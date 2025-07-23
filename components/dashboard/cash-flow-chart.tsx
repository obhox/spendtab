"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { useAnalytics } from "@/lib/context/AnalyticsContext"
import { useAccounts } from "@/lib/context/AccountContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, AlertTriangle, TrendingUp } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from '@supabase/ssr'
import { useSelectedCurrency, formatCurrency as formatCurrencyUtil } from "@/components/currency-switcher"

interface DataPoint {
  month: string
  cashFlow: number
}

// Custom Tooltip Component for better styling
const CustomTooltip = ({ active, payload, label, selectedCurrency }: any) => {
  if (active && payload && payload.length) {
    const cashFlowData = payload[0];

    const formatCurrency = (value: number) => formatCurrencyUtil(value, selectedCurrency.code, selectedCurrency.symbol);

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="mb-1 text-sm font-medium">{`Month: ${label}`}</p>
        <div className={`flex items-center text-sm ${cashFlowData.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          <span className={`mr-2 h-2 w-2 rounded-full ${cashFlowData.value >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {`Cash Flow: ${formatCurrency(cashFlowData.value)}`}
        </div>
      </div>
    );
  }
  return null;
};

export function CashFlowChart() {
  const { monthlyData, error: analyticsError, isLoading: isLoadingAnalytics } = useAnalytics()
  const { currentAccount, isAccountSwitching } = useAccounts()
  const selectedCurrency = useSelectedCurrency()
  const [chartData, setChartData] = useState<DataPoint[]>([])
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Set up real-time subscription
  useEffect(() => {
    if (!currentAccount) return
    const channel = supabase
      .channel('cash-flow-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `account_id=eq.${currentAccount.id}`
        },
        () => {
          // AnalyticsContext handles refetching
        }
      )
      .subscribe()
    return () => {
      channel.unsubscribe()
    }
  }, [currentAccount, supabase])

  // Data Transformation
  useEffect(() => {
    if (isAccountSwitching || isLoadingAnalytics) {
      setChartData([])
      return
    }
    if (!monthlyData || monthlyData.length === 0 || !currentAccount || analyticsError) {
      setChartData([])
      return
    }
    try {
      const transformedData = monthlyData.map(item => ({
        month: item.month,
        cashFlow: Number((item.income - item.expenses).toFixed(2))
      }))
      setChartData(transformedData)
    } catch (err) {
      console.error('Error transforming chart data:', err)
      setChartData([])
    }
  }, [monthlyData, currentAccount, analyticsError, isAccountSwitching, isLoadingAnalytics])

  const renderContent = () => {
    if (isAccountSwitching || isLoadingAnalytics) {
      return (
        <div className="flex h-[250px] sm:h-[300px] md:h-[350px] items-center justify-center">
          <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )
    }

    if (analyticsError) {
      return (
        <div className="flex flex-col justify-center items-center h-[250px] sm:h-[300px] md:h-[350px] space-y-3 text-center">
          <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-destructive" />
          <p className="text-sm sm:text-base font-medium text-destructive">Error loading chart data</p>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">{analyticsError}</p>
        </div>
      )
    }

    if (chartData.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-[250px] sm:h-[300px] md:h-[350px] space-y-3 text-center px-4">
          <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
          <p className="text-sm sm:text-base font-medium text-muted-foreground">No cash flow data yet</p>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
            Add transactions to visualize your cash flow over time.
          </p>
          <Link href="/transactions" className="mt-4">
            <Button size="sm">
              <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Add Transactions</span>
            </Button>
          </Link>
        </div>
      )
    }

    return (
      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <AreaChart 
          data={chartData} 
          margin={{ 
            top: 5, 
            right: 5, 
            left: 5, 
            bottom: 5 
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--border))"
          />
          <XAxis
            dataKey="month"
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dy={5}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${selectedCurrency.symbol}${new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(value)}`}
            width={45}
            dx={-5}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.1 }}
            content={(props) => <CustomTooltip {...props} selectedCurrency={selectedCurrency} />}
          />
          <defs>
            <linearGradient id="cashFlowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="cashFlow"
            stroke="hsl(var(--primary))"
            fill="url(#cashFlowGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return renderContent()
}