-- DEFINITIVE FIX: Remove all problematic constraints and recreate them more permissively
-- This migration ensures that empty strings are always allowed

-- ============================================================================
-- STEP 1: Remove ALL existing constraints
-- ============================================================================
alter table organizations drop constraint if exists clia_format_check;
alter table organizations drop constraint if exists ein_format_check;
alter table organizations drop constraint if exists npi_format_check;

-- ============================================================================
-- STEP 2: Recreate constraints that allow NULL, empty string, or valid format
-- ============================================================================

-- CLIA: Allow NULL, empty string, or valid format (10+ chars)
alter table organizations
  add constraint clia_format_check 
  check (
    clia_certificate_number is null 
    or clia_certificate_number = ''
    or (length(trim(clia_certificate_number)) >= 10)
  );

-- EIN: Allow NULL, empty string, or valid format (XX-XXXXXXX)
alter table organizations
  add constraint ein_format_check 
  check (
    ein is null 
    or ein = ''
    or (ein ~ '^\d{2}-\d{7}$')
  );

-- NPI: Allow NULL, empty string, or valid format (10 digits)
alter table organizations
  add constraint npi_format_check 
  check (
    npi is null 
    or npi = ''
    or (npi ~ '^\d{10}$')
  );

-- ============================================================================
-- STEP 3: Update existing rows to convert empty strings to NULL
-- ============================================================================
-- This ensures existing data doesn't violate the constraints
update organizations 
set 
  ein = NULLIF(trim(ein), ''),
  npi = NULLIF(trim(npi), ''),
  clia_certificate_number = NULLIF(trim(clia_certificate_number), '')
where 
  trim(ein) = '' 
  or trim(npi) = '' 
  or trim(clia_certificate_number) = '';
