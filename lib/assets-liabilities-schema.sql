-- Assets and Liabilities Schema for SpendTab

-- Create assets table
CREATE TABLE IF NOT EXISTS public.assets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  current_value decimal NOT NULL,
  purchase_value decimal,
  purchase_date date,
  depreciation_rate decimal DEFAULT 0,
  asset_type text NOT NULL CHECK (asset_type IN ('current', 'fixed', 'intangible')),
  account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create liabilities table
CREATE TABLE IF NOT EXISTS public.liabilities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  current_balance decimal NOT NULL,
  original_amount decimal,
  interest_rate decimal DEFAULT 0,
  due_date date,
  minimum_payment decimal DEFAULT 0,
  liability_type text NOT NULL CHECK (liability_type IN ('current', 'long_term')),
  account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for assets and liabilities tables
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assets
CREATE POLICY "Users can view their own assets"
  ON public.assets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets"
  ON public.assets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets"
  ON public.assets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
  ON public.assets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for liabilities
CREATE POLICY "Users can view their own liabilities"
  ON public.liabilities
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own liabilities"
  ON public.liabilities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own liabilities"
  ON public.liabilities
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own liabilities"
  ON public.liabilities
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_assets
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_liabilities
  BEFORE UPDATE ON public.liabilities
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_account_id ON public.assets(account_id);
CREATE INDEX IF NOT EXISTS idx_assets_asset_type ON public.assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_liabilities_user_id ON public.liabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_account_id ON public.liabilities(account_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_liability_type ON public.liabilities(liability_type);