"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, AlertTriangle, Plus, Calendar, Tag } from "lucide-react"
import { useBudgets } from "@/lib/context/BudgetContext"
import { useFormatCurrency } from "@/components/currency-switcher"
import { BudgetForm } from "@/components/budgets/budget-form"
import { format } from "date-fns"
import Link from "next/link"

interface Budget {
  id: string
  name: string
  amount: number
  spent: number
  start_date?: string
  end_date?: string
  period?: string
  category_id?: number
  category_name?: string
}

export function BudgetOverview() {
  const { budgets, isLoading } = useBudgets()
  const formatCurrency = useFormatCurrency()

  if (isLoading) {
    return (
      <Card style={{ backgroundColor: '#F9F9FA' }}>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-3 sm:px-6 pb-4 sm:pb-6">
          <div className="py-6 sm:py-8 text-center text-sm text-muted-foreground">Loading budgets...</div>
        </CardContent>
      </Card>
    )
  }

  if (!budgets || budgets.length === 0) {
    return (
      <Card style={{ backgroundColor: '#F9F9FA' }}>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">
            Budget Overview
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">Track your spending against your budgets</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-3 sm:px-6 pb-4 sm:pb-6">
          <div className="text-center py-6 sm:py-8">
            <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">No budgets yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 px-2">
              Create your first budget to start tracking your expenses.
            </p>
            <BudgetForm>
              <Button size="sm" className="text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            </BudgetForm>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate totals
  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const totalRemaining = totalBudgeted - totalSpent
  const overallProgress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0

  // Get budgets sorted by spending percentage (highest first) for display
  const sortedBudgets = [...budgets]
    .map(budget => ({
      ...budget,
      percentSpent: budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
    }))
    .sort((a, b) => b.percentSpent - a.percentSpent)
    .slice(0, 4) // Show top 4 budgets

  // Count budgets by status
  const overBudgetCount = budgets.filter(b => b.spent > b.amount).length
  const nearLimitCount = budgets.filter(b => {
    const percent = b.amount > 0 ? (b.spent / b.amount) * 100 : 0
    return percent > 80 && percent <= 100
  }).length

  return (
    <Card style={{ backgroundColor: '#F9F9FA' }}>
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg sm:text-xl truncate">
              Budget Overview
            </CardTitle>
          </div>
          <Link href="/budgets">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9 flex-shrink-0">
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">All</span>
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center gap-2">
            <span className="text-sm sm:text-base font-medium truncate">Overall Progress</span>
            <Badge variant={
              overallProgress > 100 ? "destructive" : 
              overallProgress > 80 ? "secondary" : 
              "default"
            } className="text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 flex-shrink-0">
              {Math.round(overallProgress)}%
            </Badge>
          </div>
          <Progress 
            value={Math.min(overallProgress, 100)} 
            className={`h-2 sm:h-3 ${overallProgress > 100 ? 'bg-red-100' : overallProgress > 80 ? 'bg-amber-100' : ''}`}
          />
        </div>

        {/* Individual Budget Progress */}
        <div className="space-y-3 sm:space-y-4">
          <h4 className="text-sm sm:text-base font-medium text-muted-foreground">Top Spending Budgets</h4>
          {sortedBudgets.map((budget) => {
            const remaining = budget.amount - budget.spent
            const isOverBudget = budget.percentSpent > 100
            const isNearLimit = budget.percentSpent > 80 && budget.percentSpent <= 100

            // Format date range
            const formatDateRange = () => {
              if (budget.period) {
                return budget.period
              }
              if (budget.start_date && budget.end_date) {
                const startDate = new Date(budget.start_date)
                const endDate = new Date(budget.end_date)
                return `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")}`
              }
              return "No period"
            }

            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm sm:text-base truncate">{budget.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-0.5">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{formatDateRange()}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge variant={
                      budget.percentSpent > 100 ? "destructive" : 
                      budget.percentSpent > 80 ? "secondary" : 
                      "default"
                    } className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                      {Math.round(budget.percentSpent)}%
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={Math.min(budget.percentSpent, 100)} 
                  className={`h-1.5 sm:h-2 ${
                    isOverBudget ? 'bg-red-100' : 
                    isNearLimit ? 'bg-amber-100' : ''
                  }`}
                />
              </div>
            )
          })}
        </div>

        {/* Budget Summary */}
        <div className="border-t pt-3 sm:pt-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="text-center">
              <div className="text-muted-foreground mb-1">Total Budget</div>
              <div className="font-medium text-sm sm:text-base truncate">{formatCurrency(totalBudgeted)}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground mb-1">Total Spent</div>
              <div className="font-medium text-sm sm:text-base truncate">{formatCurrency(totalSpent)}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground mb-1">Remaining</div>
              <div className={`font-medium text-sm sm:text-base truncate ${
                totalRemaining < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(totalRemaining)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
