-- Add share_token field to invoices table for public invoice viewing
-- This allows secure, tokenized links to be sent to clients

ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS share_token text UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_share_token ON public.invoices(share_token);

-- Function to generate a secure random token
CREATE OR REPLACE FUNCTION generate_invoice_share_token()
RETURNS text AS $$
DECLARE
  token text;
  token_exists boolean;
BEGIN
  LOOP
    -- Generate a random 32-character token
    token := encode(gen_random_bytes(24), 'base64');
    -- Replace URL-unsafe characters
    token := replace(replace(replace(token, '/', '_'), '+', '-'), '=', '');

    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM public.invoices WHERE share_token = token) INTO token_exists;

    -- Exit loop if token is unique
    EXIT WHEN NOT token_exists;
  END LOOP;

  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure invoice has a share token
CREATE OR REPLACE FUNCTION ensure_invoice_share_token(invoice_id uuid)
RETURNS text AS $$
DECLARE
  existing_token text;
  new_token text;
BEGIN
  -- Check if invoice already has a token
  SELECT share_token INTO existing_token
  FROM public.invoices
  WHERE id = invoice_id;

  -- If token exists, return it
  IF existing_token IS NOT NULL THEN
    RETURN existing_token;
  END IF;

  -- Generate new token
  new_token := generate_invoice_share_token();

  -- Update invoice with new token
  UPDATE public.invoices
  SET share_token = new_token
  WHERE id = invoice_id;

  RETURN new_token;
END;
$$ LANGUAGE plpgsql;

-- Optionally, generate tokens for existing invoices that don't have one
-- Uncomment the following lines if you want to add tokens to existing invoices:
-- UPDATE public.invoices
-- SET share_token = generate_invoice_share_token()
-- WHERE share_token IS NULL;
