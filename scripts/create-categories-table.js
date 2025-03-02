require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

async function createCategoriesTable() {
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
    
    // Create table using SQL query
    console.log('Creating categories table if it does not exist...');
    const { error: createError } = await supabase.rpc('create_categories_table', {});
    
    if (createError) {
      console.log('Error creating table via RPC, falling back to SQL execution...');
      // Try to execute SQL directly
      const { error: sqlError } = await supabase.sql`
        CREATE TABLE IF NOT EXISTS categories (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          icon TEXT,
          color TEXT,
          is_default BOOLEAN DEFAULT false,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(name, type, user_id)
        );
      `;
      
      if (sqlError) {
        console.error('Error creating categories table:', sqlError.message);
        console.log('Could not create table. Please create it manually in the Supabase dashboard.');
        return;
      }
    }
    
    // Get user ID from command line or session
    let userId = process.argv[2];
    
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
        console.log('Or provide a user ID as parameter: node scripts/create-categories-table.js YOUR_USER_ID');
        return;
      }
      
      userId = session.user.id;
      console.log(`Authenticated as user: ${session.user.email} (${userId})`);
    } else {
      console.log(`Using provided user ID: ${userId}`);
    }
    
    // Add just a few minimal default categories to get users started
    console.log('Adding minimal default categories (users can add their own)...');
    
    // Just a few essential categories to get started
    const minimalCategories = [
      { name: 'Income', type: 'income', icon: 'DollarSign', color: '#10B981', is_default: true },
      { name: 'Expense', type: 'expense', icon: 'CreditCard', color: '#EF4444', is_default: true }
    ];
    
    // Add user_id to each category
    const defaultCategories = minimalCategories.map(cat => ({
      ...cat,
      id: uuidv4(),
      user_id: userId
    }));
    
    // Insert categories
    const { error: insertError } = await supabase
      .from('categories')
      .upsert(defaultCategories, { onConflict: 'name, type, user_id' });
      
    if (insertError) {
      console.error('Error adding categories:', insertError.message);
    } else {
      console.log(`✅ Successfully added ${defaultCategories.length} default categories`);
      console.log('Users can create their own custom categories within the app!');
    }
    
    console.log('\nCategories table setup complete!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createCategoriesTable();
