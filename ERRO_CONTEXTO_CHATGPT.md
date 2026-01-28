# Erro ao Salvar Organização - Contexto Completo

## Stack Tecnológico
- **Frontend**: Next.js 14.2.3 com React 18.3.1
- **Backend**: Next.js Server Actions
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **ORM/Query**: Supabase Client (@supabase/ssr)

## Contexto do Problema

Estou desenvolvendo uma aplicação SaaS para conformidade HIPAA. O usuário está no fluxo de onboarding e precisa salvar dados da organização. A aplicação usa **Row-Level Security (RLS)** no Supabase, então operações diretas na tabela `organizations` são bloqueadas por políticas de segurança.

## Solução Implementada

Para contornar o RLS, criei uma função PostgreSQL com `SECURITY DEFINER` que bypassa as políticas RLS. A função é chamada via RPC do Supabase.

## Erro Atual

```
Error: Falha ao salvar organização: A função RPC retornou um erro. 
Certifique-se de que a migration foi executada. 
Erro: null value in column "updatedAt" of relation "organizations" violates not-null constraint
```

**Observação importante**: O erro menciona "updatedAt" (camelCase), mas no banco de dados a coluna é "updated_at" (snake_case). Isso pode indicar algum problema de conversão ou mapeamento.

## Estrutura da Tabela `organizations`

A tabela foi criada com a seguinte estrutura (da migration inicial):

```sql
create table if not exists organizations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('medical', 'dental', 'mental-health', 'therapy')),
  state text not null,
  employee_count integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);
```

**Colunas obrigatórias (NOT NULL)**:
- `id` (tem DEFAULT)
- `user_id` (sem DEFAULT)
- `name` (sem DEFAULT)
- `type` (sem DEFAULT)
- `state` (sem DEFAULT)
- `employee_count` (tem DEFAULT)
- `created_at` (tem DEFAULT)
- `updated_at` (tem DEFAULT)

## Função RPC Atual

A função `upsert_organization_jsonb` está assim:

```sql
CREATE OR REPLACE FUNCTION upsert_organization_jsonb(
  p_user_id uuid,
  p_data jsonb
)
RETURNS TABLE (...)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assessment_date timestamp with time zone;
  v_next_review_date timestamp with time zone;
  v_org_id uuid;
  v_user_id uuid;
  v_now timestamp with time zone;
BEGIN
  v_user_id := p_user_id;
  v_now := timezone('utc'::text, now());
  v_assessment_date := v_now;
  v_next_review_date := v_assessment_date + interval '12 months';

  INSERT INTO public.organizations (
    id,
    user_id,
    name,
    legal_name,
    dba,
    type,
    state,
    address_street,
    address_city,
    address_state,
    address_zip,
    security_officer_name,
    security_officer_email,
    security_officer_role,
    privacy_officer_name,
    privacy_officer_email,
    privacy_officer_role,
    employee_count,
    has_employees,
    uses_contractors,
    stores_phi_electronically,
    uses_cloud_services,
    assessment_date,
    next_review_date,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    v_user_id,
    p_data->>'name',
    p_data->>'legal_name',
    NULLIF(p_data->>'dba', ''),
    p_data->>'type',
    p_data->>'state',
    p_data->>'address_street',
    p_data->>'address_city',
    p_data->>'address_state',
    p_data->>'address_zip',
    p_data->>'security_officer_name',
    p_data->>'security_officer_email',
    p_data->>'security_officer_role',
    p_data->>'privacy_officer_name',
    p_data->>'privacy_officer_email',
    p_data->>'privacy_officer_role',
    (p_data->>'employee_count')::integer,
    COALESCE((p_data->>'has_employees')::boolean, true),
    COALESCE((p_data->>'uses_contractors')::boolean, false),
    COALESCE((p_data->>'stores_phi_electronically')::boolean, true),
    COALESCE((p_data->>'uses_cloud_services')::boolean, false),
    v_assessment_date,
    v_next_review_date,
    v_now,  -- created_at
    v_now   -- updated_at
  )
  ON CONFLICT ON CONSTRAINT organizations_user_id_key DO UPDATE SET
    -- ... campos de update ...
    updated_at = v_now
  RETURNING public.organizations.id INTO v_org_id;
  
  RETURN QUERY SELECT ... FROM public.organizations o WHERE o.id = v_org_id;
END;
$$;
```

## Código TypeScript (Next.js Server Action)

```typescript
export async function saveOrganization(data: OrganizationData) {
  const supabase = createClient(); // Server-side Supabase client
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const jsonData = {
    user_id: user.id,
    name: data.name,
    legal_name: data.legal_name,
    dba: data.dba || null,
    type: data.type,
    state: data.state,
    employee_count: data.employeeCount,
    address_street: data.address_street,
    address_city: data.address_city,
    address_state: data.address_state,
    address_zip: data.address_zip,
    security_officer_name: data.security_officer_name,
    security_officer_email: data.security_officer_email,
    security_officer_role: data.security_officer_role,
    privacy_officer_name: data.privacy_officer_name,
    privacy_officer_email: data.privacy_officer_email,
    privacy_officer_role: data.privacy_officer_role,
    has_employees: data.has_employees ?? true,
    uses_contractors: data.uses_contractors ?? false,
    stores_phi_electronically: data.stores_phi_electronically ?? true,
    uses_cloud_services: data.uses_cloud_services ?? false
  };

  const { data: rpcResult, error: rpcError } = await supabase.rpc('upsert_organization_jsonb', {
    p_user_id: user.id,
    p_data: jsonData
  });

  if (rpcError) {
    throw new Error(`Falha ao salvar organização: ${rpcError.message}`);
  }
  
  // ... retorna resultado
}
```

## Problemas Identificados e Tentativas de Correção

1. **Ambiguidade de `user_id`**: Resolvido usando variável local `v_user_id`
2. **Falta de `id` no INSERT**: Resolvido adicionando `gen_random_uuid()`
3. **Falta de `created_at` no INSERT**: Resolvido adicionando `v_now`
4. **Falta de `updated_at` no INSERT**: Resolvido adicionando `v_now`
5. **Ambiguidade no ON CONFLICT**: Resolvido usando `ON CONFLICT ON CONSTRAINT organizations_user_id_key`

## O Que Já Foi Verificado

- ✅ A função existe no banco (confirmado via query)
- ✅ A função tem `SECURITY DEFINER` configurado
- ✅ A constraint `organizations_user_id_key` existe
- ✅ O código TypeScript está chamando a função corretamente
- ✅ Os dados JSON estão sendo passados corretamente

## Possíveis Causas do Erro Atual

1. **Trigger interferindo**: Pode haver um trigger `BEFORE INSERT` que está resetando `updated_at` para NULL
2. **Ordem das colunas**: Pode haver uma incompatibilidade entre a ordem das colunas no INSERT e VALUES
3. **Conversão de nomes**: O erro menciona "updatedAt" (camelCase) mas o banco usa "updated_at" (snake_case)
4. **Função antiga ainda ativa**: Pode haver uma versão antiga da função ainda no banco
5. **DEFAULT não funcionando**: O DEFAULT da coluna pode não estar sendo aplicado quando fazemos INSERT explícito

## Informações Adicionais

- A tabela tem um trigger `update_organizations_updated_at` que atualiza `updated_at` antes de UPDATEs
- A função usa `SECURITY DEFINER` para bypassar RLS
- O `search_path` está configurado como `public`
- A função retorna uma TABLE com todas as colunas da organização

## 🔴 DESCOBERTA CRÍTICA

O erro menciona **"updatedAt"** (camelCase), mas a coluna no banco é **"updated_at"** (snake_case).

**Isso indica que:**
1. Existe um trigger ou função antiga que está tentando usar `NEW.updatedAt` (camelCase)
2. Como essa coluna não existe, o valor vira NULL
3. Viola o NOT NULL constraint de `updated_at`

**Possíveis causas:**
- Trigger `BEFORE INSERT` ou `BEFORE UPDATE` com código antigo usando camelCase
- Função `update_updated_at_column()` com versão antiga usando `updatedAt`
- Migração de ORM (Prisma, Wasp) que deixou código antigo

## Pergunta

Por que a função PostgreSQL `upsert_organization_jsonb` está retornando erro "null value in column 'updatedAt' violates not-null constraint" mesmo quando estou explicitamente inserindo `v_now` (que contém um timestamp válido) na coluna `updated_at`? 

O que pode estar causando isso e como resolver?
