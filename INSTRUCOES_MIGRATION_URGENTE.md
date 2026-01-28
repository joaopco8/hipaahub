# 🚨 INSTRUÇÕES URGENTES - Aplicar Migration

## ⚠️ O sistema está com erro porque as migrations não foram aplicadas no banco de dados

### Erro Atual
```
operator does not exist: text = uuid
```

Este erro ocorre porque a função RPC `upsert_organization_jsonb` precisa ser criada/atualizada no Supabase.

---

## 📋 SOLUÇÃO - Siga estes passos:

### Passo 1: Abrir o Supabase Dashboard
1. Acesse: https://app.supabase.com
2. Selecione seu projeto **HIPAA Guard**

### Passo 2: Abrir o SQL Editor
1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query** (botão verde no canto superior direito)

### Passo 3: Copiar o Script
1. Abra o arquivo: `supabase/migrations/APPLY_THIS_MANUALLY.sql`
2. **Copie TODO o conteúdo** do arquivo (Ctrl+A, Ctrl+C)

### Passo 4: Colar e Executar
1. Cole o conteúdo na query do SQL Editor
2. Clique em **RUN** (botão verde com ícone de play)
3. Aguarde a execução (deve levar alguns segundos)

### Passo 5: Verificar Sucesso
Você deve ver mensagens como:
```
✅ Migration completed successfully!
✅ Column onboarding_metadata added to organizations table
✅ Function upsert_organization_jsonb created/updated
✅ All permissions granted
```

### Passo 6: Testar
1. Volte ao seu aplicativo
2. Recarregue a página (F5)
3. Tente preencher o formulário de organização novamente

---

## ✅ O que esta migration faz:

1. **Adiciona coluna `onboarding_metadata`** na tabela `organizations`
   - Armazena dados adicionais do onboarding (especialidades, EHR, etc.)
   - Tipo JSONB para flexibilidade

2. **Cria/Atualiza função RPC `upsert_organization_jsonb`**
   - Bypassa RLS com segurança usando `SECURITY DEFINER`
   - Usa `auth.uid()` internamente (sem risco de manipulação)
   - Suporta TODOS os campos HIPAA obrigatórios
   - Faz INSERT ou UPDATE automaticamente

3. **Configura permissões corretas**
   - Permite que usuários autenticados usem a função

---

## 🔍 Verificação Adicional

Se quiser verificar se tudo foi aplicado corretamente, execute esta query no SQL Editor:

```sql
-- Verificar se a coluna existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
  AND column_name = 'onboarding_metadata';

-- Verificar se a função existe
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'upsert_organization_jsonb';
```

Você deve ver:
- 1 linha retornada para a coluna (tipo: `jsonb`)
- 1 linha retornada para a função (tipo: `FUNCTION`)

---

## ❓ Problemas?

Se ainda houver erros:

1. Verifique se você está no projeto correto do Supabase
2. Verifique se seu usuário tem permissão de admin no projeto
3. Tente executar o script em partes (comentando seções com `--`)
4. Avise-me qual erro específico aparece

---

## 📝 Após aplicar a migration

O sistema deverá:
- ✅ Salvar organizações sem erros
- ✅ Auto-salvar dados conforme você preenche
- ✅ Carregar dados salvos ao voltar
- ✅ Armazenar TODOS os campos do formulário
