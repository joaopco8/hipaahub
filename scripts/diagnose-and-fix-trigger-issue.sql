-- Script de diagnóstico e correção do problema de updatedAt vs updated_at
-- Execute este script no Supabase SQL Editor

-- ============================================================================
-- PASSO 1: DIAGNÓSTICO - Listar TODOS os triggers da tabela organizations
-- ============================================================================
SELECT 
  tgname as trigger_name,
  pg_get_triggerdef(oid) as trigger_definition,
  tgenabled as is_enabled
FROM pg_trigger
WHERE tgrelid = 'public.organizations'::regclass
AND NOT tgisinternal
ORDER BY tgname;

-- ============================================================================
-- PASSO 2: Verificar funções que podem estar interferindo
-- ============================================================================
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname ILIKE '%update%'
  OR proname ILIKE '%timestamp%'
  OR proname ILIKE '%organizations%'
ORDER BY proname;

-- ============================================================================
-- PASSO 3: Verificar se há funções com nome similar (versões antigas)
-- ============================================================================
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  oid::regprocedure as full_signature
FROM pg_proc
WHERE proname ILIKE '%upsert%organization%'
ORDER BY proname;

-- ============================================================================
-- PASSO 4: Verificar estrutura real da tabela (nomes de colunas)
-- ============================================================================
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations'
AND column_name IN ('id', 'user_id', 'created_at', 'updated_at', 'updatedAt', 'createdAt')
ORDER BY ordinal_position;

-- ============================================================================
-- PASSO 5: REMOVER TRIGGERS PROBLEMÁTICOS
-- ============================================================================
-- Remover trigger que pode estar usando updatedAt (camelCase)
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
DROP TRIGGER IF EXISTS update_organizations_updatedAt ON public.organizations;
DROP TRIGGER IF EXISTS set_updated_at ON public.organizations;
DROP TRIGGER IF EXISTS set_updatedAt ON public.organizations;
DROP TRIGGER IF EXISTS prisma_updated_at ON public.organizations;

-- ============================================================================
-- PASSO 6: RECRIAR TRIGGER CORRETO (se necessário)
-- ============================================================================
-- Verificar se a função update_updated_at_column existe e está correta
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());  -- snake_case correto
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger correto (opcional - você pode não precisar se a RPC já controla)
-- CREATE TRIGGER update_organizations_updated_at 
-- BEFORE UPDATE ON public.organizations
-- FOR EACH ROW 
-- EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PASSO 7: GARANTIR QUE A FUNÇÃO RPC ESTÁ CORRETA
-- ============================================================================
DROP FUNCTION IF EXISTS upsert_organization_jsonb(uuid, jsonb);

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
  v_assessment_date timestamp with time zone;
  v_next_review_date timestamp with time zone;
  v_org_id uuid;
  v_user_id uuid;
  v_now timestamp with time zone;
BEGIN
  -- Store user_id in local variable to avoid ambiguity
  v_user_id := p_user_id;
  
  -- Get current timestamp once
  v_now := timezone('utc'::text, now());
  
  -- Set assessment date
  v_assessment_date := v_now;
  v_next_review_date := v_assessment_date + interval '12 months';

  -- Upsert organization
  -- SECURITY DEFINER bypassa RLS, então podemos inserir/atualizar diretamente
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
    (p_data->>'employee_count')::integer,
    COALESCE((p_data->>'has_employees')::boolean, true),
    COALESCE((p_data->>'uses_contractors')::boolean, false),
    COALESCE((p_data->>'stores_phi_electronically')::boolean, true),
    COALESCE((p_data->>'uses_cloud_services')::boolean, false),
    v_assessment_date,
    v_next_review_date,
    v_now,  -- created_at
    v_now   -- updated_at
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
      WHEN organizations.assessment_date IS NULL THEN EXCLUDED.assessment_date
      ELSE organizations.assessment_date
    END,
    next_review_date = CASE
      WHEN organizations.assessment_date IS NULL THEN EXCLUDED.next_review_date
      ELSE organizations.next_review_date
    END,
    updated_at = v_now  -- Sempre atualiza updated_at no UPDATE
    -- created_at não é atualizado no UPDATE, mantém o valor original
  RETURNING public.organizations.id INTO v_org_id;

  -- Return the updated organization
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb TO authenticated;

-- ============================================================================
-- PASSO 8: VERIFICAÇÃO FINAL
-- ============================================================================
-- Verificar triggers restantes (deve estar vazio ou só o correto)
SELECT 
  tgname as trigger_name,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgrelid = 'public.organizations'::regclass
AND NOT tgisinternal;

-- Verificar função criada
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  prosecdef as security_definer
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';
