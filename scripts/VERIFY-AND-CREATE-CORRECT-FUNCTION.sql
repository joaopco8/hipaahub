-- ============================================================================
-- VERIFICAR E CRIAR FUNÇÃO CORRETA
-- ============================================================================
-- Execute este script após remover funções antigas
-- ============================================================================

-- ============================================================================
-- PASSO 1: VERIFICAR O QUE AINDA EXISTE
-- ============================================================================
SELECT 
  'FUNÇÕES EXISTENTES' as etapa,
  proname,
  pg_get_function_arguments(oid) as arguments,
  CASE 
    WHEN pg_get_function_arguments(oid) = 'p_data jsonb' THEN '✅ CORRETA'
    ELSE '❌ ANTIGA - REMOVER!'
  END as status
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';

-- ============================================================================
-- PASSO 2: REMOVER QUALQUER VERSÃO RESTANTE
-- ============================================================================
DROP FUNCTION IF EXISTS upsert_organization_jsonb(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(jsonb, uuid) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(jsonb, text) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb CASCADE;
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb CASCADE;

-- ============================================================================
-- PASSO 3: CRIAR FUNÇÃO CORRETA (SE NÃO EXISTIR)
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
  -- VALIDAÇÃO: auth.uid() retorna UUID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- PREPARAÇÃO
  v_now := timezone('utc'::text, now());
  v_assessment_date := v_now;
  v_next_review_date := v_assessment_date + interval '12 months';
  
  -- VERIFICAR EXISTÊNCIA (UUID = UUID)
  SELECT o.id INTO v_existing_org_id
  FROM public.organizations o
  WHERE o.user_id = v_user_id
  LIMIT 1;
  
  -- INSERT OU UPDATE
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
      v_user_id,
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
    -- UPDATE
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
    WHERE o.user_id = v_user_id
    RETURNING o.id INTO v_org_id;
  END IF;
  
  -- RETORNAR
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
-- PASSO 4: PERMISSÕES
-- ============================================================================
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(jsonb) TO anon;

-- ============================================================================
-- PASSO 5: FORÇAR REFRESH DO CACHE
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- PASSO 6: VERIFICAÇÃO FINAL
-- ============================================================================
SELECT 
  'VERIFICAÇÃO FINAL' as etapa,
  proname,
  pg_get_function_arguments(oid) as arguments,
  CASE 
    WHEN pg_get_function_arguments(oid) = 'p_data jsonb' THEN '✅ CORRETO - FUNÇÃO CRIADA!'
    ELSE '❌ ERRO - Função não foi criada corretamente'
  END as status
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';

-- Verificar quantidade
SELECT 
  'QUANTIDADE' as etapa,
  COUNT(*) as total,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ PERFEITO - Apenas uma função'
    WHEN COUNT(*) = 0 THEN '❌ ERRO - Nenhuma função existe!'
    ELSE '❌ PROBLEMA - Múltiplas funções'
  END as status
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';
