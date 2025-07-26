-- Budget Schema Fix Migration
-- This script fixes all budget-related database schema issues

-- 0. Ensure core budget table and columns exist
DO $$
BEGIN
  -- Create budgets table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets'
  ) THEN
    CREATE TABLE public.budgets (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      amount numeric NOT NULL,
      spent numeric NOT NULL DEFAULT 0,
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      updated_at timestamp with time zone NOT NULL DEFAULT now()
    );
  END IF;
  
  -- Ensure core columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.budgets ADD COLUMN name text NOT NULL DEFAULT 'Unnamed Budget';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'amount'
  ) THEN
    ALTER TABLE public.budgets ADD COLUMN amount numeric NOT NULL DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'spent'
  ) THEN
    ALTER TABLE public.budgets ADD COLUMN spent numeric NOT NULL DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.budgets ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.budgets ADD COLUMN created_at timestamp with time zone NOT NULL DEFAULT now();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.budgets ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT now();
  END IF;
END $$;

-- 1. Fix column naming inconsistencies (only if columns exist)
DO $$ 
BEGIN
  -- Check if startdate column exists and rename it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'startdate'
  ) THEN
    ALTER TABLE public.budgets RENAME COLUMN startdate TO start_date;
  END IF;
  
  -- Check if enddate column exists and rename it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'enddate'
  ) THEN
    ALTER TABLE public.budgets RENAME COLUMN enddate TO end_date;
  END IF;
  
  -- Ensure start_date and end_date columns exist (add them if they don't)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'start_date'
  ) THEN
    ALTER TABLE public.budgets ADD COLUMN start_date date;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'end_date'
  ) THEN
    ALTER TABLE public.budgets ADD COLUMN end_date date;
  END IF;
END $$;

-- 2. Make category field optional (since UI doesn't use it yet)
DO $$
BEGIN
  -- First ensure category column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.budgets ADD COLUMN category text;
  END IF;
  
  -- Then make it nullable if it's currently NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'category'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.budgets ALTER COLUMN category DROP NOT NULL;
  END IF;
END $$;

-- 3. Make period field optional (will be calculated from dates)
DO $$
BEGIN
  -- First ensure period column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'period'
  ) THEN
    ALTER TABLE public.budgets ADD COLUMN period text;
  END IF;
  
  -- Then make it nullable if it's currently NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'period'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.budgets ALTER COLUMN period DROP NOT NULL;
  END IF;
END $$;

-- 4. Add budget_id to transactions table for proper budget tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'transactions' 
    AND column_name = 'budget_id'
  ) THEN
    ALTER TABLE public.transactions 
    ADD COLUMN budget_id uuid REFERENCES public.budgets(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Add category_id to budgets for proper category linking
DO $$
BEGIN
  -- Ensure account_id column exists (required for multi-account support)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'account_id'
  ) THEN
    ALTER TABLE public.budgets 
    ADD COLUMN account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE;
  END IF;
  
  -- Add category_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.budgets 
    ADD COLUMN category_id bigint REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 6. Add recurring budget functionality
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'is_recurring'
  ) THEN
    ALTER TABLE public.budgets 
    ADD COLUMN is_recurring boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'recurring_type'
  ) THEN
    ALTER TABLE public.budgets 
    ADD COLUMN recurring_type varchar(20) CHECK (recurring_type IN ('monthly', 'weekly', 'yearly', 'quarterly'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'budgets' 
    AND column_name = 'parent_budget_id'
  ) THEN
    ALTER TABLE public.budgets 
    ADD COLUMN parent_budget_id uuid REFERENCES public.budgets(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 7. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_budget_id ON public.transactions(budget_id);
CREATE INDEX IF NOT EXISTS idx_budgets_account_id ON public.budgets(account_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON public.budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_parent_budget_id ON public.budgets(parent_budget_id);
CREATE INDEX IF NOT EXISTS idx_budgets_recurring ON public.budgets(is_recurring, recurring_type);

-- 8. Create function to automatically calculate budget spent amount
CREATE OR REPLACE FUNCTION calculate_budget_spent(budget_uuid uuid)
RETURNS numeric AS $$
DECLARE
  total_spent numeric := 0;
  budget_start_date date;
  budget_end_date date;
  budget_category_id bigint;
BEGIN
  -- Get budget details
  SELECT start_date, end_date, category_id 
  INTO budget_start_date, budget_end_date, budget_category_id
  FROM public.budgets 
  WHERE id = budget_uuid;
  
  -- Calculate spent amount based on transactions
  -- If budget has category_id, filter by category
  -- If budget has date range, filter by date range
  IF budget_category_id IS NOT NULL THEN
    -- Category-based budget tracking
    SELECT COALESCE(SUM(amount), 0)
    INTO total_spent
    FROM public.transactions t
    JOIN public.categories c ON c.name = t.category
    WHERE c.id = budget_category_id
      AND t.type = 'expense'
      AND (budget_start_date IS NULL OR t.date >= budget_start_date)
      AND (budget_end_date IS NULL OR t.date <= budget_end_date)
      AND t.account_id = (SELECT account_id FROM public.budgets WHERE id = budget_uuid);
  ELSE
    -- Direct budget_id tracking (when transactions are linked to budgets)
    SELECT COALESCE(SUM(amount), 0)
    INTO total_spent
    FROM public.transactions
    WHERE budget_id = budget_uuid
      AND type = 'expense'
      AND (budget_start_date IS NULL OR date >= budget_start_date)
      AND (budget_end_date IS NULL OR date <= budget_end_date);
  END IF;
  
  RETURN total_spent;
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to generate next recurring budget period
CREATE OR REPLACE FUNCTION get_next_budget_period(
  current_start_date date,
  current_end_date date,
  recurring_type varchar(20)
)
RETURNS TABLE(next_start_date date, next_end_date date) AS $$
BEGIN
  CASE recurring_type
    WHEN 'monthly' THEN
      RETURN QUERY SELECT 
        (current_start_date + INTERVAL '1 month')::date,
        (current_end_date + INTERVAL '1 month')::date;
    WHEN 'weekly' THEN
      RETURN QUERY SELECT 
        (current_start_date + INTERVAL '1 week')::date,
        (current_end_date + INTERVAL '1 week')::date;
    WHEN 'yearly' THEN
      RETURN QUERY SELECT 
        (current_start_date + INTERVAL '1 year')::date,
        (current_end_date + INTERVAL '1 year')::date;
    WHEN 'quarterly' THEN
      RETURN QUERY SELECT 
        (current_start_date + INTERVAL '3 months')::date,
        (current_end_date + INTERVAL '3 months')::date;
    ELSE
      RETURN QUERY SELECT current_start_date, current_end_date;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to automatically create next recurring budget
CREATE OR REPLACE FUNCTION create_next_recurring_budget(budget_uuid uuid)
RETURNS uuid AS $$
DECLARE
  budget_record record;
  next_period record;
  new_budget_id uuid;
BEGIN
  -- Get the current budget details
  SELECT * INTO budget_record
  FROM public.budgets
  WHERE id = budget_uuid AND is_recurring = true;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Get next period dates
  SELECT * INTO next_period
  FROM get_next_budget_period(
    budget_record.start_date,
    budget_record.end_date,
    budget_record.recurring_type
  );
  
  -- Create new budget for next period
  INSERT INTO public.budgets (
    name,
    amount,
    spent,
    start_date,
    end_date,
    period,
    account_id,
    category_id,
    is_recurring,
    recurring_type,
    parent_budget_id,
    created_at,
    updated_at
  ) VALUES (
    budget_record.name,
    budget_record.amount,
    0,
    next_period.next_start_date,
    next_period.next_end_date,
    to_char(next_period.next_start_date, 'Mon YYYY'),
    budget_record.account_id,
    budget_record.category_id,
    true,
    budget_record.recurring_type,
    COALESCE(budget_record.parent_budget_id, budget_record.id),
    now(),
    now()
  ) RETURNING id INTO new_budget_id;
  
  RETURN new_budget_id;
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger to update budget spent amount when transactions change
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
DECLARE
  affected_budget_id uuid;
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update budget if transaction has budget_id
    IF NEW.budget_id IS NOT NULL THEN
      UPDATE public.budgets 
      SET spent = calculate_budget_spent(NEW.budget_id),
          updated_at = now()
      WHERE id = NEW.budget_id;
    END IF;
    
    -- Update budgets based on category matching
    UPDATE public.budgets b
    SET spent = calculate_budget_spent(b.id),
        updated_at = now()
    FROM public.categories c
    WHERE c.name = NEW.category
      AND b.category_id = c.id
      AND b.account_id = NEW.account_id
      AND (b.start_date IS NULL OR NEW.date >= b.start_date)
      AND (b.end_date IS NULL OR NEW.date <= b.end_date);
      
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    -- Update budget if transaction had budget_id
    IF OLD.budget_id IS NOT NULL THEN
      UPDATE public.budgets 
      SET spent = calculate_budget_spent(OLD.budget_id),
          updated_at = now()
      WHERE id = OLD.budget_id;
    END IF;
    
    -- Update budgets based on category matching
    UPDATE public.budgets b
    SET spent = calculate_budget_spent(b.id),
        updated_at = now()
    FROM public.categories c
    WHERE c.name = OLD.category
      AND b.category_id = c.id
      AND b.account_id = OLD.account_id
      AND (b.start_date IS NULL OR OLD.date >= b.start_date)
      AND (b.end_date IS NULL OR OLD.date <= b.end_date);
      
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS update_budget_spent_trigger ON public.transactions;
CREATE TRIGGER update_budget_spent_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_spent();

-- 12. Update existing budgets to recalculate spent amounts
UPDATE public.budgets 
SET spent = calculate_budget_spent(id);

-- 13. Create budget_categories junction table for many-to-many relationship
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'budget_categories'
  ) THEN
    CREATE TABLE public.budget_categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      budget_id uuid NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
      category_id bigint NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      UNIQUE(budget_id, category_id)
    );
    
    -- Create indexes for performance
    CREATE INDEX idx_budget_categories_budget_id ON public.budget_categories(budget_id);
    CREATE INDEX idx_budget_categories_category_id ON public.budget_categories(category_id);
  END IF;
END $$;

-- 14. Migrate existing single category relationships to junction table
DO $$
BEGIN
  -- Only migrate if budget_categories table is empty and budgets have category_id data
  IF NOT EXISTS (SELECT 1 FROM public.budget_categories LIMIT 1) THEN
    INSERT INTO public.budget_categories (budget_id, category_id)
    SELECT id, category_id 
    FROM public.budgets 
    WHERE category_id IS NOT NULL;
  END IF;
END $$;

-- 15. Update calculate_budget_spent function to handle multiple categories
CREATE OR REPLACE FUNCTION calculate_budget_spent(budget_uuid uuid)
RETURNS numeric AS $$
DECLARE
  total_spent numeric := 0;
  budget_start_date date;
  budget_end_date date;
  budget_account_id uuid;
BEGIN
  -- Get budget details
  SELECT start_date, end_date, account_id 
  INTO budget_start_date, budget_end_date, budget_account_id
  FROM public.budgets 
  WHERE id = budget_uuid;
  
  -- Calculate spent amount based on transactions
  -- Check if budget has categories linked via junction table
  IF EXISTS (SELECT 1 FROM public.budget_categories WHERE budget_id = budget_uuid) THEN
    -- Multi-category budget tracking
    SELECT COALESCE(SUM(t.amount), 0)
    INTO total_spent
    FROM public.transactions t
    JOIN public.categories c ON c.name = t.category
    JOIN public.budget_categories bc ON bc.category_id = c.id
    WHERE bc.budget_id = budget_uuid
      AND t.type = 'expense'
      AND (budget_start_date IS NULL OR t.date >= budget_start_date)
      AND (budget_end_date IS NULL OR t.date <= budget_end_date)
      AND (budget_account_id IS NULL OR t.account_id = budget_account_id);
  ELSE
    -- Direct budget_id tracking (when transactions are linked to budgets)
    SELECT COALESCE(SUM(amount), 0)
    INTO total_spent
    FROM public.transactions
    WHERE budget_id = budget_uuid
      AND type = 'expense'
      AND (budget_start_date IS NULL OR date >= budget_start_date)
      AND (budget_end_date IS NULL OR date <= budget_end_date);
  END IF;
  
  RETURN total_spent;
END;
$$ LANGUAGE plpgsql;

-- 16. Update trigger function to handle multiple categories
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
DECLARE
  affected_budget_id uuid;
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update budget if transaction has budget_id
    IF NEW.budget_id IS NOT NULL THEN
      UPDATE public.budgets 
      SET spent = calculate_budget_spent(NEW.budget_id),
          updated_at = now()
      WHERE id = NEW.budget_id;
    END IF;
    
    -- Update budgets based on category matching (multiple categories)
    UPDATE public.budgets b
    SET spent = calculate_budget_spent(b.id),
        updated_at = now()
    FROM public.categories c
    JOIN public.budget_categories bc ON bc.category_id = c.id
    WHERE c.name = NEW.category
      AND bc.budget_id = b.id
      AND (b.account_id IS NULL OR b.account_id = NEW.account_id)
      AND (b.start_date IS NULL OR NEW.date >= b.start_date)
      AND (b.end_date IS NULL OR NEW.date <= b.end_date);
      
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    -- Update budget if transaction had budget_id
    IF OLD.budget_id IS NOT NULL THEN
      UPDATE public.budgets 
      SET spent = calculate_budget_spent(OLD.budget_id),
          updated_at = now()
      WHERE id = OLD.budget_id;
    END IF;
    
    -- Update budgets based on category matching (multiple categories)
    UPDATE public.budgets b
    SET spent = calculate_budget_spent(b.id),
        updated_at = now()
    FROM public.categories c
    JOIN public.budget_categories bc ON bc.category_id = c.id
    WHERE c.name = OLD.category
      AND bc.budget_id = b.id
      AND (b.account_id IS NULL OR b.account_id = OLD.account_id)
      AND (b.start_date IS NULL OR OLD.date >= b.start_date)
      AND (b.end_date IS NULL OR OLD.date <= b.end_date);
      
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 17. Add helpful views for budget reporting with multiple categories
CREATE OR REPLACE VIEW budget_summary AS
SELECT 
  b.id,
  b.name,
  b.amount,
  b.spent,
  b.amount - b.spent as remaining,
  CASE 
    WHEN b.amount > 0 THEN ROUND((b.spent / b.amount) * 100, 2)
    ELSE 0 
  END as percent_used,
  b.start_date,
  b.end_date,
  b.account_id,
  b.category_id,
  b.is_recurring,
  b.recurring_type,
  b.parent_budget_id,
  c.name as category_name,
  a.name as account_name,
  -- Aggregate multiple categories
  COALESCE(
    (SELECT string_agg(cat.name, ', ' ORDER BY cat.name)
     FROM public.budget_categories bc
     JOIN public.categories cat ON bc.category_id = cat.id
     WHERE bc.budget_id = b.id), 
    c.name
  ) as category_names
FROM public.budgets b
LEFT JOIN public.categories c ON b.category_id = c.id
LEFT JOIN public.accounts a ON b.account_id = a.id;

-- 18. Create helper functions for budget-category management
CREATE OR REPLACE FUNCTION add_category_to_budget(budget_uuid uuid, category_id_param bigint)
RETURNS boolean AS $$
BEGIN
  INSERT INTO public.budget_categories (budget_id, category_id)
  VALUES (budget_uuid, category_id_param)
  ON CONFLICT (budget_id, category_id) DO NOTHING;
  
  -- Recalculate budget spent amount
  UPDATE public.budgets 
  SET spent = calculate_budget_spent(budget_uuid),
      updated_at = now()
  WHERE id = budget_uuid;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_category_from_budget(budget_uuid uuid, category_id_param bigint)
RETURNS boolean AS $$
BEGIN
  DELETE FROM public.budget_categories 
  WHERE budget_id = budget_uuid AND category_id = category_id_param;
  
  -- Recalculate budget spent amount
  UPDATE public.budgets 
  SET spent = calculate_budget_spent(budget_uuid),
      updated_at = now()
  WHERE id = budget_uuid;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_budget_categories(budget_uuid uuid, category_ids bigint[])
RETURNS boolean AS $$
BEGIN
  -- Remove all existing categories for this budget
  DELETE FROM public.budget_categories WHERE budget_id = budget_uuid;
  
  -- Add new categories
  IF array_length(category_ids, 1) > 0 THEN
    INSERT INTO public.budget_categories (budget_id, category_id)
    SELECT budget_uuid, unnest(category_ids);
  END IF;
  
  -- Recalculate budget spent amount
  UPDATE public.budgets 
  SET spent = calculate_budget_spent(budget_uuid),
      updated_at = now()
  WHERE id = budget_uuid;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql;