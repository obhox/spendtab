require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

async function verifyUserData(userId) {
  try {
    // Get credentials from .env.local
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Error: Supabase credentials not found');
      return;
    }
    
    if (!userId) {
      console.error('Error: You must provide a user ID');
      console.log('Usage: node scripts/verify-user-data.js YOUR_USER_ID');
      return;
    }
    
    console.log('Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get transactions for the user
    console.log(`\nFetching transactions for user: ${userId}`);
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);
      
    if (transError) {
      console.error('Error fetching transactions:', transError.message);
    } else if (!transactions || transactions.length === 0) {
      console.log('No transactions found for this user.');
    } else {
      console.log(`Found ${transactions.length} transactions:`);
      transactions.forEach((tx, index) => {
        console.log(`${index + 1}. ${tx.date} | ${tx.description} | ${tx.type} | $${tx.amount}`);
      });
      
      // Calculate totals
      const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      console.log(`\nTotal Income: $${income.toFixed(2)}`);
      console.log(`Total Expenses: $${expenses.toFixed(2)}`);
      console.log(`Net Cash Flow: $${(income - expenses).toFixed(2)}`);
    }
    
    // Get budgets for the user
    console.log(`\nFetching budgets for user: ${userId}`);
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);
      
    if (budgetError) {
      console.error('Error fetching budgets:', budgetError.message);
    } else if (!budgets || budgets.length === 0) {
      console.log('No budgets found for this user.');
    } else {
      console.log(`Found ${budgets.length} budgets:`);
      budgets.forEach((budget, index) => {
        const percentSpent = (budget.spent / budget.amount) * 100;
        console.log(`${index + 1}. ${budget.name} | Budget: $${budget.amount} | Spent: $${budget.spent} (${percentSpent.toFixed(0)}%)`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Get user ID from command line arguments
const userId = process.argv[2];
verifyUserData(userId);
