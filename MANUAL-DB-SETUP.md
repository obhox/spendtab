## Manual Database Setup Instructions

Since the automated setup script encountered issues, please follow these steps to manually create the assets and liabilities tables in your Supabase dashboard:

### Issue Identified:

The `assets` and `liabilities` tables exist but are missing essential columns like `account_id` and `user_id`, causing 400 errors when the application tries to query them.

### Quick Fix (Recommended):

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the "SQL Editor" section

2. **Run the Column Fix Script**
   - Copy the entire contents of `scripts/fix-table-columns.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the fix

### Alternative: Complete Recreation:

If the quick fix doesn't work, you can recreate the tables:

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: `qggzegjmmtlqnvimjgls`

### Step 2: Open SQL Editor
1. In the left sidebar, click on "SQL Editor"
2. Click "New query" to create a new SQL script

### Step 3: Drop Existing Tables (if needed)
First, drop the existing tables if they have incorrect structure:

```sql
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.liabilities CASCADE;
```

### Step 4: Execute the Complete Schema
Copy and paste the following SQL script into the editor and click "Run":

```sql
-- Create assets table
CREATE TABLE IF NOT EXISTS public.assets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  current_value decimal NOT NULL,
  purchase_value decimal,
  purchase_date date,
  depreciation_rate decimal DEFAULT 0,
  asset_type text NOT NULL CHECK (asset_type IN ('current', 'fixed', 'intangible')),
  account_id uuid,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create liabilities table
CREATE TABLE IF NOT EXISTS public.liabilities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  current_balance decimal NOT NULL,
  original_amount decimal,
  interest_rate decimal DEFAULT 0,
  due_date date,
  minimum_payment decimal DEFAULT 0,
  liability_type text NOT NULL CHECK (liability_type IN ('current', 'long_term')),
  account_id uuid,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for assets and liabilities tables
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assets
CREATE POLICY "Users can view their own assets"
  ON public.assets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets"
  ON public.assets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets"
  ON public.assets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
  ON public.assets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for liabilities
CREATE POLICY "Users can view their own liabilities"
  ON public.liabilities
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own liabilities"
  ON public.liabilities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own liabilities"
  ON public.liabilities
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own liabilities"
  ON public.liabilities
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_assets
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_liabilities
  BEFORE UPDATE ON public.liabilities
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_account_id ON public.assets(account_id);
CREATE INDEX IF NOT EXISTS idx_assets_asset_type ON public.assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_liabilities_user_id ON public.liabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_account_id ON public.liabilities(account_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_liability_type ON public.liabilities(liability_type);
```

### Step 4: Verify Tables
After running the script, you should see:
- ✅ Success message in the SQL editor
- The tables `assets` and `liabilities` should appear in the "Table Editor" section

### Step 5: Test the Application
Once the tables are created, go back to your application at `http://localhost:3000/assets-liabilities` and try adding assets and liabilities. The 404 errors should be resolved.

### Troubleshooting
If you encounter any errors:
1. Make sure you're signed in to the correct Supabase project
2. Check that the project URL matches: `https://qggzegjmmtlqnvimjgls.supabase.co`
3. If you get permission errors, make sure you're the owner of the project
4. Try running the SQL in smaller chunks if the entire script fails

### Alternative: Use Supabase CLI
If you have Supabase CLI installed, you can also run:
```bash
supabase db reset
```
Then apply the schema from the file.