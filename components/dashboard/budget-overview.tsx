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
  period: string
  category: string
  startDate?: string
  endDate?: string
}

export function BudgetOverview() {
  const { budgets, isLoading } = useBudgets()
  const [totals, setTotals] = useState({ allocated: 0, spent: 0 });

  useEffect(() => {
    if (budgets.length > 0) {
      const totalAllocated = budgets.reduce((sum, budget) => sum + budget.amount, 0);
      const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spent !== null && budget.spent !== undefined ? budget.spent : 0), 0);
      setTotals({ allocated: totalAllocated, spent: totalSpent });
    }
  }, [budgets]);

  if (isLoading) {
    return <div className="py-2 text-sm text-center">Loading budget data...</div>
  }

  if (budgets.length === 0) {
    return (
      <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
        <p className="text-sm font-medium text-muted-foreground">No budget data available</p>
        <p className="text-xs text-muted-foreground mb-4">
          Set up budgets to track your spending against planned allocations
        </p>
        <Link href="/budgets">
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
      {budgets.map((budget) => {
        const percentUsed = Math.round((budget.spent !== null && budget.spent !== undefined ? budget.spent : 0) / budget.amount * 100);

        return (
          <div key={budget.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{budget.name}</p>
                <p className="text-xs text-muted-foreground">${(budget.spent !== null && budget.spent !== undefined ? budget.spent : 0).toLocaleString()} of ${budget.amount.toLocaleString()}</p>
              </div>
              <p className={`text-sm font-medium ${
                percentUsed > 90 ? "text-red-600" :
                percentUsed > 75 ? "text-amber-600" :
                "text-green-600"
              }`}>
                {percentUsed}%
              </p>
            </div>
            <Progress
              value={percentUsed}
              className="h-2"
            />
          </div>
        )
      })}

      <div className="pt-2">
        <p className="text-xs text-center text-muted-foreground">
          Total Budget: ${totals.allocated.toLocaleString()} •
          Spent: ${totals.spent.toLocaleString()} •
          Remaining: ${(totals.allocated - totals.spent).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
