"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BudgetForm } from "@/components/budgets/budget-form"
import { Plus } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"

const BudgetList = dynamic(
  () => import("@/components/budget-list").then((mod) => mod.BudgetList),
  { ssr: false }
)

export default function BudgetsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
        <BudgetForm>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Budget
          </Button>
        </BudgetForm>
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Budget Management</CardTitle>
          <CardDescription className="text-sm md:text-base">Create and manage your budgets to keep your finances on track.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <BudgetList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

