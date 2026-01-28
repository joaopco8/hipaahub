-- ============================================================================
-- CORREÇÃO DEFINITIVA: Organization RPC usando auth.uid() exclusivamente
-- ============================================================================
-- Esta migration resolve TODOS os problemas:
-- 1. Remove dependência de p_user_id do frontend (segurança)
-- 2. Usa auth.uid() exclusivamente no backend
-- 3. Elimina comparações text = uuid
-- 4. Garante casts corretos em todos os campos
-- 5. Remove todas as versões antigas da função
--
-- Data: 2024-12-20
-- Autor: Sistema de Auditoria HIPAA Guard
-- ============================================================================

-- ============================================================================
-- PASSO 1: REMOVER TODAS AS FUNÇÕES ANTIGAS
-- ============================================================================
-- Remove todas as versões antigas que aceitam p_user_id do frontend
DROP FUNCTION IF EXISTS upsert_organization_jsonb(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb CASCADE;
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb_v2 CASCADE;

-- Remove função antiga com muitos parâmetros
DROP FUNCTION IF EXISTS upsert_organization(uuid, text, text, text, text, text, text, text, text, text, text, text, text, text, integer, text, boolean, boolean, boolean, boolean) CASCADE;

-- Remove função de update apenas
DROP FUNCTION IF EXISTS update_organization_extended CASCADE;

-- ============================================================================
-- PASSO 2: CRIAR FUNÇÃO DEFINITIVA (SEM p_user_id)
-- ============================================================================
-- Esta função:
-- - Aceita APENAS p_data (jsonb)
-- - Usa auth.uid() internamente (segurança)
-- - Faz todos os casts corretos
-- - Não permite comparações text = uuid
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
  -- VALIDAÇÃO DE SEGURANÇA: Usar auth.uid() exclusivamente
  -- ========================================================================
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- ========================================================================
  -- PREPARAÇÃO DE DADOS
  -- ========================================================================
  v_now := timezone('utc'::text, now());
  v_assessment_date := v_now;
  v_next_review_date := v_assessment_date + interval '12 months';
  
  -- ========================================================================
  -- VERIFICAR SE ORGANIZAÇÃO JÁ EXISTE
  -- ========================================================================
  -- Usar SELECT ... INTO para evitar ambiguidade
  SELECT o.id INTO v_existing_org_id
  FROM public.organizations o
  WHERE o.user_id = v_user_id  -- Comparação UUID = UUID (correto)
  LIMIT 1;
  
  -- ========================================================================
  -- INSERT OU UPDATE
  -- ========================================================================
  IF v_existing_org_id IS NULL THEN
    -- INSERT: Criar nova organização
    INSERT INTO public.organizations (
      id,
      user_id,
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
      v_user_id,  -- UUID direto de auth.uid()
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
      -- Casts explícitos para evitar erros de tipo
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
    -- UPDATE: Atualizar organização existente
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
      -- Preservar assessment_date e next_review_date se já existirem
      assessment_date = COALESCE(o.assessment_date, v_assessment_date),
      next_review_date = COALESCE(o.next_review_date, v_next_review_date),
      updated_at = v_now  -- Sempre atualizar updated_at
      -- created_at NÃO é atualizado (preserva data original)
    WHERE o.user_id = v_user_id  -- Comparação UUID = UUID (correto)
    RETURNING o.id INTO v_org_id;
  END IF;
  
  -- ========================================================================
  -- RETORNAR RESULTADO
  -- ========================================================================
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
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(jsonb) TO anon;

-- ============================================================================
-- PASSO 4: COMENTÁRIO DE DOCUMENTAÇÃO
-- ============================================================================
COMMENT ON FUNCTION upsert_organization_jsonb(jsonb) IS 
'Upsert organization data using authenticated user ID from auth.uid().
This function is SECURITY DEFINER and bypasses RLS.
Frontend should NOT send user_id - it is obtained from auth.uid() internally.
This ensures security and prevents user_id manipulation.';

-- ============================================================================
-- PASSO 5: VERIFICAÇÃO
-- ============================================================================
-- Verificar que a função foi criada corretamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'upsert_organization_jsonb' 
    AND pg_get_function_arguments(oid) = 'p_data jsonb'
  ) THEN
    RAISE EXCEPTION 'Function upsert_organization_jsonb(jsonb) was not created correctly';
  END IF;
  
  RAISE NOTICE '✅ Function upsert_organization_jsonb(jsonb) created successfully';
END $$;
