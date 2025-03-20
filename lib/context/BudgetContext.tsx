"use client"
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react"
import { supabase } from "../supabase"
import { v4 as uuidv4 } from 'uuid'
import { useAccounts } from "./AccountContext"
import { toast } from "sonner"
import { getCookie } from "@/lib/cookie-utils"

// Budget data interface
export interface Budget {
  id: string
  name: string
  amount: number
  spent: number
  startDate?: string
  endDate?: string
  period?: string
  account_id: string
}

// Context interface
interface BudgetContextType {
  budgets: Budget[]
  addBudget: (budget: Omit<Budget, "id">) => Promise<Budget | null>
  updateBudget: (id: string, budget: Omit<Budget, "id">) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  isLoading: boolean
  error: string | null
  getBudgets: () => Promise<void>
}

// Create the context with a default value
const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

// Provider component
export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Use a ref to track if we're currently fetching to prevent duplicate requests
  const isFetchingRef = useRef(false)
  
  // Cache the last fetched data by account ID
  const budgetCacheRef = useRef<Record<string, Budget[]>>({})

  // Load initial data from Supabase
  const { currentAccount, isAccountSwitching } = useAccounts()

  const getBudgets = useCallback(async () => {
    if (!currentAccount || isAccountSwitching) {
      setIsLoading(false);
      return;
    }
    
    // Prevent duplicate fetches
    if (isFetchingRef.current) {
      return;
    }
    
    // Check if we have a cached version first
    if (budgetCacheRef.current[currentAccount.id]) {
      setBudgets(budgetCacheRef.current[currentAccount.id])
      setIsLoading(false)
      
      // Still fetch in the background to update cache, but don't show loading state
      isFetchingRef.current = true
      try {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .eq('account_id', currentAccount.id)
          .order('name', { ascending: true })
        
        if (error) throw error
        
        if (data) {
          const formattedData = data.map(item => ({
            id: item.id,
            name: item.name,
            amount: item.amount,
            spent: item.spent || 0,
            period: item.period,
            startDate: item.startDate || undefined,
            endDate: item.endDate || undefined,
            account_id: item.account_id
          }))
          
          // Only update if the data has actually changed
          const currentData = JSON.stringify(budgets)
          const newData = JSON.stringify(formattedData)
          
          if (currentData !== newData) {
            setBudgets(formattedData)
            budgetCacheRef.current[currentAccount.id] = formattedData
          }
        }
      } catch (error: any) {
        console.error('Error fetching budgets in background:', error)
      } finally {
        isFetchingRef.current = false
      }
      return
    }

    try {
      setIsLoading(true)
      isFetchingRef.current = true
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('account_id', currentAccount.id)
        .order('name', { ascending: true })
      
      if (error) {
        toast(error.message)
        throw error
      }
      
      if (data) {
        const formattedData = data.map(item => ({
          id: item.id,
          name: item.name,
          amount: item.amount,
          spent: item.spent || 0,
          period: item.period,
          startDate: item.startDate || undefined,
          endDate: item.endDate || undefined,
          account_id: item.account_id
        }))
        
        setBudgets(formattedData)
        budgetCacheRef.current[currentAccount.id] = formattedData
      }
    } catch (error: any) {
      console.error('Error fetching budgets:', error)
      setError(error.message || 'Failed to load budgets')
      toast(error.message || 'Failed to load budgets')
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [currentAccount, isAccountSwitching, budgets])

  useEffect(() => {
    if (!currentAccount) {
      setIsLoading(false)
      return
    }
    
    // If we already have budgets for this account, use them immediately
    if (budgetCacheRef.current[currentAccount.id]) {
      setBudgets(budgetCacheRef.current[currentAccount.id])
      setIsLoading(false)
    } else {
      // Otherwise fetch them
      getBudgets()
    }

    // Clean up any existing subscription
    const cleanupSubscription = () => {
      const existingChannel = supabase.getChannels().find(ch => ch.topic.startsWith('realtime:budgets-'));
      if (existingChannel) {
        supabase.removeChannel(existingChannel);
      }
    };

    // Set up real-time subscription with debouncing
    let channel;
    let debounceTimer: NodeJS.Timeout | null = null;
    
    if (currentAccount) {
      // Clean up any existing subscription first
      cleanupSubscription();

      const filter = `account_id=eq.${currentAccount.id}`
      
      channel = supabase
        .channel(`budgets-${currentAccount.id}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'budgets',
            filter: filter
          }, 
          () => {
            // Debounce the getBudgets call to prevent multiple rapid fetches
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              getBudgets();
            }, 300); // Wait 300ms before fetching
          }
        )
        .subscribe()
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [currentAccount, getBudgets])

  // Add a new budget
  const addBudget = async (budget: Omit<Budget, "id">): Promise<Budget | null> => {
    if (!currentAccount) {
      const errorMsg = 'No account selected';
      setError(errorMsg)
      toast(errorMsg)
      return null
    }

    try {
      const userSubscriptionTier = getCookie('userSubscriptionTier') || 'free';
      
      if (userSubscriptionTier === 'free') {
        // Check if user has reached the free plan limit
        const { count, error: countError } = await supabase
          .from('budgets')
          .select('*', { count: 'exact', head: true })
          .eq('account_id', currentAccount.id)

        if (countError) {
          toast(countError.message)
          throw countError
        }

        if (count && count >= 3) {
          const errorMsg = 'Free users are limited to 3 budgets. Please upgrade to create more budgets.'
          toast(errorMsg)
          throw new Error(errorMsg)
        }
      }
      
      setError(null) // Reset any previous errors
      
      // Optimistic update to reduce UI flicker
      const newBudgetId = uuidv4()
      const newBudget = {
        ...budget,
        id: newBudgetId,
        spent: 0
      }
      
      // Add optimistically to local state
      setBudgets(prev => [...prev, newBudget])

      const { data, error } = await supabase
        .from('budgets')
        .insert([newBudget])
        .select()
        .single()

      if (error) {
        // Revert optimistic update
        setBudgets(prev => prev.filter(b => b.id !== newBudgetId))
        toast(error.message)
        throw error
      }

      // Update cache
      budgetCacheRef.current[currentAccount.id] = [...budgets, newBudget]

      return data
    } catch (error: any) {
      console.error('Error adding budget:', error)
      setError(error.message)
      return null
    }
  }

  // Update an existing budget
  const updateBudget = async (id: string, budget: Omit<Budget, "id">) => {
    try {
      setError(null)
      
      // Optimistic update
      const updatedBudget = { id, ...budget }
      setBudgets(prev => 
        prev.map(b => b.id === id ? updatedBudget : b)
      )
      
      // Update cache
      if (currentAccount) {
        budgetCacheRef.current[currentAccount.id] = budgets.map(b => 
          b.id === id ? updatedBudget : b
        )
      }

      const { error } = await supabase
        .from('budgets')
        .update(budget)
        .eq('id', id)

      if (error) {
        // Revert optimistic update on error
        getBudgets()
        toast(error.message)
        throw error
      }
    } catch (error: any) {
      console.error('Error updating budget:', error)
      setError(error.message)
      toast(error.message)
    }
  }

  // Delete a budget
  const deleteBudget = async (id: string) => {
    try {
      setError(null)
      
      // Optimistic delete
      const previousBudgets = [...budgets]
      setBudgets(prev => prev.filter(b => b.id !== id))
      
      // Update cache
      if (currentAccount) {
        budgetCacheRef.current[currentAccount.id] = budgets.filter(b => b.id !== id)
      }

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)

      if (error) {
        // Revert optimistic delete
        setBudgets(previousBudgets)
        toast(error.message)
        throw error
      }
    } catch (error: any) {
      console.error('Error deleting budget:', error)
      setError(error.message)
      toast(error.message)
    }
  }

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        isLoading,
        error,
        getBudgets
      }}
    >
      {children}
    </BudgetContext.Provider>
  )
}

// Custom hook to use the budget context
export function useBudgets() {
  const context = useContext(BudgetContext)
  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetProvider')
  }
  return context
}
