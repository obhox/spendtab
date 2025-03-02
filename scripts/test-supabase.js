require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  try {
    // Get credentials from .env.local
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Error: Supabase credentials not found in .env.local file');
      console.log('Make sure your .env.local file contains:');
      console.log('NEXT_PUBLIC_SUPABASE_URL=your-project-url');
      console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
      return;
    }
    
    console.log('Supabase URL found:', supabaseUrl);
    console.log('Attempting to connect to Supabase...');
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test transactions table
    console.log('\nTesting transactions table...');
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);
      
    if (transError) {
      console.error('Error accessing transactions table:', transError.message);
    } else {
      console.log('✅ Successfully connected to transactions table');
      console.log(`Found ${transactions.length} transaction(s)`);
    }
    
    // Test budgets table
    console.log('\nTesting budgets table...');
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .limit(1);
      
    if (budgetError) {
      console.error('Error accessing budgets table:', budgetError.message);
    } else {
      console.log('✅ Successfully connected to budgets table');
      console.log(`Found ${budgets.length} budget(s)`);
    }
    
    console.log('\nSupabase connection test complete!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testSupabase();
