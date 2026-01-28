# Erro PostgreSQL: null value in column "updatedAt" - Contexto para ChatGPT

## Problema
```
Error: null value in column "updatedAt" of relation "organizations" violates not-null constraint
```

**Observação crítica**: O erro menciona `"updatedAt"` (camelCase), mas a coluna real no PostgreSQL é `updated_at` (snake_case).

## Contexto Técnico

**Stack**: Next.js 14 + Supabase (PostgreSQL) + RLS ativo

**Tabela**:
```sql
create table organizations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  name text not null,
  type text not null,
  state text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);
```

**Função RPC** (usa `SECURITY DEFINER` para bypassar RLS):
```sql
CREATE OR REPLACE FUNCTION upsert_organization_jsonb(p_user_id uuid, p_data jsonb)
RETURNS TABLE (...)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_now timestamp with time zone;
BEGIN
  v_now := timezone('utc'::text, now());
  
  INSERT INTO public.organizations (
    id, user_id, name, ..., created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), v_user_id, ..., v_now, v_now
  )
  ON CONFLICT ON CONSTRAINT organizations_user_id_key DO UPDATE SET
    ...,
    updated_at = v_now
  RETURNING id INTO v_org_id;
  
  RETURN QUERY SELECT ... FROM organizations WHERE id = v_org_id;
END;
$$;
```

**Trigger existente** (da migration inicial):
```sql
CREATE TRIGGER update_organizations_updated_at 
BEFORE UPDATE ON organizations
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
```

**Função do trigger**:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());  -- snake_case correto
  return new;
END;
$$ LANGUAGE plpgsql;
```

## Hipótese Principal

O erro menciona `"updatedAt"` (camelCase), o que indica que:

1. **Existe um trigger ou função antiga** que está tentando usar `NEW.updatedAt` (camelCase)
2. Como essa coluna não existe, o valor vira `NULL`
3. Viola o `NOT NULL` constraint de `updated_at`

**Possíveis causas:**
- Trigger `BEFORE INSERT` (não apenas `BEFORE UPDATE`) com código antigo
- Versão antiga da função `update_updated_at_column()` usando `updatedAt`
- Migração de ORM (Prisma, Wasp) que deixou código antigo
- Cache do Supabase com função antiga

## O Que Já Foi Verificado

- ✅ Função RPC existe e tem `SECURITY DEFINER`
- ✅ Constraint `organizations_user_id_key` existe
- ✅ Função RPC insere `updated_at = v_now` explicitamente
- ✅ Trigger é `BEFORE UPDATE` (não deveria interferir no INSERT)

## Pergunta para ChatGPT

**Por que o PostgreSQL está retornando erro "null value in column 'updatedAt'" quando:**

1. A coluna real é `updated_at` (snake_case), não `updatedAt` (camelCase)
2. A função RPC insere explicitamente `updated_at = v_now` no INSERT
3. O trigger é apenas `BEFORE UPDATE`, não `BEFORE INSERT`

**O que pode estar causando isso e como diagnosticar/corrigir?**

Possíveis soluções:
- Verificar se existe trigger `BEFORE INSERT` oculto
- Verificar versões antigas da função `update_updated_at_column()`
- Verificar se há outras funções/triggers usando camelCase
- Limpar cache do Supabase
