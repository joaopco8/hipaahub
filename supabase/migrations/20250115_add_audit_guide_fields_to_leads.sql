-- Add fields for audit survival guide form
-- These fields are needed for the new audit survival guide landing page

-- Make phone_number optional (nullable) since the audit guide form doesn't require it
alter table leads alter column phone_number drop not null;

-- Add practice_name field
alter table leads add column if not exists practice_name text;

-- Add role field
alter table leads add column if not exists role text;

-- Add audit_timeline field
alter table leads add column if not exists audit_timeline text;

-- Add comment
comment on column leads.practice_name is 'Name of the clinic or practice';
comment on column leads.role is 'Role of the person (clinic_owner, practice_manager, etc.)';
comment on column leads.audit_timeline is 'When the audit is scheduled (next_30_days, 1_3_months, etc.)';
