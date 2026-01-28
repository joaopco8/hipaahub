-- ============================================================================
-- DIAGNÓSTICO COMPLETO - Execute PRIMEIRO para ver o que está errado
-- ============================================================================
-- Cole e execute este script no Supabase SQL Editor
-- ============================================================================

-- 1. Verificar tipo da coluna user_id
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'organizations' 
  AND column_name = 'user_id'
  AND table_schema = 'public';

-- 2. Verificar TODAS as funções upsert_organization
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname LIKE '%upsert_organization%';

-- 3. Verificar RLS Policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'organizations'
  AND schemaname = 'public';

-- 4. Verificar estrutura completa da tabela
SELECT 
    column_name, 
    data_type, 
    udt_name
FROM information_schema.columns 
WHERE table_name = 'organizations' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Testar auth.uid() diretamente
SELECT 
    auth.uid() as current_user_id,
    pg_typeof(auth.uid()) as user_id_type;
