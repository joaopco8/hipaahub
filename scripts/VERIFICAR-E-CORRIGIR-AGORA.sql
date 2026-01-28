-- ============================================================================
-- VERIFICAR E CORRIGIR AGORA - Execute este script COMPLETO
-- ============================================================================
-- Este script verifica EXATAMENTE o que existe e corrige
-- ============================================================================

-- ============================================================================
-- PASSO 1: VERIFICAR O QUE EXISTE AGORA
-- ============================================================================
SELECT 
  'FUNÇÕES EXISTENTES AGORA' as diagnostico,
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  CASE 
    WHEN pg_get_function_arguments(p.oid) LIKE '%text%' THEN '❌ TEM TEXT - PROBLEMA!'
    WHEN pg_get_function_arguments(p.oid) LIKE '%uuid%' AND pg_get_function_arguments(p.oid) != 'p_data jsonb' THEN '❌ TEM UUID - PROBLEMA!'
    WHEN pg_get_function_arguments(p.oid) = 'p_data jsonb' THEN '✅ CORRETA'
    ELSE '⚠️ VERIFICAR'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname LIKE '%upsert%organization%'
   OR p.proname LIKE '%update%organization%extended%'
ORDER BY n.nspname, p.proname;

-- ============================================================================
-- PASSO 2: VERIFICAR CÓDIGO DA FUNÇÃO (se existe)
-- ============================================================================
SELECT 
  'CÓDIGO DA FUNÇÃO' as diagnostico,
  p.proname,
  pg_get_function_arguments(p.oid) as arguments,
  CASE 
    WHEN prosrc LIKE '%text%' AND prosrc LIKE '%user_id%' AND prosrc LIKE '%=%' THEN '❌ TEM COMPARAÇÃO TEXT = UUID!'
    WHEN prosrc LIKE '%v_user_id := auth.uid()%' THEN '✅ USA auth.uid()'
    WHEN prosrc LIKE '%v_user_id uuid%' THEN '✅ DECLARADO COMO UUID'
    ELSE '⚠️ VERIFICAR'
  END as status,
  LEFT(prosrc, 500) as code_preview
FROM pg_proc p
WHERE p.proname = 'upsert_organization_jsonb';

-- ============================================================================
-- PASSO 3: REMOVER TUDO DE FORMA AINDA MAIS AGRESSIVA
-- ============================================================================
DO $$
DECLARE
  r RECORD;
  removed_count INTEGER := 0;
BEGIN
  RAISE NOTICE '=== REMOVENDO TODAS AS FUNÇÕES ===';
  
  FOR r IN 
    SELECT n.nspname, p.proname, pg_get_function_arguments(p.oid) as args, p.oid
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname LIKE '%upsert%organization%'
       OR p.proname LIKE '%update%organization%extended%'
       OR (p.proname LIKE '%organization%' AND p.proname LIKE '%jsonb%')
  LOOP
    BEGIN
      -- Tentar remover de todas as formas possíveis
      EXECUTE format('DROP FUNCTION IF EXISTS %s.%s(%s) CASCADE', r.nspname, r.proname, r.args);
      EXECUTE format('DROP FUNCTION IF EXISTS %s.%s CASCADE', r.nspname, r.proname);
      removed_count := removed_count + 1;
      RAISE NOTICE '✅ Removida: %.%(%)', r.nspname, r.proname, r.args;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '⚠️ Erro: %.%(%) - %', r.nspname, r.proname, r.args, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '=== Total removido: % ===', removed_count;
END $$;

-- Remover explicitamente TODAS as variações
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb(jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb(jsonb) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb CASCADE;

-- ============================================================================
-- PASSO 4: VERIFICAR QUE TUDO FOI REMOVIDO
-- ============================================================================
SELECT 
  'APÓS LIMPEZA' as etapa,
  COUNT(*) as funcoes_restantes,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ TUDO REMOVIDO'
    ELSE '❌ AINDA EXISTEM!'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname LIKE '%upsert%organization%'
   OR p.proname LIKE '%update%organization%extended%';

-- ============================================================================
-- PASSO 5: CRIAR FUNÇÃO 100% CORRETA (SEM NENHUMA COMPARAÇÃO TEXT = UUID)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.upsert_organization_jsonb(
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
  v_user_id uuid;  -- CRÍTICO: UUID, não text!
  v_org_id uuid;
  v_now timestamp with time zone;
  v_assessment_date timestamp with time zone;
  v_next_review_date timestamp with time zone;
  v_existing_org_id uuid;
  v_state text;
BEGIN
  -- Obter user_id como UUID (auth.uid() retorna UUID)
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Preparar state (garantir que nunca seja NULL)
  v_state := COALESCE(
    NULLIF(p_data->>'state', ''),
    NULLIF(p_data->>'address_state', ''),
    'CA'
  );
  
  v_now := timezone('utc'::text, now());
  v_assessment_date := v_now;
  v_next_review_date := v_assessment_date + interval '12 months';
  
  -- VERIFICAR EXISTÊNCIA
  -- CRÍTICO: v_user_id é UUID, o.user_id é UUID → UUID = UUID (CORRETO)
  SELECT o.id INTO v_existing_org_id
  FROM public.organizations o
  WHERE o.user_id = v_user_id  -- UUID = UUID (sem conversão!)
  LIMIT 1;
  
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
      v_user_id,  -- UUID direto (sem conversão!)
      COALESCE(NULLIF(p_data->>'name', ''), 'Unnamed Organization'),
      COALESCE(NULLIF(p_data->>'legal_name', ''), p_data->>'name', 'Unnamed Organization'),
      NULLIF(p_data->>'dba', ''),
      COALESCE(NULLIF(p_data->>'type', ''), 'medical'),
      v_state,
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
    -- CRÍTICO: v_user_id é UUID, o.user_id é UUID → UUID = UUID (CORRETO)
    UPDATE public.organizations o
    SET
      name = COALESCE(NULLIF(p_data->>'name', ''), o.name),
      legal_name = COALESCE(NULLIF(p_data->>'legal_name', ''), p_data->>'name', o.legal_name),
      dba = COALESCE(NULLIF(p_data->>'dba', ''), o.dba),
      type = COALESCE(NULLIF(p_data->>'type', ''), o.type),
      state = COALESCE(v_state, o.state),
      address_street = COALESCE(NULLIF(p_data->>'address_street', ''), o.address_street),
      address_city = COALESCE(NULLIF(p_data->>'address_city', ''), o.address_city),
      address_state = COALESCE(NULLIF(p_data->>'address_state', ''), o.address_state),
      address_zip = COALESCE(NULLIF(p_data->>'address_zip', ''), o.address_zip),
      security_officer_name = COALESCE(NULLIF(p_data->>'security_officer_name', ''), o.security_officer_name),
      security_officer_email = COALESCE(NULLIF(p_data->>'security_officer_email', ''), o.security_officer_email),
      security_officer_role = COALESCE(NULLIF(p_data->>'security_officer_role', ''), o.security_officer_role),
      privacy_officer_name = COALESCE(NULLIF(p_data->>'privacy_officer_name', ''), o.privacy_officer_name),
      privacy_officer_email = COALESCE(NULLIF(p_data->>'privacy_officer_email', ''), o.privacy_officer_email),
      privacy_officer_role = COALESCE(NULLIF(p_data->>'privacy_officer_role', ''), o.privacy_officer_role),
      employee_count = COALESCE((p_data->>'employee_count')::integer, o.employee_count),
      has_employees = COALESCE((p_data->>'has_employees')::boolean, o.has_employees),
      uses_contractors = COALESCE((p_data->>'uses_contractors')::boolean, o.uses_contractors),
      stores_phi_electronically = COALESCE((p_data->>'stores_phi_electronically')::boolean, o.stores_phi_electronically),
      uses_cloud_services = COALESCE((p_data->>'uses_cloud_services')::boolean, o.uses_cloud_services),
      assessment_date = COALESCE(o.assessment_date, v_assessment_date),
      next_review_date = COALESCE(o.next_review_date, v_next_review_date),
      updated_at = v_now
    WHERE o.user_id = v_user_id  -- UUID = UUID (sem conversão!)
    RETURNING o.id INTO v_org_id;
  END IF;
  
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
-- PASSO 6: PERMISSÕES
-- ============================================================================
GRANT EXECUTE ON FUNCTION public.upsert_organization_jsonb(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_organization_jsonb(jsonb) TO anon;

-- ============================================================================
-- PASSO 7: FORÇAR REFRESH DO CACHE (MÚLTIPLAS VEZES)
-- ============================================================================
NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  FOR i IN 1..5 LOOP
    PERFORM pg_sleep(1);
    NOTIFY pgrst, 'reload schema';
  END LOOP;
END $$;

-- ============================================================================
-- PASSO 8: VERIFICAÇÃO FINAL
-- ============================================================================
SELECT 
  'VERIFICAÇÃO FINAL' as status,
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  CASE 
    WHEN pg_get_function_arguments(p.oid) = 'p_data jsonb' THEN '✅ CORRETO'
    ELSE '❌ ERRO'
  END as resultado
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'upsert_organization_jsonb';

SELECT 
  'QUANTIDADE' as status,
  COUNT(*) as total,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ PERFEITO'
    WHEN COUNT(*) = 0 THEN '❌ FUNÇÃO NÃO EXISTE!'
    ELSE '❌ MÚLTIPLAS FUNÇÕES!'
  END as resultado
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'upsert_organization_jsonb'
  AND n.nspname = 'public';

-- ============================================================================
-- FIM
-- ============================================================================
SELECT '✅ SCRIPT CONCLUÍDO' as mensagem_final;
SELECT '⚠️ Se ainda der erro, REINICIE o PostgREST no Supabase Dashboard → Settings → API' as proximo_passo;
