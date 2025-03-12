-- Add accounts table for multi-account support
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for accounts table
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Add account_id to existing tables
ALTER TABLE public.transactions
  ADD COLUMN account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE;

ALTER TABLE public.budgets
  ADD COLUMN account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE;

-- Update RLS policies for accounts
CREATE POLICY "Users can view their own accounts"
  ON public.accounts
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own accounts"
  ON public.accounts
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own accounts"
  ON public.accounts
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own accounts"
  ON public.accounts
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Update existing RLS policies to include account_id check
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id AND account_id IN (
    SELECT id FROM public.accounts WHERE owner_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can view their own budgets" ON public.budgets;
CREATE POLICY "Users can view their own budgets"
  ON public.budgets
  FOR SELECT
  USING (auth.uid() = user_id AND account_id IN (
    SELECT id FROM public.accounts WHERE owner_id = auth.uid()
  ));

-- Add trigger for updated_at on accounts table
CREATE TRIGGER set_updated_at_accounts
BEFORE UPDATE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();