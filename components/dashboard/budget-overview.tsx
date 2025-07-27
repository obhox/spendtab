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
        <CardHeader>
          <CardTitle>
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!budgets || budgets.length === 0) {
    return (
      <Card style={{ backgroundColor: '#F9F9FA' }}>
        <CardHeader>
          <CardTitle>
            Budget Overview
          </CardTitle>
          <CardDescription>Track your spending against your budgets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first budget to start tracking your expenses.
            </p>
            <BudgetForm>
              <Button>
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              Budget Overview
            </CardTitle>
          </div>
          <Link href="/budgets">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Progress</span>
            <Badge variant={
              overallProgress > 100 ? "destructive" : 
              overallProgress > 80 ? "secondary" : 
              "default"
            }>
              {Math.round(overallProgress)}%
            </Badge>
          </div>
          <Progress 
            value={Math.min(overallProgress, 100)} 
            className={`h-2 ${overallProgress > 100 ? 'bg-red-100' : overallProgress > 80 ? 'bg-amber-100' : ''}`}
          />
        </div>

        {/* Individual Budget Progress */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Top Spending Budgets</h4>
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
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{budget.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDateRange()}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      budget.percentSpent > 100 ? "destructive" : 
                      budget.percentSpent > 80 ? "secondary" : 
                      "default"
                    }>
                      {Math.round(budget.percentSpent)}%
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={Math.min(budget.percentSpent, 100)} 
                  className={`h-1.5 ${
                    isOverBudget ? 'bg-red-100' : 
                    isNearLimit ? 'bg-amber-100' : ''
                  }`}
                />
              </div>
            )
          })}
        </div>

        {/* Budget Summary */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-sm">
            <div className="text-center">
              <div className="text-muted-foreground">Total Budget</div>
              <div className="font-medium">{formatCurrency(totalBudgeted)}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Total Spent</div>
              <div className="font-medium">{formatCurrency(totalSpent)}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Remaining</div>
              <div className={`font-medium ${
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
