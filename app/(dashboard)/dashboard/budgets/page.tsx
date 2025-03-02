"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BudgetList } from "@/components/budgets/budget-list"
import { BudgetForm } from "@/components/budgets/budget-form"
import { Plus } from 'lucide-react'

export default function BudgetsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
        <BudgetForm>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Budget
          </Button>
        </BudgetForm>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Budget Management</CardTitle>
          <CardDescription>Create and manage your budgets to keep your finances on track.</CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetList />
        </CardContent>
      </Card>
    </div>
  )
}

