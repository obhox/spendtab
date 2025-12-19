const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupTaxSchema() {
  console.log('Setting up tax schema...')
  
  const schemaPath = path.join(__dirname, '../lib/tax-schema.sql')
  const sql = fs.readFileSync(schemaPath, 'utf8')

  try {
    const { error } = await supabase.rpc('exec', { sql })
    
    if (error) {
      console.error('Error executing SQL:', error)
      // Fallback: try direct query if rpc exec is not available or fails
      console.log('RPC exec failed, attempting manual setup instructions...')
      console.log('Please run the SQL in lib/tax-schema.sql in your Supabase SQL Editor.')
    } else {
      console.log('✓ Tax schema applied successfully')
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

setupTaxSchema()
