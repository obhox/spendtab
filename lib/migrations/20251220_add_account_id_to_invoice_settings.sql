-- Add account_id to invoice_settings
ALTER TABLE public.invoice_settings 
ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE;

-- Create index for account_id
CREATE INDEX IF NOT EXISTS idx_invoice_settings_account_id ON public.invoice_settings(account_id);

-- Drop the unique constraint on user_id (since a user can have multiple accounts with different settings)
ALTER TABLE public.invoice_settings DROP CONSTRAINT IF EXISTS invoice_settings_user_id_key;

-- Add unique constraint on account_id (one settings record per account)
ALTER TABLE public.invoice_settings ADD CONSTRAINT invoice_settings_account_id_key UNIQUE (account_id);

-- Update RLS policies to include account checks
DROP POLICY IF EXISTS "Users can view their own invoice settings" ON public.invoice_settings;
CREATE POLICY "Users can view their own invoice settings"
  ON public.invoice_settings FOR SELECT
  USING (
    (account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid()))
    OR 
    (user_id = auth.uid() AND account_id IS NULL) -- Backwards compatibility for unmigrated rows
  );

DROP POLICY IF EXISTS "Users can insert their own invoice settings" ON public.invoice_settings;
CREATE POLICY "Users can insert their own invoice settings"
  ON public.invoice_settings FOR INSERT
  WITH CHECK (
    (account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid()))
    OR 
    (user_id = auth.uid() AND account_id IS NULL)
  );

DROP POLICY IF EXISTS "Users can update their own invoice settings" ON public.invoice_settings;
CREATE POLICY "Users can update their own invoice settings"
  ON public.invoice_settings FOR UPDATE
  USING (
    (account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid()))
    OR 
    (user_id = auth.uid() AND account_id IS NULL)
  )
  WITH CHECK (
    (account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid()))
    OR 
    (user_id = auth.uid() AND account_id IS NULL)
  );

DROP POLICY IF EXISTS "Users can delete their own invoice settings" ON public.invoice_settings;
CREATE POLICY "Users can delete their own invoice settings"
  ON public.invoice_settings FOR DELETE
  USING (
    (account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid()))
    OR 
    (user_id = auth.uid() AND account_id IS NULL)
  );
