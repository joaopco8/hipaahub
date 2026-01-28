# ✅ Passos Finais de Verificação

## Status Atual
✅ Função `upsert_organization_jsonb` criada com `uuid` (não `text`)

## Passos para Resolver o Erro "operator does not exist: text = uuid"

### 1. ✅ Verificar Função no Supabase (JÁ FEITO)
Execute `scripts/VERIFY-FUNCTION-AND-CLEAR-CACHE.sql` no Supabase SQL Editor e confirme:
- ✅ Função existe com `uuid` (não `text`)
- ✅ Nenhuma função com `text` restante
- ✅ Permissões corretas

### 2. 🔄 Limpar Cache do Supabase (CRÍTICO!)
No Supabase SQL Editor, execute:
```sql
NOTIFY pgrst, 'reload schema';
```

Isso força o PostgREST a recarregar o schema e reconhecer a nova função.

### 3. 🛑 Parar o Servidor Next.js
No terminal, pressione `Ctrl+C` para parar o servidor.

### 4. 🧹 Limpar Cache do Next.js
Execute no terminal:
```powershell
if (Test-Path .next) { Remove-Item -Recurse -Force .next; Write-Host "Cache removido" }
```

### 5. ⏳ Aguardar 10 Segundos
Aguarde para garantir que todos os processos foram finalizados.

### 6. 🚀 Reiniciar o Servidor
```bash
pnpm dev
```

### 7. 🧹 Limpar Cache do Navegador
1. Abra DevTools (F12)
2. Clique com botão direito no botão de recarregar
3. Selecione "Empty Cache and Hard Reload"
   
   OU
   
4. Pressione `Ctrl+Shift+Delete`
5. Selecione "Cache" e "Cookies"
6. Limpe tudo

### 8. ✅ Testar Novamente
Tente salvar a organização novamente.

---

## Se Ainda Der Erro

### Verificar Logs do Servidor
No terminal do Next.js, procure por:
```
🔄 Attempting to save organization via RPC function...
User ID type: string Value: [seu-uuid]
```

### Verificar Erro Específico
Se ainda der "operator does not exist: text = uuid", execute no Supabase SQL Editor:

```sql
-- Listar TODAS as funções relacionadas
SELECT 
  proname,
  pg_get_function_arguments(oid) as args,
  oid::regprocedure as signature
FROM pg_proc
WHERE proname LIKE '%upsert%organization%'
ORDER BY proname;
```

Se aparecer QUALQUER função com `text` na lista, execute `scripts/KILL-TEXT-FUNCTIONS.sql` novamente.

---

## Checklist Final

- [ ] Função criada com `uuid` (verificado no Supabase)
- [ ] Cache do Supabase limpo (`NOTIFY pgrst, 'reload schema'`)
- [ ] Servidor Next.js parado e reiniciado
- [ ] Cache do Next.js limpo (pasta `.next` removida)
- [ ] Cache do navegador limpo
- [ ] Teste realizado novamente

Se todos os itens estão marcados e ainda dá erro, me envie:
1. O erro completo do console do navegador
2. O erro completo do terminal do Next.js
3. O resultado da query de verificação de funções
