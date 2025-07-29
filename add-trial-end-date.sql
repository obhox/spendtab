-- Add trial_end_date column to users table if it doesn't exist
-- This script is safe to run multiple times

DO $$ 
BEGIN
    -- Check if trial_end_date column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'trial_end_date'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN trial_end_date timestamp with time zone DEFAULT (now() + interval '21 days');
        
        -- Update existing users to have a trial end date if they don't have one
        UPDATE public.users 
        SET trial_end_date = created_at + interval '21 days'
        WHERE trial_end_date IS NULL;
        
        RAISE NOTICE 'Added trial_end_date column to users table';
    ELSE
        RAISE NOTICE 'trial_end_date column already exists';
    END IF;
END $$;

-- Ensure all existing trial users have a trial_end_date
UPDATE public.users 
SET trial_end_date = created_at + interval '21 days'
WHERE subscription_tier = 'trial' 
AND trial_end_date IS NULL;