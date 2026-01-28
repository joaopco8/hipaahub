-- Add US HIPAA Required Fields to organizations table
-- These fields are mandatory for HIPAA compliance documents in the United States

-- US Legal Identifiers (Obrigatórios)
-- EIN (Employer Identification Number) - Obrigatório
alter table organizations
  add column if not exists ein text;
comment on column organizations.ein is 'EIN (Employer Identification Number) - Format: XX-XXXXXXX (9 digits) - Required for HIPAA documents';
  
-- NPI (National Provider Identifier) - Obrigatório para provedores
alter table organizations
  add column if not exists npi text;
comment on column organizations.npi is 'NPI (National Provider Identifier) - 10 digits - Required for healthcare providers';
  
-- State License Number - Obrigatório
alter table organizations
  add column if not exists state_license_number text;
comment on column organizations.state_license_number is 'State License Number - Required for operation in the state';
  
-- CLIA Certificate Number - Condicional (se faz testes laboratoriais)
alter table organizations
  add column if not exists clia_certificate_number text;
comment on column organizations.clia_certificate_number is 'CLIA Certificate Number - Required if organization performs laboratory tests';
  
-- Medicare Provider Number - Condicional (se atende Medicare)
alter table organizations
  add column if not exists medicare_provider_number text;
comment on column organizations.medicare_provider_number is 'Medicare Provider Number - Required if organization serves Medicare patients';
  
-- State Tax ID - Obrigatório (varia por estado)
alter table organizations
  add column if not exists state_tax_id text;
comment on column organizations.state_tax_id is 'State Tax ID - Required for state tax purposes';
  
-- Authorized Representative / Signatory
alter table organizations
  add column if not exists authorized_representative_name text;
comment on column organizations.authorized_representative_name is 'Authorized Representative Name - Person authorized to sign legal documents';
  
alter table organizations
  add column if not exists authorized_representative_title text;
comment on column organizations.authorized_representative_title is 'Authorized Representative Title - CEO, Compliance Officer, etc.';
  
-- CEO Information (separate from Security Officer)
alter table organizations
  add column if not exists ceo_name text;
comment on column organizations.ceo_name is 'CEO Name - Chief Executive Officer or equivalent';
  
alter table organizations
  add column if not exists ceo_title text;
comment on column organizations.ceo_title is 'CEO Title - Chief Executive Officer, President, etc.';

-- Optional but Recommended Fields
-- Contact Information
alter table organizations
  add column if not exists phone_number text;
comment on column organizations.phone_number is 'Primary phone number - Recommended for OCR contact';
  
alter table organizations
  add column if not exists email_address text;
comment on column organizations.email_address is 'Primary email address - Recommended for official notifications';
  
alter table organizations
  add column if not exists website text;
comment on column organizations.website is 'Organization website - Demonstrates professionalism';
  
-- Accreditation and Services
alter table organizations
  add column if not exists accreditation_status text;
comment on column organizations.accreditation_status is 'Accreditation Status - AAAHC, CLIA, etc.';
  
alter table organizations
  add column if not exists types_of_services text;
comment on column organizations.types_of_services is 'Types of Services - Scope of operations';
  
alter table organizations
  add column if not exists insurance_coverage text;
comment on column organizations.insurance_coverage is 'Insurance Coverage - Cyber insurance, malpractice, etc.';
  
-- Laboratory Services Flag (for CLIA requirement)
alter table organizations
  add column if not exists performs_laboratory_tests boolean default false;
comment on column organizations.performs_laboratory_tests is 'Performs Laboratory Tests - Determines if CLIA Certificate is required';
  
-- Medicare Services Flag (for Medicare Provider Number requirement)
alter table organizations
  add column if not exists serves_medicare_patients boolean default false;
comment on column organizations.serves_medicare_patients is 'Serves Medicare Patients - Determines if Medicare Provider Number is required';

-- Add validation constraints
-- EIN format validation (XX-XXXXXXX)
alter table organizations
  add constraint ein_format_check 
  check (ein is null or ein ~ '^\d{2}-\d{7}$');

-- NPI format validation (10 digits)
alter table organizations
  add constraint npi_format_check 
  check (npi is null or npi ~ '^\d{10}$');

-- CLIA format validation (10 digits or alphanumeric)
alter table organizations
  add constraint clia_format_check 
  check (clia_certificate_number is null or length(clia_certificate_number) >= 10);

-- Create index for faster lookups
create index if not exists organizations_ein_idx on organizations(ein) where ein is not null;
create index if not exists organizations_npi_idx on organizations(npi) where npi is not null;
create index if not exists organizations_state_license_idx on organizations(state_license_number) where state_license_number is not null;
