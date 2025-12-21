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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string
          tax_id: string | null
          notes: string | null
          user_id: string
          account_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string
          tax_id?: string | null
          notes?: string | null
          user_id: string
          account_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string
          tax_id?: string | null
          notes?: string | null
          user_id?: string
          account_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          client_id: string | null
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          invoice_date: string
          due_date: string
          paid_date: string | null
          subtotal: number
          tax_rate: number
          tax_amount: number
          total_amount: number
          notes: string | null
          terms: string | null
          transaction_id: string | null
          user_id: string
          account_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          client_id?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          invoice_date?: string
          due_date: string
          paid_date?: string | null
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total_amount?: number
          notes?: string | null
          terms?: string | null
          transaction_id?: string | null
          user_id: string
          account_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          client_id?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          invoice_date?: string
          due_date?: string
          paid_date?: string | null
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total_amount?: number
          notes?: string | null
          terms?: string | null
          transaction_id?: string | null
          user_id?: string
          account_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          amount: number
          category: string | null
          line_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity?: number
          unit_price?: number
          amount?: number
          category?: string | null
          line_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          amount?: number
          category?: string | null
          line_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_sequences: {
        Row: {
          id: string
          account_id: string
          current_number: number
          prefix: string
          year: number
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          current_number?: number
          prefix?: string
          year?: number
          updated_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          current_number?: number
          prefix?: string
          year?: number
          updated_at?: string
        }
        Relationships: []
      }
      invoice_settings: {
        Row: {
          id: string
          user_id: string
          business_name: string | null
          business_email: string | null
          business_phone: string | null
          business_address: string | null
          business_city: string | null
          business_state: string | null
          business_postal_code: string | null
          business_country: string
          business_tax_id: string | null
          business_website: string | null
          logo_url: string | null
          default_payment_terms: string
          default_notes: string | null
          invoice_prefix: string
          bank_name: string | null
          account_name: string | null
          account_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          business_name?: string | null
          business_email?: string | null
          business_phone?: string | null
          business_address?: string | null
          business_city?: string | null
          business_state?: string | null
          business_postal_code?: string | null
          business_country?: string
          business_tax_id?: string | null
          business_website?: string | null
          logo_url?: string | null
          default_payment_terms?: string
          default_notes?: string | null
          invoice_prefix?: string
          bank_name?: string | null
          account_name?: string | null
          account_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string | null
          business_email?: string | null
          business_phone?: string | null
          business_address?: string | null
          business_city?: string | null
          business_state?: string | null
          business_postal_code?: string | null
          business_country?: string
          business_tax_id?: string | null
          business_website?: string | null
          logo_url?: string | null
          default_payment_terms?: string
          default_notes?: string | null
          invoice_prefix?: string
          bank_name?: string | null
          account_name?: string | null
          account_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      get_next_invoice_number: {
        Args: {
          p_account_id: string
        }
        Returns: string
      }
      create_next_recurring_budget: {
        Args: {
          budget_uuid: string
        }
        Returns: Json
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

// Supabase client with typed database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
export { createClient }
