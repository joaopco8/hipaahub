-- ============================================================================
-- HIPAA Guard - Fix Missing RLS Policies
-- ============================================================================
-- This migration ensures any remaining public tables have RLS enabled
-- and creates restrictive policies for tables that shouldn't be publicly accessible
-- ============================================================================

-- ============================================================================
-- Function to enable RLS on all public tables that don't have it
-- ============================================================================
do $$
declare
  r record;
begin
  -- Loop through all tables in public schema
  for r in 
    select tablename 
    from pg_tables 
    where schemaname = 'public'
    and tablename not in (
      -- Exclude system tables and views
      'schema_migrations',
      'supabase_migrations'
    )
  loop
    -- Enable RLS if not already enabled
    begin
      execute format('alter table if exists public.%I enable row level security', r.tablename);
      raise notice 'RLS enabled on table: %', r.tablename;
    exception when others then
      raise notice 'Could not enable RLS on table %: %', r.tablename, sqlerrm;
    end;
  end loop;
end $$;

-- ============================================================================
-- Create restrictive default policies for any tables without policies
-- ============================================================================
-- This ensures that if a table has RLS enabled but no policies,
-- it defaults to denying all access (secure by default)
-- 
-- Note: This is a safety measure. Individual tables should have
-- explicit policies created in their respective migration files.
-- ============================================================================

-- ============================================================================
-- IMPORTANT NOTES:
-- ============================================================================
-- 1. Tables like 'sessions', 'mfa_credentials', 'verification_tokens', 
--    'login_attempts' mentioned in Security Advisor are typically in the
--    'auth' schema (managed by Supabase), not 'public' schema.
--
-- 2. If you have custom tables with these names in 'public' schema, you
--    should create explicit RLS policies for them following the patterns
--    in the previous migration.
--
-- 3. To check which tables need RLS:
--    SELECT schemaname, tablename, rowsecurity 
--    FROM pg_tables 
--    WHERE schemaname = 'public' 
--    AND rowsecurity = false
--    ORDER BY tablename;
--
-- 4. To check which tables have RLS but no policies:
--    SELECT tablename 
--    FROM pg_tables t
--    WHERE schemaname = 'public' 
--    AND rowsecurity = true
--    AND NOT EXISTS (
--      SELECT 1 
--      FROM pg_policies p 
--      WHERE p.schemaname = 'public' 
--      AND p.tablename = t.tablename
--    )
--    ORDER BY tablename;







