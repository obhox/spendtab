-- ============================================================
-- INVOICE SETTINGS - Business Details for Invoices
-- ============================================================
-- This schema adds business settings/configuration for invoices
-- ============================================================

-- ============================================================
-- INVOICE SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoice_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Business Information
  business_name text,
  business_email text,
  business_phone text,
  business_address text,
  business_city text,
  business_state text,
  business_postal_code text,
  business_country text DEFAULT 'Nigeria',
  business_tax_id text,
  business_website text,

  -- Logo
  logo_url text, -- URL to uploaded logo in Supabase Storage

  -- Invoice Defaults
  default_payment_terms text DEFAULT 'Payment due within 30 days',
  default_notes text,
  invoice_prefix text DEFAULT 'INV',

  -- Bank Details (optional for invoice footer)
  bank_name text,
  account_name text,
  account_number text,

  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for invoice_settings
ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;

-- Index for invoice_settings
CREATE INDEX IF NOT EXISTS idx_invoice_settings_user_id ON public.invoice_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_settings_account_id ON public.invoice_settings(account_id);

-- Ensure one settings record per account
ALTER TABLE public.invoice_settings ADD CONSTRAINT invoice_settings_account_id_key UNIQUE (account_id);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Users can view their own settings (via account ownership)
CREATE POLICY "Users can view their own invoice settings"
  ON public.invoice_settings FOR SELECT
  USING (
    account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid())
    OR
    (user_id = auth.uid() AND account_id IS NULL)
  );

-- Users can insert their own settings
CREATE POLICY "Users can insert their own invoice settings"
  ON public.invoice_settings FOR INSERT
  WITH CHECK (
    account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid())
    OR
    (user_id = auth.uid() AND account_id IS NULL)
  );

-- Users can update their own settings
CREATE POLICY "Users can update their own invoice settings"
  ON public.invoice_settings FOR UPDATE
  USING (
    account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid())
    OR
    (user_id = auth.uid() AND account_id IS NULL)
  )
  WITH CHECK (
    account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid())
    OR
    (user_id = auth.uid() AND account_id IS NULL)
  );

-- Users can delete their own settings
CREATE POLICY "Users can delete their own invoice settings"
  ON public.invoice_settings FOR DELETE
  USING (
    account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid())
    OR
    (user_id = auth.uid() AND account_id IS NULL)
  );

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Updated_at trigger
CREATE TRIGGER set_updated_at_invoice_settings
BEFORE UPDATE ON public.invoice_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- STORAGE BUCKET FOR LOGOS
-- ============================================================
-- Run this in Supabase Dashboard > Storage to create the bucket
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('invoice-logos', 'invoice-logos', true);
--
-- Then set up RLS policies for the bucket:
--
-- CREATE POLICY "Users can upload their own logo"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'invoice-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Anyone can view logos"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'invoice-logos');
--
-- CREATE POLICY "Users can update their own logo"
-- ON storage.objects FOR UPDATE
-- USING (bucket_id = 'invoice-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Users can delete their own logo"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'invoice-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
