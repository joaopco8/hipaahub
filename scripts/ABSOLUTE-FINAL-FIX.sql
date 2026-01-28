-- ============================================================================
-- SOLUÇÃO ABSOLUTA E DEFINITIVA
-- ============================================================================
-- Execute TUDO de uma vez no Supabase SQL Editor
-- Este script resolve o problema de uma vez por todas

-- ============================================================================
-- PASSO 1: DIAGNÓSTICO COMPLETO
-- ============================================================================
-- Verificar TODAS as funções relacionadas
SELECT 
  oid,
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  oid::regprocedure as full_signature,
  prosrc as source_code
FROM pg_proc
WHERE proname LIKE '%upsert%organization%'
   OR proname LIKE '%organization%upsert%'
ORDER BY proname, oid;

-- ============================================================================
-- PASSO 2: REMOVER ABSOLUTAMENTE TUDO (SEM EXCEÇÃO)
-- ============================================================================
-- Remover todas as sobrecargas possíveis
DO $$
DECLARE
  r RECORD;
  drop_count INTEGER := 0;
BEGIN
  FOR r IN 
    SELECT oid, proname, pg_get_function_arguments(oid) as args
    FROM pg_proc
    WHERE proname LIKE '%upsert%organization%'
       OR proname LIKE '%organization%upsert%'
  LOOP
    BEGIN
      EXECUTE format('DROP FUNCTION IF EXISTS %s.%s(%s) CASCADE', 'public', r.proname, r.args);
      drop_count := drop_count + 1;
      RAISE NOTICE 'Removed: %(%)', r.proname, r.args;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error removing %(%): %', r.proname, r.args, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Total functions removed: %', drop_count;
END $$;

-- Remover também versões diretas (todas as combinações possíveis)
DROP FUNCTION IF EXISTS upsert_organization_jsonb(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(jsonb, uuid) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(jsonb, text) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb CASCADE;
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb CASCADE;

-- ============================================================================
-- PASSO 3: VERIFICAR SE FOI REMOVIDA (DEVE RETORNAR 0)
-- ============================================================================
SELECT 
  COUNT(*) as remaining_functions,
  string_agg(proname || '(' || pg_get_function_arguments(oid) || ')', ', ') as functions_list
FROM pg_proc
WHERE proname LIKE '%upsert%organization%';

-- Se retornar > 0, ainda há funções antigas. Execute o PASSO 2 novamente.

-- ============================================================================
-- PASSO 4: VERIFICAR TIPO DA COLUNA user_id
-- ============================================================================
SELECT 
  column_name, 
  data_type,
  udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'organizations'
  AND column_name = 'user_id';

-- Deve retornar: data_type = 'uuid', udt_name = 'uuid'

-- ============================================================================
-- PASSO 5: RECRIAR FUNÇÃO CORRETA (VERSÃO LIMPA)
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
  SELECT org.id INTO v_org_id
  FROM public.organizations org
  WHERE org.user_id = p_user_id
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
    UPDATE public.organizations org
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
      assessment_date = COALESCE(org.assessment_date, v_assessment_date),
      next_review_date = COALESCE(org.next_review_date, v_next_review_date),
      updated_at = v_now
    WHERE org.user_id = p_user_id
    RETURNING org.id INTO v_org_id;
  END IF;
  
  -- Retornar resultado
  RETURN QUERY
  SELECT 
    org.id,
    org.user_id,
    org.name,
    org.legal_name,
    org.dba,
    org.type,
    org.state,
    org.address_street,
    org.address_city,
    org.address_state,
    org.address_zip,
    org.security_officer_name,
    org.security_officer_email,
    org.security_officer_role,
    org.privacy_officer_name,
    org.privacy_officer_email,
    org.privacy_officer_role,
    org.employee_count,
    org.has_employees,
    org.uses_contractors,
    org.stores_phi_electronically,
    org.uses_cloud_services,
    org.assessment_date,
    org.next_review_date,
    org.created_at,
    org.updated_at
  FROM public.organizations org
  WHERE org.id = v_org_id;
END;
$$;

-- ============================================================================
-- PASSO 6: PERMISSÕES
-- ============================================================================
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(uuid, jsonb) TO anon;
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(uuid, jsonb) TO service_role;

-- ============================================================================
-- PASSO 7: VERIFICAÇÃO FINAL
-- ============================================================================
-- Verificar função criada
SELECT 
  '✅ Função criada' as status,
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  oid::regprocedure as full_signature
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';

-- Verificar se há funções com assinatura errada (text em vez de uuid)
SELECT 
  '⚠️ FUNÇÃO COM ASSINATURA ERRADA ENCONTRADA!' as warning,
  proname,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb'
  AND pg_get_function_arguments(oid) LIKE '%text%';

-- Se retornar linhas acima, há problema. Deve retornar 0 linhas.
