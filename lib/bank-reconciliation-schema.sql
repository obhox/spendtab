-- Bank Reconciliation Schema for SpendTab
-- This schema adds bank reconciliation functionality to the existing transaction system

-- Create bank_statements table to store imported bank statements
CREATE TABLE IF NOT EXISTS public.bank_statements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  statement_date date NOT NULL,
  opening_balance decimal NOT NULL DEFAULT 0,
  closing_balance decimal NOT NULL DEFAULT 0,
  statement_period_start date NOT NULL,
  statement_period_end date NOT NULL,
  file_name text,
  file_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reconciled', 'discrepancy')),
  reconciled_at timestamp with time zone,
  reconciled_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create bank_transactions table to store imported bank transaction data
CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_statement_id uuid REFERENCES public.bank_statements(id) ON DELETE CASCADE NOT NULL,
  transaction_date date NOT NULL,
  description text NOT NULL,
  amount decimal NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('debit', 'credit')),
  reference_number text,
  balance_after decimal,
  category_suggested text,
  matched_transaction_id uuid REFERENCES public.transactions(id),
  match_confidence decimal DEFAULT 0 CHECK (match_confidence >= 0 AND match_confidence <= 1),
  match_status text NOT NULL DEFAULT 'unmatched' CHECK (match_status IN ('unmatched', 'matched', 'manual_match', 'ignored')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create reconciliation_sessions table to track reconciliation attempts
CREATE TABLE IF NOT EXISTS public.reconciliation_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  bank_statement_id uuid REFERENCES public.bank_statements(id) ON DELETE CASCADE NOT NULL,
  session_date timestamp with time zone DEFAULT now() NOT NULL,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  total_bank_transactions integer DEFAULT 0,
  matched_transactions integer DEFAULT 0,
  unmatched_transactions integer DEFAULT 0,
  discrepancy_amount decimal DEFAULT 0,
  notes text,
  completed_at timestamp with time zone,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create reconciliation_discrepancies table to track unresolved differences
CREATE TABLE IF NOT EXISTS public.reconciliation_discrepancies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reconciliation_session_id uuid REFERENCES public.reconciliation_sessions(id) ON DELETE CASCADE NOT NULL,
  discrepancy_type text NOT NULL CHECK (discrepancy_type IN ('missing_bank_transaction', 'missing_app_transaction', 'amount_mismatch', 'date_mismatch')),
  bank_transaction_id uuid REFERENCES public.bank_transactions(id),
  app_transaction_id uuid REFERENCES public.transactions(id),
  expected_amount decimal,
  actual_amount decimal,
  description text NOT NULL,
  resolution_status text NOT NULL DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'resolved', 'ignored')),
  resolution_notes text,
  resolved_at timestamp with time zone,
  resolved_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for all new tables
ALTER TABLE public.bank_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_discrepancies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bank_statements
CREATE POLICY "Users can view bank statements for their accounts"
  ON public.bank_statements
  FOR SELECT
  USING (account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert bank statements for their accounts"
  ON public.bank_statements
  FOR INSERT
  WITH CHECK (account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update bank statements for their accounts"
  ON public.bank_statements
  FOR UPDATE
  USING (account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete bank statements for their accounts"
  ON public.bank_statements
  FOR DELETE
  USING (account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid()));

-- Create RLS policies for bank_transactions
CREATE POLICY "Users can view bank transactions for their statements"
  ON public.bank_transactions
  FOR SELECT
  USING (bank_statement_id IN (
    SELECT id FROM public.bank_statements 
    WHERE account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid())
  ));

CREATE POLICY "Users can insert bank transactions for their statements"
  ON public.bank_transactions
  FOR INSERT
  WITH CHECK (bank_statement_id IN (
    SELECT id FROM public.bank_statements 
    WHERE account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid())
  ));

CREATE POLICY "Users can update bank transactions for their statements"
  ON public.bank_transactions
  FOR UPDATE
  USING (bank_statement_id IN (
    SELECT id FROM public.bank_statements 
    WHERE account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid())
  ));

-- Create RLS policies for reconciliation_sessions
CREATE POLICY "Users can view their reconciliation sessions"
  ON public.reconciliation_sessions
  FOR SELECT
  USING (account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert their reconciliation sessions"
  ON public.reconciliation_sessions
  FOR INSERT
  WITH CHECK (account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Users can update their reconciliation sessions"
  ON public.reconciliation_sessions
  FOR UPDATE
  USING (account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid()));

-- Create RLS policies for reconciliation_discrepancies
CREATE POLICY "Users can view discrepancies for their reconciliation sessions"
  ON public.reconciliation_discrepancies
  FOR SELECT
  USING (reconciliation_session_id IN (
    SELECT id FROM public.reconciliation_sessions 
    WHERE account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid())
  ));

CREATE POLICY "Users can insert discrepancies for their reconciliation sessions"
  ON public.reconciliation_discrepancies
  FOR INSERT
  WITH CHECK (reconciliation_session_id IN (
    SELECT id FROM public.reconciliation_sessions 
    WHERE account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid())
  ));

CREATE POLICY "Users can update discrepancies for their reconciliation sessions"
  ON public.reconciliation_discrepancies
  FOR UPDATE
  USING (reconciliation_session_id IN (
    SELECT id FROM public.reconciliation_sessions 
    WHERE account_id IN (SELECT id FROM public.accounts WHERE owner_id = auth.uid())
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bank_statements_account_id ON public.bank_statements(account_id);
CREATE INDEX IF NOT EXISTS idx_bank_statements_statement_date ON public.bank_statements(statement_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_statement_id ON public.bank_transactions(bank_statement_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON public.bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_match_status ON public.bank_transactions(match_status);
CREATE INDEX IF NOT EXISTS idx_reconciliation_sessions_account_id ON public.reconciliation_sessions(account_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_discrepancies_session_id ON public.reconciliation_discrepancies(reconciliation_session_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER set_updated_at_bank_statements
  BEFORE UPDATE ON public.bank_statements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_bank_transactions
  BEFORE UPDATE ON public.bank_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_reconciliation_sessions
  BEFORE UPDATE ON public.reconciliation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_reconciliation_discrepancies
  BEFORE UPDATE ON public.reconciliation_discrepancies
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Create function to automatically match transactions based on amount and date
CREATE OR REPLACE FUNCTION public.auto_match_bank_transactions(statement_id uuid)
RETURNS void AS $$
DECLARE
  bank_tx RECORD;
  app_tx RECORD;
  match_found BOOLEAN;
BEGIN
  -- Loop through unmatched bank transactions
  FOR bank_tx IN 
    SELECT * FROM public.bank_transactions 
    WHERE bank_statement_id = statement_id 
    AND match_status = 'unmatched'
  LOOP
    match_found := FALSE;
    
    -- Try to find exact match by amount and date (within 3 days)
    FOR app_tx IN
      SELECT * FROM public.transactions t
      JOIN public.bank_statements bs ON bs.account_id = t.account_id
      WHERE bs.id = statement_id
      AND ABS(t.amount - ABS(bank_tx.amount)) < 0.01
      AND ABS(EXTRACT(EPOCH FROM (t.date::timestamp - bank_tx.transaction_date::timestamp))/86400) <= 3
      AND t.id NOT IN (SELECT matched_transaction_id FROM public.bank_transactions WHERE matched_transaction_id IS NOT NULL)
      ORDER BY ABS(EXTRACT(EPOCH FROM (t.date::timestamp - bank_tx.transaction_date::timestamp)))
      LIMIT 1
    LOOP
      -- Update bank transaction with match
      UPDATE public.bank_transactions 
      SET 
        matched_transaction_id = app_tx.id,
        match_status = 'matched',
        match_confidence = CASE 
          WHEN bank_tx.transaction_date = app_tx.date THEN 0.95
          ELSE 0.85
        END,
        updated_at = now()
      WHERE id = bank_tx.id;
      
      match_found := TRUE;
      EXIT;
    END LOOP;
    
    -- If no exact match found, try simple text matching by description
    IF NOT match_found THEN
      FOR app_tx IN
        SELECT * FROM public.transactions t
        JOIN public.bank_statements bs ON bs.account_id = t.account_id
        WHERE bs.id = statement_id
        AND ABS(t.amount - ABS(bank_tx.amount)) < 0.01
        AND ABS(EXTRACT(EPOCH FROM (t.date::timestamp - bank_tx.transaction_date::timestamp))/86400) <= 7
        AND (
          LOWER(t.description) LIKE '%' || LOWER(bank_tx.description) || '%'
          OR LOWER(bank_tx.description) LIKE '%' || LOWER(t.description) || '%'
          OR LOWER(t.description) = LOWER(bank_tx.description)
        )
        AND t.id NOT IN (SELECT matched_transaction_id FROM public.bank_transactions WHERE matched_transaction_id IS NOT NULL)
        ORDER BY 
          CASE 
            WHEN LOWER(t.description) = LOWER(bank_tx.description) THEN 1
            WHEN LOWER(t.description) LIKE '%' || LOWER(bank_tx.description) || '%' THEN 2
            WHEN LOWER(bank_tx.description) LIKE '%' || LOWER(t.description) || '%' THEN 3
            ELSE 4
          END,
          ABS(EXTRACT(EPOCH FROM (t.date::timestamp - bank_tx.transaction_date::timestamp)))
        LIMIT 1
      LOOP
        -- Update bank transaction with text match
        UPDATE public.bank_transactions 
        SET 
          matched_transaction_id = app_tx.id,
          match_status = 'matched',
          match_confidence = CASE 
            WHEN LOWER(app_tx.description) = LOWER(bank_tx.description) THEN 0.8
            ELSE 0.6
          END,
          updated_at = now()
        WHERE id = bank_tx.id;
        
        EXIT;
      END LOOP;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate reconciliation summary
CREATE OR REPLACE FUNCTION public.get_reconciliation_summary(statement_id uuid)
RETURNS TABLE(
  total_bank_transactions integer,
  matched_transactions integer,
  unmatched_transactions integer,
  bank_balance decimal,
  app_balance decimal,
  discrepancy_amount decimal
) AS $$
DECLARE
  stmt_record RECORD;
  app_balance_calc decimal;
BEGIN
  -- Get statement details
  SELECT * INTO stmt_record FROM public.bank_statements WHERE id = statement_id;
  
  -- Calculate app balance for the same period
  SELECT COALESCE(SUM(
    CASE 
      WHEN type = 'income' THEN amount 
      ELSE -amount 
    END
  ), 0) INTO app_balance_calc
  FROM public.transactions 
  WHERE account_id = stmt_record.account_id
  AND date <= stmt_record.statement_period_end;
  
  RETURN QUERY
  SELECT 
    COUNT(*)::integer as total_bank_transactions,
    COUNT(CASE WHEN match_status = 'matched' THEN 1 END)::integer as matched_transactions,
    COUNT(CASE WHEN match_status = 'unmatched' THEN 1 END)::integer as unmatched_transactions,
    stmt_record.closing_balance as bank_balance,
    app_balance_calc as app_balance,
    (stmt_record.closing_balance - app_balance_calc) as discrepancy_amount
  FROM public.bank_transactions
  WHERE bank_statement_id = statement_id;
END;
$$ LANGUAGE plpgsql;