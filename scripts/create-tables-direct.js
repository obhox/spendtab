const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTablesDirectly() {
  console.log('Creating assets and liabilities tables...')
  
  try {
    // Create assets table
    console.log('Creating assets table...')
    const { error: assetsError } = await supabase.rpc('exec', {
      sql: `
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
        
        ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can view their own assets"
          ON public.assets
          FOR SELECT
          USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can insert their own assets"
          ON public.assets
          FOR INSERT
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update their own assets"
          ON public.assets
          FOR UPDATE
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can delete their own assets"
          ON public.assets
          FOR DELETE
          USING (auth.uid() = user_id);
      `
    })
    
    if (assetsError) {
      console.error('Error creating assets table:', assetsError)
    } else {
      console.log('✓ Assets table created successfully')
    }

    // Create liabilities table
    console.log('Creating liabilities table...')
    const { error: liabilitiesError } = await supabase.rpc('exec', {
      sql: `
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
        
        ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can view their own liabilities"
          ON public.liabilities
          FOR SELECT
          USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can insert their own liabilities"
          ON public.liabilities
          FOR INSERT
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update their own liabilities"
          ON public.liabilities
          FOR UPDATE
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can delete their own liabilities"
          ON public.liabilities
          FOR DELETE
          USING (auth.uid() = user_id);
      `
    })
    
    if (liabilitiesError) {
      console.error('Error creating liabilities table:', liabilitiesError)
    } else {
      console.log('✓ Liabilities table created successfully')
    }

    // Test the tables
    console.log('Testing table access...')
    
    const { data: assets, error: assetsTestError } = await supabase
      .from('assets')
      .select('count', { count: 'exact', head: true })
    
    const { data: liabilities, error: liabilitiesTestError } = await supabase
      .from('liabilities')
      .select('count', { count: 'exact', head: true })
    
    if (!assetsTestError) {
      console.log('✓ Assets table is accessible')
    } else {
      console.error('✗ Assets table error:', assetsTestError)
    }
    
    if (!liabilitiesTestError) {
      console.log('✓ Liabilities table is accessible')
    } else {
      console.error('✗ Liabilities table error:', liabilitiesTestError)
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createTablesDirectly()