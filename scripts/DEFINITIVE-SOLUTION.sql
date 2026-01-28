-- ============================================================================
-- SOLUÇÃO DEFINITIVA - Execute TUDO de uma vez
-- ============================================================================
-- Este script resolve o problema "operator does not exist: text = uuid" de forma definitiva

-- ============================================================================
-- PASSO 1: REMOVER ABSOLUTAMENTE TUDO
-- ============================================================================
-- Remover todas as funções relacionadas (sem exceção)
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Remover todas as sobrecargas de upsert_organization_jsonb
  FOR r IN 
    SELECT oid, proname, pg_get_function_arguments(oid) as args
    FROM pg_proc
    WHERE proname LIKE '%upsert%organization%'
  LOOP
    BEGIN
      EXECUTE format('DROP FUNCTION IF EXISTS %s.%s(%s) CASCADE', 'public', r.proname, r.args);
      RAISE NOTICE 'Removed: %(%)', r.proname, r.args;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error removing %(%): %', r.proname, r.args, SQLERRM;
    END;
  END LOOP;
END $$;

-- Remover também funções com nomes diferentes
DROP FUNCTION IF EXISTS upsert_organization_jsonb CASCADE;
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb CASCADE;
DROP FUNCTION IF EXISTS upsert_organization CASCADE;
DROP FUNCTION IF EXISTS update_organization_extended CASCADE;

-- ============================================================================
-- PASSO 2: VERIFICAR TIPO DA COLUNA (DEVE SER UUID)
-- ============================================================================
DO $$
DECLARE
  col_type text;
BEGIN
  SELECT udt_name INTO col_type
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
    AND table_name = 'organizations'
    AND column_name = 'user_id';
  
  IF col_type != 'uuid' THEN
    RAISE EXCEPTION 'Coluna user_id não é UUID! Tipo atual: %. Execute: ALTER TABLE organizations ALTER COLUMN user_id TYPE uuid USING user_id::uuid;', col_type;
  END IF;
  
  RAISE NOTICE 'Coluna user_id é UUID - OK';
END $$;

-- ============================================================================
-- PASSO 3: RECRIAR FUNÇÃO ABSOLUTAMENTE CORRETA
-- ============================================================================
CREATE FUNCTION upsert_organization_jsonb(
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
BEGIN
  -- Validar entrada
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id cannot be NULL';
  END IF;
  
  -- Timestamp
  v_now := timezone('utc'::text, now());

  -- INSERT/UPDATE - UUID direto, sem conversões
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
    p_user_id,  -- UUID direto
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
    v_now,
    v_now + interval '12 months',
    v_now,
    v_now
  )
  ON CONFLICT ON CONSTRAINT organizations_user_id_key DO UPDATE SET
    name = EXCLUDED.name,
    legal_name = EXCLUDED.legal_name,
    dba = EXCLUDED.dba,
    type = EXCLUDED.type,
    state = EXCLUDED.state,
    address_street = EXCLUDED.address_street,
    address_city = EXCLUDED.address_city,
    address_state = EXCLUDED.address_state,
    address_zip = EXCLUDED.address_zip,
    security_officer_name = EXCLUDED.security_officer_name,
    security_officer_email = EXCLUDED.security_officer_email,
    security_officer_role = EXCLUDED.security_officer_role,
    privacy_officer_name = EXCLUDED.privacy_officer_name,
    privacy_officer_email = EXCLUDED.privacy_officer_email,
    privacy_officer_role = EXCLUDED.privacy_officer_role,
    employee_count = EXCLUDED.employee_count,
    has_employees = EXCLUDED.has_employees,
    uses_contractors = EXCLUDED.uses_contractors,
    stores_phi_electronically = EXCLUDED.stores_phi_electronically,
    uses_cloud_services = EXCLUDED.uses_cloud_services,
    assessment_date = CASE 
      WHEN public.organizations.assessment_date IS NULL THEN EXCLUDED.assessment_date
      ELSE public.organizations.assessment_date
    END,
    next_review_date = CASE
      WHEN public.organizations.assessment_date IS NULL THEN EXCLUDED.next_review_date
      ELSE public.organizations.next_review_date
    END,
    updated_at = v_now
  RETURNING public.organizations.id INTO v_org_id;

  -- Return - qualificar todas as colunas explicitamente
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
-- PASSO 4: PERMISSÕES
-- ============================================================================
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(uuid, jsonb) TO anon;

-- ============================================================================
-- PASSO 5: VERIFICAÇÃO FINAL
-- ============================================================================
SELECT 
  'Função criada' as status,
  proname as function_name,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';
