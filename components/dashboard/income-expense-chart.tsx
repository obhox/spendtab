"use client"

import { useEffect, useState, useMemo } from "react"
import { BarChart } from "@tremor/react"
import CountUp from "react-countup"
import { useAnalytics } from "@/lib/context/AnalyticsContext" // Ensure path is correct
import { useAccounts } from "@/lib/context/AccountContext"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'

interface DataPoint {
  month: string // YYYY-MM format
  income: number
  expense: number
}

export function IncomeExpenseChart() {
  const { monthlyData, error, isLoading, refreshData } = useAnalytics()
  const { currentAccount, isAccountSwitching } = useAccounts()
  const [chartData, setChartData] = useState<DataPoint[]>([])

  // Memoize the Supabase client instance
  const supabase = useMemo(() => createClientComponentClient(), []) as SupabaseClient;

  // State for the interactive CountUp display
  const [values, setValues] = useState({
    start: 0,
    end: 0,
    label: "Select a bar to see details"
  })

  // Set up real-time subscription for transactions
  useEffect(() => {
    // Guard clauses
    if (!currentAccount || !supabase || !refreshData) return

    const channelName = `income-expense-changes-${currentAccount.id}`
    let channel: ReturnType<SupabaseClient['channel']> | null = null;

    try {
      channel = supabase
        .channel(channelName)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `account_id=eq.${currentAccount.id}`
          },
          (payload) => {
            // Transaction changed, trigger a data refresh via context
            // Removed console.log('Transaction change detected via Supabase RT:', payload)
            refreshData()
          }
        )
        .subscribe((status, err) => {
          // Optional: Handle specific statuses if needed for UI feedback, but avoid console logging
          if (status === 'CHANNEL_ERROR' && err) {
             // Potentially log to an external error tracking service in production
             // console.error(`Realtime channel '${channelName}' ERROR:`, err) // Removed console.error
          } else if (status === 'TIMED_OUT') {
             // Potentially handle timeout scenario
             // console.warn(`Realtime channel '${channelName}' TIMED_OUT.`) // Removed console.warn
          }
        });
    } catch (channelError) {
        // Handle potential errors during channel creation/subscription if necessary
        // console.error("Error setting up Supabase channel:", channelError); // Removed console.error
    }


    // Cleanup function
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
          .catch(err => {
             // Handle potential errors during unsubscription if necessary
             // console.error("Error unsubscribing channel:", err) // Removed console.error
          })
      }
    }
  }, [currentAccount, supabase, refreshData]);

  // Effect to transform data for the chart when monthlyData changes
  useEffect(() => {
    if (isAccountSwitching || !monthlyData || !currentAccount) {
        setChartData([])
        setValues({ start: 0, end: 0, label: "Select a bar to see details" })
        return
    }

    if (!isLoading && !isAccountSwitching && monthlyData.length === 0) {
        setChartData([]);
        setValues({ start: 0, end: 0, label: "Select a bar to see details" })
        return;
    }


    try {
      const transformedData = monthlyData.map(item => ({
        month: item.month,
        income: Number(item.income?.toFixed(2) ?? 0),
        expense: Number(item.expenses?.toFixed(2) ?? 0) // Map 'expenses' from context to 'expense'
      }));

      setChartData(transformedData);

      if (values.label === "Select a bar to see details" || values.end === 0) {
         setValues({ start: 0, end: 0, label: "Select a bar to see details"})
      }

    } catch (err) {
      // Log transformation errors to an error tracking service if needed
      // console.error('Error transforming chart data:', err); // Removed console.error
      setChartData([]);
      setValues({ start: 0, end: 0, label: "Select a bar to see details" });
    }
  }, [monthlyData, currentAccount, isAccountSwitching, isLoading]);


  // Value formatter for chart tooltips and axes
  const valueFormatter = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', // Consider making dynamic
      minimumFractionDigits: 2
    }).format(value)
  }

  // Handler for chart interactions
  const onValueChangeHandler = (value: any) => {
    if (!value) {
      setValues(prev => ({ start: prev.end, end: 0, label: "Select a bar to see details" }))
      return
    }

    const categoryKey = value.categoryClicked as 'income' | 'expense' | undefined;

    switch (value.eventType) {
      case 'bar':
        if (categoryKey && value[categoryKey] !== undefined) {
          setValues(prev => ({
            start: prev.end,
            end: Number(value[categoryKey]),
            label: `${categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)} (${value.month})`
          }))
        }
        break

      case 'category':
         if (categoryKey) {
          const totalCategoryValue = chartData.reduce(
            (sum, dataPoint) => sum + (dataPoint[categoryKey] ?? 0), 0
          )
          setValues(prev => ({
            start: prev.end,
            end: totalCategoryValue,
            label: `Total ${categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}`
          }))
        }
        break

      default:
        setValues(prev => ({ start: prev.end, end: 0, label: "Select a bar to see details" }))
        break
    }
  }

  // --- Render Logic ---

  // Display error state to the user
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[350px] bg-muted/5 rounded-lg border border-dashed border-red-500/50 p-4 space-y-2">
        <p className="text-sm font-medium text-red-600">Error loading chart data</p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    )
  }

  // Display loading state
  if (isLoading || isAccountSwitching) {
       return (
         <div className="flex flex-col justify-center items-center h-[350px] bg-muted/5 rounded-xl border border-dashed border-muted/20 p-8 space-y-4">
             <p className="text-sm text-muted-foreground">Loading chart data...</p>
             {/* Optional: Add a spinner component here */}
         </div>
       );
  }

  // Display empty state when no data is available after loading
  if (chartData.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[350px] bg-gradient-to-b from-muted/5 to-muted/10 rounded-xl border border-dashed border-muted/20 p-8 space-y-4 transition-all duration-200 hover:border-muted/30">
        <div className="rounded-full bg-muted/10 p-4">
          <Plus className="h-6 w-6 text-muted-foreground/60" />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-base font-medium text-muted-foreground/80">No income or expense data yet</p>
          <p className="text-sm text-muted-foreground/60 max-w-md leading-relaxed">
            Add transactions for the selected period to visualize your cash flow.
          </p>
        </div>
        <Link href="/transactions">
          <Button
            size="sm"
            variant="outline"
            className="transition-all duration-200 hover:bg-primary hover:text-primary-foreground focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </Link>
      </div>
    )
  }

  // Define colors
  const incomeColor = "emerald"
  const expenseColor = "red"

  // Render the chart and interactive display
  return (
    <div className="p-4 w-full bg-card rounded-xl shadow-sm border border-border/50">
      {/* Interactive CountUp Display */}
      <div className="h-16 mb-4 sm:mb-6 transition-all duration-300 ease-in-out">
        {values.end > 0 || values.label !== "Select a bar to see details" ? (
          <>
            <p className="text-sm sm:text-base font-medium text-muted-foreground/90 truncate">
              {values.label}
            </p>
            <p
              className={`text-2xl sm:text-3xl font-bold tracking-tight transition-colors duration-200 tabular-nums ${
                values.label.toLowerCase().includes('income') ? 'text-emerald-600' :
                values.label.toLowerCase().includes('expense') ? 'text-red-600' : 'text-foreground'
              }`}
            >
              <CountUp
                start={values.start}
                end={values.end}
                duration={0.8}
                decimals={2}
                prefix="$"
                separator=","
              />
            </p>
          </>
        ) : (
           <p className="text-sm sm:text-base font-medium text-muted-foreground/70 pt-1">
             {values.label}
           </p>
        )}
      </div>

      {/* Chart Area */}
      {/* Desktop/Tablet */}
      <div className="hidden sm:block w-full h-[250px] md:h-[300px] transition-opacity duration-300 ease-in-out">
        <BarChart
          className="h-full w-full"
          data={chartData}
          index="month"
          categories={["income", "expense"]}
          colors={[incomeColor, expenseColor]}
          valueFormatter={valueFormatter}
          yAxisWidth={70}
          onValueChange={onValueChangeHandler}
          stack={false}
          showLegend={true}
          showAnimation={true}
          animationDuration={750}
          showGridLines={true}
        />
      </div>

      {/* Mobile */}
      <div className="sm:hidden w-full h-[220px] transition-opacity duration-300 ease-in-out">
        <BarChart
          className="h-full w-full"
          data={chartData}
          index="month"
          categories={["income", "expense"]}
          colors={[incomeColor, expenseColor]}
          valueFormatter={valueFormatter}
          yAxisWidth={60}
          onValueChange={onValueChangeHandler}
          stack={false}
          showLegend={true}
          showAnimation={true}
          animationDuration={750}
          showGridLines={true}
        />
      </div>
    </div>
  )
}
