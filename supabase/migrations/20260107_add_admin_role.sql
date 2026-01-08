
-- Add is_admin column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Optional: Create an index on is_admin for faster lookups if we have many users
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);
