"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, Calendar, DollarSign, Tag, Repeat } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { useBudgets } from "@/lib/context/BudgetContext"
import { useFormatCurrency } from "@/components/currency-switcher"
import { BudgetForm } from "@/components/budgets/budget-form"
import { format } from "date-fns"
import { toast } from "sonner"

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
  is_recurring?: boolean
  recurring_type?: 'monthly' | 'weekly' | 'yearly' | 'quarterly'
  parent_budget_id?: string
}

export function BudgetList() {
  const { budgets, deleteBudget, createNextRecurringBudget, isLoading } = useBudgets()
  const formatCurrency = useFormatCurrency()
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null)

  const handleDeleteBudget = async (budgetId: string) => {
    try {
      await deleteBudget(budgetId)
      setBudgetToDelete(null)
      toast.success("Budget deleted successfully!")
    } catch (error) {
      console.error("Error deleting budget:", error)
      toast.error("Failed to delete budget. Please try again.")
    }
  }

  const handleCreateNextRecurring = async (budgetId: string) => {
    try {
      await createNextRecurringBudget(budgetId)
    } catch (error) {
      console.error("Error creating next recurring budget:", error)
      toast.error("Failed to create next recurring budget. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!budgets || budgets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Create your first budget to start tracking your expenses.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {budgets.map((budget) => {
        const percentSpent = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
        const remaining = budget.amount - budget.spent
        const isOverBudget = percentSpent > 100
        const isNearLimit = percentSpent > 80 && percentSpent <= 100

        // Format date range
        const formatDateRange = () => {
          if (budget.period) {
            return budget.period
          }
          if (budget.start_date && budget.end_date) {
            const startDate = new Date(budget.start_date)
            const endDate = new Date(budget.end_date)
            return `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd, yyyy")}`
          }
          return "No period set"
        }

        return (
          <Card key={budget.id} className={`relative ${isOverBudget ? 'border-red-200 bg-red-50' : isNearLimit ? 'border-amber-200 bg-amber-50' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{budget.name}</CardTitle>
                    {budget.is_recurring && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        <Repeat className="h-3 w-3 mr-1" />
                        {budget.recurring_type}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {formatDateRange()}
                    </div>
                    {budget.category_name && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-3 w-3" />
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            const categories = budget.category_name.split(', ').map(name => name.trim()).filter(Boolean);
                            if (categories.length === 0) return null;
                            
                            if (categories.length === 1) {
                              return (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                  {categories[0]}
                                </span>
                              );
                            } else {
                              const additionalCount = categories.length - 1;
                              return (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                  {categories[0]} +{additionalCount} other{additionalCount > 1 ? 's' : ''}
                                </span>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <BudgetForm budget={budget}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    </BudgetForm>
                    {budget.is_recurring && (
                      <DropdownMenuItem onClick={() => handleCreateNextRecurring(budget.id)}>
                        <Repeat className="mr-2 h-4 w-4" />
                        Create Next Period
                      </DropdownMenuItem>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{budget.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteBudget(budget.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <Badge variant={
                    isOverBudget ? "destructive" : 
                    isNearLimit ? "secondary" : 
                    "default"
                  }>
                    {Math.round(percentSpent)}%
                  </Badge>
                </div>
                
                <Progress 
                  value={Math.min(percentSpent, 100)} 
                  className={`h-2 ${
                    isOverBudget ? 'bg-red-100' : 
                    isNearLimit ? 'bg-amber-100' : ''
                  }`}
                />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Spent</p>
                    <p className="font-medium">{formatCurrency(budget.spent)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Budget</p>
                    <p className="font-medium">{formatCurrency(budget.amount)}</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className={`font-medium ${
                      remaining < 0 ? 'text-red-600' : 
                      remaining < budget.amount * 0.2 ? 'text-amber-600' : 
                      'text-green-600'
                    }`}>
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                  {isOverBudget && (
                    <div className="mt-1 text-xs text-red-600 font-medium">
                      Over budget by {formatCurrency(Math.abs(remaining))}
                    </div>
                  )}
                  {isNearLimit && !isOverBudget && (
                    <div className="mt-1 text-xs text-amber-600 font-medium">
                      Approaching budget limit
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
