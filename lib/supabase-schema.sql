-- Schema setup for BusinessOS Supabase integration

-- Enable RLS (Row Level Security)
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  date date NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  amount decimal NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  notes text,
  budget_id uuid REFERENCES public.budgets(id) ON DELETE SET NULL,
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
