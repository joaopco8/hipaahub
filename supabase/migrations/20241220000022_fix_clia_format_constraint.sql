-- Fix CLIA format constraint to allow empty strings
-- The constraint was too strict and was rejecting empty strings

-- Drop the existing constraint
alter table organizations
  drop constraint if exists clia_format_check;

-- Recreate with more lenient validation
-- Allow NULL, empty string, or values with at least 10 characters
alter table organizations
  add constraint clia_format_check 
  check (
    clia_certificate_number is null 
    or clia_certificate_number = ''
    or length(trim(clia_certificate_number)) >= 10
  );

-- Also fix EIN and NPI constraints to allow empty strings
alter table organizations
  drop constraint if exists ein_format_check;

alter table organizations
  add constraint ein_format_check 
  check (
    ein is null 
    or ein = ''
    or ein ~ '^\d{2}-\d{7}$'
  );

alter table organizations
  drop constraint if exists npi_format_check;

alter table organizations
  add constraint npi_format_check 
  check (
    npi is null 
    or npi = ''
    or npi ~ '^\d{10}$'
  );
