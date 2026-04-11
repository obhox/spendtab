"use client"

import { Suspense, useEffect, useState, memo, useCallback } from "react"
import { ArrowDown, ArrowUp, DollarSign, TrendingUp, CalendarIcon } from 'lucide-react'
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart"
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart"
import { BudgetOverview } from "@/components/dashboard/budget-overview"
import { useTransactions } from "@/lib/context/TransactionContext"
import { useAccounts } from "@/lib/context/AccountContext"
import { useAnalytics } from "@/lib/context/AnalyticsContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns"
import { useSelectedCurrency, formatCurrency as formatCurrencyUtil } from "@/components/currency-switcher"

const timePeriods = [
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "current_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "last_6_months", label: "Last 6 Months" },
  { value: "year_to_date", label: "Year to Date" },
  { value: "last_12_months", label: "Last 12 Months" }
];

// Bento metric skeleton
const MetricSkeleton = () => (
  <div className="bg-white border border-ibm-g20 p-6">
    <Skeleton className="h-3 w-24 mb-4" />
    <Skeleton className="h-8 w-3/4 mb-2" />
    <Skeleton className="h-3 w-1/2" />
  </div>
);

// --- Metrics Component ---
function DashboardMetrics() {
  const { transactions = [] } = useTransactions() || {};
  const { currentAccount } = useAccounts() || {};
  const { setDateRange } = useAnalytics();
  const selectedCurrency = useSelectedCurrency();
  const [metrics, setMetrics] = useState({
    revenue: 0, expenses: 0, profit: 0, cashFlow: 0, transactionCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState("last_30_days");

  const getDateRangeFromTimePeriod = useCallback((period: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case "last_30_days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "current_month":
        startDate = startOfMonth(now);
        break;
      case "last_month":
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        startDate = lastMonthStart;
        endDate = endOfMonth(lastMonthStart);
        break;
      case "last_3_months":
        startDate = startOfMonth(subMonths(now, 3));
        break;
      case "last_6_months":
        startDate = startOfMonth(subMonths(now, 6));
        break;
      case "year_to_date":
        startDate = startOfYear(now);
        break;
      case "last_12_months":
        startDate = startOfMonth(subMonths(now, 12));
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  }, []);

  useEffect(() => {
    setDateRange(getDateRangeFromTimePeriod(timePeriod));
  }, [timePeriod, setDateRange, getDateRangeFromTimePeriod]);

  useEffect(() => {
    setIsLoading(true);
    setMetrics({ revenue: 0, expenses: 0, profit: 0, cashFlow: 0, transactionCount: 0 });
    if (!currentAccount) { setIsLoading(false); }
  }, [currentAccount]);

  useEffect(() => {
    if (!currentAccount) { if (isLoading) setIsLoading(false); return; }
    const validTransactions = Array.isArray(transactions) ? transactions : [];
    setIsLoading(true);
    try {
      const { startDate, endDate } = getDateRangeFromTimePeriod(timePeriod);
      const filtered = validTransactions.filter(t => {
        if (t.account_id !== currentAccount.id) return false;
        try {
          if (!t.date || typeof t.date !== 'string') return false;
          const d = new Date(t.date);
          if (isNaN(d.getTime())) return false;
          return isWithinInterval(d, { start: startDate, end: endDate });
        } catch { return false; }
      });
      const revenue = filtered.filter(t => t.type === "income").reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const expenses = filtered.filter(t => t.type === "expense").reduce((s, t) => s + (Number(t.amount) || 0), 0);
      setMetrics({ revenue, expenses, profit: revenue - expenses, cashFlow: revenue - expenses, transactionCount: filtered.length });
    } catch (e) {
      console.error("Error calculating metrics:", e);
    } finally {
      setIsLoading(false);
    }
  }, [transactions, currentAccount, timePeriod, getDateRangeFromTimePeriod]);

  const getTimePeriodLabel = useCallback(() =>
    timePeriods.find(p => p.value === timePeriod)?.label ?? "Selected Period",
    [timePeriod]
  );

  const formatCurrency = useCallback((value: number | undefined | null): string => {
    const n = Number(value);
    return isNaN(n) ? `${selectedCurrency.symbol}0.00` : formatCurrencyUtil(n, selectedCurrency.code, selectedCurrency.symbol);
  }, [selectedCurrency]);

  return (
    <div className="space-y-px">
      {/* Time period filter row */}
      <div className="bg-white border border-ibm-g20 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <span className="ibm-label">Overview</span>
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-full sm:w-[180px] h-8 text-sm border-ibm-g20 bg-ibm-g10 text-ibm-black">
            <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-60" />
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {timePeriods.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bento metric cards — 1px gap creates seamless grid lines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ibm-g20">
        {isLoading ? (
          <><MetricSkeleton /><MetricSkeleton /><MetricSkeleton /><MetricSkeleton /></>
        ) : (
          <>
            {/* Revenue — white */}
            <div className="bg-white p-4 sm:p-6 md:p-8 min-h-[120px] sm:min-h-[140px] flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <p className="ibm-label">Revenue</p>
                <TrendingUp className="h-4 w-4 text-ibm-g50" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-semibold text-ibm-black tracking-tight">{formatCurrency(metrics.revenue)}</p>
                <p className="text-xs text-ibm-g50 mt-1">{getTimePeriodLabel()}</p>
              </div>
            </div>

            {/* Expenses — light gray */}
            <div className="bg-ibm-g10 p-4 sm:p-6 md:p-8 min-h-[120px] sm:min-h-[140px] flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <p className="ibm-label">Expenses</p>
                <ArrowDown className="h-4 w-4 text-ibm-g50" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-semibold text-ibm-black tracking-tight">{formatCurrency(metrics.expenses)}</p>
                <p className="text-xs text-ibm-g50 mt-1">{getTimePeriodLabel()}</p>
              </div>
            </div>

            {/* Profit/Loss — IBM blue */}
            <div className="bg-ibm-blue p-4 sm:p-6 md:p-8 min-h-[120px] sm:min-h-[140px] flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/60">
                  {metrics.profit >= 0 ? 'Profit' : 'Loss'}
                </p>
                <DollarSign className="h-4 w-4 text-white/60" />
              </div>
              <div>
                <p className={`text-2xl md:text-3xl font-semibold tracking-tight ${metrics.profit >= 0 ? 'text-white' : 'text-red-300'}`}>
                  {formatCurrency(metrics.profit)}
                </p>
                <p className="text-xs text-white/60 mt-1">{getTimePeriodLabel()}</p>
              </div>
            </div>

            {/* Cash Flow — IBM black */}
            <div className="bg-ibm-black p-4 sm:p-6 md:p-8 min-h-[120px] sm:min-h-[140px] flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/40">Cash Flow</p>
                <ArrowUp className="h-4 w-4 text-white/40" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-semibold text-white tracking-tight">{formatCurrency(metrics.cashFlow)}</p>
                <p className="text-xs text-white/40 mt-1">{getTimePeriodLabel()}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const MemoizedDashboardMetrics = memo(DashboardMetrics);

// --- Main Dashboard Page ---
export default function DashboardPage() {
  const { currentAccount, isAccountSwitching } = useAccounts() || {};

  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-ibm-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
      <Skeleton className="h-8 w-32" />
      <p className="text-base font-medium text-white">Switching account…</p>
    </div>
  );

  const DashboardSkeleton = () => (
    <div className="space-y-px">
      <div className="bg-white border border-ibm-g20 h-12" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ibm-g20">
        <MetricSkeleton /><MetricSkeleton /><MetricSkeleton /><MetricSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-px bg-ibm-g20 mt-px">
        <div className="lg:col-span-4 bg-white p-6"><Skeleton className="h-[300px]" /></div>
        <div className="lg:col-span-3 bg-ibm-g10 p-6"><Skeleton className="h-[300px]" /></div>
      </div>
    </div>
  );

  return (
    <>
      {isAccountSwitching && <LoadingOverlay />}
      <Suspense fallback={<DashboardSkeleton />}>
        <div className="space-y-4 md:space-y-6">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-ibm-black">Dashboard</h1>

          {/* KPI Bento */}
          <MemoizedDashboardMetrics />

          {/* Charts bento — 1px gap grid */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-px bg-ibm-g20">
            <div className="bg-white lg:col-span-4 p-4 sm:p-5 md:p-6">
              <p className="ibm-label mb-3 sm:mb-4">Income vs Expenses</p>
              <IncomeExpenseChart />
            </div>
            <div className="bg-ibm-g10 lg:col-span-3 p-4 sm:p-5 md:p-6">
              <p className="ibm-label mb-3 sm:mb-4">Cash Flow</p>
              <CashFlowChart />
            </div>
          </div>

          {/* Bottom bento — transactions + budget */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-px bg-ibm-g20">
            <div className="bg-white lg:col-span-4 p-4 sm:p-5 md:p-6">
              <RecentTransactions />
            </div>
            <div className="bg-ibm-g10 lg:col-span-3 p-4 sm:p-5 md:p-6">
              <BudgetOverview />
            </div>
          </div>
        </div>
      </Suspense>
    </>
  )
}
