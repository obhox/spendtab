"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { useBudgetQuery } from "@/lib/hooks/useBudgetQuery"
import { useAccounts } from "@/lib/context/AccountContext"

export function BudgetOverview() {
  const { currentAccount } = useAccounts()
  const [topBudgets, setTopBudgets] = useState<any[]>([])
  const { budgets, isLoading } = useBudgetQuery()
  
  // Process budgets to show the 4 with highest spending percentage
  useEffect(() => {
    if (!budgets) return;
    const processed = budgets.map(budget => ({
      id: budget.id,
      allocated: budget.amount,
      spent: budget.spent,
      remaining: budget.amount - budget.spent,
      percentSpent: Math.round((budget.spent / budget.amount) * 100)
    }))
    .sort((a, b) => b.percentSpent - a.percentSpent)
    .slice(0, 4)
    
    setTopBudgets(processed)
  }, [budgets])

  if (isLoading) {
    return <div className="py-2 text-sm text-center">Loading budgets...</div>
  }

  return (
    <div className="space-y-4">
      {topBudgets.length === 0 ? (
        <div className="py-4 text-center text-sm text-muted-foreground">
          No budget data to display.
        </div>
      ) : (
        topBudgets.map((budget) => {
          return (
            <div key={budget.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{budget.percentSpent}%</span>
              </div>
              <Progress value={budget.percentSpent} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>${budget.spent.toLocaleString()} spent</span>
                <span>${budget.remaining.toLocaleString()} remaining</span>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
