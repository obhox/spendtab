"use client"

import { createContext, useContext, ReactNode } from "react"
import { useBudgetQuery } from "@/lib/hooks/useBudgetQuery"

// Define the Budget interface to match the useBudgetQuery interface
export interface Budget {
  id: string
  name: string
  amount: number
  spent: number
  start_date?: string
  end_date?: string
  period?: string
  category_id?: number
  category_name?: string
  account_id: string // Required to match useBudgetQuery
  is_recurring?: boolean
  recurring_type?: 'monthly' | 'weekly' | 'yearly' | 'quarterly'
  parent_budget_id?: string
  created_at?: string
  updated_at?: string
}

// Define the context interface
interface BudgetContextType {
  budgets: Budget[]
  isLoading: boolean
  error: Error | null
  addBudget: (budget: Omit<Budget, 'id' | 'spent' | 'created_at' | 'updated_at'>) => void
  updateBudget: (budget: Budget) => void
  deleteBudget: (id: string) => void
  createNextRecurringBudget: (budgetId: string) => void
  setBudgetCategories: (params: { budgetId: string, categoryIds: number[] }) => void
  addCategoryToBudget: (params: { budgetId: string, categoryId: number }) => void
  removeCategoryFromBudget: (params: { budgetId: string, categoryId: number }) => void
  fetchBudgetCategories: (budgetId: string) => Promise<any[]>
  refetch: () => void
}

// Create the context
const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

// Provider component
interface BudgetProviderProps {
  children: ReactNode
}

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const budgetQuery = useBudgetQuery()

  return (
    <BudgetContext.Provider
      value={{
        budgets: budgetQuery.budgets,
        isLoading: budgetQuery.isLoading,
        error: budgetQuery.error,
        addBudget: budgetQuery.addBudget,
        updateBudget: budgetQuery.updateBudget,
        deleteBudget: budgetQuery.deleteBudget,
        createNextRecurringBudget: budgetQuery.createNextRecurringBudget,
        setBudgetCategories: budgetQuery.setBudgetCategories,
        addCategoryToBudget: budgetQuery.addCategoryToBudget,
        removeCategoryFromBudget: budgetQuery.removeCategoryFromBudget,
        fetchBudgetCategories: budgetQuery.fetchBudgetCategories,
        refetch: budgetQuery.refetch
      }}
    >
      {children}
    </BudgetContext.Provider>
  )
}

// Hook to use the budget context
export function useBudgets() {
  const context = useContext(BudgetContext)
  if (context === undefined) {
    throw new Error("useBudgets must be used within a BudgetProvider")
  }
  return context
}
