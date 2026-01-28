-- ============================================================================
-- DIAGNÓSTICO E CORREÇÃO DEFINITIVA
-- ============================================================================
-- Execute este script COMPLETO no Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PASSO 1: DIAGNÓSTICO - Listar TODAS as funções relacionadas
-- ============================================================================
SELECT 
  'DIAGNÓSTICO INICIAL' as etapa,
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  oid::regprocedure as full_signature
FROM pg_proc
WHERE proname LIKE '%upsert%organization%'
   OR proname LIKE '%update%organization%'
ORDER BY proname, arguments;

-- ============================================================================
-- PASSO 2: REMOVER ABSOLUTAMENTE TUDO
-- ============================================================================
DO $$
DECLARE
  r RECORD;
  removed_count INTEGER := 0;
BEGIN
  RAISE NOTICE '=== Removendo TODAS as funções upsert_organization* e update_organization* ===';
  
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

-- Remover explicitamente também
DROP FUNCTION IF EXISTS upsert_organization_jsonb(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb CASCADE;
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb_v2 CASCADE;
DROP FUNCTION IF EXISTS update_organization_extended CASCADE;

-- ============================================================================
-- PASSO 3: VERIFICAR QUE TUDO FOI REMOVIDO
-- ============================================================================
SELECT 
  'APÓS LIMPEZA' as etapa,
  COUNT(*) as funcoes_restantes,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ TUDO REMOVIDO - PRONTO PARA CRIAR'
    ELSE '❌ AINDA EXISTEM FUNÇÕES - PROBLEMA!'
  END as status
FROM pg_proc
WHERE proname LIKE '%upsert%organization%'
   OR proname LIKE '%update%organization%extended%';

-- ============================================================================
-- PASSO 4: CRIAR FUNÇÃO DEFINITIVA (SEM NENHUMA COMPARAÇÃO TEXT = UUID)
-- ============================================================================
CREATE OR REPLACE FUNCTION upsert_organization_jsonb(
  p_data jsonb
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  legal_name text,
  dba text,
  type text,
  state text,
  address_street text,
  address_city text,
  address_state text,
  address_zip text,
  security_officer_name text,
  security_officer_email text,
  security_officer_role text,
  privacy_officer_name text,
  privacy_officer_email text,
  privacy_officer_role text,
  employee_count integer,
  has_employees boolean,
  uses_contractors boolean,
  stores_phi_electronically boolean,
  uses_cloud_services boolean,
  assessment_date timestamp with time zone,
  next_review_date timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
  v_now timestamp with time zone;
  v_assessment_date timestamp with time zone;
  v_next_review_date timestamp with time zone;
  v_existing_org_id uuid;
BEGIN
  -- ========================================================================
  -- CRÍTICO: auth.uid() retorna UUID, armazenar em variável UUID
  -- ========================================================================
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- ========================================================================
  -- PREPARAÇÃO
  -- ========================================================================
  v_now := timezone('utc'::text, now());
  v_assessment_date := v_now;
  v_next_review_date := v_assessment_date + interval '12 months';
  
  -- ========================================================================
  -- VERIFICAR EXISTÊNCIA - CRÍTICO: v_user_id é UUID, o.user_id é UUID
  -- ========================================================================
  SELECT o.id INTO v_existing_org_id
  FROM public.organizations o
  WHERE o.user_id = v_user_id  -- UUID = UUID (CORRETO)
  LIMIT 1;
  
  -- ========================================================================
  -- INSERT OU UPDATE
  -- ========================================================================
  IF v_existing_org_id IS NULL THEN
    -- INSERT
    INSERT INTO public.organizations (
      id, user_id, name, legal_name, dba, type, state,
      address_street, address_city, address_state, address_zip,
      security_officer_name, security_officer_email, security_officer_role,
      privacy_officer_name, privacy_officer_email, privacy_officer_role,
      employee_count, has_employees, uses_contractors,
      stores_phi_electronically, uses_cloud_services,
      assessment_date, next_review_date, created_at, updated_at
    )
    VALUES (
      gen_random_uuid(),
      v_user_id,  -- UUID direto (CORRETO)
      p_data->>'name',
      p_data->>'legal_name',
      NULLIF(p_data->>'dba', ''),
      p_data->>'type',
      p_data->>'state',
      p_data->>'address_street',
      p_data->>'address_city',
      p_data->>'address_state',
      p_data->>'address_zip',
      p_data->>'security_officer_name',
      p_data->>'security_officer_email',
      p_data->>'security_officer_role',
      p_data->>'privacy_officer_name',
      p_data->>'privacy_officer_email',
      p_data->>'privacy_officer_role',
      COALESCE((p_data->>'employee_count')::integer, 1),
      COALESCE((p_data->>'has_employees')::boolean, true),
      COALESCE((p_data->>'uses_contractors')::boolean, false),
      COALESCE((p_data->>'stores_phi_electronically')::boolean, true),
      COALESCE((p_data->>'uses_cloud_services')::boolean, false),
      v_assessment_date,
      v_next_review_date,
      v_now,
      v_now
    )
    RETURNING public.organizations.id INTO v_org_id;
  ELSE
    -- UPDATE - CRÍTICO: v_user_id é UUID, o.user_id é UUID
    UPDATE public.organizations o
    SET
      name = p_data->>'name',
      legal_name = p_data->>'legal_name',
      dba = NULLIF(p_data->>'dba', ''),
      type = p_data->>'type',
      state = p_data->>'state',
      address_street = p_data->>'address_street',
      address_city = p_data->>'address_city',
      address_state = p_data->>'address_state',
      address_zip = p_data->>'address_zip',
      security_officer_name = p_data->>'security_officer_name',
      security_officer_email = p_data->>'security_officer_email',
      security_officer_role = p_data->>'security_officer_role',
      privacy_officer_name = p_data->>'privacy_officer_name',
      privacy_officer_email = p_data->>'privacy_officer_email',
      privacy_officer_role = p_data->>'privacy_officer_role',
      employee_count = COALESCE((p_data->>'employee_count')::integer, o.employee_count),
      has_employees = COALESCE((p_data->>'has_employees')::boolean, o.has_employees),
      uses_contractors = COALESCE((p_data->>'uses_contractors')::boolean, o.uses_contractors),
      stores_phi_electronically = COALESCE((p_data->>'stores_phi_electronically')::boolean, o.stores_phi_electronically),
      uses_cloud_services = COALESCE((p_data->>'uses_cloud_services')::boolean, o.uses_cloud_services),
      assessment_date = COALESCE(o.assessment_date, v_assessment_date),
      next_review_date = COALESCE(o.next_review_date, v_next_review_date),
      updated_at = v_now
    WHERE o.user_id = v_user_id  -- UUID = UUID (CORRETO)
    RETURNING o.id INTO v_org_id;
  END IF;
  
  -- ========================================================================
  -- RETORNAR
  -- ========================================================================
  RETURN QUERY
  SELECT 
    o.id, o.user_id, o.name, o.legal_name, o.dba,
    o.type, o.state, o.address_street, o.address_city,
    o.address_state, o.address_zip, o.security_officer_name,
    o.security_officer_email, o.security_officer_role,
    o.privacy_officer_name, o.privacy_officer_email,
    o.privacy_officer_role, o.employee_count, o.has_employees,
    o.uses_contractors, o.stores_phi_electronically,
    o.uses_cloud_services, o.assessment_date, o.next_review_date,
    o.created_at, o.updated_at
  FROM public.organizations o
  WHERE o.id = v_org_id;
END;
$$;

-- ============================================================================
-- PASSO 5: PERMISSÕES
-- ============================================================================
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(jsonb) TO anon;

-- ============================================================================
-- PASSO 6: FORÇAR REFRESH DO CACHE (CRÍTICO!)
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- PASSO 7: VERIFICAÇÃO FINAL
-- ============================================================================
SELECT 
  'VERIFICAÇÃO FINAL' as etapa,
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  CASE 
    WHEN pg_get_function_arguments(oid) = 'p_data jsonb' THEN '✅ CORRETO'
    ELSE '❌ ERRO'
  END as status
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';

-- Verificar quantidade (deve ser 1)
SELECT 
  'QUANTIDADE' as etapa,
  COUNT(*) as total,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ PERFEITO'
    WHEN COUNT(*) = 0 THEN '❌ FUNÇÃO NÃO EXISTE'
    ELSE '❌ MÚLTIPLAS FUNÇÕES'
  END as status
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';
