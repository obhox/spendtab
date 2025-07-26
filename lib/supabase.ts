import { createClient } from '@supabase/supabase-js'

// Define types for our database
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          created_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          date: string
          description: string
          category: string
          amount: number
          type: 'income' | 'expense'
          notes?: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          date: string
          description: string
          category: string
          amount: number
          type: 'income' | 'expense'
          notes?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          date?: string
          description?: string
          category?: string
          amount?: number
          type?: 'income' | 'expense'
          notes?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      budgets: {
        Row: {
          id: string
          name: string
          amount: number
          spent: number
          period: string
          category: string
          startDate?: string | null
          endDate?: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          amount: number
          spent: number
          period: string
          category: string
          startDate?: string | null
          endDate?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          amount?: number
          spent?: number
          period?: string
          category?: string
          startDate?: string | null
          endDate?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          type: 'income' | 'expense'
          icon?: string | null
          color?: string | null
          is_default: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'income' | 'expense'
          icon?: string | null
          color?: string | null
          is_default?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'income' | 'expense'
          icon?: string | null
          color?: string | null
          is_default?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          name: string
          description?: string | null
          category: string
          current_value: number
          purchase_value?: number | null
          purchase_date?: string | null
          depreciation_rate?: number | null
          asset_type: 'current' | 'fixed' | 'intangible'
          account_id?: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          current_value: number
          purchase_value?: number | null
          purchase_date?: string | null
          depreciation_rate?: number | null
          asset_type: 'current' | 'fixed' | 'intangible'
          account_id?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          current_value?: number
          purchase_value?: number | null
          purchase_date?: string | null
          depreciation_rate?: number | null
          asset_type?: 'current' | 'fixed' | 'intangible'
          account_id?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      liabilities: {
        Row: {
          id: string
          name: string
          description?: string | null
          category: string
          current_balance: number
          original_amount?: number | null
          interest_rate?: number | null
          due_date?: string | null
          minimum_payment?: number | null
          liability_type: 'current' | 'long_term'
          account_id?: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          current_balance: number
          original_amount?: number | null
          interest_rate?: number | null
          due_date?: string | null
          minimum_payment?: number | null
          liability_type: 'current' | 'long_term'
          account_id?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          current_balance?: number
          original_amount?: number | null
          interest_rate?: number | null
          due_date?: string | null
          minimum_payment?: number | null
          liability_type?: 'current' | 'long_term'
          account_id?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Supabase client with typed database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
export { createClient }
