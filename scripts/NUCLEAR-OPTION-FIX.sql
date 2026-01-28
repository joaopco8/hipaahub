-- ============================================================================
-- OPÇÃO NUCLEAR - Remove TUDO e recria do zero
-- ============================================================================
-- Execute TUDO de uma vez no Supabase SQL Editor
-- Esta é a solução mais agressiva possível

-- ============================================================================
-- PASSO 1: LISTAR E REMOVER TODAS AS FUNÇÕES (INCLUINDO text)
-- ============================================================================
DO $$
DECLARE
  r RECORD;
  total_removed INTEGER := 0;
BEGIN
  -- Listar todas as funções primeiro
  RAISE NOTICE '=== FUNÇÕES ENCONTRADAS ===';
  FOR r IN 
    SELECT 
      oid,
      proname,
      pg_get_function_arguments(oid) as args,
      oid::regprocedure as full_sig
    FROM pg_proc
    WHERE proname LIKE '%upsert%organization%'
       OR proname LIKE '%organization%upsert%'
  LOOP
    RAISE NOTICE 'Encontrada: %(%)', r.proname, r.args;
    
    -- Remover TODAS, sem exceção
    BEGIN
      EXECUTE format('DROP FUNCTION IF EXISTS %s.%s(%s) CASCADE', 
        'public', r.proname, r.args);
      total_removed := total_removed + 1;
      RAISE NOTICE '✅ Removida: %(%)', r.proname, r.args;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ Erro ao remover %(%): %', r.proname, r.args, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '=== TOTAL REMOVIDO: % ===', total_removed;
END $$;

-- Remover também todas as combinações possíveis
DROP FUNCTION IF EXISTS upsert_organization_jsonb(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(jsonb, uuid) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(jsonb, text) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(uuid) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(text) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb() CASCADE;
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb CASCADE;

-- ============================================================================
-- PASSO 2: VERIFICAR SE FOI REMOVIDA (DEVE SER 0)
-- ============================================================================
DO $$
DECLARE
  func_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO func_count
  FROM pg_proc
  WHERE proname LIKE '%upsert%organization%';
  
  IF func_count > 0 THEN
    RAISE EXCEPTION 'Ainda existem % funções relacionadas! Execute o PASSO 1 novamente.', func_count;
  ELSE
    RAISE NOTICE '✅ Todas as funções foram removidas com sucesso';
  END IF;
END $$;

-- ============================================================================
-- PASSO 3: RECRIAR FUNÇÃO COM NOME TEMPORÁRIO (PARA TESTAR)
-- ============================================================================
-- Criar com nome diferente primeiro para evitar cache
CREATE OR REPLACE FUNCTION upsert_organization_jsonb_v2(
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
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id cannot be NULL';
  END IF;
  
  v_now := timezone('utc'::text, now());
  
  -- Verificar se existe
  SELECT org.id INTO v_org_id
  FROM public.organizations org
  WHERE org.user_id = p_user_id
  LIMIT 1;
  
  IF v_org_id IS NULL THEN
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
      v_now,
      v_now + interval '12 months',
      v_now,
      v_now
    )
    RETURNING public.organizations.id INTO v_org_id;
  ELSE
    -- UPDATE
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
      assessment_date = COALESCE(org.assessment_date, v_now),
      next_review_date = COALESCE(org.next_review_date, v_now + interval '12 months'),
      updated_at = v_now
    WHERE org.user_id = p_user_id
    RETURNING org.id INTO v_org_id;
  END IF;
  
  -- Return
  RETURN QUERY
  SELECT 
    org.id, org.user_id, org.name, org.legal_name, org.dba,
    org.type, org.state, org.address_street, org.address_city,
    org.address_state, org.address_zip, org.security_officer_name,
    org.security_officer_email, org.security_officer_role,
    org.privacy_officer_name, org.privacy_officer_email,
    org.privacy_officer_role, org.employee_count, org.has_employees,
    org.uses_contractors, org.stores_phi_electronically,
    org.uses_cloud_services, org.assessment_date, org.next_review_date,
    org.created_at, org.updated_at
  FROM public.organizations org
  WHERE org.id = v_org_id;
END;
$$;

-- Criar a função com o nome correto (alias)
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
BEGIN
  RETURN QUERY
  SELECT * FROM upsert_organization_jsonb_v2(p_user_id, p_data);
END;
$$;

-- ============================================================================
-- PASSO 4: PERMISSÕES
-- ============================================================================
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(uuid, jsonb) TO anon;
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb_v2(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb_v2(uuid, jsonb) TO anon;

-- ============================================================================
-- PASSO 5: VERIFICAÇÃO FINAL
-- ============================================================================
SELECT 
  'Funções criadas' as status,
  proname,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc
WHERE proname IN ('upsert_organization_jsonb', 'upsert_organization_jsonb_v2')
ORDER BY proname;

-- Verificar se há funções com text
SELECT 
  '⚠️ FUNÇÃO COM TEXT ENCONTRADA!' as warning,
  proname,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc
WHERE proname LIKE '%upsert%organization%'
  AND pg_get_function_arguments(oid) LIKE '%text%';

-- Deve retornar 0 linhas
