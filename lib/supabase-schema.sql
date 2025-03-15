-- Schema setup for BusinessOS Supabase integration

-- Enable RLS (Row Level Security)
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

-- Helper functions for subscription restrictions
CREATE OR REPLACE FUNCTION public.check_monthly_transaction_limit()
RETURNS TRIGGER AS $$
DECLARE
  transaction_count INTEGER;
  user_tier TEXT;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM public.users
  WHERE id = NEW.user_id;

  -- Only check limits for free tier
  IF user_tier = 'free' THEN
    -- Count transactions for current month
    SELECT COUNT(*) INTO transaction_count
    FROM public.transactions
    WHERE user_id = NEW.user_id
    AND date_trunc('month', date) = date_trunc('month', NEW.date);

    IF transaction_count >= 50 THEN
      RAISE EXCEPTION 'Free users are limited to 50 transactions per month';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.check_budget_limit()
RETURNS TRIGGER AS $$
DECLARE
  budget_count INTEGER;
  user_tier TEXT;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM public.users
  WHERE id = NEW.user_id;

  -- Only check limits for free tier
  IF user_tier = 'free' THEN
    -- Count existing budgets
    SELECT COUNT(*) INTO budget_count
    FROM public.budgets
    WHERE user_id = NEW.user_id;

    IF budget_count >= 3 THEN
      RAISE EXCEPTION 'Free users are limited to 3 budgets';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.check_account_limit()
RETURNS TRIGGER AS $$
DECLARE
  account_count INTEGER;
  user_tier TEXT;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM public.users
  WHERE id = NEW.owner_id;

  -- Only check limits for free tier
  IF user_tier = 'free' THEN
    -- Count existing accounts
    SELECT COUNT(*) INTO account_count
    FROM public.accounts
    WHERE owner_id = NEW.owner_id;

    IF account_count >= 1 THEN
      RAISE EXCEPTION 'Free users are limited to 1 account';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  date date NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  amount decimal NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  amount decimal NOT NULL,
  spent decimal NOT NULL DEFAULT 0,
  period text NOT NULL,
  category text NOT NULL,
  startDate date,
  endDate date,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for budgets
CREATE POLICY "Users can view their own budgets"
  ON public.budgets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets"
  ON public.budgets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
  ON public.budgets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
  ON public.budgets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  owner_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for accounts table
alter table public.accounts enable row level security;

-- Create policies for accounts table
CREATE POLICY "Users can view their own accounts"
  ON public.accounts
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own accounts"
  ON public.accounts
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id AND owner_id IS NOT NULL);

CREATE POLICY "Users can update their own accounts"
  ON public.accounts
  FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own accounts"
  ON public.accounts
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Create triggers for subscription restrictions
CREATE TRIGGER check_monthly_transaction_limit_trigger
  BEFORE INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_monthly_transaction_limit();

CREATE TRIGGER check_budget_limit_trigger
  BEFORE INSERT ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.check_budget_limit();

CREATE TRIGGER check_account_limit_trigger
  BEFORE INSERT ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.check_account_limit();

-- Create functions and triggers for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_transactions
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_budgets
BEFORE UPDATE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
