require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

async function seedSampleData(manualUserId = null) {
  try {
    // Get credentials from .env.local
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Error: Supabase credentials not found');
      return;
    }
    
    console.log('Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    let userId = manualUserId;
    
    // If no manual user ID was provided, check for authentication
    if (!userId) {
      console.log('Checking authentication...');
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('Authentication error:', authError.message);
        return;
      }
      
      if (!session || !session.user) {
        console.log('No authenticated user found. You need to be logged in to add data.');
        console.log('Please sign in to your application first, then run this script again.');
        console.log('Or provide a user ID as parameter: node scripts/seed-sample-data.js YOUR_USER_ID');
        return;
      }
      
      userId = session.user.id;
      console.log(`Authenticated as user: ${session.user.email} (${userId})`);
    } else {
      console.log(`Using provided user ID: ${userId}`);
    }
    
    // Sample transactions data
    const transactions = [
      {
        id: uuidv4(),
        date: new Date('2023-06-01').toISOString().split('T')[0],
        description: 'Client Payment',
        category: 'Income',
        amount: 5000,
        type: 'income',
        notes: 'Monthly client retainer',
        user_id: userId
      },
      {
        id: uuidv4(),
        date: new Date('2023-06-03').toISOString().split('T')[0],
        description: 'Office Rent',
        category: 'Rent',
        amount: 1500,
        type: 'expense',
        notes: 'Monthly office space rental',
        user_id: userId
      },
      {
        id: uuidv4(),
        date: new Date('2023-06-05').toISOString().split('T')[0],
        description: 'Software Subscription',
        category: 'Software',
        amount: 79.99,
        type: 'expense',
        notes: 'Monthly Adobe Creative Cloud',
        user_id: userId
      },
      {
        id: uuidv4(),
        date: new Date('2023-06-10').toISOString().split('T')[0],
        description: 'Project Fee',
        category: 'Income',
        amount: 2500,
        type: 'income',
        notes: 'Website development project',
        user_id: userId
      },
      {
        id: uuidv4(),
        date: new Date('2023-06-15').toISOString().split('T')[0],
        description: 'Office Supplies',
        category: 'Supplies',
        amount: 120.50,
        type: 'expense',
        notes: 'Paper, ink, and stationery',
        user_id: userId
      }
    ];
    
    // Sample budgets data
    const budgets = [
      {
        id: uuidv4(),
        name: 'Marketing',
        amount: 2000,
        spent: 500,
        period: 'Monthly',
        category: 'Marketing',
        startDate: new Date('2023-06-01').toISOString().split('T')[0],
        endDate: new Date('2023-06-30').toISOString().split('T')[0],
        user_id: userId
      },
      {
        id: uuidv4(),
        name: 'Office Supplies',
        amount: 300,
        spent: 120.50,
        period: 'Monthly',
        category: 'Supplies',
        startDate: new Date('2023-06-01').toISOString().split('T')[0],
        endDate: new Date('2023-06-30').toISOString().split('T')[0],
        user_id: userId
      },
      {
        id: uuidv4(),
        name: 'Software',
        amount: 500,
        spent: 79.99,
        period: 'Monthly',
        category: 'Software',
        startDate: new Date('2023-06-01').toISOString().split('T')[0],
        endDate: new Date('2023-06-30').toISOString().split('T')[0],
        user_id: userId
      },
      {
        id: uuidv4(),
        name: 'Rent',
        amount: 1500,
        spent: 1500,
        period: 'Monthly',
        category: 'Rent',
        startDate: new Date('2023-06-01').toISOString().split('T')[0],
        endDate: new Date('2023-06-30').toISOString().split('T')[0],
        user_id: userId
      }
    ];
    
    // Insert transactions
    console.log('Adding sample transactions...');
    const { error: transError } = await supabase
      .from('transactions')
      .insert(transactions);
      
    if (transError) {
      console.error('Error adding transactions:', transError.message);
    } else {
      console.log(`✅ Successfully added ${transactions.length} transactions`);
    }
    
    // Insert budgets
    console.log('Adding sample budgets...');
    const { error: budgetError } = await supabase
      .from('budgets')
      .insert(budgets);
      
    if (budgetError) {
      console.error('Error adding budgets:', budgetError.message);
    } else {
      console.log(`✅ Successfully added ${budgets.length} budgets`);
    }
    
    console.log('\nSample data seeding complete!');
    console.log('You can now view your data in the BusinessOS application.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Check if a user ID was provided as a command-line argument
const providedUserId = process.argv[2];
seedSampleData(providedUserId);
