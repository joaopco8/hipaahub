-- ============================================================================
-- SOLUÇÃO FINAL E FUNCIONAL - Padrão correto de RPC
-- ============================================================================
-- Execute TUDO de uma vez no Supabase SQL Editor

-- ============================================================================
-- PASSO 1: REMOVER TODAS AS FUNÇÕES ANTIGAS
-- ============================================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT oid, proname, pg_get_function_arguments(oid) as args
    FROM pg_proc
    WHERE proname LIKE '%upsert%organization%'
  LOOP
    BEGIN
      EXECUTE format('DROP FUNCTION IF EXISTS %s.%s(%s) CASCADE', 'public', r.proname, r.args);
      RAISE NOTICE 'Removed: %(%)', r.proname, r.args;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error: %', SQLERRM;
    END;
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS upsert_organization_jsonb CASCADE;

-- ============================================================================
-- PASSO 2: RECRIAR FUNÇÃO COM PADRÃO CORRETO
-- ============================================================================
CREATE OR REPLACE FUNCTION upsert_organization_jsonb(
  p_user_id uuid,
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
  v_org_id uuid;
  v_now timestamp with time zone;
  v_assessment_date timestamp with time zone;
  v_next_review_date timestamp with time zone;
BEGIN
  -- Validar entrada
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id cannot be NULL';
  END IF;
  
  -- Timestamp
  v_now := timezone('utc'::text, now());
  v_assessment_date := v_now;
  v_next_review_date := v_assessment_date + interval '12 months';
  
  -- Verificar se organização já existe
  SELECT o.id INTO v_org_id
  FROM public.organizations o
  WHERE o.user_id = p_user_id
  LIMIT 1;
  
  -- Se não existe, INSERT
  IF v_org_id IS NULL THEN
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
      p_user_id,
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
      (p_data->>'employee_count')::integer,
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
    -- Se existe, UPDATE
    -- Usar subquery para obter valores atuais sem ambiguidade
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
      employee_count = (p_data->>'employee_count')::integer,
      has_employees = COALESCE((p_data->>'has_employees')::boolean, true),
      uses_contractors = COALESCE((p_data->>'uses_contractors')::boolean, false),
      stores_phi_electronically = COALESCE((p_data->>'stores_phi_electronically')::boolean, true),
      uses_cloud_services = COALESCE((p_data->>'uses_cloud_services')::boolean, false),
      assessment_date = COALESCE(o.assessment_date, v_assessment_date),
      next_review_date = COALESCE(o.next_review_date, v_next_review_date),
      updated_at = v_now
    WHERE o.user_id = p_user_id
    RETURNING o.id INTO v_org_id;
  END IF;
  
  -- Retornar resultado
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.name,
    o.legal_name,
    o.dba,
    o.type,
    o.state,
    o.address_street,
    o.address_city,
    o.address_state,
    o.address_zip,
    o.security_officer_name,
    o.security_officer_email,
    o.security_officer_role,
    o.privacy_officer_name,
    o.privacy_officer_email,
    o.privacy_officer_role,
    o.employee_count,
    o.has_employees,
    o.uses_contractors,
    o.stores_phi_electronically,
    o.uses_cloud_services,
    o.assessment_date,
    o.next_review_date,
    o.created_at,
    o.updated_at
  FROM public.organizations o
  WHERE o.id = v_org_id;
END;
$$;

-- ============================================================================
-- PASSO 3: PERMISSÕES
-- ============================================================================
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(uuid, jsonb) TO anon;

-- ============================================================================
-- PASSO 4: VERIFICAÇÃO
-- ============================================================================
SELECT 
  'Função criada com sucesso' as status,
  proname as function_name,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';
