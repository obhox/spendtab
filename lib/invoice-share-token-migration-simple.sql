-- Simple migration to add share_token field to invoices table
-- This allows secure, tokenized links to be sent to clients

-- Add share_token column
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS share_token text UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_share_token ON public.invoices(share_token);

-- That's it! The token generation is now handled in the application code.
