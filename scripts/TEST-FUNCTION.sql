-- ============================================================================
-- TESTE DA FUNÇÃO upsert_organization_jsonb
-- ============================================================================
-- Execute este script para testar se a função está funcionando corretamente

-- ============================================================================
-- PASSO 1: VERIFICAR SE A FUNÇÃO EXISTE
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
-- PASSO 3: TESTE DE CHAMADA (SUBSTITUA O UUID POR UM UUID VÁLIDO)
-- ============================================================================
-- Descomente e substitua '00000000-0000-0000-0000-000000000000' por um UUID real
-- ou use auth.uid() se estiver autenticado

/*
SELECT * FROM upsert_organization_jsonb(
  auth.uid(),  -- ou use um UUID específico
  '{
    "name": "Test Organization",
    "legal_name": "Test Organization LLC",
    "type": "medical",
    "state": "CA",
    "employee_count": 5,
    "address_street": "123 Test St",
    "address_city": "Los Angeles",
    "address_state": "CA",
    "address_zip": "90001",
    "security_officer_name": "John Doe",
    "security_officer_email": "john@test.com",
    "security_officer_role": "Security Officer",
    "privacy_officer_name": "Jane Doe",
    "privacy_officer_email": "jane@test.com",
    "privacy_officer_role": "Privacy Officer"
  }'::jsonb
);
*/

-- ============================================================================
-- PASSO 4: VERIFICAR SE HÁ ERROS DE TIPO NO CÓDIGO
-- ============================================================================
-- Verificar se há conversões text = uuid no código
SELECT 
  proname,
  CASE 
    WHEN prosrc LIKE '%::text%' AND prosrc LIKE '%user_id%' THEN '⚠️ Possível conversão text'
    WHEN prosrc LIKE '%text =%' AND prosrc LIKE '%user_id%' THEN '⚠️ Comparação text ='
    WHEN prosrc LIKE '%user_id%::text%' THEN '⚠️ user_id convertido para text'
    ELSE '✅ OK'
  END as status,
  prosrc
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';

-- ============================================================================
-- PASSO 5: VERIFICAR PERMISSÕES
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
