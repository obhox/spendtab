"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from "lucide-react"
import { BudgetForm } from "./budget-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useBudgets } from "@/lib/context/BudgetContext"
import { toast } from "sonner"
import { useSelectedCurrency, formatCurrency as formatCurrencyUtil } from "@/components/currency-switcher"

interface Budget {
  id: string
  name: string
  amount: number
  spent: number
  period?: string
  category?: string
  startDate?: string
  endDate?: string
  account_id?: string
}

export function BudgetList() {
  const { budgets, deleteBudget, isLoading } = useBudgets()
  const selectedCurrency = useSelectedCurrency()
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null)
  
  // Format currency value
  const formatCurrency = (value: number): string => {
    return formatCurrencyUtil(value, selectedCurrency.code, selectedCurrency.symbol)
  }

  const handleDelete = (id: string) => {
    setBudgetToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (budgetToDelete) {
      deleteBudget(budgetToDelete)
      toast("Budget deleted", {
        description: "The budget has been deleted successfully."
      })
      setBudgetToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  if (isLoading) {
    return <div className="py-10 text-center">Loading budgets...</div>
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const percentSpent = Math.round((budget.spent / budget.amount) * 100)
          const remaining = budget.amount - budget.spent

          return (
            <Card key={budget.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold">{budget.name}</CardTitle>
                {budget.period && (
                  <div className="text-sm text-muted-foreground">
                    Period: {budget.period}
                    {budget.startDate && budget.endDate && (
                      <span> ({new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()})</span>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="pb-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className={`text-sm font-medium ${percentSpent > 90 ? "text-red-600" : percentSpent > 75 ? "text-amber-600" : "text-green-600"}`}>
                      {percentSpent}%
                    </span>
                  </div>
                  <Progress 
                    value={percentSpent} 
                    className={`h-2.5 ${percentSpent > 90 ? "bg-red-200" : percentSpent > 75 ? "bg-amber-200" : "bg-green-200"}`} 
                  />
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <div className="text-sm text-muted-foreground font-medium">Budget</div>
                    <div className="text-lg font-bold tracking-tight">{formatCurrency(budget.amount)}</div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-sm text-muted-foreground font-medium">Spent</div>
                    <div className={`text-lg font-bold tracking-tight ${budget.spent > budget.amount ? "text-red-600" : ""}`}>
                      {formatCurrency(budget.spent)}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-sm text-muted-foreground font-medium">Remaining</div>
                    <div className={`text-lg font-bold tracking-tight ${remaining < 0 ? "text-red-600" : remaining < budget.amount * 0.25 ? "text-amber-600" : "text-green-600"}`}>
                      {formatCurrency(remaining)}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-3 border-t">
                <BudgetForm budget={budget}>
                  <Button variant="ghost" size="sm" className="hover:bg-muted">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </BudgetForm>
                <Button variant="ghost" size="sm" className="hover:bg-red-100 hover:text-red-600" onClick={() => handleDelete(budget.id)}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the budget from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
