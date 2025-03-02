"use client"

import { ReactNode } from "react"
import { TransactionProvider } from "./TransactionContext"
import { BudgetProvider } from "./BudgetContext"
import { AnalyticsProvider } from "./AnalyticsContext"
import { ReportsProvider } from "./ReportsContext"
import { CategoryProvider } from "./CategoryContext"

interface DataProviderProps {
  children: ReactNode
}

export function DataProvider({ children }: DataProviderProps) {
  return (
    <CategoryProvider>
      <TransactionProvider>
        <BudgetProvider>
          <AnalyticsProvider>
            <ReportsProvider>
              {children}
            </ReportsProvider>
          </AnalyticsProvider>
        </BudgetProvider>
      </TransactionProvider>
    </CategoryProvider>
  )
}
