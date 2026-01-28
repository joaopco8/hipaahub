-- ============================================================================
-- VERIFICAÇÃO: A função está correta e aplicada?
-- ============================================================================
-- Execute este script para verificar se a função está correta no banco
-- ============================================================================

-- ============================================================================
-- VERIFICAÇÃO 1: Assinatura da Função
-- ============================================================================
SELECT 
  'ASSINATURA' as check_type,
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  CASE 
    WHEN pg_get_function_arguments(oid) = 'p_data jsonb' THEN '✅ CORRETO - Apenas p_data'
    WHEN pg_get_function_arguments(oid) LIKE '%p_user_id%' THEN '❌ ERRADO - Ainda tem p_user_id!'
    WHEN pg_get_function_arguments(oid) LIKE '%text%' THEN '❌ ERRADO - Tem text!'
    ELSE '⚠️ VERIFICAR'
  END as status
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';

-- ============================================================================
-- VERIFICAÇÃO 2: Quantas funções existem?
-- ============================================================================
SELECT 
  'QUANTIDADE' as check_type,
  COUNT(*) as total_functions,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ ERRO - Nenhuma função existe!'
    WHEN COUNT(*) = 1 THEN '✅ PERFEITO - Apenas uma função'
    ELSE '❌ PROBLEMA - Múltiplas funções existem!'
  END as status
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';

-- ============================================================================
-- VERIFICAÇÃO 3: Código da Função (verificar se usa auth.uid())
-- ============================================================================
SELECT 
  'CÓDIGO' as check_type,
  proname,
  CASE 
    WHEN prosrc LIKE '%auth.uid()%' THEN '✅ USA auth.uid()'
    WHEN prosrc LIKE '%p_user_id%' THEN '❌ USA p_user_id (ERRADO!)'
    ELSE '⚠️ VERIFICAR CÓDIGO'
  END as auth_check,
  CASE 
    WHEN prosrc LIKE '%text = uuid%' OR prosrc LIKE '%uuid = text%' THEN '❌ TEM COMPARAÇÃO TEXT=UUID!'
    WHEN prosrc LIKE '%v_user_id := auth.uid()%' THEN '✅ CORRETO - v_user_id := auth.uid()'
    ELSE '⚠️ VERIFICAR'
  END as comparison_check
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb'
  AND pg_get_function_arguments(oid) = 'p_data jsonb';

-- ============================================================================
-- VERIFICAÇÃO 4: Permissões
-- ============================================================================
SELECT 
  'PERMISSÕES' as check_type,
  proname,
  has_function_privilege('authenticated', oid, 'EXECUTE') as authenticated_can_execute,
  has_function_privilege('anon', oid, 'EXECUTE') as anon_can_execute,
  CASE 
    WHEN has_function_privilege('authenticated', oid, 'EXECUTE') 
         AND has_function_privilege('anon', oid, 'EXECUTE') 
    THEN '✅ PERMISSÕES OK'
    ELSE '❌ FALTAM PERMISSÕES'
  END as status
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb'
  AND pg_get_function_arguments(oid) = 'p_data jsonb';

-- ============================================================================
-- VERIFICAÇÃO 5: SECURITY DEFINER
-- ============================================================================
SELECT 
  'SEGURANÇA' as check_type,
  proname,
  prosecdef as is_security_definer,
  CASE 
    WHEN prosecdef = true THEN '✅ SECURITY DEFINER (correto)'
    ELSE '❌ NÃO É SECURITY DEFINER (problema!)'
  END as status
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb'
  AND pg_get_function_arguments(oid) = 'p_data jsonb';

-- ============================================================================
-- VERIFICAÇÃO 6: Listar TODAS as funções relacionadas (para debug)
-- ============================================================================
SELECT 
  'TODAS AS FUNÇÕES' as check_type,
  proname,
  pg_get_function_arguments(oid) as arguments,
  prosecdef as security_definer,
  oid::regprocedure as full_signature
FROM pg_proc
WHERE proname LIKE '%upsert%organization%'
   OR proname LIKE '%update%organization%'
ORDER BY proname;
