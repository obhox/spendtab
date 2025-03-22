"use client"
import { createContext, useContext, ReactNode } from "react"
import { useAccounts } from "./AccountContext"
import { useBudgetQuery } from "../hooks/useBudgetQuery"

import { type Budget } from "../hooks/useBudgetQuery"
export type { Budget }

// Context interface
interface BudgetContextType {
  budgets: Budget[]
  addBudget: (budget: Omit<Budget, "id" | "spent">) => void
  updateBudget: (budget: Budget) => void
  deleteBudget: (id: string) => void
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

// Create the context with a default value
const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

// Provider component
export function BudgetProvider({ children }: { children: ReactNode }) {
  const {
    budgets,
    isLoading,
    error,
    addBudget,
    updateBudget,
    deleteBudget,
    refetch
  } = useBudgetQuery()

  const { currentAccount } = useAccounts()

  // React Query handles all the data fetching, caching, and mutations

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        isLoading,
        error,
        refetch
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
