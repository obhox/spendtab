// This script can be used to migrate placeholder data to Supabase
// It's a template that can be modified based on specific needs

import { supabase } from '../lib/supabase'
import fs from 'fs'
import path from 'path'

// Mock user ID - in a real migration you would use the actual user IDs
const USER_ID = 'your-user-id' // Replace with actual user ID

// Sample data structure (replace with your actual data structure)
interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: 'income' | 'expense'
  notes?: string
}

interface Budget {
  id: string
  name: string
  amount: number
  spent: number
  period: string
  startDate?: string
  endDate?: string
}
// This script can be used to migrate placeholder data to Supabase
// It's a template that can be modified based on specific needs

import { supabase } from '../lib/supabase'
import fs from 'fs'
import path from 'path'

// Mock user ID - in a real migration you would use the actual user IDs
const USER_ID = 'your-user-id' // Replace with actual user ID

// Sample data structure (replace with your actual data structure)
interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: 'income' | 'expense'
  notes?: string
}

interface Budget {
  id: string
  name: string
  amount: number
  spent: number
  period: string
  startDate?: string
  endDate?: string
}

async function migrateTransactions(transactions: Transaction[]) {
  console.log(`Migrating ${transactions.length} transactions...`)
  
  for (const transaction of transactions) {
    // Convert to Supabase format
    const supabaseTransaction = {
      ...transaction,
      user_id: USER_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Insert into Supabase
    const { error } = await supabase
      .from('transactions')
      .insert(supabaseTransaction)
    
    if (error) {
      console.error(`Error migrating transaction ${transaction.id}:`, error)
    } else {
      console.log(`Migrated transaction: ${transaction.id}`)
    }
  }
}

async function migrateBudgets(budgets: Budget[]) {
  console.log(`Migrating ${budgets.length} budgets...`)
  
  for (const budget of budgets) {
    // Convert to Supabase format
    const supabaseBudget = {
      ...budget,
      user_id: USER_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Insert into Supabase
    const { error } = await supabase
      .from('budgets')
      .insert(supabaseBudget)
    
    if (error) {
      console.error(`Error migrating budget ${budget.id}:`, error)
    } else {
      console.log(`Migrated budget: ${budget.id}`)
    }
  }
}

async function main() {
  try {
    // Load data from JSON files
    // This is just an example - you would need to modify this to match your actual data source
    const transactionsJson = path.join(__dirname, 'data', 'transactions.json')
    const budgetsJson = path.join(__dirname, 'data', 'budgets.json')
    
    if (fs.existsSync(transactionsJson)) {
      const transactions = JSON.parse(fs.readFileSync(transactionsJson, 'utf8')) as Transaction[]
      await migrateTransactions(transactions)
    }
    
    if (fs.existsSync(budgetsJson)) {
      const budgets = JSON.parse(fs.readFileSync(budgetsJson, 'utf8')) as Budget[]
      await migrateBudgets(budgets)
    }
    
    console.log('Migration completed!')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// Uncomment to run the migration
// main()
