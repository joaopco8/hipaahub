# 🧪 Teste RPC - Instruções Completas

## Objetivo
Testar definitivamente a função RPC `upsert_organization_jsonb(jsonb)` para diagnosticar problemas.

## Como Usar

### Opção 1: Via Página Web (Recomendado)

1. **Acesse a página de teste:**
   ```
   http://localhost:3000/dashboard/test-rpc
   ```

2. **Clique em "Executar Teste"**

3. **Analise os resultados:**
   - ✅ Verde = Sucesso
   - ❌ Vermelho = Erro (com solução)

### Opção 2: Via Console do Navegador

1. Abra DevTools (F12)
2. Vá para a aba Console
3. Execute:
```javascript
// Importar a função (se estiver em client component)
// Ou acesse a página /dashboard/test-rpc
```

### Opção 3: Via Server Action (Terminal)

1. Crie um arquivo temporário ou use o terminal do Next.js
2. Importe e execute:
```typescript
import { testOrganizationRPC } from '@/app/actions/test-organization-rpc';

const result = await testOrganizationRPC();
console.log(result);
```

## O Que o Teste Verifica

### ✅ Passo 1: Cliente Supabase
- Cria cliente corretamente
- Verifica configuração

### ✅ Passo 2: Autenticação
- Verifica se usuário está autenticado
- Valida `user.id` (tipo e formato UUID)
- Verifica se não é null

### ✅ Passo 3: Payload
- Cria payload mínimo válido
- Valida estrutura do JSON
- Garante que NÃO envia `user_id` ou `p_user_id`

### ✅ Passo 4: Chamada RPC
- Chama `supabase.rpc('upsert_organization_jsonb', { p_data: {...} })`
- Mede tempo de execução
- Captura erros detalhados

### ✅ Passo 5: Análise de Resultado
- Identifica camada do erro (frontend, RPC, PostgREST, Postgres)
- Fornece solução específica para cada tipo de erro
- Valida se `user_id` retornado corresponde ao usuário autenticado

## Diagnóstico de Erros

### Erro: "function does not exist" (Code: 42883)
**Camada:** PostgREST  
**Causa:** Função não existe no banco  
**Solução:** Execute `scripts/VERIFY-AND-CREATE-CORRECT-FUNCTION.sql`

### Erro: "operator does not exist: text = uuid"
**Camada:** Postgres  
**Causa:** Ainda existe função antiga com parâmetro `text`  
**Solução:** Execute `scripts/NUCLEAR-CLEAN-AND-RECREATE.sql`

### Erro: "User must be authenticated"
**Camada:** Postgres  
**Causa:** `auth.uid()` retornou NULL  
**Solução:** Verifique se o token JWT está válido. Faça login novamente.

### Erro: "null value violates not-null constraint"
**Camada:** Postgres  
**Causa:** Campo obrigatório não fornecido  
**Solução:** Verifique o payload. Todos os campos obrigatórios devem estar presentes.

### Erro: Code 42xxx (SQL Syntax)
**Camada:** Postgres  
**Causa:** Erro de sintaxe SQL na função  
**Solução:** Verifique a função no banco. Execute `scripts/VERIFY-FUNCTION-IS-CORRECT.sql`

### Erro: Code PGRSTxxx
**Camada:** PostgREST  
**Causa:** Erro do PostgREST (cache desatualizado)  
**Solução:** Execute `NOTIFY pgrst, 'reload schema';` no Supabase SQL Editor

## Checklist de Verificação

Após executar o teste, verifique:

- [ ] Usuário está autenticado
- [ ] `user.id` é UUID válido
- [ ] Payload não contém `user_id`
- [ ] RPC é chamada apenas com `p_data`
- [ ] Função existe no banco com assinatura `(p_data jsonb)`
- [ ] Função usa `auth.uid()` internamente
- [ ] Não há comparações `text = uuid` no código
- [ ] Cache do Supabase foi atualizado

## Resultado Esperado

### ✅ Sucesso
```json
{
  "success": true,
  "step": "complete",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Test Organization",
    ...
  }
}
```

### ❌ Erro
```json
{
  "success": false,
  "step": "rpc_call",
  "error": {
    "layer": "postgres",
    "message": "operator does not exist: text = uuid",
    "code": "42883",
    "solution": "Execute scripts/NUCLEAR-CLEAN-AND-RECREATE.sql"
  }
}
```

## Próximos Passos Após Teste

1. **Se sucesso:** O problema estava resolvido. Teste o onboarding normal.

2. **Se erro:**
   - Anote a camada do erro
   - Siga a solução sugerida
   - Execute o script SQL recomendado
   - Execute o teste novamente

3. **Se persistir:**
   - Envie os logs completos
   - Envie o resultado do `DIAGNOSTIC-COMPLETE.sql`
   - Envie screenshot da página de teste
