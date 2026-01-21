alter table public.profiles
add column if not exists trial_ends_at timestamptz;

alter table public.profiles
alter column subscription_status set default 'trial';

alter table public.profiles
alter column trial_ends_at set default (timezone('utc'::text, now()) + interval '14 days');

update public.profiles
set trial_ends_at = created_at + interval '14 days'
where subscription_status = 'trial'
  and trial_ends_at is null;

update public.profiles
set trial_ends_at = null
where subscription_status in ('active', 'past_due', 'cancelled')
  and trial_ends_at is not null;

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
    subscription_status,
    trial_ends_at
  )
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'company_name',
    'trial',
    timezone('utc'::text, now()) + interval '14 days'
  )
  on conflict (id) do update set
    first_name = coalesce(public.profiles.first_name, excluded.first_name),
    last_name = coalesce(public.profiles.last_name, excluded.last_name),
    company_name = coalesce(public.profiles.company_name, excluded.company_name),
    subscription_status = coalesce(public.profiles.subscription_status, excluded.subscription_status),
    trial_ends_at = coalesce(public.profiles.trial_ends_at, excluded.trial_ends_at);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
