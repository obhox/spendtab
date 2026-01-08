
-- Add Paystack subscription fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS paystack_customer_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_subscription_code TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan_code TEXT,
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paystack_auth_code TEXT;

-- Create index for faster lookups by subscription code (useful for webhooks)
CREATE INDEX IF NOT EXISTS idx_profiles_paystack_sub_code ON public.profiles(paystack_subscription_code);
CREATE INDEX IF NOT EXISTS idx_profiles_paystack_cust_code ON public.profiles(paystack_customer_code);
