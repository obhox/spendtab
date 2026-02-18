-- Add phone_number column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Update handle_new_user function to sync metadata to profiles including phone_number
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (
    id,
    first_name,
    last_name,
    company_name,
    phone_number,
    subscription_status,
    trial_ends_at
  )
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'phone_number',
    'trial',
    timezone('utc'::text, now()) + interval '14 days'
  )
  on conflict (id) do update set
    first_name = coalesce(public.profiles.first_name, excluded.first_name),
    last_name = coalesce(public.profiles.last_name, excluded.last_name),
    company_name = coalesce(public.profiles.company_name, excluded.company_name),
    phone_number = coalesce(public.profiles.phone_number, excluded.phone_number),
    subscription_status = coalesce(public.profiles.subscription_status, excluded.subscription_status),
    trial_ends_at = coalesce(public.profiles.trial_ends_at, excluded.trial_ends_at);

  return new;
end;
$$;
