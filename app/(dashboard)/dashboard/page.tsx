"use client"

import { Suspense, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, DollarSign, TrendingUp } from 'lucide-react'
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart"
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart"
import { BudgetOverview } from "@/components/dashboard/budget-overview"
import { DataProvider } from "@/lib/context/DataProvider"
import { useTransactions } from "@/lib/context/TransactionContext"

function DashboardMetrics() {
  const { transactions } = useTransactions()
  const [metrics, setMetrics] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    cashFlow: 0,
    transactionCount: 0
  })
  
  useEffect(() => {
    if (transactions.length > 0) {
      // Calculate metrics from transactions
      const currentDate = new Date()
      const lastMonth = new Date(currentDate)
      lastMonth.setMonth(currentDate.getMonth() - 1)
      
      // Current month transactions
      const currentMonthTransactions = transactions.filter(t => 
        new Date(t.date) >= lastMonth && new Date(t.date) <= currentDate
      )
      
      // Calculate totals
      const revenue = currentMonthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0)
        
      const expenses = currentMonthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0)
        
      setMetrics({
        revenue,
        expenses,
        profit: revenue - expenses,
        cashFlow: revenue - expenses,
        transactionCount: currentMonthTransactions.length
      })
    }
  }, [transactions])
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.revenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {transactions.length === 0 ? "No revenue data yet" : "Current month revenue"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          <ArrowDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.expenses.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {transactions.length === 0 ? "No expense data yet" : "Current month expenses"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit</CardTitle>
          <ArrowUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.profit.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {transactions.length === 0 ? "No profit data yet" : "Current month profit"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.cashFlow.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {transactions.length === 0 ? "No cash flow data yet" : "Current month cash flow"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <DataProvider>
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="space-y-4">
            <DashboardMetrics />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Income vs Expenses</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <IncomeExpenseChart />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentTransactions />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Cash Flow</CardTitle>
                  <CardDescription>Your cash flow trends</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <CashFlowChart />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Budget Overview</CardTitle>
                  <CardDescription>Your budget utilization</CardDescription>
                </CardHeader>
                <CardContent>
                  <BudgetOverview />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Suspense>
    </DataProvider>
  )
}
