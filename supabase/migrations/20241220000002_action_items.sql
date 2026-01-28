-- Action Items table
create table if not exists action_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  organization_id uuid references organizations(id) on delete cascade,
  risk_assessment_id uuid references risk_assessments(id) on delete cascade,
  item_key text not null, -- e.g., 'security-policy', 'encryption-at-rest'
  title text not null,
  description text not null,
  priority text not null check (priority in ('critical', 'high', 'medium')),
  category text not null, -- e.g., 'Policies', 'Security', 'Training'
  status text not null default 'pending' check (status in ('pending', 'in-progress', 'completed')),
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, item_key)
);

-- Enable Row Level Security
alter table action_items enable row level security;

-- RLS Policies for action_items
create policy "Users can view own action items" on action_items
  for select using (auth.uid() = user_id);

create policy "Users can insert own action items" on action_items
  for insert with check (auth.uid() = user_id);

create policy "Users can update own action items" on action_items
  for update using (auth.uid() = user_id);

create policy "Users can delete own action items" on action_items
  for delete using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists action_items_user_id_idx on action_items(user_id);
create index if not exists action_items_organization_id_idx on action_items(organization_id);
create index if not exists action_items_risk_assessment_id_idx on action_items(risk_assessment_id);
create index if not exists action_items_status_idx on action_items(status);
create index if not exists action_items_priority_idx on action_items(priority);

-- Function to update updated_at timestamp
create trigger update_action_items_updated_at before update on action_items
  for each row execute function update_updated_at_column();








