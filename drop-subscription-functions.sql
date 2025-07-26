-- Drop subscription restriction functions and triggers
-- Run this in your Supabase SQL Editor to clean up the old subscription system

-- Drop triggers first (they depend on the functions)
DROP TRIGGER IF EXISTS check_monthly_transaction_limit_trigger ON transactions;
DROP TRIGGER IF EXISTS check_budget_limit_trigger ON budgets;
DROP TRIGGER IF EXISTS check_account_limit_trigger ON accounts;

-- Drop the functions
DROP FUNCTION IF EXISTS check_monthly_transaction_limit();
DROP FUNCTION IF EXISTS check_budget_limit();
DROP FUNCTION IF EXISTS check_account_limit();

-- Verify the functions are dropped
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('check_monthly_transaction_limit', 'check_budget_limit', 'check_account_limit');

-- This query should return no rows if all functions were successfully dropped