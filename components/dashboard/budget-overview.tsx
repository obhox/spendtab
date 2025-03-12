"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { useBudgets } from "@/lib/context/BudgetContext"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface Budget {
  id: string
  name: string
  amount: number
  spent: number
  period?: string
  startDate?: string
  endDate?: string
}

export function BudgetOverview() {
  const { budgets, isLoading } = useBudgets()
  const [totals, setTotals] = useState({ allocated: 0, spent: 0 })

  const getSpentAmount = (budget: Budget): number => {
    return budget.spent !== null && budget.spent !== undefined ? budget.spent : 0
  }

  const calculatePercentage = (spent: number, amount: number): number => {
    if (amount <= 0) return 0
    return Math.round((spent / amount) * 100)
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value)
  }

  useEffect(() => {
    if (budgets.length > 0) {
      const totalAllocated = budgets.reduce((sum, budget) => sum + budget.amount, 0)
      const totalSpent = budgets.reduce((sum, budget) => sum + getSpentAmount(budget), 0)
      setTotals({ allocated: totalAllocated, spent: totalSpent })
    }
  }, [budgets])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px] bg-muted/5 rounded-lg border border-dashed">
        <div className="flex flex-col items-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading budget data...</p>
        </div>
      </div>
    )
  }

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] bg-muted/5 rounded-lg border border-dashed p-4 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">No budget data available</p>
        <p className="text-xs text-muted-foreground text-center max-w-md">
          Set up budgets to track your spending against planned allocations
        </p>
        <Link href="/budgets" className="mt-4">
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Create Budget
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {budgets.slice(0, 5).map((budget) => {
        const spent = getSpentAmount(budget)
        const percentUsed = calculatePercentage(spent, budget.amount)

        return (
          <div key={budget.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{budget.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(spent)} of {formatCurrency(budget.amount)}
                </p>
              </div>
              <p className={`text-sm font-medium ${percentUsed > 90 ? "text-red-600" : percentUsed > 75 ? "text-amber-600" : "text-green-600"}`}>
                {percentUsed}%
              </p>
            </div>
            <Progress
              value={percentUsed}
              className={`h-2 ${percentUsed > 90 ? "bg-red-200" : percentUsed > 75 ? "bg-amber-200" : "bg-green-200"}`}
            />
          </div>
        )
      })}

      <div className="pt-4 border-t">
        <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
          <div>
            <p className="font-medium">Total Budget</p>
            <p>{formatCurrency(totals.allocated)}</p>
          </div>
          <div>
            <p className="font-medium">Total Spent</p>
            <p>{formatCurrency(totals.spent)}</p>
          </div>
          <div>
            <p className="font-medium">Remaining</p>
            <p>{formatCurrency(totals.allocated - totals.spent)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
