-- ============================================================================
-- VERIFICAÇÃO COMPLETA - Execute todos os passos e me envie os resultados
-- ============================================================================

-- ============================================================================
-- PASSO 1: VERIFICAR SE A FUNÇÃO EXISTE E SUA ASSINATURA
-- ============================================================================
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  oid::regprocedure as full_signature,
  prosecdef as security_definer
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';

-- ============================================================================
-- PASSO 2: VERIFICAR TIPO DA COLUNA user_id
-- ============================================================================
SELECT 
  column_name, 
  data_type,
  udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'organizations'
  AND column_name = 'user_id';

-- ============================================================================
-- PASSO 3: VERIFICAR SE HÁ ERROS DE TIPO NO CÓDIGO
-- ============================================================================
SELECT 
  proname,
  CASE 
    WHEN prosrc LIKE '%::text%' AND prosrc LIKE '%user_id%' THEN '⚠️ Possível conversão text'
    WHEN prosrc LIKE '%text =%' AND prosrc LIKE '%user_id%' THEN '⚠️ Comparação text ='
    WHEN prosrc LIKE '%user_id%::text%' THEN '⚠️ user_id convertido para text'
    WHEN prosrc LIKE '%auth.uid()%' THEN '⚠️ Usa auth.uid() (pode causar problemas)'
    ELSE '✅ OK - Sem problemas de tipo'
  END as status
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';

-- ============================================================================
-- PASSO 4: VERIFICAR PERMISSÕES (JÁ CONFIRMADO - OK)
-- ============================================================================
SELECT 
  p.proname as function_name,
  a.rolname as role,
  has_function_privilege(a.oid, p.oid, 'EXECUTE') as can_execute
FROM pg_proc p
CROSS JOIN pg_roles a
WHERE p.proname = 'upsert_organization_jsonb'
  AND a.rolname IN ('authenticated', 'anon', 'service_role')
ORDER BY a.rolname;
