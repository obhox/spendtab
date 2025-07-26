const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file')
  process.exit(1)
}

// Use service key if available, otherwise use anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey
const supabase = createClient(supabaseUrl, supabaseKey)

if (!supabaseServiceKey) {
  console.log('⚠️  Using anon key - some operations might fail due to permissions')
  console.log('For full schema setup, you may need to run the SQL directly in Supabase dashboard')
}

async function setupAssetsLiabilitiesSchema() {
  try {
    console.log('Setting up Assets and Liabilities schema...')
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'lib', 'assets-liabilities-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`Executing ${statements.length} SQL statements...`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`Executing statement ${i + 1}/${statements.length}...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error)
        // Continue with other statements even if one fails
      } else {
        console.log(`✓ Statement ${i + 1} executed successfully`)
      }
    }
    
    console.log('Schema setup completed!')
    
    // Test the tables by checking if they exist
    console.log('Testing table creation...')
    
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('count', { count: 'exact', head: true })
    
    const { data: liabilities, error: liabilitiesError } = await supabase
      .from('liabilities')
      .select('count', { count: 'exact', head: true })
    
    if (!assetsError) {
      console.log('✓ Assets table is accessible')
    } else {
      console.error('✗ Assets table error:', assetsError)
    }
    
    if (!liabilitiesError) {
      console.log('✓ Liabilities table is accessible')
    } else {
      console.error('✗ Liabilities table error:', liabilitiesError)
    }
    
  } catch (error) {
    console.error('Error setting up schema:', error)
    process.exit(1)
  }
}

// Alternative method using direct SQL execution
async function setupSchemaDirectly() {
  try {
    console.log('Setting up Assets and Liabilities schema directly...')
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'lib', 'assets-liabilities-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute the entire schema at once
    const { error } = await supabase.rpc('exec_sql', { sql: schema })
    
    if (error) {
      console.error('Error executing schema:', error)
      process.exit(1)
    }
    
    console.log('✓ Schema executed successfully!')
    
    // Test the tables
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('count', { count: 'exact', head: true })
    
    const { data: liabilities, error: liabilitiesError } = await supabase
      .from('liabilities')
      .select('count', { count: 'exact', head: true })
    
    if (!assetsError) {
      console.log('✓ Assets table is accessible')
    } else {
      console.error('✗ Assets table error:', assetsError)
    }
    
    if (!liabilitiesError) {
      console.log('✓ Liabilities table is accessible')
    } else {
      console.error('✗ Liabilities table error:', liabilitiesError)
    }
    
  } catch (error) {
    console.error('Error setting up schema:', error)
    process.exit(1)
  }
}

// Run the setup
if (require.main === module) {
  console.log('Choose setup method:')
  console.log('1. Statement by statement (recommended)')
  console.log('2. Direct execution')
  
  const method = process.argv[2] || '1'
  
  if (method === '2') {
    setupSchemaDirectly()
  } else {
    setupAssetsLiabilitiesSchema()
  }
}

module.exports = { setupAssetsLiabilitiesSchema, setupSchemaDirectly }