
-- Update handle_new_user function to remove free trial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, subscription_status, trial_start, trial_end)
  VALUES (
    NEW.id, 
    'inactive', -- Set default status to inactive instead of trial
    NULL,       -- No trial start
    NULL        -- No trial end
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Update existing trial users to inactive if we want to revoke current trials immediately
-- UPDATE public.profiles SET subscription_status = 'inactive' WHERE subscription_status = 'trial';
