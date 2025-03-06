"use client"

import { Suspense, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, DollarSign, TrendingUp } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { DataProvider } from "@/lib/context/DataProvider"
import { useTransactions } from "@/lib/context/TransactionContext"

const RecentTransactions = dynamic(
  () => import("@/components/dashboard/recent-transactions").then((mod) => mod.RecentTransactions),
  { ssr: false }
)

const IncomeExpenseChart = dynamic(
  () => import("@/components/dashboard/income-expense-chart").then((mod) => mod.IncomeExpenseChart),
  { ssr: false }
)

const CashFlowChart = dynamic(
  () => import("@/components/dashboard/cash-flow-chart").then((mod) => mod.CashFlowChart),
  { ssr: false }
)

const BudgetOverview = dynamic(
  () => import("@/components/dashboard/budget-overview").then((mod) => mod.BudgetOverview),
  { ssr: false }
)

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
      const currentDate = new Date()
      const lastMonth = new Date(currentDate)
      lastMonth.setMonth(currentDate.getMonth() - 1)
      
      const currentMonthTransactions = transactions.filter(t => 
        new Date(t.date) >= lastMonth && new Date(t.date) <= currentDate
      )
      
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
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <DashboardMetrics />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
              <IncomeExpenseChart />
            </Suspense>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
              <RecentTransactions />
            </Suspense>
          </CardContent>
        </Card>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
              <CashFlowChart />
            </Suspense>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
              <BudgetOverview />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
