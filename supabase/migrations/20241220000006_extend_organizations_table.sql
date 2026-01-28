-- Extend organizations table with comprehensive organization data
-- This migration adds all fields required for HIPAA compliance documentation

-- Add new columns to organizations table
alter table organizations
  -- Identity fields
  add column if not exists legal_name text,
  add column if not exists dba text,
  
  -- Address fields (juridically critical)
  add column if not exists address_street text,
  add column if not exists address_city text,
  add column if not exists address_state text,
  add column if not exists address_zip text,
  
  -- Security Officer (HIPAA requires names, not generic titles)
  add column if not exists security_officer_name text,
  add column if not exists security_officer_email text,
  add column if not exists security_officer_role text,
  
  -- Privacy Officer (can be same person, but name must exist)
  add column if not exists privacy_officer_name text,
  add column if not exists privacy_officer_email text,
  add column if not exists privacy_officer_role text,
  
  -- Organization structure
  add column if not exists has_employees boolean default true,
  add column if not exists uses_contractors boolean default false,
  
  -- Technology (minimal necessary)
  add column if not exists stores_phi_electronically boolean default true,
  add column if not exists uses_cloud_services boolean default false,
  
  -- Governance dates
  add column if not exists assessment_date timestamp with time zone default timezone('utc'::text, now()),
  add column if not exists next_review_date timestamp with time zone,
  
  -- Optional contact information (soft step after onboarding)
  add column if not exists primary_contact_name text,
  add column if not exists compliance_contact_email text,
  add column if not exists compliance_contact_phone text,
  
  -- Legal identifiers (optional but powerful)
  add column if not exists ein text,
  add column if not exists npi text;

-- Set next_review_date to 12 months from assessment_date for existing records
update organizations
set next_review_date = assessment_date + interval '12 months'
where next_review_date is null and assessment_date is not null;

-- Create function to auto-update next_review_date when assessment_date changes
create or replace function update_next_review_date()
returns trigger as $$
begin
  if new.assessment_date is not null then
    new.next_review_date = new.assessment_date + interval '12 months';
  end if;
  return new;
end;
$$ language plpgsql;

-- Create trigger to auto-update next_review_date
drop trigger if exists update_next_review_date_trigger on organizations;
create trigger update_next_review_date_trigger
  before insert or update of assessment_date on organizations
  for each row
  execute function update_next_review_date();

-- Add comments for documentation
comment on column organizations.legal_name is 'Legal organization name (required for contracts and ToS)';
comment on column organizations.dba is 'Doing Business As name (optional)';
comment on column organizations.address_street is 'Primary business address street (juridically critical for breach notification)';
comment on column organizations.address_city is 'Primary business address city';
comment on column organizations.address_state is 'Primary business address state';
comment on column organizations.address_zip is 'Primary business address ZIP code';
comment on column organizations.security_officer_name is 'Security Officer full name (HIPAA requires names, not generic titles)';
comment on column organizations.security_officer_email is 'Security Officer email';
comment on column organizations.security_officer_role is 'Security Officer role/title';
comment on column organizations.privacy_officer_name is 'Privacy Officer full name (can be same person as Security Officer)';
comment on column organizations.privacy_officer_email is 'Privacy Officer email';
comment on column organizations.privacy_officer_role is 'Privacy Officer role/title';
comment on column organizations.assessment_date is 'Date of current HIPAA assessment (auto-set on creation)';
comment on column organizations.next_review_date is 'Next review date (auto-set to 12 months from assessment_date)';






