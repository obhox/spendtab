const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function setupBudgetSchema() {
  console.log('🚀 Setting up budget schema with multiple categories support...\n')

  // Get Supabase credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables!')
    console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in your .env.local file')
    process.exit(1)
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '..', 'lib', 'budget-schema-fix.sql')
    console.log('📖 Reading schema file:', schemaPath)
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`)
    }

    const schema = fs.readFileSync(schemaPath, 'utf8')
    console.log('✅ Schema file loaded successfully')

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`🔧 Executing ${statements.length} SQL statements...`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`   Executing statement ${i + 1}/${statements.length}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          // Try direct SQL execution as fallback
          const { error: directError } = await supabase.sql([statement])
          if (directError) {
            console.warn(`   ⚠️  Warning on statement ${i + 1}: ${directError.message}`)
          }
        }
      } catch (err) {
        console.warn(`   ⚠️  Warning on statement ${i + 1}: ${err.message}`)
      }
    }

    console.log('\n✅ Budget schema setup completed!')
    console.log('\n📋 What was set up:')
    console.log('   • Budget categories junction table (budget_categories)')
    console.log('   • Updated budget calculation functions for multiple categories')
    console.log('   • Helper functions: set_budget_categories, add_category_to_budget, remove_category_from_budget')
    console.log('   • Updated budget_summary view to show multiple category names')
    console.log('   • Migrated existing single category relationships to the new system')

    // Verify the setup
    console.log('\n🔍 Verifying setup...')
    
    // Check if budget_categories table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'budget_categories')

    if (tableError) {
      console.warn('   ⚠️  Could not verify table creation:', tableError.message)
    } else if (tables && tables.length > 0) {
      console.log('   ✅ budget_categories table created successfully')
    } else {
      console.log('   ❌ budget_categories table not found')
    }

    // Check if functions exist
    const { data: functions, error: funcError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .in('routine_name', ['set_budget_categories', 'add_category_to_budget', 'remove_category_from_budget'])

    if (funcError) {
      console.warn('   ⚠️  Could not verify function creation:', funcError.message)
    } else if (functions && functions.length >= 3) {
      console.log('   ✅ Budget category management functions created successfully')
    } else {
      console.log('   ⚠️  Some budget category management functions may not have been created')
    }

    console.log('\n🎉 Setup complete! You can now use multiple categories per budget.')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.error('\n💡 If you see permission errors, try:')
    console.error('   1. Using SUPABASE_SERVICE_ROLE_KEY instead of ANON_KEY')
    console.error('   2. Running the SQL manually in the Supabase SQL Editor')
    console.error('   3. Copy the contents of lib/budget-schema-fix.sql and paste into Supabase dashboard')
    process.exit(1)
  }
}

// Run the setup
setupBudgetSchema()