-- ============================================================
-- INVOICE MODULE - DATABASE SCHEMA
-- ============================================================
-- This schema adds invoice management capabilities to SpendTab
-- Includes: clients, invoices, invoice_items, invoice_sequences
-- ============================================================

-- ============================================================
-- CLIENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  country text DEFAULT 'Nigeria',
  tax_id text, -- Tax ID/EIN for business clients
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Indexes for clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_account_id ON public.clients(account_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);

-- ============================================================
-- INVOICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number text NOT NULL UNIQUE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,

  -- Status tracking
  status text NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',

  -- Dates
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  paid_date date,

  -- Financial details
  subtotal decimal NOT NULL DEFAULT 0,
  tax_rate decimal NOT NULL DEFAULT 0, -- Percentage (e.g., 7.5 for 7.5%)
  tax_amount decimal NOT NULL DEFAULT 0,
  total_amount decimal NOT NULL DEFAULT 0,

  -- Additional fields
  notes text, -- Notes visible to client
  terms text, -- Payment terms

  -- Transaction integration
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL, -- Created when paid

  -- Multi-tenant support
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,

  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_account_id ON public.invoices(account_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- ============================================================
-- INVOICE ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,

  -- Line item details
  description text NOT NULL,
  quantity decimal NOT NULL DEFAULT 1,
  unit_price decimal NOT NULL DEFAULT 0,
  amount decimal NOT NULL DEFAULT 0, -- quantity * unit_price

  -- Optional category for income tracking
  category text,

  -- Ordering
  line_order integer NOT NULL DEFAULT 0,

  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for invoice_items
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Indexes for invoice_items
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

-- ============================================================
-- INVOICE SEQUENCES TABLE (for auto-numbering)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoice_sequences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_number integer NOT NULL DEFAULT 0,
  prefix text DEFAULT 'INV', -- e.g., "INV", "INVOICE"
  year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for invoice_sequences
ALTER TABLE public.invoice_sequences ENABLE ROW LEVEL SECURITY;

-- Index for invoice_sequences
CREATE INDEX IF NOT EXISTS idx_invoice_sequences_account_id ON public.invoice_sequences(account_id);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Clients policies
CREATE POLICY "Users can view their own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "Users can view their own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
  ON public.invoices FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
  ON public.invoices FOR DELETE
  USING (auth.uid() = user_id);

-- Invoice items policies (access through invoice ownership)
CREATE POLICY "Users can view invoice items for their invoices"
  ON public.invoice_items FOR SELECT
  USING (invoice_id IN (SELECT id FROM public.invoices WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert invoice items for their invoices"
  ON public.invoice_items FOR INSERT
  WITH CHECK (invoice_id IN (SELECT id FROM public.invoices WHERE user_id = auth.uid()));

CREATE POLICY "Users can update invoice items for their invoices"
  ON public.invoice_items FOR UPDATE
  USING (invoice_id IN (SELECT id FROM public.invoices WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete invoice items for their invoices"
  ON public.invoice_items FOR DELETE
  USING (invoice_id IN (SELECT id FROM public.invoices WHERE user_id = auth.uid()));

-- Invoice sequences policies
CREATE POLICY "Users can view their account invoice sequences"
  ON public.invoice_sequences FOR SELECT
  USING (account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert their account invoice sequences"
  ON public.invoice_sequences FOR INSERT
  WITH CHECK (account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update their account invoice sequences"
  ON public.invoice_sequences FOR UPDATE
  USING (account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid()));

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Updated_at triggers (assumes set_updated_at function exists)
CREATE TRIGGER set_updated_at_clients
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_invoices
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_invoice_items
BEFORE UPDATE ON public.invoice_items
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_invoice_sequences
BEFORE UPDATE ON public.invoice_sequences
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to get next invoice number
CREATE OR REPLACE FUNCTION get_next_invoice_number(p_account_id uuid)
RETURNS text AS $$
DECLARE
  v_sequence_record RECORD;
  v_current_year integer;
  v_next_number integer;
  v_invoice_number text;
BEGIN
  v_current_year := EXTRACT(YEAR FROM CURRENT_DATE)::integer;

  -- Get or create sequence record for account
  SELECT * INTO v_sequence_record
  FROM public.invoice_sequences
  WHERE account_id = p_account_id
  FOR UPDATE;

  -- If no sequence exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.invoice_sequences (account_id, current_number, year)
    VALUES (p_account_id, 1, v_current_year)
    RETURNING * INTO v_sequence_record;

    v_next_number := 1;
  ELSE
    -- Check if year has changed
    IF v_sequence_record.year != v_current_year THEN
      -- Reset sequence for new year
      UPDATE public.invoice_sequences
      SET current_number = 1, year = v_current_year
      WHERE account_id = p_account_id;

      v_next_number := 1;
    ELSE
      -- Increment sequence
      v_next_number := v_sequence_record.current_number + 1;

      UPDATE public.invoice_sequences
      SET current_number = v_next_number
      WHERE account_id = p_account_id;
    END IF;
  END IF;

  -- Format: PREFIX-YEAR-NUMBER (e.g., INV-2025-001)
  v_invoice_number := v_sequence_record.prefix || '-' ||
                      v_current_year || '-' ||
                      LPAD(v_next_number::text, 3, '0');

  RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate invoice totals
CREATE OR REPLACE FUNCTION recalculate_invoice_totals(p_invoice_id uuid)
RETURNS void AS $$
DECLARE
  v_subtotal decimal;
  v_tax_rate decimal;
  v_tax_amount decimal;
  v_total_amount decimal;
BEGIN
  -- Get current tax rate
  SELECT tax_rate INTO v_tax_rate
  FROM public.invoices
  WHERE id = p_invoice_id;

  -- Calculate subtotal from items
  SELECT COALESCE(SUM(amount), 0) INTO v_subtotal
  FROM public.invoice_items
  WHERE invoice_id = p_invoice_id;

  -- Calculate tax and total
  v_tax_amount := v_subtotal * (v_tax_rate / 100);
  v_total_amount := v_subtotal + v_tax_amount;

  -- Update invoice
  UPDATE public.invoices
  SET
    subtotal = v_subtotal,
    tax_amount = v_tax_amount,
    total_amount = v_total_amount
  WHERE id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate totals when items change
CREATE OR REPLACE FUNCTION trigger_recalculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    PERFORM recalculate_invoice_totals(OLD.invoice_id);
  ELSE
    PERFORM recalculate_invoice_totals(NEW.invoice_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_on_item_change
AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
FOR EACH ROW
EXECUTE FUNCTION trigger_recalculate_invoice_totals();

-- Function to update invoice status based on due date
CREATE OR REPLACE FUNCTION update_invoice_overdue_status()
RETURNS void AS $$
BEGIN
  UPDATE public.invoices
  SET status = 'overdue'
  WHERE status = 'sent'
    AND due_date < CURRENT_DATE
    AND paid_date IS NULL;
END;
$$ LANGUAGE plpgsql;

-- NOTE: To automatically update overdue status, set up a scheduled task/cron job
-- to call: SELECT update_invoice_overdue_status();

-- ============================================================
-- INSTALLATION COMPLETE
-- ============================================================
-- To install this schema, run this SQL file in your Supabase SQL Editor
-- After installation:
-- 1. Verify tables are created: SELECT * FROM information_schema.tables WHERE table_schema = 'public';
-- 2. Test invoice number generation: SELECT get_next_invoice_number('your-account-id');
-- 3. Set up a cron job to run update_invoice_overdue_status() daily
-- ============================================================
