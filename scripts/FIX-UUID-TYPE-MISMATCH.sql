-- ============================================================================
-- CORREÇÃO DEFINITIVA: Problema text = uuid
-- ============================================================================
-- Este script corrige o erro "operator does not exist: text = uuid"
-- Execute COMPLETO no Supabase SQL Editor

-- ============================================================================
-- PASSO 1: VERIFICAR TIPO REAL DA COLUNA user_id
-- ============================================================================
SELECT 
  column_name, 
  data_type,
  udt_name as postgres_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'organizations'
  AND column_name = 'user_id';

-- Se retornar 'uuid' → OK
-- Se retornar 'text' → PRECISA CONVERTER (veja PASSO 2)

-- ============================================================================
-- PASSO 2: CONVERTER COLUNA PARA UUID (SE NECESSÁRIO)
-- ============================================================================
-- Execute APENAS se o PASSO 1 retornou 'text'
-- Descomente as linhas abaixo se necessário:

/*
-- Verificar se há dados inválidos antes de converter
SELECT COUNT(*) as invalid_uuids
FROM organizations
WHERE user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Se retornar 0, pode converter com segurança
ALTER TABLE organizations
ALTER COLUMN user_id TYPE uuid
USING user_id::uuid;
*/

-- ============================================================================
-- PASSO 3: LISTAR TODAS AS FUNÇÕES RELACIONADAS
-- ============================================================================
SELECT 
  oid,
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  oid::regprocedure as full_signature,
  prosrc as source_code
FROM pg_proc
WHERE proname LIKE '%upsert%organization%'
ORDER BY proname, oid;

-- ============================================================================
-- PASSO 4: REMOVER TODAS AS FUNÇÕES (TODAS AS SOBRECARGAS)
-- ============================================================================
DO $$
DECLARE
  func_record RECORD;
  drop_sql TEXT;
BEGIN
  FOR func_record IN 
    SELECT 
      oid,
      proname,
      pg_get_function_arguments(oid) as args
    FROM pg_proc
    WHERE proname = 'upsert_organization_jsonb'
  LOOP
    BEGIN
      drop_sql := format('DROP FUNCTION IF EXISTS %s.%s(%s) CASCADE', 
        'public', 
        func_record.proname, 
        func_record.args
      );
      EXECUTE drop_sql;
      RAISE NOTICE 'Removed: %(%)', func_record.proname, func_record.args;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error removing %(%): %', func_record.proname, func_record.args, SQLERRM;
    END;
  END LOOP;
END $$;

-- Remover também versões diretas
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb CASCADE;

-- ============================================================================
-- PASSO 5: VERIFICAR SE FOI REMOVIDA
-- ============================================================================
SELECT 
  COUNT(*) as remaining_functions
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';

-- Deve retornar 0

-- ============================================================================
-- PASSO 6: RECRIAR FUNÇÃO CORRETA (UUID EM TUDO)
-- ============================================================================
CREATE OR REPLACE FUNCTION upsert_organization_jsonb(
  p_user_id uuid,  -- UUID explícito
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
AS $function$
DECLARE
  v_assessment_date timestamp with time zone;
  v_next_review_date timestamp with time zone;
  v_org_id uuid;
  v_user_id uuid;  -- UUID, não text
  v_now timestamp with time zone;
BEGIN
  -- Validar que p_user_id é UUID válido
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id cannot be NULL';
  END IF;
  
  -- CRÍTICO: p_user_id já é UUID, não precisa converter
  -- NUNCA faça: v_user_id := p_user_id::text (isso causaria text = uuid)
  v_user_id := p_user_id;  -- UUID = UUID ✅
  
  -- Get current timestamp
  v_now := timezone('utc'::text, now());
  
  -- Set assessment dates
  v_assessment_date := v_now;
  v_next_review_date := v_assessment_date + interval '12 months';

  -- INSERT
  -- CRÍTICO: user_id na tabela é UUID, v_user_id é UUID
  -- NUNCA faça: user_id = v_user_id::text
  INSERT INTO public.organizations (
    id,
    user_id,  -- UUID
    name,
    legal_name,
    dba,
    type,
    state,
    address_street,
    address_city,
    address_state,
    address_zip,
    security_officer_name,
    security_officer_email,
    security_officer_role,
    privacy_officer_name,
    privacy_officer_email,
    privacy_officer_role,
    employee_count,
    has_employees,
    uses_contractors,
    stores_phi_electronically,
    uses_cloud_services,
    assessment_date,
    next_review_date,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    v_user_id,  -- UUID = UUID ✅
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
  -- CRÍTICO: ON CONFLICT usa user_id (UUID) = EXCLUDED.user_id (UUID)
  -- NUNCA faça: WHERE user_id::text = ...
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
      WHEN organizations.assessment_date IS NULL THEN EXCLUDED.assessment_date
      ELSE organizations.assessment_date
    END,
    next_review_date = CASE
      WHEN organizations.assessment_date IS NULL THEN EXCLUDED.next_review_date
      ELSE organizations.next_review_date
    END,
    updated_at = v_now
  RETURNING public.organizations.id INTO v_org_id;

  -- Return result
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
  WHERE o.id = v_org_id;  -- UUID = UUID ✅
END;
$function$;

-- ============================================================================
-- PASSO 7: CONCEDER PERMISSÕES
-- ============================================================================
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(uuid, jsonb) TO anon;

-- ============================================================================
-- PASSO 8: VERIFICAÇÃO FINAL
-- ============================================================================
-- Verificar função criada
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  oid::regprocedure as full_signature,
  prosecdef as security_definer
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';

-- Verificar se há comparações text = uuid no código da função
SELECT 
  proname,
  prosrc
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb'
  AND (
    prosrc LIKE '%::text%'
    OR prosrc LIKE '%text =%'
    OR prosrc LIKE '%= text%'
  );

-- Se retornar linhas, há problemas. Se retornar 0 linhas, está OK.
