-- ============================================================================
-- CORREÇÃO ULTIMATE: Remover TUDO e recriar com verificação completa
-- ============================================================================
-- Execute este script COMPLETO no Supabase SQL Editor
-- Não execute em partes - execute tudo de uma vez

-- ============================================================================
-- PASSO 1: DIAGNÓSTICO COMPLETO
-- ============================================================================
-- Verificar TODAS as funções relacionadas
SELECT 
  oid,
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  oid::regprocedure as full_signature,
  prosecdef as security_definer,
  prorettype::regtype as return_type,
  prosrc as source_code
FROM pg_proc
WHERE proname LIKE '%upsert%organization%'
   OR proname LIKE '%organization%upsert%'
ORDER BY proname, oid;

-- ============================================================================
-- PASSO 2: REMOVER ABSOLUTAMENTE TUDO
-- ============================================================================
-- Usar DO block para remover todas as sobrecargas dinamicamente
DO $$
DECLARE
  func_record RECORD;
  drop_sql TEXT;
BEGIN
  -- Remover todas as funções com nome upsert_organization_jsonb
  FOR func_record IN 
    SELECT 
      oid,
      proname,
      pg_get_function_arguments(oid) as args,
      pg_get_function_identity_arguments(oid) as identity_args
    FROM pg_proc
    WHERE proname = 'upsert_organization_jsonb'
  LOOP
    -- Tentar remover com CASCADE
    BEGIN
      drop_sql := format('DROP FUNCTION IF EXISTS %s.%s(%s) CASCADE', 
        'public', 
        func_record.proname, 
        func_record.args
      );
      EXECUTE drop_sql;
      RAISE NOTICE 'Removed: %(%)', func_record.proname, func_record.args;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to remove %(%): %', func_record.proname, func_record.args, SQLERRM;
    END;
    
    -- Tentar também com identity arguments
    BEGIN
      IF func_record.identity_args IS DISTINCT FROM func_record.args THEN
        drop_sql := format('DROP FUNCTION IF EXISTS %s.%s(%s) CASCADE', 
          'public', 
          func_record.proname, 
          func_record.identity_args
        );
        EXECUTE drop_sql;
        RAISE NOTICE 'Removed (identity): %(%)', func_record.proname, func_record.identity_args;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to remove (identity) %(%): %', func_record.proname, func_record.identity_args, SQLERRM;
    END;
  END LOOP;
END $$;

-- Remover também usando DROP direto (fallback)
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb(jsonb, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.upsert_organization_jsonb(jsonb, text) CASCADE;
DROP FUNCTION IF EXISTS upsert_organization_jsonb CASCADE;

-- ============================================================================
-- PASSO 3: VERIFICAR SE FOI REMOVIDA
-- ============================================================================
SELECT 
  COUNT(*) as remaining_functions
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';

-- Se retornar 0, está OK. Se retornar > 0, ainda há funções antigas.

-- ============================================================================
-- PASSO 4: RECRIAR FUNÇÃO COM ASSINATURA EXPLÍCITA E CORRETA
-- ============================================================================
CREATE OR REPLACE FUNCTION upsert_organization_jsonb(
  p_user_id uuid,  -- UUID explícito, não text
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
  v_user_id uuid;
  v_now timestamp with time zone;
BEGIN
  -- Validar que p_user_id é UUID válido
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id cannot be NULL';
  END IF;
  
  -- Store user_id (já é uuid, não precisa converter)
  v_user_id := p_user_id;
  
  -- Get current timestamp
  v_now := timezone('utc'::text, now());
  
  -- Set assessment dates
  v_assessment_date := v_now;
  v_next_review_date := v_assessment_date + interval '12 months';

  -- INSERT
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
  WHERE o.id = v_org_id;
END;
$function$;

-- ============================================================================
-- PASSO 5: CONCEDER PERMISSÕES
-- ============================================================================
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(uuid, jsonb) TO anon;
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(uuid, jsonb) TO service_role;

-- ============================================================================
-- PASSO 6: VERIFICAÇÃO FINAL E TESTE
-- ============================================================================
-- Verificar função criada
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  oid::regprocedure as full_signature,
  prosecdef as security_definer,
  prorettype::regtype as return_type
FROM pg_proc
WHERE proname = 'upsert_organization_jsonb';

-- Verificar permissões
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  a.rolname as role,
  has_function_privilege(a.oid, p.oid, 'EXECUTE') as can_execute
FROM pg_proc p
CROSS JOIN pg_roles a
WHERE p.proname = 'upsert_organization_jsonb'
  AND a.rolname IN ('authenticated', 'anon', 'service_role')
ORDER BY a.rolname;

-- ============================================================================
-- PASSO 7: TESTE DE CHAMADA (OPCIONAL - COMENTE SE NÃO QUISER EXECUTAR)
-- ============================================================================
-- Descomente para testar a função diretamente
/*
SELECT * FROM upsert_organization_jsonb(
  '00000000-0000-0000-0000-000000000000'::uuid,
  '{"name": "Test Organization", "type": "medical", "state": "CA", "employee_count": 1}'::jsonb
);
*/
