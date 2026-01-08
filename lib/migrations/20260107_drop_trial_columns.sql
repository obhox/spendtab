
-- Drop trial columns from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS trial_start;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS trial_end;

-- Drop trigger function if it references trial columns (it was updated in previous migration but let's be safe)
-- The previous migration 20260107_remove_free_trial.sql updated the function to insert NULLs.
-- If we drop columns, that function will fail if it tries to insert into them.
-- So we MUST update the function again to NOT reference these columns.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, subscription_status)
  VALUES (
    NEW.id, 
    'inactive'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
