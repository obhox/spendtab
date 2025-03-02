"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "../supabase"
import { v4 as uuidv4 } from 'uuid'

// Budget data interface
export interface Budget {
  id: string
  name: string
  amount: number
  spent: number
  period: string
  category: string
  startDate?: string
  endDate?: string
}

// Context interface
interface BudgetContextType {
  budgets: Budget[]
  addBudget: (budget: Omit<Budget, "id">) => Promise<void>
  updateBudget: (id: string, budget: Omit<Budget, "id">) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

// Create the context with a default value
const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

// Provider component
export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial data from Supabase
  useEffect(() => {
    async function fetchBudgets() {
      try {
        setIsLoading(true)
        
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .order('name', { ascending: true })
        
        if (error) {
          throw error
        }
        
        if (data) {
          setBudgets(data.map(item => ({
            id: item.id,
            name: item.name,
            amount: item.amount,
            spent: item.spent,
            period: item.period,
            category: item.category,
            startDate: item.startDate || undefined,
            endDate: item.endDate || undefined
          })))
        }
      } catch (error) {
        console.error('Error fetching budgets:', error)
        setError('Failed to load budgets')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchBudgets()

    // Set up real-time subscription
    const channel = supabase
      .channel('budgets-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'budgets' 
        }, 
        () => {
          fetchBudgets()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Add a new budget
  const addBudget = async (budget: Omit<Budget, "id">) => {
    try {
      setIsLoading(true)
      
      const newBudget = {
        ...budget,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('budgets')
        .insert(newBudget)
      
      if (error) {
        throw error
      }
      
      // Optimistically update the UI
      setBudgets(prev => [...prev, {
        id: newBudget.id,
        name: budget.name,
        amount: budget.amount,
        spent: budget.spent,
        period: budget.period,
        category: budget.category,
        startDate: budget.startDate,
        endDate: budget.endDate
      }])
      
    } catch (error) {
      console.error('Error adding budget:', error)
      setError('Failed to add budget')
    } finally {
      setIsLoading(false)
    }
  }

  // Update an existing budget
  const updateBudget = async (id: string, updatedBudget: Omit<Budget, "id">) => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase
        .from('budgets')
        .update({
          ...updatedBudget,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
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
    try {
      setIsLoading(true)
      
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
      
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

  // Context value
  const value = {
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    isLoading,
    error,
  }

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
}

// Custom hook to use the budget context
export function useBudgets() {
  const context = useContext(BudgetContext)
  if (context === undefined) {
    throw new Error("useBudgets must be used within a BudgetProvider")
  }
  return context
}
