-- Add phone_number column to users table
-- This field will store the user's phone number for account verification and communication

alter table users
  add column if not exists phone_number text;

-- Update the handle_new_user function to include phone_number from metadata
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, full_name, avatar_url, phone_number)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'phone_number'
  )
  on conflict (id) do update
  set 
    full_name = coalesce(excluded.full_name, users.full_name),
    avatar_url = coalesce(excluded.avatar_url, users.avatar_url),
    phone_number = coalesce(excluded.phone_number, users.phone_number);
  return new;
end;
$$ language plpgsql security definer;

-- Add comment to the column
comment on column users.phone_number is 'User phone number for account verification and communication';
