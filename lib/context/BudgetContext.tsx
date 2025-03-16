"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
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

  // Load initial data from Supabase
  const { currentAccount, isAccountSwitching } = useAccounts()

  const getBudgets = async () => {
    if (!currentAccount || isAccountSwitching) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
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
        setBudgets(data.map(item => ({
          id: item.id,
          name: item.name,
          amount: item.amount,
          spent: item.spent || 0,
          period: item.period,
          startDate: item.startDate || undefined,
          endDate: item.endDate || undefined,
          account_id: item.account_id
        })))
      }
    } catch (error: any) {
      console.error('Error fetching budgets:', error)
      setError(error.message || 'Failed to load budgets')
      toast(error.message || 'Failed to load budgets')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Reset budgets when switching accounts
    setBudgets([])
    setError(null)
    
    getBudgets()

    // Clean up any existing subscription
    const cleanupSubscription = () => {
      const existingChannel = supabase.getChannels().find(ch => ch.topic.startsWith('realtime:budgets-'));
      if (existingChannel) {
        supabase.removeChannel(existingChannel);
      }
    };

    // Set up real-time subscription only if we have a current account
    let channel;
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
            getBudgets()
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
      
      setIsLoading(true)
      setError(null) // Reset any previous errors
      
      const newBudget = {
        ...budget,
        id: uuidv4(),
        spent: 0
      }

      const { data, error } = await supabase
        .from('budgets')
        .insert([newBudget])
        .select()
        .single()

      if (error) {
        toast(error.message)
        throw error
      }

      return data
    } catch (error: any) {
      console.error('Error adding budget:', error)
      setError(error.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Update an existing budget
  const updateBudget = async (id: string, budget: Omit<Budget, "id">) => {
    try {
      setIsLoading(true)
      setError(null)

      const { error } = await supabase
        .from('budgets')
        .update(budget)
        .eq('id', id)

      if (error) {
        toast(error.message)
        throw error
      }
    } catch (error: any) {
      console.error('Error updating budget:', error)
      setError(error.message)
      toast(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a budget
  const deleteBudget = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)

      if (error) {
        toast(error.message)
        throw error
      }
    } catch (error: any) {
      console.error('Error deleting budget:', error)
      setError(error.message)
      toast(error.message)
    } finally {
      setIsLoading(false)
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