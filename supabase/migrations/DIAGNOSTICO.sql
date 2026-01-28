-- ============================================================================
-- DIAGNÓSTICO: Verificar estado atual do banco
-- ============================================================================
-- Execute este script PRIMEIRO para ver o que está acontecendo
-- ============================================================================

-- 1. Verificar estrutura da tabela organizations
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'organizations' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se a função existe e sua assinatura
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname LIKE '%upsert_organization%';

-- 3. Verificar se há dados na tabela
SELECT COUNT(*) as total_organizations FROM organizations;

-- 4. Verificar tipo da coluna user_id especificamente
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'organizations' 
  AND column_name = 'user_id';
