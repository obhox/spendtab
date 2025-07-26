require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

async function createTestTaxTransaction() {
  try {
    // Get credentials from .env.local
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Error: Supabase credentials not found');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🧪 Creating test transaction with tax data...\n');
    
    // Get the first account to use for testing
    const { data: accounts, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .limit(1);
    
    if (accountError || !accounts || accounts.length === 0) {
      console.error('Error: No accounts found. Please create an account first.');
      return;
    }
    
    const testAccount = accounts[0];
    console.log(`Using account: ${testAccount.name} (${testAccount.id})`);
    
    // Create a test transaction with tax data
    const testTransaction = {
      description: 'Business Lunch Meeting - Tax Test',
      amount: 85.50,
      date: new Date().toISOString().split('T')[0],
      category: 'Business Meals',
      type: 'expense',
      payment_source: 'credit_card',
      notes: 'Meeting with potential client to discuss project requirements',
      account_id: testAccount.id,
      // Tax optimization fields
      tax_deductible: true,
      tax_category: 'Meals and Entertainment',
      business_purpose: 'Client meeting to discuss new project proposal and requirements',
      receipt_url: 'https://example.com/receipt-12345.pdf',
      mileage: 15.5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert the test transaction
    const { data: newTransaction, error: insertError } = await supabase
      .from('transactions')
      .insert(testTransaction)
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating test transaction:', insertError.message);
      return;
    }
    
    console.log('✅ Test transaction created successfully!');
    console.log('📋 Transaction Details:');
    console.log(`   ID: ${newTransaction.id}`);
    console.log(`   Description: ${newTransaction.description}`);
    console.log(`   Amount: $${newTransaction.amount}`);
    console.log(`   Tax Deductible: ${newTransaction.tax_deductible}`);
    console.log(`   Tax Category: ${newTransaction.tax_category}`);
    console.log(`   Business Purpose: ${newTransaction.business_purpose}`);
    console.log(`   Receipt URL: ${newTransaction.receipt_url}`);
    console.log(`   Mileage: ${newTransaction.mileage} miles`);
    
    console.log('\n🔍 Now testing data retrieval...');
    
    // Test fetching the transaction back
    const { data: fetchedTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', newTransaction.id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching transaction:', fetchError.message);
      return;
    }
    
    console.log('✅ Transaction fetched successfully!');
    console.log('📊 Fetched Tax Data:');
    console.log(`   Tax Deductible: ${fetchedTransaction.tax_deductible}`);
    console.log(`   Tax Category: ${fetchedTransaction.tax_category}`);
    console.log(`   Business Purpose: ${fetchedTransaction.business_purpose}`);
    console.log(`   Receipt URL: ${fetchedTransaction.receipt_url}`);
    console.log(`   Mileage: ${fetchedTransaction.mileage}`);
    
    // Verify all tax fields are present and correct
    const taxFieldsMatch = 
      fetchedTransaction.tax_deductible === testTransaction.tax_deductible &&
      fetchedTransaction.tax_category === testTransaction.tax_category &&
      fetchedTransaction.business_purpose === testTransaction.business_purpose &&
      fetchedTransaction.receipt_url === testTransaction.receipt_url &&
      fetchedTransaction.mileage === testTransaction.mileage;
    
    if (taxFieldsMatch) {
      console.log('\n🎉 SUCCESS: All tax fields are being stored and retrieved correctly!');
    } else {
      console.log('\n❌ ERROR: Tax fields do not match expected values');
    }
    
    console.log('\n📝 You can now:');
    console.log('   1. Check the transaction in the frontend application');
    console.log('   2. Edit the transaction to verify tax fields are editable');
    console.log('   3. View the transaction in the tax reports');
    console.log(`   4. Delete this test transaction (ID: ${newTransaction.id}) when done`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
createTestTaxTransaction();