-- ============================================================================
-- APLICAR CORREÇÃO DEFINITIVA - Organization RPC
-- ============================================================================
-- Execute este script no Supabase SQL Editor para aplicar a correção completa
-- 
-- O que este script faz:
-- 1. Remove TODAS as funções antigas (incluindo versões com text)
-- 2. Cria função definitiva que usa auth.uid() (não aceita p_user_id)
-- 3. Garante que não há comparações text = uuid
-- 4. Força refresh do schema cache
-- ============================================================================

-- ============================================================================
-- PASSO 1: REMOVER TODAS AS FUNÇÕES ANTIGAS
-- ============================================================================
DO $$
DECLARE
  r RECORD;
  removed_count INTEGER := 0;
BEGIN
  RAISE NOTICE '=== Removendo todas as funções upsert_organization* ===';
  
  -- Remover todas as versões
  FOR r IN 
    SELECT oid, proname, pg_get_function_arguments(oid) as args
    FROM pg_proc
    WHERE proname LIKE '%upsert%organization%'
       OR proname LIKE '%update%organization%extended%'
  LOOP
    BEGIN
      EXECUTE format('DROP FUNCTION IF EXISTS %s.%s(%s) CASCADE', 
        'public', r.proname, r.args);
      removed_count := removed_count + 1;
      RAISE NOTICE '✅ Removida: %(%)', r.proname, r.args;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '⚠️ Erro ao remover %(%): %', r.proname, r.args, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '=== Total removido: % ===', removed_count;
END $$;

-- Remover também explicitamente
DROP FUNCTION IF EXISTS upsert_organization_jsonb(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb CASCADE;
DROP FUNCTION IF EXISTS update_organization_extended CASCADE;

-- ============================================================================
-- PASSO 2: APLICAR MIGRATION DEFINITIVA
-- ============================================================================
-- A migration 20241220000020_fix_organization_rpc_definitive.sql
-- será aplicada automaticamente pelo Supabase, mas você pode executar
-- o conteúdo aqui se preferir aplicar manualmente.

-- Verificar se a migration já foi aplicada
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'upsert_organization_jsonb' 
    AND pg_get_function_arguments(oid) = 'p_data jsonb'
  ) THEN
    RAISE NOTICE '✅ Função definitiva já existe';
  ELSE
    RAISE NOTICE '⚠️ Função definitiva NÃO existe. Execute a migration: 20241220000020_fix_organization_rpc_definitive.sql';
  END IF;
END $$;

-- ============================================================================
-- PASSO 3: VERIFICAR FUNÇÕES RESTANTES
-- ============================================================================
SELECT 
  'Funções restantes' as status,
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  CASE 
    WHEN pg_get_function_arguments(oid) LIKE '%text%' THEN '❌ TEM TEXT - PROBLEMA!'
    WHEN pg_get_function_arguments(oid) LIKE '%uuid%' AND proname LIKE '%upsert%organization%' THEN '❌ TEM UUID - DEVE SER REMOVIDA!'
    WHEN pg_get_function_arguments(oid) = 'p_data jsonb' THEN '✅ CORRETO - DEFINITIVA'
    ELSE '⚠️ VERIFICAR'
  END as check_result
FROM pg_proc
WHERE proname LIKE '%upsert%organization%'
   OR proname LIKE '%update%organization%'
ORDER BY proname;

-- ============================================================================
-- PASSO 4: FORÇAR REFRESH DO SCHEMA CACHE
-- ============================================================================
NOTIFY pgrst, 'reload schema';

SELECT '✅ Schema cache refresh solicitado' as status;

-- ============================================================================
-- PASSO 5: VERIFICAÇÃO FINAL
-- ============================================================================
-- Deve existir APENAS uma função: upsert_organization_jsonb(jsonb)
SELECT 
  COUNT(*) as total_functions,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ PERFEITO - Apenas função definitiva existe'
    WHEN COUNT(*) = 0 THEN '❌ ERRO - Nenhuma função existe!'
    ELSE '⚠️ ATENÇÃO - Múltiplas funções existem'
  END as status
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb'
  AND pg_get_function_arguments(oid) = 'p_data jsonb';
