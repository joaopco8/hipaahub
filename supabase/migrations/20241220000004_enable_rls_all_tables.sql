-- ============================================================================
-- HIPAA Guard - Enable RLS on All Public Tables
-- ============================================================================
-- This migration ensures all public tables have Row Level Security enabled
-- with appropriate policies following HIPAA compliance requirements.
-- ============================================================================

-- ============================================================================
-- CUSTOMERS TABLE
-- Private table - no user access allowed
-- ============================================================================
-- Ensure RLS is enabled
alter table if exists customers enable row level security;

-- Drop existing policies if any
drop policy if exists "No user access to customers" on customers;

-- Restrictive policy: no access for authenticated users
-- Only service role can access this table
create policy "No user access to customers" on customers
  for all using (false);

-- ============================================================================
-- USERS TABLE
-- Users can only view and update their own data
-- ============================================================================
-- Ensure RLS is enabled
alter table if exists users enable row level security;

-- Drop and recreate policies to ensure they exist
drop policy if exists "Can view own user data." on users;
drop policy if exists "Can update own user data." on users;
drop policy if exists "Can insert own user data." on users;

create policy "Can view own user data." on users
  for select using (auth.uid() = id);

create policy "Can update own user data." on users
  for update using (auth.uid() = id);

create policy "Can insert own user data." on users
  for insert with check (auth.uid() = id);

-- ============================================================================
-- PRODUCTS TABLE
-- Public read-only access
-- ============================================================================
-- Ensure RLS is enabled
alter table if exists products enable row level security;

-- Drop and recreate policy
drop policy if exists "Allow public read-only access." on products;

create policy "Allow public read-only access." on products
  for select using (true);

-- ============================================================================
-- PRICES TABLE
-- Public read-only access
-- ============================================================================
-- Ensure RLS is enabled
alter table if exists prices enable row level security;

-- Drop and recreate policy
drop policy if exists "Allow public read-only access." on prices;

create policy "Allow public read-only access." on prices
  for select using (true);

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- Users can only view their own subscriptions
-- ============================================================================
-- Ensure RLS is enabled
alter table if exists subscriptions enable row level security;

-- Drop and recreate policy
drop policy if exists "Can only view own subs data." on subscriptions;

create policy "Can only view own subs data." on subscriptions
  for select using (auth.uid() = user_id);

-- ============================================================================
-- POSTS TABLE
-- Users can manage their own posts
-- ============================================================================
-- Ensure RLS is enabled
alter table if exists posts enable row level security;

-- Drop existing policies
drop policy if exists "Can view own posts" on posts;
drop policy if exists "Can insert own posts" on posts;
drop policy if exists "Can update own posts" on posts;
drop policy if exists "Can delete own posts" on posts;

-- Recreate policies
create policy "Can view own posts" on posts
  for select using (auth.uid() = user_id);

create policy "Can insert own posts" on posts
  for insert with check (auth.uid() = user_id);

create policy "Can update own posts" on posts
  for update using (auth.uid() = user_id);

create policy "Can delete own posts" on posts
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- ORGANIZATIONS TABLE
-- Users can manage their own organization
-- ============================================================================
-- Ensure RLS is enabled (should already be enabled, but ensure it)
alter table if exists organizations enable row level security;

-- Policies should already exist, but ensure they do
-- Drop and recreate to be safe
drop policy if exists "Users can view own organization" on organizations;
drop policy if exists "Users can insert own organization" on organizations;
drop policy if exists "Users can update own organization" on organizations;
drop policy if exists "Users can delete own organization" on organizations;

create policy "Users can view own organization" on organizations
  for select using (auth.uid() = user_id);

create policy "Users can insert own organization" on organizations
  for insert with check (auth.uid() = user_id);

create policy "Users can update own organization" on organizations
  for update using (auth.uid() = user_id);

create policy "Users can delete own organization" on organizations
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- RISK_ASSESSMENTS TABLE
-- Users can manage their own risk assessments
-- ============================================================================
-- Ensure RLS is enabled
alter table if exists risk_assessments enable row level security;

-- Drop and recreate policies
drop policy if exists "Users can view own risk assessment" on risk_assessments;
drop policy if exists "Users can insert own risk assessment" on risk_assessments;
drop policy if exists "Users can update own risk assessment" on risk_assessments;
drop policy if exists "Users can delete own risk assessment" on risk_assessments;

create policy "Users can view own risk assessment" on risk_assessments
  for select using (auth.uid() = user_id);

create policy "Users can insert own risk assessment" on risk_assessments
  for insert with check (auth.uid() = user_id);

create policy "Users can update own risk assessment" on risk_assessments
  for update using (auth.uid() = user_id);

create policy "Users can delete own risk assessment" on risk_assessments
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- STAFF_MEMBERS TABLE
-- Users can manage their own staff members
-- ============================================================================
-- Ensure RLS is enabled
alter table if exists staff_members enable row level security;

-- Drop and recreate policies
drop policy if exists "Users can view own staff members" on staff_members;
drop policy if exists "Users can insert own staff members" on staff_members;
drop policy if exists "Users can update own staff members" on staff_members;
drop policy if exists "Users can delete own staff members" on staff_members;

create policy "Users can view own staff members" on staff_members
  for select using (auth.uid() = user_id);

create policy "Users can insert own staff members" on staff_members
  for insert with check (auth.uid() = user_id);

create policy "Users can update own staff members" on staff_members
  for update using (auth.uid() = user_id);

create policy "Users can delete own staff members" on staff_members
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- COMPLIANCE_COMMITMENTS TABLE
-- Users can manage their own compliance commitments
-- ============================================================================
-- Ensure RLS is enabled
alter table if exists compliance_commitments enable row level security;

-- Drop and recreate policies
drop policy if exists "Users can view own commitment" on compliance_commitments;
drop policy if exists "Users can insert own commitment" on compliance_commitments;
drop policy if exists "Users can update own commitment" on compliance_commitments;
drop policy if exists "Users can delete own commitment" on compliance_commitments;

create policy "Users can view own commitment" on compliance_commitments
  for select using (auth.uid() = user_id);

create policy "Users can insert own commitment" on compliance_commitments
  for insert with check (auth.uid() = user_id);

create policy "Users can update own commitment" on compliance_commitments
  for update using (auth.uid() = user_id);

create policy "Users can delete own commitment" on compliance_commitments
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- ACTION_ITEMS TABLE
-- Users can manage their own action items
-- ============================================================================
-- Ensure RLS is enabled
alter table if exists action_items enable row level security;

-- Drop and recreate policies
drop policy if exists "Users can view own action items" on action_items;
drop policy if exists "Users can insert own action items" on action_items;
drop policy if exists "Users can update own action items" on action_items;
drop policy if exists "Users can delete own action items" on action_items;

create policy "Users can view own action items" on action_items
  for select using (auth.uid() = user_id);

create policy "Users can insert own action items" on action_items
  for insert with check (auth.uid() = user_id);

create policy "Users can update own action items" on action_items
  for update using (auth.uid() = user_id);

create policy "Users can delete own action items" on action_items
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- NOTE: Tables mentioned in Security Advisor that may be from Supabase Auth
-- ============================================================================
-- The following tables are managed by Supabase Auth and should NOT have
-- RLS policies created in public schema:
-- - sessions (auth.sessions)
-- - mfa_credentials (auth.mfa_credentials)
-- - verification_tokens (auth.verification_tokens)
-- - login_attempts (auth.login_attempts)
--
-- These are in the auth schema, not public schema, and are managed by Supabase.
-- If they appear in Security Advisor, they may be false positives or
-- require Supabase configuration changes, not SQL migrations.
--
-- If you have custom tables with these names in public schema, create them
-- with appropriate RLS policies following the patterns above.

-- ============================================================================
-- VERIFICATION: Check all public tables have RLS enabled
-- ============================================================================
-- Run this query in Supabase SQL Editor to verify:
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;







