-- Fix missing columns in assets and liabilities tables

-- Add missing columns to assets table
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS current_value decimal;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS purchase_value decimal;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS purchase_date date;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS depreciation_rate decimal DEFAULT 0;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS asset_type text CHECK (asset_type IN ('current', 'fixed', 'intangible'));
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add missing columns to liabilities table
ALTER TABLE public.liabilities ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.liabilities ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.liabilities ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.liabilities ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.liabilities ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.liabilities ADD COLUMN IF NOT EXISTS current_balance decimal;
ALTER TABLE public.liabilities ADD COLUMN IF NOT EXISTS original_amount decimal;
ALTER TABLE public.liabilities ADD COLUMN IF NOT EXISTS interest_rate decimal DEFAULT 0;
ALTER TABLE public.liabilities ADD COLUMN IF NOT EXISTS due_date date;
ALTER TABLE public.liabilities ADD COLUMN IF NOT EXISTS minimum_payment decimal DEFAULT 0;
ALTER TABLE public.liabilities ADD COLUMN IF NOT EXISTS liability_type text CHECK (liability_type IN ('current', 'long_term'));
ALTER TABLE public.liabilities ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.liabilities ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Enable RLS if not already enabled
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assets (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can insert their own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can update their own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can delete their own assets" ON public.assets;

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

-- Create RLS policies for liabilities (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own liabilities" ON public.liabilities;
DROP POLICY IF EXISTS "Users can insert their own liabilities" ON public.liabilities;
DROP POLICY IF EXISTS "Users can update their own liabilities" ON public.liabilities;
DROP POLICY IF EXISTS "Users can delete their own liabilities" ON public.liabilities;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_account_id ON public.assets(account_id);
CREATE INDEX IF NOT EXISTS idx_assets_asset_type ON public.assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_liabilities_user_id ON public.liabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_account_id ON public.liabilities(account_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_liability_type ON public.liabilities(liability_type);