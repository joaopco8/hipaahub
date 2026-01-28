-- Create comprehensive training records table for HIPAA compliance
-- This table stores all training records required by OCR

create table if not exists training_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  organization_id uuid,
  staff_member_id uuid,
  
  -- Employee Information (required by OCR)
  full_name text not null,
  email text not null,
  role_title text not null,
  
  -- Training Information
  training_type text not null check (training_type in ('initial', 'annual', 'remedial')),
  training_date timestamp with time zone not null default timezone('utc'::text, now()),
  completion_status text not null check (completion_status in ('completed', 'pending', 'expired')) default 'pending',
  expiration_date timestamp with time zone not null,
  
  -- Acknowledgement (critical for OCR)
  acknowledgement boolean default false,
  acknowledgement_date timestamp with time zone,
  acknowledgement_ip text,
  
  -- Record Metadata
  recorded_by text not null default 'System (HIPAA Guard)',
  record_timestamp timestamp with time zone not null default timezone('utc'::text, now()),
  
  -- Additional Metadata
  training_content_version text,
  quiz_score numeric(5, 2),
  notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for efficient queries
create index if not exists training_records_user_id_idx on training_records(user_id);
create index if not exists training_records_organization_id_idx on training_records(organization_id);
create index if not exists training_records_staff_member_id_idx on training_records(staff_member_id);
create index if not exists training_records_expiration_date_idx on training_records(expiration_date);
create index if not exists training_records_completion_status_idx on training_records(completion_status);

-- Add foreign key constraint for staff_member_id (if staff_members table exists)
do $$
begin
  if exists (
    select 1 from information_schema.tables 
    where table_schema = 'public'
    and table_name = 'staff_members'
  ) then
    if not exists (
      select 1 from information_schema.table_constraints 
      where constraint_schema = 'public'
      and constraint_name = 'training_records_staff_member_id_fkey'
    ) then
      begin
        alter table training_records
          add constraint training_records_staff_member_id_fkey
          foreign key (staff_member_id) references staff_members(id) on delete cascade;
      exception when others then
        raise notice 'Could not create foreign key constraint for staff_member_id: %', sqlerrm;
      end;
    end if;
  end if;
end $$;

-- Ensure one active training per staff member per type (partial unique index)
-- Only create if staff_member_id is not null
create unique index if not exists training_records_unique_active_training 
  on training_records(staff_member_id, training_type) 
  where completion_status = 'completed' and staff_member_id is not null;

-- Add foreign key constraint for organization_id (if organizations table exists and id is uuid)
-- Note: We check udt_name instead of data_type for better compatibility
do $$
begin
  if exists (
    select 1 from information_schema.tables t
    join information_schema.columns c on c.table_name = t.table_name
    where t.table_schema = 'public'
    and t.table_name = 'organizations' 
    and c.column_name = 'id'
    and (c.data_type = 'uuid' or c.udt_name = 'uuid')
  ) then
    if not exists (
      select 1 from information_schema.table_constraints 
      where constraint_schema = 'public'
      and constraint_name = 'training_records_organization_id_fkey'
    ) then
      begin
        alter table training_records
          add constraint training_records_organization_id_fkey
          foreign key (organization_id) references organizations(id) on delete cascade;
      exception when others then
        -- If constraint creation fails, just continue without it
        raise notice 'Could not create foreign key constraint for organization_id: %', sqlerrm;
      end;
    end if;
  end if;
end $$;

-- Enable RLS
alter table training_records enable row level security;

-- RLS Policies
create policy "Users can view own training records" on training_records
  for select using (auth.uid() = user_id);

create policy "Users can insert own training records" on training_records
  for insert with check (auth.uid() = user_id);

create policy "Users can update own training records" on training_records
  for update using (auth.uid() = user_id);

create policy "Users can delete own training records" on training_records
  for delete using (auth.uid() = user_id);

-- Function to auto-update expiration_date when training_date changes
create or replace function update_training_expiration_date()
returns trigger as $$
begin
  if new.training_date is not null and new.expiration_date is null then
    new.expiration_date = new.training_date + interval '12 months';
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update expiration_date
drop trigger if exists update_training_expiration_date_trigger on training_records;
create trigger update_training_expiration_date_trigger
  before insert or update of training_date on training_records
  for each row
  execute function update_training_expiration_date();

-- Function to auto-update completion_status based on expiration_date
create or replace function update_training_status()
returns trigger as $$
begin
  if new.completion_status = 'completed' and new.expiration_date < timezone('utc'::text, now()) then
    new.completion_status = 'expired';
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update status
drop trigger if exists update_training_status_trigger on training_records;
create trigger update_training_status_trigger
  before insert or update of expiration_date on training_records
  for each row
  execute function update_training_status();

-- Add comments for documentation
comment on table training_records is 'HIPAA Employee Training Records - Required by OCR for compliance audits';
comment on column training_records.full_name is 'Full name of employee (required by OCR)';
comment on column training_records.email is 'Email of employee (required by OCR)';
comment on column training_records.role_title is 'Role/Title of employee (required by OCR)';
comment on column training_records.training_type is 'Type of training: initial, annual, or remedial';
comment on column training_records.training_date is 'Date training was completed';
comment on column training_records.completion_status is 'Status: completed, pending, or expired';
comment on column training_records.expiration_date is 'Date training expires (training_date + 12 months)';
comment on column training_records.acknowledgement is 'Employee acknowledgement checkbox (required by OCR)';
comment on column training_records.acknowledgement_date is 'Date employee acknowledged training';
comment on column training_records.recorded_by is 'System or person who recorded the training';
comment on column training_records.record_timestamp is 'Timestamp when record was created (immutable log)';

