# 🚨 SOLUÇÃO DEFINITIVA - Execute o SQL no Supabase

## ⚠️ O ERRO

```
operator does not exist: text = uuid
```

Este erro acontece porque a função RPC `upsert_organization_jsonb` não existe ou está desatualizada no banco de dados.

---

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### Passo 1: Abrir Supabase Dashboard
1. Acesse: **https://app.supabase.com**
2. Faça login
3. Selecione seu projeto **HIPAA Guard**

### Passo 2: Abrir SQL Editor
1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique no botão verde **New Query** (canto superior direito)

### Passo 3: Copiar Script
1. Abra o arquivo: **`supabase/migrations/FIX_FINAL_SIMPLES.sql`**
2. Selecione TODO o conteúdo (Ctrl+A)
3. Copie (Ctrl+C)

### Passo 4: Colar e Executar
1. Cole o conteúdo no SQL Editor do Supabase
2. Clique no botão verde **RUN** (ou pressione Ctrl+Enter)
3. Aguarde alguns segundos

### Passo 5: Verificar Sucesso
Você deve ver:
```
Success. No rows returned
```

**Se aparecer algum erro**, copie a mensagem e me envie.

### Passo 6: Testar
1. Volte ao seu app
2. Recarregue a página (F5)
3. Tente salvar a organização novamente

---

## 📋 O que este script faz:

1. ✅ Converte `user_id` para UUID (se necessário)
2. ✅ Remove todas as funções antigas que podem causar conflito
3. ✅ Adiciona coluna `onboarding_metadata` (se não existir)
4. ✅ Cria a função RPC `upsert_organization_jsonb` correta
5. ✅ Configura permissões para usuários autenticados

---

## 🔍 Se ainda não funcionar:

Execute este script de diagnóstico primeiro:

```sql
-- Verificar tipo da coluna user_id
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'organizations' AND column_name = 'user_id';

-- Verificar se a função existe
SELECT proname, pg_get_function_arguments(oid) 
FROM pg_proc 
WHERE proname = 'upsert_organization_jsonb';
```

Me envie os resultados.
