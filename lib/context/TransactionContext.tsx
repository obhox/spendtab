"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react"
import { supabase } from "../supabase"
import { v4 as uuidv4 } from 'uuid'
import { useAccounts } from './AccountContext'
import { toast } from "sonner"
import { getCookie } from "@/lib/cookie-utils"

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

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000

// Provider component
export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentAccount, isAccountSwitching } = useAccounts()
  
  // Use refs to prevent duplicate requests and implement caching
  const isFetchingRef = useRef(false)
  const transactionCacheRef = useRef<Record<string, { data: Transaction[], timestamp: number }>>({})
  
  // Track last request timestamp to prevent too frequent refetching
  const lastFetchTimestampRef = useRef<Record<string, number>>({})
  
  // Minimum time between fetches (5 seconds)
  const MIN_FETCH_INTERVAL = 5000

  // Function to check if cache is still valid
  const isCacheValid = useCallback((accountId: string) => {
    if (!transactionCacheRef.current[accountId]) return false
    
    const cacheEntry = transactionCacheRef.current[accountId]
    const now = Date.now()
    
    return (now - cacheEntry.timestamp) < CACHE_EXPIRATION
  }, [])

  // Fetch transactions with caching and optimizations
  const fetchTransactions = useCallback(async (forceFetch = false) => {
    if (!currentAccount || isAccountSwitching) {
      setIsLoading(false)
      return
    }
    
    // Prevent duplicate fetches
    if (isFetchingRef.current) {
      return
    }
    
    // Check request throttling
    const now = Date.now()
    const lastFetchTime = lastFetchTimestampRef.current[currentAccount.id] || 0
    if (!forceFetch && (now - lastFetchTime) < MIN_FETCH_INTERVAL) {
      // Too soon since last fetch, use cache if available
      if (transactionCacheRef.current[currentAccount.id]) {
        setTransactions(transactionCacheRef.current[currentAccount.id].data)
        setIsLoading(false)
      }
      return
    }
    
    // Check cache first
    if (!forceFetch && isCacheValid(currentAccount.id)) {
      setTransactions(transactionCacheRef.current[currentAccount.id].data)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      isFetchingRef.current = true
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', currentAccount.id)
        .order('date', { ascending: false })
      
      if (error) {
        toast(error.message)
        throw error
      }
      
      if (data) {
        const formattedData = data.map(item => ({
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
        }))
        
        setTransactions(formattedData)
        
        // Update cache with timestamp
        transactionCacheRef.current[currentAccount.id] = {
          data: formattedData,
          timestamp: Date.now()
        }
        
        // Update last fetch timestamp
        lastFetchTimestampRef.current[currentAccount.id] = Date.now()
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error)
      setError(error.message || 'Failed to load transactions')
      toast(error.message || 'Failed to load transactions')
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [currentAccount, isAccountSwitching, isCacheValid])

  // Load initial data from Supabase
  useEffect(() => {
    if (!currentAccount) {
      setTransactions([])
      setError(null)
      setIsLoading(false)
      return
    }
    
    // Use cached data if available and valid
    if (isCacheValid(currentAccount.id)) {
      setTransactions(transactionCacheRef.current[currentAccount.id].data)
      setIsLoading(false)
      
      // Optional: fetch in background after a delay to refresh the cache
      const timer = setTimeout(() => {
        fetchTransactions(true);
      }, 2000); // 2 second delay
      
      return () => clearTimeout(timer);
    } else {
      // Reset transactions only if switching to an account without valid cached data
      setTransactions([])
      setError(null)
      fetchTransactions(false)
    }
  }, [currentAccount, fetchTransactions, isCacheValid])

  // Set up realtime subscription
  useEffect(() => {
    if (!currentAccount) return;
    
    // Clean up any existing subscription
    const cleanupSubscription = () => {
      const existingChannels = supabase.getChannels().filter(ch => 
        ch.topic.startsWith('realtime:transactions-')
      );
      
      existingChannels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };

    cleanupSubscription();
    
    // Debounce timer for realtime updates
    let debounceTimer: NodeJS.Timeout | null = null;
    
    // Set up new subscription for current account
    const channel = supabase
      .channel(`transactions-${currentAccount.id}`)
    // Removed realtime subscription - data will be fetched on-demand
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [currentAccount, fetchTransactions]);

  // Add a new transaction
  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!currentAccount) {
      const errorMsg = 'No account selected'
      setError(errorMsg)
      toast(errorMsg)
      return
    }
    
    try {
      setError(null) // Clear any previous errors
      
      const userSubscriptionTier = getCookie('userSubscriptionTier') || 'free';
      
      if (userSubscriptionTier === 'free') {
        // Check if user has reached the free plan limit for transactions
        const { count, error: countError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('account_id', currentAccount.id)
          .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString())

        if (countError) {
          toast(countError.message)
          throw countError
        }

        if (count && count >= 50) {
          const errorMsg = 'Free users are limited to 50 transactions per month. Please upgrade to add more transactions.'
          toast(errorMsg)
          throw new Error(errorMsg)
        }
      }
      
      // Create a local transaction ID for optimistic updates
      const localId = uuidv4()
      
      // Create the transaction object
      const newTransaction = {
        id: localId,
        date: transaction.date,
        description: transaction.description,
        category: transaction.category,
        amount: transaction.amount,
        type: transaction.type,
        notes: transaction.notes,
        account_id: currentAccount.id,
        payment_source: transaction.payment_source,
        budget_id: transaction.budget_id
      }
      
      // Optimistically update the UI
      setTransactions(prev => [newTransaction, ...prev])
      
      // Update cache if it exists
      if (transactionCacheRef.current[currentAccount.id]) {
        transactionCacheRef.current[currentAccount.id] = {
          data: [newTransaction, ...transactionCacheRef.current[currentAccount.id].data],
          timestamp: transactionCacheRef.current[currentAccount.id].timestamp
        }
      }
      
      const dbTransaction = {
        ...transaction,
        id: localId,
        account_id: currentAccount.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('transactions')
        .insert(dbTransaction)
      
      if (error) {
        // Rollback optimistic update
        setTransactions(prev => prev.filter(t => t.id !== localId))
        if (transactionCacheRef.current[currentAccount.id]) {
          transactionCacheRef.current[currentAccount.id] = {
            data: transactionCacheRef.current[currentAccount.id].data.filter(t => t.id !== localId),
            timestamp: transactionCacheRef.current[currentAccount.id].timestamp
          }
        }
        toast(error.message)
        throw error
      }
      
    } catch (error: any) {
      console.error('Error adding transaction:', error)
      setError(error.message || 'Failed to add transaction')
      toast(error.message || 'Failed to add transaction')
    }
  }

  // Update an existing transaction
  const updateTransaction = async (id: string, updatedTransaction: Omit<Transaction, "id">) => {
    if (!currentAccount) {
      const errorMsg = 'No account selected'
      setError(errorMsg)
      toast(errorMsg)
      return
    }
    
    try {
      setError(null) // Clear any previous errors
      
      // Save previous state for rollback
      const previousTransactions = [...transactions]
      
      // Optimistically update the UI
      const updatedTransactions = transactions.map(transaction =>
        transaction.id === id ? { ...updatedTransaction, id } : transaction
      )
      
      setTransactions(updatedTransactions)
      
      // Update cache if it exists
      if (transactionCacheRef.current[currentAccount.id]) {
        transactionCacheRef.current[currentAccount.id] = {
          data: updatedTransactions,
          timestamp: transactionCacheRef.current[currentAccount.id].timestamp
        }
      }
      
      const { error } = await supabase
        .from('transactions')
        .update({
          ...updatedTransaction,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) {
        // Rollback optimistic update
        setTransactions(previousTransactions)
        if (transactionCacheRef.current[currentAccount.id]) {
          transactionCacheRef.current[currentAccount.id] = {
            data: previousTransactions,
            timestamp: transactionCacheRef.current[currentAccount.id].timestamp
          }
        }
        toast(error.message)
        throw error
      }
      
    } catch (error: any) {
      console.error('Error updating transaction:', error)
      setError(error.message || 'Failed to update transaction')
      toast(error.message || 'Failed to update transaction')
    }
  }

  // Delete a transaction
  const deleteTransaction = async (id: string) => {
    if (!currentAccount) {
      const errorMsg = 'No account selected'
      setError(errorMsg)
      toast(errorMsg)
      return
    }
    
    try {
      setError(null) // Clear any previous errors
      
      // Save previous state for rollback
      const previousTransactions = [...transactions]
      
      // Optimistically update the UI
      const updatedTransactions = transactions.filter(transaction => transaction.id !== id)
      setTransactions(updatedTransactions)
      
      // Update cache if it exists
      if (transactionCacheRef.current[currentAccount.id]) {
        transactionCacheRef.current[currentAccount.id] = {
          data: updatedTransactions,
          timestamp: transactionCacheRef.current[currentAccount.id].timestamp
        }
      }
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
      
      if (error) {
        // Rollback optimistic update
        setTransactions(previousTransactions)
        if (transactionCacheRef.current[currentAccount.id]) {
          transactionCacheRef.current[currentAccount.id] = {
            data: previousTransactions,
            timestamp: transactionCacheRef.current[currentAccount.id].timestamp
          }
        }
        toast(error.message)
        throw error
      }
      
    } catch (error: any) {
      console.error('Error deleting transaction:', error)
      setError(error.message || 'Failed to delete transaction')
      toast(error.message || 'Failed to delete transaction')
    }
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        setTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        isLoading,
        error,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider')
  }
  return context
}

