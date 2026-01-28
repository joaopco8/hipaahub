-- ============================================================================
-- VERIFICAÇÃO FINAL E LIMPEZA DE CACHE
-- ============================================================================
-- Execute este script para verificar se tudo está correto

-- ============================================================================
-- 1. VERIFICAR FUNÇÃO CRIADA (DEVE MOSTRAR APENAS UUID)
-- ============================================================================
SELECT 
  '✅ Função encontrada' as status,
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  CASE 
    WHEN pg_get_function_arguments(oid) LIKE 'uuid%' THEN '✅ CORRETO - UUID'
    WHEN pg_get_function_arguments(oid) LIKE 'text%' THEN '❌ ERRADO - TEM TEXT!'
    ELSE '⚠️ TIPO DESCONHECIDO'
  END as type_check
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';

-- ============================================================================
-- 2. VERIFICAR SE HÁ FUNÇÕES COM TEXT (DEVE SER 0)
-- ============================================================================
SELECT 
  COUNT(*) as functions_with_text,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ NENHUMA FUNÇÃO COM TEXT - PERFEITO!'
    ELSE '❌ AINDA EXISTEM FUNÇÕES COM TEXT - PROBLEMA!'
  END as status
FROM pg_proc
WHERE proname LIKE '%upsert%organization%'
  AND pg_get_function_arguments(oid) LIKE '%text%';

-- ============================================================================
-- 3. VERIFICAR PERMISSÕES (DEVE TER authenticated E anon)
-- ============================================================================
SELECT 
  p.proname as function_name,
  p.proargtypes::regtype[] as argument_types,
  CASE 
    WHEN has_function_privilege('authenticated', p.oid, 'EXECUTE') 
         AND has_function_privilege('anon', p.oid, 'EXECUTE') 
    THEN '✅ PERMISSÕES OK'
    ELSE '❌ FALTAM PERMISSÕES'
  END as permissions_status
FROM pg_proc p
WHERE p.proname = 'upsert_organization_jsonb';

-- ============================================================================
-- 4. FORÇAR REFRESH DO SCHEMA CACHE (CRÍTICO!)
-- ============================================================================
NOTIFY pgrst, 'reload schema';

SELECT '✅ Cache do Supabase forçado a recarregar' as status;

-- ============================================================================
-- 5. TESTE RÁPIDO DA FUNÇÃO (OPCIONAL - DESCOMENTE SE QUISER TESTAR)
-- ============================================================================
-- Descomente as linhas abaixo para testar a função:
/*
DO $$
DECLARE
  test_user_id uuid := '00000000-0000-0000-0000-000000000000'::uuid;
  test_data jsonb := '{"name": "Test Org", "type": "medical", "state": "CA"}'::jsonb;
  result_count integer;
BEGIN
  -- Tentar chamar a função (pode falhar se não houver usuário válido, mas testa a assinatura)
  SELECT COUNT(*) INTO result_count
  FROM upsert_organization_jsonb(test_user_id, test_data);
  
  RAISE NOTICE '✅ Função executou sem erro de tipo!';
EXCEPTION WHEN OTHERS THEN
  IF SQLERRM LIKE '%operator does not exist%' THEN
    RAISE EXCEPTION '❌ ERRO DE TIPO: %', SQLERRM;
  ELSE
    RAISE NOTICE '⚠️ Erro esperado (usuário não existe): %', SQLERRM;
  END IF;
END $$;
*/
