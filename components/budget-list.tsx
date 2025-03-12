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
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null)

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
            <Card key={budget.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{budget.name}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-medium">{percentSpent}%</span>
                </div>
                <Progress value={percentSpent} className="h-2 mb-2" />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Budget</div>
                    <div className="text-lg font-bold">${budget.amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                    <div className="text-lg font-bold">${remaining.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <BudgetForm budget={budget}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </BudgetForm>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(budget.id)}>
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
