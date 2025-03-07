"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "../supabase"
import { v4 as uuidv4 } from 'uuid'

// Transaction data interface
export interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: "income" | "expense"
  notes?: string
  payment_source: string
  budget_id?: string
}

// Context interface
interface TransactionContextType {
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>
  updateTransaction: (id: string, transaction: Omit<Transaction, "id">) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

// Create the context with a default value
const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

// Provider component
export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial data from Supabase
  useEffect(() => {
    async function fetchTransactions() {
      try {
        setIsLoading(true)
        
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false })
        
        if (error) {
          throw error
        }
        
        if (data) {
          setTransactions(data.map(item => ({
            id: item.id,
            date: item.date,
            description: item.description,
            category: item.category,
            amount: item.amount,
            type: item.type,
            notes: item.notes || undefined,
            payment_source: item.payment_source || undefined,
            budget_id: item.budget_id || undefined
          })))
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setError('Failed to load transactions')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTransactions()

    // Set up real-time subscription
    const channel = supabase
      .channel('transactions-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'transactions' 
        }, 
        () => {
          fetchTransactions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Add a new transaction
  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      setIsLoading(true)
      
      const newTransaction = {
        ...transaction,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('transactions')
        .insert(newTransaction)
      
      if (error) {
        throw error
      }
      
      // Optimistically update the UI
      setTransactions(prev => [...prev, { 
        id: newTransaction.id,
        date: transaction.date,
        description: transaction.description,
        category: transaction.category,
        amount: transaction.amount,
        type: transaction.type,
        notes: transaction.notes,
        payment_source: transaction.payment_source
      }])

      // Budget spent amount is now handled directly by the database
    } catch (error) {
      console.error('Error adding transaction:', error)
      setError('Failed to add transaction')
    } finally {
      setIsLoading(false)
    }
  }

  // Update an existing transaction
  const updateTransaction = async (id: string, updatedTransaction: Omit<Transaction, "id">) => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase
        .from('transactions')
        .update({
          ...updatedTransaction,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      // Optimistically update the UI
      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === id ? { ...updatedTransaction, id } : transaction
        )
      )

      // Budget spent amount is now handled directly by the database
    } catch (error) {
      console.error('Error updating transaction:', error)
      setError('Failed to update transaction')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a transaction
  const deleteTransaction = async (id: string) => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      // Update the UI
      setTransactions(prev => prev.filter(transaction => transaction.id !== id))

      // Budget spent amount is now handled directly by the database
    } catch (error) {
      console.error('Error deleting transaction:', error)
      setError('Failed to delete transaction')
    } finally {
      setIsLoading(false)
    }
  }

  // Context value
  const value = {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isLoading,
    error,
  }

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>
}

// Custom hook to use the transaction context
export function useTransactions() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider")
  }
  return context
}
