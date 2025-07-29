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
      <div className="pt-0 px-4 pb-4 md:pt-0 md:px-6 md:pb-6 lg:pt-0 lg:px-8 lg:pb-8">
        <div className="flex flex-col gap-3 sm:gap-6">
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Budgets</h1>
            <div className="flex justify-end">
              <BudgetForm>
                <Button className="w-full sm:w-auto text-xs sm:text-sm">
                  <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Create Budget
                </Button>
              </BudgetForm>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold">Budget Management</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Create and manage your budgets to keep your finances on track.</p>
            </div>
            <Suspense fallback={<Skeleton className="h-[300px] sm:h-[400px] w-full" />}>
              <BudgetList />
            </Suspense>
          </div>
        </div>
      </div>
    </DataProvider>
  )
}

