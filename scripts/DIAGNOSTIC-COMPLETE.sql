-- ============================================================================
-- DIAGNÓSTICO COMPLETO - Por que ainda dá erro "text = uuid"?
-- ============================================================================
-- Execute este script para descobrir exatamente o que está acontecendo
-- ============================================================================

-- ============================================================================
-- 1. VERIFICAR TODAS AS FUNÇÕES EXISTENTES
-- ============================================================================
SELECT 
  'TODAS AS FUNÇÕES' as diagnostico,
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  oid::regprocedure as full_signature,
  prosecdef as is_security_definer,
  CASE 
    WHEN pg_get_function_arguments(oid) = 'p_data jsonb' THEN '✅ CORRETA'
    WHEN pg_get_function_arguments(oid) LIKE '%p_user_id%' THEN '❌ ANTIGA - TEM p_user_id'
    WHEN pg_get_function_arguments(oid) LIKE '%text%' THEN '❌ ANTIGA - TEM text'
    ELSE '⚠️ VERIFICAR'
  END as status
FROM pg_proc
WHERE proname LIKE '%upsert%organization%'
   OR proname LIKE '%update%organization%'
ORDER BY proname, oid;

-- ============================================================================
-- 2. VERIFICAR CÓDIGO DA FUNÇÃO (se existe)
-- ============================================================================
SELECT 
  'CÓDIGO DA FUNÇÃO' as diagnostico,
  proname,
  pg_get_function_arguments(oid) as arguments,
  CASE 
    WHEN prosrc LIKE '%auth.uid()%' THEN '✅ USA auth.uid()'
    WHEN prosrc LIKE '%p_user_id%' THEN '❌ USA p_user_id (ANTIGA!)'
    ELSE '⚠️ VERIFICAR'
  END as auth_check,
  CASE 
    WHEN prosrc LIKE '%text = uuid%' OR prosrc LIKE '%uuid = text%' THEN '❌ TEM COMPARAÇÃO TEXT=UUID!'
    WHEN prosrc LIKE '%v_user_id := auth.uid()%' THEN '✅ CORRETO'
    ELSE '⚠️ VERIFICAR'
  END as comparison_check,
  -- Mostrar primeiras 200 caracteres do código
  LEFT(prosrc, 200) as code_preview
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb'
ORDER BY oid;

-- ============================================================================
-- 3. VERIFICAR SE HÁ MÚLTIPLAS VERSÕES (PROBLEMA!)
-- ============================================================================
SELECT 
  'MÚLTIPLAS VERSÕES?' as diagnostico,
  COUNT(*) as total_versions,
  string_agg(pg_get_function_arguments(oid), ', ') as all_arguments,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ NENHUMA FUNÇÃO EXISTE!'
    WHEN COUNT(*) = 1 THEN '✅ APENAS UMA FUNÇÃO'
    ELSE '❌ PROBLEMA - MÚLTIPLAS FUNÇÕES EXISTEM!'
  END as status
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';

-- ============================================================================
-- 4. VERIFICAR QUAL FUNÇÃO O POSTGREST VAI ESCOLHER
-- ============================================================================
-- O PostgREST escolhe a função baseado na assinatura
-- Se houver múltiplas, pode escolher a errada!
SELECT 
  'POSTGREST ESCOLHERÁ' as diagnostico,
  proname,
  pg_get_function_arguments(oid) as arguments,
  oid::regprocedure as signature,
  CASE 
    WHEN pg_get_function_arguments(oid) = 'p_data jsonb' THEN '✅ ESTA SERÁ ESCOLHIDA (CORRETA)'
    WHEN pg_get_function_arguments(oid) LIKE '%p_user_id%' THEN '❌ ESTA PODE SER ESCOLHIDA (ERRADA!)'
    ELSE '⚠️ VERIFICAR'
  END as will_be_chosen
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb'
ORDER BY 
  -- PostgREST prefere funções com menos parâmetros
  array_length(string_to_array(pg_get_function_arguments(oid), ','), 1),
  oid;

-- ============================================================================
-- 5. TESTE: TENTAR CHAMAR A FUNÇÃO (se autenticado)
-- ============================================================================
-- Descomente para testar (só funciona se você estiver autenticado)
/*
DO $$
DECLARE
  test_result record;
  test_data jsonb := '{"name": "Test", "type": "medical", "state": "CA"}'::jsonb;
BEGIN
  -- Tentar chamar a função
  SELECT * INTO test_result
  FROM upsert_organization_jsonb(test_data);
  
  RAISE NOTICE '✅ Função executou sem erro!';
EXCEPTION WHEN OTHERS THEN
  IF SQLERRM LIKE '%operator does not exist%' THEN
    RAISE EXCEPTION '❌ ERRO TEXT=UUID: %', SQLERRM;
  ELSE
    RAISE NOTICE '⚠️ Erro (pode ser esperado): %', SQLERRM;
  END IF;
END $$;
*/

-- ============================================================================
-- 6. FORÇAR REFRESH DO CACHE
-- ============================================================================
NOTIFY pgrst, 'reload schema';

SELECT '✅ Cache refresh solicitado' as diagnostico;

-- ============================================================================
-- RESUMO FINAL
-- ============================================================================
SELECT 
  'RESUMO' as diagnostico,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'upsert_organization_jsonb' 
      AND pg_get_function_arguments(oid) = 'p_data jsonb'
    ) THEN '✅ Função correta existe'
    ELSE '❌ Função correta NÃO existe!'
  END as funcao_correta,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'upsert_organization_jsonb' 
      AND (pg_get_function_arguments(oid) LIKE '%p_user_id%' 
           OR pg_get_function_arguments(oid) LIKE '%text%')
    ) THEN '❌ AINDA EXISTEM FUNÇÕES ANTIGAS!'
    ELSE '✅ Nenhuma função antiga encontrada'
  END as funcoes_antigas,
  (
    SELECT COUNT(*) 
    FROM pg_proc 
    WHERE proname = 'upsert_organization_jsonb'
  ) as total_funcoes;
