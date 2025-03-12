"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "../supabase"
import { v4 as uuidv4 } from 'uuid'
import { useAccounts } from "./AccountContext"

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
  const { currentAccount } = useAccounts()

  useEffect(() => {
    // Fetch budgets when account changes
    fetchBudgets()

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
            fetchBudgets()
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
      setError('No account selected')
      return null
    }
    
    try {
      setIsLoading(true)
      setError(null) // Reset any previous errors
      
      const newBudget = {
        ...budget,
        id: uuidv4(),
        spent: 0,
        account_id: currentAccount.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('budgets')
        .insert(newBudget)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Update the UI with the returned data from Supabase
      const createdBudget = {
        id: data.id,
        name: data.name,
        amount: data.amount,
        spent: data.spent || 0,
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate,
        account_id: data.account_id
      }
      
      setBudgets(prev => [...prev, createdBudget])
      
      // Return the created budget
      return createdBudget

    } catch (error) {
      console.error('Error adding budget:', error)
      setError('Failed to add budget')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Update an existing budget
  const updateBudget = async (id: string, updatedBudget: Omit<Budget, "id">) => {
    if (!currentAccount) {
      setError('No account selected')
      return
    }
    
    try {
      setIsLoading(true)
      setError(null) // Reset any previous errors
      
      const { error } = await supabase
        .from('budgets')
        .update({
          ...updatedBudget,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('account_id', currentAccount.id)
      
      if (error) {
        throw error
      }
      
      // Optimistically update the UI
      setBudgets(prev =>
        prev.map(budget =>
          budget.id === id ? { ...updatedBudget, id } : budget
        )
      )
      
    } catch (error) {
      console.error('Error updating budget:', error)
      setError('Failed to update budget')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a budget
  const deleteBudget = async (id: string) => {
    if (!currentAccount) {
      setError('No account selected')
      return
    }
    
    try {
      setIsLoading(true)
      setError(null) // Reset any previous errors
      
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('account_id', currentAccount.id)
      
      if (error) {
        throw error
      }
      
      // Update the UI
      setBudgets(prev => prev.filter(budget => budget.id !== id))
      
    } catch (error) {
      console.error('Error deleting budget:', error)
      setError('Failed to delete budget')
    } finally {
      setIsLoading(false)
    }
  }

  // Function to fetch budgets - can be called manually or by the effect
  const fetchBudgets = async () => {
    if (!currentAccount) {
      setBudgets([])
      setError(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('account_id', currentAccount.id)
        .order('name', { ascending: true })
      
      if (error) {
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
    } catch (error) {
      console.error('Error fetching budgets:', error)
      setError('Failed to load budgets')
    } finally {
      setIsLoading(false)
    }
  }

  // Context value
  const value = {
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    isLoading,
    error,
    getBudgets: fetchBudgets,
  }

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  )
}

// Custom hook to use the budget context
export function useBudgets() {
  const context = useContext(BudgetContext)
  if (context === undefined) {
    throw new Error("useBudgets must be used within a BudgetProvider")
  }
  return context
}