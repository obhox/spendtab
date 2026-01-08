
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS trial_start timestamp with time zone,
ADD COLUMN IF NOT EXISTS trial_end timestamp with time zone;
