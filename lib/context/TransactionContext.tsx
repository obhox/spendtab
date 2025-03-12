"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "../supabase"
import { v4 as uuidv4 } from 'uuid'
import { useAccounts } from './AccountContext'

// Transaction data interface
export interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: "income" | "expense"
  notes?: string
  account_id: string
  payment_source?: string
  budget_id?: string | null
}

// Context interface
interface TransactionContextType {
  transactions: Transaction[]
  setTransactions: (transactions: Transaction[]) => void
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
  const { currentAccount, isAccountSwitching } = useAccounts()

  // Load initial data from Supabase
  useEffect(() => {
    async function fetchTransactions() {
      setTransactions([]) // Reset transactions before fetching new account data
      setError(null) // Clear any previous errors
      
      if (!currentAccount || isAccountSwitching) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('account_id', currentAccount.id)
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
            account_id: item.account_id,
            payment_source: item.payment_source || undefined,
            budget_id: item.budget_id || null
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

    // Clean up any existing subscription
    const cleanupSubscription = () => {
      const existingChannel = supabase.getChannels().find(ch => ch.topic.startsWith('realtime:transactions-'));
      if (existingChannel) {
        supabase.removeChannel(existingChannel);
      }
    };

    // Set up real-time subscription only for current account
    let channel;
    if (currentAccount) {
      // Clean up any existing subscription first
      cleanupSubscription();
      
      // Set up new subscription for current account
      channel = supabase
        .channel(`transactions-${currentAccount.id}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'transactions',
            filter: `account_id=eq.${currentAccount.id}`
          }, 
          () => {
            fetchTransactions()
          }
        )
        .subscribe()
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [currentAccount])

  // Add a new transaction
  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!currentAccount) {
      setError('No account selected')
      return
    }
    
    // Create a local transaction ID for optimistic updates
    const localId = uuidv4()
    
    try {
      setError(null) // Clear any previous errors
      setIsLoading(true)
      
      const newTransaction = {
        ...transaction,
        id: localId,
        account_id: currentAccount.id, // Use current account ID for consistency
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
        account_id: currentAccount.id,
        payment_source: transaction.payment_source,
        budget_id: transaction.budget_id
      }])
      
    } catch (error) {
      console.error('Error adding transaction:', error)
      setError('Failed to add transaction')
    } finally {
      setIsLoading(false)
    }
  }

  // Update an existing transaction
  const updateTransaction = async (id: string, updatedTransaction: Omit<Transaction, "id">) => {
    if (!currentAccount) {
      setError('No account selected')
      return
    }
    
    try {
      setError(null) // Clear any previous errors
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
      
    } catch (error) {
      console.error('Error updating transaction:', error)
      setError('Failed to update transaction')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a transaction
  const deleteTransaction = async (id: string) => {
    if (!currentAccount) {
      setError('No account selected')
      return
    }
    
    try {
      setError(null) // Clear any previous errors
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
    setTransactions,
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
