// Script to add a test user for weekly email testing
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTestUser() {
  try {
    console.log('🧪 Adding test user for weekly email automation...');
    
    // Add a test user to the users table
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: '00000000-0000-0000-0000-000000000001', // Test UUID
          email: 'test@example.com',
          first_name: 'Test',
          subscription_tier: 'trial'
        }
      ])
      .select();

    if (error) {
      console.error('❌ Error adding test user:', error.message);
      return;
    }

    console.log('✅ Test user added successfully:', data);
    console.log('📧 You can now run the weekly email test to see it in action!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addTestUser();