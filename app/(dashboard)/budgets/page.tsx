"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { BudgetForm } from "@/components/budgets/budget-form"
import { Plus } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"

const BudgetList = dynamic(
  () => import("@/components/budget-list").then((mod) => mod.BudgetList),
  { ssr: false }
)

import { DataProvider } from "@/lib/context/DataProvider"

export default function BudgetsPage() {
  return (
    <DataProvider>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Budgets</h1>
          <BudgetForm>
            <Button className="w-full sm:w-auto text-sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          </BudgetForm>
        </div>
        <Suspense fallback={<Skeleton className="h-48 sm:h-64 w-full" />}>
          <BudgetList />
        </Suspense>
      </div>
    </DataProvider>
  )
}
