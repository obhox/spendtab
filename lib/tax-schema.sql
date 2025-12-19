-- Schema for Tax Centre
-- Based on Nigeria Tax Guide 2025

CREATE TABLE IF NOT EXISTS public.tax_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_type TEXT NOT NULL CHECK (business_type IN ('individual', 'small_company', 'company')),
  is_professional_service BOOLEAN DEFAULT FALSE, -- Key for small company status
  tax_id TEXT, -- TIN
  vat_registered BOOLEAN DEFAULT FALSE,
  filing_status TEXT DEFAULT 'up_to_date',
  last_filing_date DATE,
  tax_year INTEGER DEFAULT 2025, -- Added to fix trigger error
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tax_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own tax settings"
  ON public.tax_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tax settings"
  ON public.tax_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax settings"
  ON public.tax_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax settings"
  ON public.tax_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
-- Assuming public.set_updated_at() exists, if not create it or use moddatetime extension
-- CREATE EXTENSION IF NOT EXISTS moddatetime;
-- CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.tax_settings
--   FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

-- Add tax_deductible column to transactions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'tax_deductible') THEN
        ALTER TABLE public.transactions ADD COLUMN tax_deductible BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add payment_source column to transactions table if it doesn't exist (it seems it was used in the form)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'payment_source') THEN
        ALTER TABLE public.transactions ADD COLUMN payment_source TEXT DEFAULT 'bank_transfer';
    END IF;
END $$;

-- Add budget_id column to transactions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'budget_id') THEN
        ALTER TABLE public.transactions ADD COLUMN budget_id UUID REFERENCES public.budgets(id);
    END IF;
END $$;

-- Add account_id column to transactions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'account_id') THEN
        ALTER TABLE public.transactions ADD COLUMN account_id UUID REFERENCES public.accounts(id);
    END IF;
END $$;

-- Add tax_year column to tax_settings table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tax_settings' AND column_name = 'tax_year') THEN
        ALTER TABLE public.tax_settings ADD COLUMN tax_year INTEGER DEFAULT 2025;
    END IF;
END $$;

-- Comment
COMMENT ON TABLE public.tax_settings IS 'Stores user tax configuration for Nigeria Tax Guide 2025 compliance';
