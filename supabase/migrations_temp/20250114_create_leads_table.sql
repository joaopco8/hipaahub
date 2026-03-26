-- Create leads table for exit intent popup lead capture
-- This table stores leads captured from the exit intent popup on the landing page

create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone_number text not null,
  source text default 'exit_intent_popup',
  material_downloaded boolean default false,
  downloaded_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on email for faster lookups
create index if not exists leads_email_idx on leads(email);

-- Create index on created_at for analytics
create index if not exists leads_created_at_idx on leads(created_at);

-- Enable RLS
alter table leads enable row level security;

-- Policy: Only authenticated users (admins) can view leads
-- Regular users cannot access this table
create policy "Only admins can view leads" on leads
  for select
  using (false); -- For now, no one can view (can be updated later with admin role check)

-- Policy: Anyone can insert leads (for the exit intent popup)
create policy "Anyone can insert leads" on leads
  for insert
  with check (true);

-- Add comment
comment on table leads is 'Leads captured from exit intent popup and other marketing forms';
