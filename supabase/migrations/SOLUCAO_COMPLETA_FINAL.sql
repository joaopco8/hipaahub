-- ============================================================================
-- CORREÇÃO DEFINITIVA COMPLETA + RLS POLICIES
-- ============================================================================
-- Este script resolve TUDO: função RPC + RLS policies + tipos UUID
-- Execute este script no Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PASSO 1: Converter coluna user_id para UUID (se necessário)
-- ============================================================================
DO $$
DECLARE
    v_user_id_type text;
BEGIN
    SELECT data_type INTO v_user_id_type
    FROM information_schema.columns
    WHERE table_name = 'organizations'
      AND column_name = 'user_id'
      AND table_schema = 'public';
    
    RAISE NOTICE 'Tipo atual da coluna user_id: %', v_user_id_type;
    
    -- Se não for uuid, converter
    IF v_user_id_type != 'uuid' AND v_user_id_type IS NOT NULL THEN
        RAISE NOTICE 'Convertendo coluna user_id para UUID...';
        ALTER TABLE organizations 
        ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
        RAISE NOTICE '✅ Coluna user_id convertida para UUID';
    ELSE
        RAISE NOTICE '✅ Coluna user_id já é do tipo UUID';
    END IF;
END $$;

-- ============================================================================
-- PASSO 2: Corrigir RLS Policies (CRÍTICO!)
-- ============================================================================
-- Remover policies antigas que podem ter comparações text = uuid
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
DROP POLICY IF EXISTS "Users can insert own organization" ON organizations;
DROP POLICY IF EXISTS "Users can update own organization" ON organizations;
DROP POLICY IF EXISTS "Users can delete own organization" ON organizations;
DROP POLICY IF EXISTS "Can view own organization" ON organizations;
DROP POLICY IF EXISTS "Can insert own organization" ON organizations;
DROP POLICY IF EXISTS "Can update own organization" ON organizations;

-- Recriar policies com comparação UUID = UUID correta
CREATE POLICY "Users can view own organization" ON organizations
  FOR SELECT USING (user_id::uuid = auth.uid()::uuid);

CREATE POLICY "Users can insert own organization" ON organizations
  FOR INSERT WITH CHECK (user_id::uuid = auth.uid()::uuid);

CREATE POLICY "Users can update own organization" ON organizations
  FOR UPDATE USING (user_id::uuid = auth.uid()::uuid);

CREATE POLICY "Users can delete own organization" ON organizations
  FOR DELETE USING (user_id::uuid = auth.uid()::uuid);

-- ============================================================================
-- PASSO 3: Remover TODAS as funções antigas
-- ============================================================================
DROP FUNCTION IF EXISTS upsert_organization_jsonb(jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb(jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb(uuid, jsonb) CASCADE;

-- Remover qualquer função com nome similar
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN 
        SELECT oid, proname, oidvectortypes(proargtypes) as args
        FROM pg_proc 
        WHERE proname LIKE 'upsert_organization%'
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %s.%I(%s) CASCADE', 
            'public', r.proname, r.args);
        RAISE NOTICE 'Removida função: %(%)', r.proname, r.args;
    END LOOP;
END $$;

-- ============================================================================
-- PASSO 4: Garantir que a coluna de metadata existe
-- ============================================================================
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS onboarding_metadata jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_organizations_onboarding_metadata 
ON organizations USING gin (onboarding_metadata);

-- ============================================================================
-- PASSO 5: Criar função RPC CORRETA com tipos explícitos
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
  ein text,
  npi text,
  state_license_number text,
  state_tax_id text,
  authorized_representative_name text,
  authorized_representative_title text,
  ceo_name text,
  ceo_title text,
  performs_laboratory_tests boolean,
  clia_certificate_number text,
  serves_medicare_patients boolean,
  medicare_provider_number text,
  phone_number text,
  email_address text,
  website text,
  accreditation_status text,
  types_of_services text,
  insurance_coverage text,
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
  v_user_id uuid;  -- Tipo explícito UUID
  v_org_id uuid;
  v_now timestamp with time zone;
  v_assessment_date timestamp with time zone;
  v_next_review_date timestamp with time zone;
  v_existing_org_id uuid;
  v_metadata jsonb;
BEGIN
  -- SECURITY: Obter UUID do usuário autenticado
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Garantir que v_user_id é UUID (cast explícito)
  v_user_id := v_user_id::uuid;
  
  -- EXTRACT METADATA
  v_metadata := jsonb_build_object(
    'practice_type_primary', p_data->>'practice_type_primary',
    'specialties', p_data->'specialties',
    'number_of_locations', CASE WHEN p_data->>'number_of_locations' IS NOT NULL AND p_data->>'number_of_locations' != '' THEN (p_data->>'number_of_locations')::integer ELSE NULL END,
    'multi_state_operations', CASE WHEN p_data->>'multi_state_operations' IS NOT NULL AND p_data->>'multi_state_operations' != '' THEN (p_data->>'multi_state_operations')::boolean ELSE NULL END,
    'remote_workforce', CASE WHEN p_data->>'remote_workforce' IS NOT NULL AND p_data->>'remote_workforce' != '' THEN (p_data->>'remote_workforce')::boolean ELSE NULL END,
    'ehr_system', p_data->>'ehr_system',
    'email_provider', p_data->>'email_provider',
    'cloud_storage_provider', p_data->>'cloud_storage_provider',
    'uses_vpn', CASE WHEN p_data->>'uses_vpn' IS NOT NULL AND p_data->>'uses_vpn' != '' THEN (p_data->>'uses_vpn')::boolean ELSE NULL END,
    'vpn_provider', p_data->>'vpn_provider',
    'device_types', p_data->'device_types',
    'security_officer_role_other', p_data->>'security_officer_role_other',
    'privacy_officer_role_other', p_data->>'privacy_officer_role_other',
    'primary_contact_name', p_data->>'primary_contact_name',
    'compliance_contact_email', p_data->>'compliance_contact_email',
    'compliance_contact_phone', p_data->>'compliance_contact_phone'
  );
  
  -- Remove null values from metadata
  SELECT jsonb_object_agg(key, value)
  INTO v_metadata
  FROM jsonb_each(v_metadata)
  WHERE value IS NOT NULL AND value::text != 'null';
  
  -- Se v_metadata ficou null, usar objeto vazio
  IF v_metadata IS NULL THEN
    v_metadata := '{}'::jsonb;
  END IF;
  
  -- PREPARE DATA
  v_now := timezone('utc'::text, now());
  v_assessment_date := v_now;
  v_next_review_date := v_assessment_date + interval '12 months';
  
  -- CHECK IF ORGANIZATION EXISTS - CRÍTICO: Comparação UUID = UUID com cast explícito
  SELECT o.id INTO v_existing_org_id
  FROM public.organizations o
  WHERE o.user_id::uuid = v_user_id::uuid  -- Cast explícito em ambos os lados
  LIMIT 1;
  
  -- INSERT OR UPDATE
  IF v_existing_org_id IS NULL THEN
    -- INSERT
    INSERT INTO public.organizations (
      id, user_id, name, legal_name, dba, type, state,
      address_street, address_city, address_state, address_zip,
      security_officer_name, security_officer_email, security_officer_role,
      privacy_officer_name, privacy_officer_email, privacy_officer_role,
      employee_count, has_employees, uses_contractors,
      stores_phi_electronically, uses_cloud_services,
      ein, npi, state_license_number, state_tax_id,
      authorized_representative_name, authorized_representative_title,
      ceo_name, ceo_title,
      performs_laboratory_tests, clia_certificate_number,
      serves_medicare_patients, medicare_provider_number,
      phone_number, email_address, website,
      accreditation_status, types_of_services, insurance_coverage,
      onboarding_metadata, assessment_date, next_review_date,
      created_at, updated_at
    )
    VALUES (
      gen_random_uuid(),
      v_user_id::uuid,  -- Cast explícito
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
      NULLIF(p_data->>'ein', ''),
      NULLIF(p_data->>'npi', ''),
      NULLIF(p_data->>'state_license_number', ''),
      NULLIF(p_data->>'state_tax_id', ''),
      NULLIF(p_data->>'authorized_representative_name', ''),
      NULLIF(p_data->>'authorized_representative_title', ''),
      NULLIF(p_data->>'ceo_name', ''),
      NULLIF(p_data->>'ceo_title', ''),
      COALESCE((p_data->>'performs_laboratory_tests')::boolean, false),
      NULLIF(p_data->>'clia_certificate_number', ''),
      COALESCE((p_data->>'serves_medicare_patients')::boolean, false),
      NULLIF(p_data->>'medicare_provider_number', ''),
      NULLIF(p_data->>'phone_number', ''),
      NULLIF(p_data->>'email_address', ''),
      NULLIF(p_data->>'website', ''),
      NULLIF(p_data->>'accreditation_status', ''),
      NULLIF(p_data->>'types_of_services', ''),
      NULLIF(p_data->>'insurance_coverage', ''),
      v_metadata,
      v_assessment_date,
      v_next_review_date,
      v_now,
      v_now
    )
    RETURNING public.organizations.id INTO v_org_id;
  ELSE
    -- UPDATE - CRÍTICO: Cast explícito na cláusula WHERE
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
      ein = COALESCE(NULLIF(p_data->>'ein', ''), o.ein),
      npi = COALESCE(NULLIF(p_data->>'npi', ''), o.npi),
      state_license_number = COALESCE(NULLIF(p_data->>'state_license_number', ''), o.state_license_number),
      state_tax_id = COALESCE(NULLIF(p_data->>'state_tax_id', ''), o.state_tax_id),
      authorized_representative_name = COALESCE(NULLIF(p_data->>'authorized_representative_name', ''), o.authorized_representative_name),
      authorized_representative_title = COALESCE(NULLIF(p_data->>'authorized_representative_title', ''), o.authorized_representative_title),
      ceo_name = COALESCE(NULLIF(p_data->>'ceo_name', ''), o.ceo_name),
      ceo_title = COALESCE(NULLIF(p_data->>'ceo_title', ''), o.ceo_title),
      performs_laboratory_tests = COALESCE((p_data->>'performs_laboratory_tests')::boolean, o.performs_laboratory_tests),
      clia_certificate_number = COALESCE(NULLIF(p_data->>'clia_certificate_number', ''), o.clia_certificate_number),
      serves_medicare_patients = COALESCE((p_data->>'serves_medicare_patients')::boolean, o.serves_medicare_patients),
      medicare_provider_number = COALESCE(NULLIF(p_data->>'medicare_provider_number', ''), o.medicare_provider_number),
      phone_number = COALESCE(NULLIF(p_data->>'phone_number', ''), o.phone_number),
      email_address = COALESCE(NULLIF(p_data->>'email_address', ''), o.email_address),
      website = COALESCE(NULLIF(p_data->>'website', ''), o.website),
      accreditation_status = COALESCE(NULLIF(p_data->>'accreditation_status', ''), o.accreditation_status),
      types_of_services = COALESCE(NULLIF(p_data->>'types_of_services', ''), o.types_of_services),
      insurance_coverage = COALESCE(NULLIF(p_data->>'insurance_coverage', ''), o.insurance_coverage),
      onboarding_metadata = COALESCE(o.onboarding_metadata, '{}'::jsonb) || v_metadata,
      assessment_date = COALESCE(o.assessment_date, v_assessment_date),
      next_review_date = COALESCE(o.next_review_date, v_next_review_date),
      updated_at = v_now
    WHERE o.user_id::uuid = v_user_id::uuid  -- Cast explícito em ambos os lados
    RETURNING o.id INTO v_org_id;
  END IF;
  
  -- RETURN RESULT
  RETURN QUERY
  SELECT 
    o.id, o.user_id, o.name, o.legal_name, o.dba, o.type, o.state,
    o.address_street, o.address_city, o.address_state, o.address_zip,
    o.security_officer_name, o.security_officer_email, o.security_officer_role,
    o.privacy_officer_name, o.privacy_officer_email, o.privacy_officer_role,
    o.employee_count, o.has_employees, o.uses_contractors,
    o.stores_phi_electronically, o.uses_cloud_services,
    o.ein, o.npi, o.state_license_number, o.state_tax_id,
    o.authorized_representative_name, o.authorized_representative_title,
    o.ceo_name, o.ceo_title,
    o.performs_laboratory_tests, o.clia_certificate_number,
    o.serves_medicare_patients, o.medicare_provider_number,
    o.phone_number, o.email_address, o.website,
    o.accreditation_status, o.types_of_services, o.insurance_coverage,
    o.assessment_date, o.next_review_date,
    o.created_at, o.updated_at
  FROM public.organizations o
  WHERE o.id = v_org_id;
END;
$$;

-- ============================================================================
-- PASSO 6: Permissões
-- ============================================================================
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(jsonb) TO anon;

-- ============================================================================
-- PASSO 7: Verificação final
-- ============================================================================
DO $$
BEGIN
  -- Verificar função
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'upsert_organization_jsonb' 
    AND pg_get_function_arguments(oid) = 'p_data jsonb'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    RAISE NOTICE '✅ Function upsert_organization_jsonb created successfully';
  ELSE
    RAISE EXCEPTION '❌ Function was not created correctly';
  END IF;
  
  -- Verificar tipo da coluna user_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations'
      AND column_name = 'user_id'
      AND data_type = 'uuid'
      AND table_schema = 'public'
  ) THEN
    RAISE NOTICE '✅ Column user_id is UUID type';
  ELSE
    RAISE WARNING '⚠️ Column user_id is NOT UUID type - this may cause issues';
  END IF;
  
  -- Verificar policies
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'organizations'
      AND schemaname = 'public'
      AND policyname = 'Users can view own organization'
  ) THEN
    RAISE NOTICE '✅ RLS Policies created successfully';
  ELSE
    RAISE WARNING '⚠️ RLS Policies may not be created correctly';
  END IF;
END $$;
