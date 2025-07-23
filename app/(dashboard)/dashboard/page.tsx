"use client"

import { Suspense, useEffect, useState, memo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// Removed Tabs imports as they are not used currently
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, DollarSign, TrendingUp, CalendarIcon } from 'lucide-react'
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart"
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart"
import { BudgetOverview } from "@/components/dashboard/budget-overview"
import { DataProvider } from "@/lib/context/DataProvider"
import { useTransactions } from "@/lib/context/TransactionContext"
import { useAccounts } from "@/lib/context/AccountContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSelectedCurrency, formatCurrency as formatCurrencyUtil } from "@/components/currency-switcher"

// Time period options for the filter
const timePeriods = [
  { value: "current_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "last_6_months", label: "Last 6 Months" },
  { value: "year_to_date", label: "Year to Date" },
  { value: "last_12_months", label: "Last 12 Months" }
];

// --- Helper: Loading Skeleton for Metric Cards ---
// Moved outside DashboardMetrics to be accessible by DashboardSkeleton
const MetricSkeleton = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-2 sm:p-3 md:p-4">
            <Skeleton className="h-3 sm:h-4 w-2/4" />
            <Skeleton className="h-3 sm:h-4 w-3 sm:w-4" />
        </CardHeader>
        <CardContent className="pt-0 p-2 sm:p-3 md:p-4">
            <Skeleton className="h-6 sm:h-7 w-3/4 mb-1" />
            <Skeleton className="h-2 sm:h-3 w-1/2" />
        </CardContent>
    </Card>
);


// --- Metrics Component ---
function DashboardMetrics() {
  const { transactions = [] } = useTransactions() || {};
  const { currentAccount } = useAccounts() || {};
  const selectedCurrency = useSelectedCurrency();
  const [metrics, setMetrics] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    cashFlow: 0,
    transactionCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState("current_month");
  // const supabase = createClientComponentClient(); // Keep if needed for other logic

  // Reset metrics on account change
  useEffect(() => {
    setIsLoading(true);
    setMetrics({
      revenue: 0, expenses: 0, profit: 0, cashFlow: 0, transactionCount: 0
    });
    if (!currentAccount) {
      setIsLoading(false); // Stop loading if no account
    }
  }, [currentAccount]);

  // Calculate metrics when dependencies change
  useEffect(() => {
    // Skip calculation if no account
    if (!currentAccount) {
        // Ensure loading state is false if there's no account after initial check
        if (isLoading) setIsLoading(false);
        return;
    }

    // Ensure transactions is an array before proceeding
    const validTransactions = Array.isArray(transactions) ? transactions : [];

    // Start calculation process (setIsLoading moved inside the effect that depends on account)
    // Check if we need to set loading (e.g., if dependencies changed triggering a recalc)
    // The effect listening to currentAccount handles the initial loading state change
    setIsLoading(true);
    try {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = endOfMonth(now); // Default end date

      switch (timePeriod) {
        case "current_month":
          startDate = startOfMonth(now);
          endDate = now;
          break;
        case "last_month":
          const lastMonthStart = startOfMonth(subMonths(now, 1));
          startDate = lastMonthStart;
          endDate = endOfMonth(lastMonthStart);
          break;
        case "last_3_months":
          startDate = startOfMonth(subMonths(now, 3));
          endDate = now;
          break;
        case "last_6_months":
          startDate = startOfMonth(subMonths(now, 6));
          endDate = now;
          break;
        case "year_to_date":
          startDate = startOfYear(now);
          endDate = now;
          break;
        case "last_12_months":
          startDate = startOfMonth(subMonths(now, 12));
          endDate = now;
          break;
        default:
          startDate = startOfMonth(now);
          endDate = now;
      }

      const filteredTransactions = validTransactions.filter(t => {
        if (t.account_id !== currentAccount.id) return false;
        try {
          if (!t.date || typeof t.date !== 'string') return false;
          const transactionDate = new Date(t.date);
          if (isNaN(transactionDate.getTime())) return false;
          return isWithinInterval(transactionDate, { start: startDate, end: endDate });
        } catch (error) {
          console.error("Error parsing transaction date:", t.date, error);
          return false;
        }
      });

      const revenue = filteredTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const expenses = filteredTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const profit = revenue - expenses;
      const cashFlow = revenue - expenses;

      setMetrics({
        revenue,
        expenses,
        profit,
        cashFlow,
        transactionCount: filteredTransactions.length
      });

    } catch (error) {
      console.error("Error calculating metrics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [transactions, currentAccount, timePeriod]); // Rerun when these change

  // Memoized helpers
  const getTimePeriodLabel = useCallback(() => {
    return timePeriods.find(p => p.value === timePeriod)?.label ?? "Selected Period";
  }, [timePeriod]);

  const formatCurrency = useCallback((value: number | undefined | null): string => {
    const numValue = Number(value);
    return isNaN(numValue) ? `${selectedCurrency.symbol}0.00` : formatCurrencyUtil(numValue, selectedCurrency.code, selectedCurrency.symbol);
  }, [selectedCurrency]);


  return (
    <div className="space-y-4">
      {/* Time Period Selector */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-start sm:justify-end">
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] h-9">
             <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
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

      {/* --- Metrics Grid --- */}
      {/* Grid: 1 col mobile, 2 cols tablet, 4 cols desktop */}
      <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {/* Use the globally defined MetricSkeleton - layout controlled by parent grid */}
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : (
          <>
            {/* Revenue Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-2 sm:p-3 md:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Revenue</CardTitle>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0 p-2 sm:p-3 md:p-4">
                <div className="text-lg sm:text-xl md:text-2xl font-bold">{formatCurrency(metrics.revenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {getTimePeriodLabel()}
                </p>
              </CardContent>
            </Card>

            {/* Expenses Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-2 sm:p-3 md:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Expenses</CardTitle>
                <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0 p-2 sm:p-3 md:p-4">
                <div className="text-lg sm:text-xl md:text-2xl font-bold">{formatCurrency(metrics.expenses)}</div>
                <p className="text-xs text-muted-foreground">
                   {getTimePeriodLabel()}
                </p>
              </CardContent>
            </Card>

            {/* Profit Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-2 sm:p-3 md:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  {metrics.profit >= 0 ? 'Profit' : 'Loss'}
                </CardTitle>
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0 p-2 sm:p-3 md:p-4">
                <div className={`text-lg sm:text-xl md:text-2xl font-bold ${metrics.profit >= 0 ? 'text-foreground' : 'text-red-600'}`}>
                    {formatCurrency(metrics.profit)}
                </div>
                <p className="text-xs text-muted-foreground">
                   {getTimePeriodLabel()}
                </p>
              </CardContent>
            </Card>

            {/* Cash Flow Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-2 sm:p-3 md:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Cash Flow</CardTitle>
                <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0 p-2 sm:p-3 md:p-4">
                <div className="text-lg sm:text-xl md:text-2xl font-bold">{formatCurrency(metrics.cashFlow)}</div>
                <p className="text-xs text-muted-foreground">
                  {getTimePeriodLabel()}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

const MemoizedDashboardMetrics = memo(DashboardMetrics);

// --- Main Dashboard Page Component ---
export default function DashboardPage() {
  const { currentAccount, isAccountSwitching } = useAccounts() || {};

  // Loading overlay remains the same
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
        <Skeleton className="h-8 w-32" />
        <p className="text-lg font-medium text-foreground">Switching account...</p>
    </div>
  );

  // Main page Skeleton
  const DashboardSkeleton = () => (
      <div className="p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
          <Skeleton className="h-8 w-48 mb-4" /> {/* Heading */}
          {/* Metrics Skeleton */}
          {/* Updated grid class to match mobile layout */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-4">
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
          </div>
          {/* Charts/Overview Skeleton */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-1 md:col-span-1 lg:col-span-4"><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-[220px] sm:h-[300px] md:h-[350px]" /></CardContent></Card>
              <Card className="col-span-1 md:col-span-1 lg:col-span-3"><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-[220px] sm:h-[300px] md:h-[350px]" /></CardContent></Card>
              <Card className="col-span-1 md:col-span-1 lg:col-span-4"><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-[200px]" /></CardContent></Card>
              <Card className="col-span-1 md:col-span-1 lg:col-span-3"><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-[200px]" /></CardContent></Card>
          </div>
      </div>
  );

  return (
    <DataProvider>
      {isAccountSwitching && <LoadingOverlay />}
      <Suspense fallback={<DashboardSkeleton />}>
        <div className="p-2 sm:p-4 md:p-6 lg:p-8 space-y-3 sm:space-y-4 md:space-y-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <MemoizedDashboardMetrics />
            
            {/* Charts Grid - Responsive layout */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-7">
              {/* Income vs Expenses Chart */}
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader className="p-3 pb-2 sm:p-4 sm:pb-2">
                  <CardTitle className="text-sm sm:text-base md:text-lg">Income vs Expenses</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
                  <IncomeExpenseChart />
                </CardContent>
              </Card>
              
              {/* Cash Flow Chart */}
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader className="p-3 pb-2 sm:p-4 sm:pb-2">
                  <CardTitle className="text-sm sm:text-base md:text-lg">Cash Flow</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
                  <CashFlowChart />
                </CardContent>
              </Card>
            </div>
            
            {/* Bottom Grid - Recent Transactions and Budget */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-7">
              {/* Recent Transactions */}
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader className="p-3 pb-2 sm:p-4 sm:pb-2">
                  <CardTitle className="text-sm sm:text-base md:text-lg">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
                  <RecentTransactions />
                </CardContent>
              </Card>
              
              {/* Budget Overview */}
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader className="p-3 pb-2 sm:p-4 sm:pb-2">
                  <CardTitle className="text-sm sm:text-base md:text-lg">Budget Overview</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
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
