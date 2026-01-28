-- Organizations table
create table if not exists organizations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('medical', 'dental', 'mental-health', 'therapy')),
  state text not null,
  employee_count integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Risk Assessments table
create table if not exists risk_assessments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  organization_id uuid references organizations(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  total_risk_score numeric(10, 2) not null default 0,
  max_possible_score numeric(10, 2) not null default 0,
  risk_percentage numeric(5, 2) not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Staff Members table
create table if not exists staff_members (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  organization_id uuid references organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('staff', 'admin')),
  training_completed boolean default false,
  training_completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, email)
);

-- Compliance Commitments table
create table if not exists compliance_commitments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  organization_id uuid references organizations(id) on delete cascade,
  committed boolean not null default false,
  committed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Enable Row Level Security
alter table organizations enable row level security;
alter table risk_assessments enable row level security;
alter table staff_members enable row level security;
alter table compliance_commitments enable row level security;

-- RLS Policies for organizations
create policy "Users can view own organization" on organizations
  for select using (auth.uid() = user_id);

create policy "Users can insert own organization" on organizations
  for insert with check (auth.uid() = user_id);

create policy "Users can update own organization" on organizations
  for update using (auth.uid() = user_id);

-- RLS Policies for risk_assessments
create policy "Users can view own risk assessment" on risk_assessments
  for select using (auth.uid() = user_id);

create policy "Users can insert own risk assessment" on risk_assessments
  for insert with check (auth.uid() = user_id);

create policy "Users can update own risk assessment" on risk_assessments
  for update using (auth.uid() = user_id);

-- RLS Policies for staff_members
create policy "Users can view own staff members" on staff_members
  for select using (auth.uid() = user_id);

create policy "Users can insert own staff members" on staff_members
  for insert with check (auth.uid() = user_id);

create policy "Users can update own staff members" on staff_members
  for update using (auth.uid() = user_id);

create policy "Users can delete own staff members" on staff_members
  for delete using (auth.uid() = user_id);

-- RLS Policies for compliance_commitments
create policy "Users can view own commitment" on compliance_commitments
  for select using (auth.uid() = user_id);

create policy "Users can insert own commitment" on compliance_commitments
  for insert with check (auth.uid() = user_id);

create policy "Users can update own commitment" on compliance_commitments
  for update using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists organizations_user_id_idx on organizations(user_id);
create index if not exists risk_assessments_user_id_idx on risk_assessments(user_id);
create index if not exists risk_assessments_organization_id_idx on risk_assessments(organization_id);
create index if not exists staff_members_user_id_idx on staff_members(user_id);
create index if not exists staff_members_organization_id_idx on staff_members(organization_id);
create index if not exists compliance_commitments_user_id_idx on compliance_commitments(user_id);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers to update updated_at
create trigger update_organizations_updated_at before update on organizations
  for each row execute function update_updated_at_column();

create trigger update_risk_assessments_updated_at before update on risk_assessments
  for each row execute function update_updated_at_column();

create trigger update_staff_members_updated_at before update on staff_members
  for each row execute function update_updated_at_column();

create trigger update_compliance_commitments_updated_at before update on compliance_commitments
  for each row execute function update_updated_at_column();

