-- ============================================================================
-- CORREÇÃO DEFINITIVA - RLS POLICIES + FUNÇÃO
-- ============================================================================
-- Execute este script COMPLETO no Supabase SQL Editor
-- ============================================================================

-- PASSO 1: Converter user_id para UUID (se necessário)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'organizations' AND column_name = 'user_id' AND data_type != 'uuid'
    ) THEN
        ALTER TABLE organizations ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
        RAISE NOTICE '✅ user_id convertido para UUID';
    ELSE
        RAISE NOTICE '✅ user_id já é UUID';
    END IF;
END $$;

-- PASSO 2: REMOVER TODAS AS POLÍTICAS RLS ANTIGAS
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
DROP POLICY IF EXISTS "Users can insert own organization" ON organizations;
DROP POLICY IF EXISTS "Users can update own organization" ON organizations;
DROP POLICY IF EXISTS "Users can delete own organization" ON organizations;
DROP POLICY IF EXISTS "Can view own organization" ON organizations;
DROP POLICY IF EXISTS "Can insert own organization" ON organizations;
DROP POLICY IF EXISTS "Can update own organization" ON organizations;
DROP POLICY IF EXISTS "Can delete own organization" ON organizations;
DROP POLICY IF EXISTS "organizations_select_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_insert_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_update_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_delete_policy" ON organizations;

-- Remover todas as políticas que possam existir
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'organizations' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON organizations', r.policyname);
    END LOOP;
END $$;

-- PASSO 3: Recriar políticas RLS CORRETAS (com UUID explícito)
CREATE POLICY "organizations_select_policy" ON organizations
    FOR SELECT
    USING (user_id = auth.uid()::uuid);

CREATE POLICY "organizations_insert_policy" ON organizations
    FOR INSERT
    WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "organizations_update_policy" ON organizations
    FOR UPDATE
    USING (user_id = auth.uid()::uuid)
    WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "organizations_delete_policy" ON organizations
    FOR DELETE
    USING (user_id = auth.uid()::uuid);

-- PASSO 4: Remover funções antigas
DROP FUNCTION IF EXISTS upsert_organization_jsonb(jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(uuid, jsonb) CASCADE;

-- PASSO 5: Adicionar coluna metadata
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS onboarding_metadata jsonb DEFAULT '{}'::jsonb;

-- PASSO 6: Criar função CORRETA
CREATE OR REPLACE FUNCTION upsert_organization_jsonb(p_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
  v_now timestamp with time zone;
  v_existing_id uuid;
  v_metadata jsonb;
BEGIN
  -- Obter UUID do usuário (já é UUID)
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Extrair metadata
  v_metadata := jsonb_build_object(
    'practice_type_primary', NULLIF(p_data->>'practice_type_primary', ''),
    'specialties', p_data->'specialties',
    'number_of_locations', CASE WHEN p_data->>'number_of_locations' ~ '^[0-9]+$' THEN (p_data->>'number_of_locations')::integer ELSE NULL END,
    'multi_state_operations', CASE WHEN p_data->>'multi_state_operations' = 'true' THEN true WHEN p_data->>'multi_state_operations' = 'false' THEN false ELSE NULL END,
    'remote_workforce', CASE WHEN p_data->>'remote_workforce' = 'true' THEN true WHEN p_data->>'remote_workforce' = 'false' THEN false ELSE NULL END,
    'ehr_system', NULLIF(p_data->>'ehr_system', ''),
    'email_provider', NULLIF(p_data->>'email_provider', ''),
    'cloud_storage_provider', NULLIF(p_data->>'cloud_storage_provider', ''),
    'uses_vpn', CASE WHEN p_data->>'uses_vpn' = 'true' THEN true WHEN p_data->>'uses_vpn' = 'false' THEN false ELSE NULL END,
    'vpn_provider', NULLIF(p_data->>'vpn_provider', ''),
    'device_types', p_data->'device_types',
    'security_officer_role_other', NULLIF(p_data->>'security_officer_role_other', ''),
    'privacy_officer_role_other', NULLIF(p_data->>'privacy_officer_role_other', ''),
    'primary_contact_name', NULLIF(p_data->>'primary_contact_name', ''),
    'compliance_contact_email', NULLIF(p_data->>'compliance_contact_email', ''),
    'compliance_contact_phone', NULLIF(p_data->>'compliance_contact_phone', '')
  );
  
  SELECT jsonb_object_agg(key, value) INTO v_metadata
  FROM jsonb_each(v_metadata)
  WHERE value IS NOT NULL AND value::text NOT IN ('null', '""');
  
  IF v_metadata IS NULL THEN v_metadata := '{}'::jsonb; END IF;
  
  v_now := now();
  
  -- Verificar se existe (comparação UUID direta)
  SELECT id INTO v_existing_id 
  FROM organizations 
  WHERE user_id = v_user_id
  LIMIT 1;
  
  -- INSERT ou UPDATE
  IF v_existing_id IS NULL THEN
    INSERT INTO organizations (
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
      gen_random_uuid(), v_user_id,
      NULLIF(p_data->>'name', ''), NULLIF(p_data->>'legal_name', ''), NULLIF(p_data->>'dba', ''),
      NULLIF(p_data->>'type', ''), NULLIF(p_data->>'state', ''),
      NULLIF(p_data->>'address_street', ''), NULLIF(p_data->>'address_city', ''),
      NULLIF(p_data->>'address_state', ''), NULLIF(p_data->>'address_zip', ''),
      NULLIF(p_data->>'security_officer_name', ''), NULLIF(p_data->>'security_officer_email', ''),
      NULLIF(p_data->>'security_officer_role', ''),
      NULLIF(p_data->>'privacy_officer_name', ''), NULLIF(p_data->>'privacy_officer_email', ''),
      NULLIF(p_data->>'privacy_officer_role', ''),
      COALESCE((p_data->>'employee_count')::integer, 1),
      COALESCE((p_data->>'has_employees')::boolean, true),
      COALESCE((p_data->>'uses_contractors')::boolean, false),
      COALESCE((p_data->>'stores_phi_electronically')::boolean, true),
      COALESCE((p_data->>'uses_cloud_services')::boolean, false),
      NULLIF(p_data->>'ein', ''), NULLIF(p_data->>'npi', ''),
      NULLIF(p_data->>'state_license_number', ''), NULLIF(p_data->>'state_tax_id', ''),
      NULLIF(p_data->>'authorized_representative_name', ''), NULLIF(p_data->>'authorized_representative_title', ''),
      NULLIF(p_data->>'ceo_name', ''), NULLIF(p_data->>'ceo_title', ''),
      COALESCE((p_data->>'performs_laboratory_tests')::boolean, false),
      NULLIF(p_data->>'clia_certificate_number', ''),
      COALESCE((p_data->>'serves_medicare_patients')::boolean, false),
      NULLIF(p_data->>'medicare_provider_number', ''),
      NULLIF(p_data->>'phone_number', ''), NULLIF(p_data->>'email_address', ''),
      NULLIF(p_data->>'website', ''), NULLIF(p_data->>'accreditation_status', ''),
      NULLIF(p_data->>'types_of_services', ''), NULLIF(p_data->>'insurance_coverage', ''),
      v_metadata, v_now, v_now + interval '12 months', v_now, v_now
    )
    RETURNING id INTO v_org_id;
  ELSE
    UPDATE organizations SET
      name = NULLIF(p_data->>'name', ''), legal_name = NULLIF(p_data->>'legal_name', ''),
      dba = NULLIF(p_data->>'dba', ''), type = NULLIF(p_data->>'type', ''),
      state = NULLIF(p_data->>'state', ''),
      address_street = NULLIF(p_data->>'address_street', ''),
      address_city = NULLIF(p_data->>'address_city', ''),
      address_state = NULLIF(p_data->>'address_state', ''),
      address_zip = NULLIF(p_data->>'address_zip', ''),
      security_officer_name = NULLIF(p_data->>'security_officer_name', ''),
      security_officer_email = NULLIF(p_data->>'security_officer_email', ''),
      security_officer_role = NULLIF(p_data->>'security_officer_role', ''),
      privacy_officer_name = NULLIF(p_data->>'privacy_officer_name', ''),
      privacy_officer_email = NULLIF(p_data->>'privacy_officer_email', ''),
      privacy_officer_role = NULLIF(p_data->>'privacy_officer_role', ''),
      employee_count = COALESCE((p_data->>'employee_count')::integer, employee_count),
      has_employees = COALESCE((p_data->>'has_employees')::boolean, has_employees),
      uses_contractors = COALESCE((p_data->>'uses_contractors')::boolean, uses_contractors),
      stores_phi_electronically = COALESCE((p_data->>'stores_phi_electronically')::boolean, stores_phi_electronically),
      uses_cloud_services = COALESCE((p_data->>'uses_cloud_services')::boolean, uses_cloud_services),
      ein = COALESCE(NULLIF(p_data->>'ein', ''), ein),
      npi = COALESCE(NULLIF(p_data->>'npi', ''), npi),
      state_license_number = COALESCE(NULLIF(p_data->>'state_license_number', ''), state_license_number),
      state_tax_id = COALESCE(NULLIF(p_data->>'state_tax_id', ''), state_tax_id),
      authorized_representative_name = COALESCE(NULLIF(p_data->>'authorized_representative_name', ''), authorized_representative_name),
      authorized_representative_title = COALESCE(NULLIF(p_data->>'authorized_representative_title', ''), authorized_representative_title),
      ceo_name = COALESCE(NULLIF(p_data->>'ceo_name', ''), ceo_name),
      ceo_title = COALESCE(NULLIF(p_data->>'ceo_title', ''), ceo_title),
      performs_laboratory_tests = COALESCE((p_data->>'performs_laboratory_tests')::boolean, performs_laboratory_tests),
      clia_certificate_number = COALESCE(NULLIF(p_data->>'clia_certificate_number', ''), clia_certificate_number),
      serves_medicare_patients = COALESCE((p_data->>'serves_medicare_patients')::boolean, serves_medicare_patients),
      medicare_provider_number = COALESCE(NULLIF(p_data->>'medicare_provider_number', ''), medicare_provider_number),
      phone_number = COALESCE(NULLIF(p_data->>'phone_number', ''), phone_number),
      email_address = COALESCE(NULLIF(p_data->>'email_address', ''), email_address),
      website = COALESCE(NULLIF(p_data->>'website', ''), website),
      accreditation_status = COALESCE(NULLIF(p_data->>'accreditation_status', ''), accreditation_status),
      types_of_services = COALESCE(NULLIF(p_data->>'types_of_services', ''), types_of_services),
      insurance_coverage = COALESCE(NULLIF(p_data->>'insurance_coverage', ''), insurance_coverage),
      onboarding_metadata = COALESCE(onboarding_metadata, '{}'::jsonb) || v_metadata,
      assessment_date = COALESCE(assessment_date, v_now),
      next_review_date = COALESCE(next_review_date, v_now + interval '12 months'),
      updated_at = v_now
    WHERE user_id = v_user_id
    RETURNING id INTO v_org_id;
  END IF;
  
  SELECT to_jsonb(o.*) INTO v_metadata FROM organizations o WHERE o.id = v_org_id;
  RETURN v_metadata;
END;
$$;

-- PASSO 7: Permissões
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(jsonb) TO anon;

-- PASSO 8: Verificação final
DO $$
BEGIN
  RAISE NOTICE '✅ Script executado com sucesso!';
  RAISE NOTICE '✅ Políticas RLS recriadas com UUID explícito';
  RAISE NOTICE '✅ Função upsert_organization_jsonb criada';
END $$;
