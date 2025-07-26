-- US Tax Optimization Schema Migration
-- This script adds tax-related fields and predefined US tax categories

-- Add tax-related columns to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS tax_deductible boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tax_category text,
ADD COLUMN IF NOT EXISTS business_purpose text,
ADD COLUMN IF NOT EXISTS receipt_url text,
ADD COLUMN IF NOT EXISTS mileage decimal,
ADD COLUMN IF NOT EXISTS tax_year integer DEFAULT EXTRACT(year FROM date);

-- Create tax_categories table for predefined US tax categories
CREATE TABLE IF NOT EXISTS public.tax_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  irs_form text, -- Which IRS form this applies to (e.g., "Schedule C", "Form 1040")
  category_type text NOT NULL CHECK (category_type IN ('business_expense', 'personal_deduction', 'income')),
  deduction_limit decimal, -- Maximum deduction amount if applicable
  requires_documentation boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Insert predefined US tax categories for business expenses (Schedule C)
INSERT INTO public.tax_categories (name, description, irs_form, category_type, requires_documentation) VALUES
-- Business Expenses (Schedule C)
('Advertising', 'Business advertising and marketing expenses', 'Schedule C', 'business_expense', true),
('Car and Truck Expenses', 'Vehicle expenses for business use', 'Schedule C', 'business_expense', true),
('Commissions and Fees', 'Commissions and professional fees paid', 'Schedule C', 'business_expense', true),
('Contract Labor', 'Payments to independent contractors', 'Schedule C', 'business_expense', true),
('Depletion', 'Depletion of natural resources', 'Schedule C', 'business_expense', true),
('Depreciation', 'Depreciation of business assets', 'Schedule C', 'business_expense', true),
('Employee Benefit Programs', 'Employee benefits and insurance', 'Schedule C', 'business_expense', true),
('Insurance (other than health)', 'Business insurance premiums', 'Schedule C', 'business_expense', true),
('Interest (Mortgage)', 'Mortgage interest on business property', 'Schedule C', 'business_expense', true),
('Interest (Other)', 'Other business interest expenses', 'Schedule C', 'business_expense', true),
('Legal and Professional Services', 'Attorney, accountant, and consultant fees', 'Schedule C', 'business_expense', true),
('Office Expenses', 'Office supplies and expenses', 'Schedule C', 'business_expense', true),
('Pension and Profit-Sharing Plans', 'Retirement plan contributions', 'Schedule C', 'business_expense', true),
('Rent or Lease (Vehicles)', 'Vehicle rental and lease payments', 'Schedule C', 'business_expense', true),
('Rent or Lease (Other)', 'Equipment and property rental', 'Schedule C', 'business_expense', true),
('Repairs and Maintenance', 'Business equipment and property repairs', 'Schedule C', 'business_expense', true),
('Supplies', 'Business supplies and materials', 'Schedule C', 'business_expense', true),
('Taxes and Licenses', 'Business taxes and license fees', 'Schedule C', 'business_expense', true),
('Travel', 'Business travel expenses', 'Schedule C', 'business_expense', true),
('Meals', 'Business meals (50% deductible)', 'Schedule C', 'business_expense', true),
('Utilities', 'Business utilities and phone', 'Schedule C', 'business_expense', true),
('Wages', 'Employee wages and salaries', 'Schedule C', 'business_expense', true),
('Other Expenses', 'Other miscellaneous business expenses', 'Schedule C', 'business_expense', true),

-- Personal Deductions (Schedule A)
('Medical and Dental Expenses', 'Medical and dental expenses exceeding 7.5% of AGI', 'Schedule A', 'personal_deduction', true),
('State and Local Taxes', 'State and local income, sales, and property taxes (up to $10,000)', 'Schedule A', 'personal_deduction', true),
('Home Mortgage Interest', 'Mortgage interest on primary and secondary homes', 'Schedule A', 'personal_deduction', true),
('Gifts to Charity', 'Charitable contributions and donations', 'Schedule A', 'personal_deduction', true),
('Casualty and Theft Losses', 'Casualty and theft losses from federally declared disasters', 'Schedule A', 'personal_deduction', true),
('Other Itemized Deductions', 'Other miscellaneous itemized deductions', 'Schedule A', 'personal_deduction', true),

-- Income Categories
('Business Income', 'Income from business operations', 'Schedule C', 'income', false),
('Interest Income', 'Interest earned from banks, bonds, etc.', 'Form 1040', 'income', false),
('Dividend Income', 'Dividends from stocks and mutual funds', 'Form 1040', 'income', false),
('Capital Gains', 'Gains from sale of investments or property', 'Schedule D', 'income', true),
('Rental Income', 'Income from rental properties', 'Schedule E', 'income', false),
('Retirement Income', 'Distributions from retirement accounts', 'Form 1040', 'income', false),
('Social Security Benefits', 'Social Security benefit payments', 'Form 1040', 'income', false),
('Unemployment Compensation', 'Unemployment benefits received', 'Form 1040', 'income', false),
('Other Income', 'Other miscellaneous income', 'Form 1040', 'income', false);

-- Create function to automatically set tax year based on transaction date
CREATE OR REPLACE FUNCTION public.set_tax_year()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tax_year = EXTRACT(year FROM NEW.date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set tax year
CREATE TRIGGER set_tax_year_trigger
  BEFORE INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tax_year();

-- Create index for tax reporting queries
CREATE INDEX IF NOT EXISTS idx_transactions_tax_year ON public.transactions(tax_year);
CREATE INDEX IF NOT EXISTS idx_transactions_tax_deductible ON public.transactions(tax_deductible);
CREATE INDEX IF NOT EXISTS idx_transactions_tax_category ON public.transactions(tax_category);

-- Create view for tax summary by year
CREATE OR REPLACE VIEW public.tax_summary_by_year AS
SELECT 
  tax_year,
  user_id,
  SUM(CASE WHEN tax_deductible = true AND type = 'expense' THEN ABS(amount) ELSE 0 END) as total_deductible_expenses,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  COUNT(CASE WHEN tax_deductible = true THEN 1 END) as deductible_transaction_count,
  COUNT(*) as total_transaction_count
FROM public.transactions
GROUP BY tax_year, user_id;

-- Create view for business expense summary (Schedule C)
CREATE OR REPLACE VIEW public.schedule_c_summary AS
SELECT 
  tax_year,
  user_id,
  tax_category,
  SUM(ABS(amount)) as total_amount,
  COUNT(*) as transaction_count,
  COUNT(CASE WHEN receipt_url IS NOT NULL THEN 1 END) as documented_transactions
FROM public.transactions
WHERE tax_deductible = true 
  AND type = 'expense'
  AND tax_category IN (
    SELECT name FROM public.tax_categories 
    WHERE category_type = 'business_expense'
  )
GROUP BY tax_year, user_id, tax_category;

-- Grant necessary permissions
GRANT SELECT ON public.tax_categories TO authenticated;
GRANT SELECT ON public.tax_summary_by_year TO authenticated;
GRANT SELECT ON public.schedule_c_summary TO authenticated;