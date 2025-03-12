"use client"

import { Suspense, useEffect, useState, memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, DollarSign, TrendingUp } from 'lucide-react'
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart"
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart"
import { BudgetOverview } from "@/components/dashboard/budget-overview"
import { DataProvider } from "@/lib/context/DataProvider"
import { useTransactions } from "@/lib/context/TransactionContext"
import { useAccounts } from "@/lib/context/AccountContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, isWithinInterval } from "date-fns"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// If the module is not found, make sure to:
// 1. Install the package: npm install @supabase/auth-helpers-nextjs
// 2. Add the types: npm install -D @supabase/supabase-js

// Time period options for the filter
const timePeriods = [
  { value: "current_month", label: "Current Month" },
  { value: "last_month", label: "Last Month" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "last_6_months", label: "Last 6 Months" },
  { value: "year_to_date", label: "Year to Date" },
  { value: "last_12_months", label: "Last 12 Months" }
]

function DashboardMetrics() {
  const { transactions = [], setTransactions } = useTransactions() || {}
  const { currentAccount } = useAccounts() || {}
  const [metrics, setMetrics] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    cashFlow: 0,
    transactionCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState("current_month")
  const supabase = createClientComponentClient()
  
  // Set up real-time subscription for transactions
  useEffect(() => {
    if (!currentAccount) return

    // Subscribe to changes in transactions table for current account
    const channel = supabase
      .channel('transactions-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'transactions',
          filter: `account_id=eq.${currentAccount.id}`
        }, 
        async (payload) => {
          // Fetch updated transactions for the current account
          const { data: updatedTransactions, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('account_id', currentAccount.id)
            .order('date', { ascending: false })

          if (!error && updatedTransactions) {
            setTransactions(updatedTransactions)
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount or account change
    return () => {
      channel.unsubscribe()
    }
  }, [currentAccount, supabase, setTransactions])
  
  // Reset metrics when account changes
  useEffect(() => {
    setMetrics({
      revenue: 0,
      expenses: 0,
      profit: 0,
      cashFlow: 0,
      transactionCount: 0
    })
  }, [currentAccount]) // Reset on account change
  
  useEffect(() => {
    try {
      setIsLoading(true)
      
      // Only calculate metrics if we have transactions and a current account
      if (!transactions || transactions.length === 0 || !currentAccount) {
        setIsLoading(false)
        return // We already reset metrics in the previous effect
      }

      // Calculate metrics from transactions for the current account only
      const currentDate = new Date()
      
      // Determine date range based on selected time period
      let startDate = new Date()
      
      switch (timePeriod) {
        case "current_month":
          startDate = startOfMonth(currentDate)
          break
        case "last_month":
          startDate = startOfMonth(subMonths(currentDate, 1))
          currentDate.setDate(0) // Last day of previous month
          break
        case "last_3_months":
          startDate = startOfMonth(subMonths(currentDate, 3))
          break
        case "last_6_months":
          startDate = startOfMonth(subMonths(currentDate, 6))
          break
        case "year_to_date":
          startDate = startOfYear(currentDate)
          break
        case "last_12_months":
          startDate = startOfMonth(subMonths(currentDate, 12))
          break
        default:
          startDate = startOfMonth(currentDate)
      }
      
      // Get only transactions for current account
      const currentAccountTransactions = transactions.filter(t => 
        t.account_id === currentAccount.id
      )
      
      // Filter transactions by date range
      const filteredTransactions = currentAccountTransactions.filter(t => {
        try {
          const transactionDate = new Date(t.date)
          return isWithinInterval(transactionDate, {
            start: startDate,
            end: currentDate
          })
        } catch (error) {
          console.error("Error parsing transaction date:", t.date, error)
          return false
        }
      })
      
      // Calculate totals
      const revenue = filteredTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
        
      const expenses = filteredTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
      
      // Calculate profit (income - expenses)  
      const profit = revenue - expenses
      
      // Calculate cash flow (could be different from profit in a real system)
      // For now using the same calculation, but separating them for future differentiation
      const cashFlow = revenue - expenses
      
      setMetrics({
        revenue,
        expenses,
        profit,
        cashFlow,
        transactionCount: filteredTransactions.length
      })
    } catch (error) {
      console.error("Error calculating metrics:", error)
    } finally {
      setIsLoading(false)
    }
  }, [transactions, currentAccount, timePeriod]) // Added timePeriod to dependencies
  
  // Get time period label for display
  const getTimePeriodLabel = () => {
    const period = timePeriods.find(p => p.value === timePeriod)
    return period ? period.label : "Current Month"
  }
  
  // Safe number formatter to avoid NaN displays
  const formatCurrency = (value) => {
    return isNaN(value) ? "$0.00" : `$${value.toFixed(2)}`
  }
  
  if (isLoading) {
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array(4).fill(0).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="animate-pulse h-8 bg-muted rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  }
  
  return (
    <>
      <div className="flex justify-end mb-4">
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            {timePeriods.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              {getTimePeriodLabel()} revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.expenses)}</div>
            <p className="text-xs text-muted-foreground">
              {getTimePeriodLabel()} expenses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.profit)}</div>
            <p className="text-xs text-muted-foreground">
              {getTimePeriodLabel()} profit
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.cashFlow)}</div>
            <p className="text-xs text-muted-foreground">
              {getTimePeriodLabel()} cash flow
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// Memoized wrapper to prevent unnecessary rerenders
const MemoizedDashboardMetrics = memo(DashboardMetrics)

export default function DashboardPage() {
  const { currentAccount, isAccountSwitching } = useAccounts() || {}
  
  // Loading overlay for account switching
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse h-8 w-32 bg-muted rounded"></div>
        <p className="text-lg font-medium">Switching account...</p>
      </div>
    </div>
  )
  
  return (
    <DataProvider>
      {isAccountSwitching && <LoadingOverlay />}
      <Suspense fallback={<div className="p-4 text-center animate-pulse bg-muted rounded">Loading dashboard...</div>}>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          {currentAccount ? (
            <h2 className="text-xl tracking-tight text-muted-foreground">Account: {currentAccount.name}</h2>
          ) : (
            <h2 className="text-xl tracking-tight text-muted-foreground">No account selected</h2>
          )}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <MemoizedDashboardMetrics />
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
                    <CardTitle>Cash Flow</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <CashFlowChart />
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RecentTransactions />
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Budget Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BudgetOverview />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Suspense>
    </DataProvider>
  )
}