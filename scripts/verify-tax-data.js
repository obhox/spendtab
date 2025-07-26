require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

async function verifyTaxData() {
  try {
    // Get credentials from .env.local
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Error: Supabase credentials not found');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Verifying tax-related data in transactions...\n');
    
    // Fetch all transactions with tax fields
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching transactions:', error.message);
      return;
    }
    
    console.log(`📊 Total transactions found: ${transactions.length}\n`);
    
    // Check for tax-related fields
    const taxDeductibleTransactions = transactions.filter(t => t.tax_deductible === true);
    const transactionsWithTaxCategory = transactions.filter(t => t.tax_category && t.tax_category.trim() !== '');
    const transactionsWithBusinessPurpose = transactions.filter(t => t.business_purpose && t.business_purpose.trim() !== '');
    const transactionsWithReceipts = transactions.filter(t => t.receipt_url && t.receipt_url.trim() !== '');
    const transactionsWithMileage = transactions.filter(t => t.mileage && t.mileage > 0);
    
    console.log('📈 Tax Data Summary:');
    console.log(`   Tax Deductible Transactions: ${taxDeductibleTransactions.length}`);
    console.log(`   Transactions with Tax Category: ${transactionsWithTaxCategory.length}`);
    console.log(`   Transactions with Business Purpose: ${transactionsWithBusinessPurpose.length}`);
    console.log(`   Transactions with Receipts: ${transactionsWithReceipts.length}`);
    console.log(`   Transactions with Mileage: ${transactionsWithMileage.length}\n`);
    
    // Show sample tax deductible transactions
    if (taxDeductibleTransactions.length > 0) {
      console.log('🏷️  Sample Tax Deductible Transactions:');
      taxDeductibleTransactions.slice(0, 5).forEach((transaction, index) => {
        console.log(`   ${index + 1}. ${transaction.description} - $${transaction.amount}`);
        console.log(`      Category: ${transaction.tax_category || 'Not specified'}`);
        console.log(`      Business Purpose: ${transaction.business_purpose || 'Not specified'}`);
        console.log(`      Receipt: ${transaction.receipt_url ? 'Yes' : 'No'}`);
        if (transaction.mileage) {
          console.log(`      Mileage: ${transaction.mileage} miles`);
        }
        console.log('');
      });
    }
    
    // Check database schema for tax fields
    console.log('🔧 Checking database schema for tax fields...');
    const { data: columns, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'transactions' })
      .single();
    
    if (!schemaError && columns) {
      const taxFields = ['tax_deductible', 'tax_category', 'business_purpose', 'receipt_url', 'mileage'];
      const existingTaxFields = taxFields.filter(field => 
        columns.some(col => col.column_name === field)
      );
      
      console.log(`   Tax fields in database: ${existingTaxFields.join(', ')}`);
    }
    
    console.log('\n✅ Tax data verification complete!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the verification
verifyTaxData();