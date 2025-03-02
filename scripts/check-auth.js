require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

async function checkAuth() {
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
    
    // Check for authentication
    console.log('Checking authentication...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Authentication error:', authError.message);
      return;
    }
    
    if (!session || !session.user) {
      console.log('No authenticated user found.');
      console.log('You need to be logged in through the Supabase authentication system.');
      console.log('Please sign in to your application first at http://localhost:3000/login');
      return;
    }
    
    console.log(`✅ Authenticated as user: ${session.user.email}`);
    console.log(`User ID: ${session.user.id}`);
    console.log(`Email verified: ${session.user.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log(`Last sign in: ${new Date(session.user.last_sign_in_at).toLocaleString()}`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkAuth();
