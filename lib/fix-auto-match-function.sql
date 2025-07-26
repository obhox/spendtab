-- Fix for the auto_match_bank_transactions function
-- This fixes the PostgreSQL error: function pg_catalog.extract(unknown, integer) does not exist
-- Also removes dependency on similarity function which requires pg_trgm extension

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