"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { useAnalytics } from "@/lib/context/AnalyticsContext"
import { useAccounts } from "@/lib/context/AccountContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card" // Assuming shadcn/ui Card
import { Plus, AlertTriangle, BarChart as BarChartIcon } from "lucide-react" // Added icons
import Link from "next/link"
import { createBrowserClient } from '@supabase/ssr'

interface DataPoint {
  month: string
  income: number
  expense: number
}

// Custom Tooltip Component for better styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const incomeData = payload.find((p: any) => p.dataKey === 'income');
    const expenseData = payload.find((p: any) => p.dataKey === 'expense');

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', // Or get from context/config if dynamic
      minimumFractionDigits: 2
    }).format(value);

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="mb-1 text-sm font-medium">{`Month: ${label}`}</p>
        {incomeData && (
          <div className="flex items-center text-sm text-green-600 dark:text-green-400">
             <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
             {`${incomeData.name}: ${formatCurrency(incomeData.value)}`}
          </div>
        )}
        {expenseData && (
         <div className="flex items-center text-sm text-red-600 dark:text-red-400">
            <span className="mr-2 h-2 w-2 rounded-full bg-red-500"></span>
            {`${expenseData.name}: ${formatCurrency(expenseData.value)}`}
          </div>
        )}
      </div>
    );
  }
  return null;
};


export function IncomeExpenseChart() {
  const { monthlyData, error: analyticsError, isLoading: isLoadingAnalytics } = useAnalytics() // Added isLoading
  const { currentAccount, isAccountSwitching } = useAccounts()
  const [chartData, setChartData] = useState<DataPoint[]>([])
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Set up real-time subscription (no changes needed here)
  useEffect(() => {
    if (!currentAccount) return
    const channel = supabase
      .channel('income-expense-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `account_id=eq.${currentAccount.id}`
        },
        () => {
          // AnalyticsContext should handle refetching
        }
      )
      .subscribe()
    return () => {
      channel.unsubscribe()
    }
  }, [currentAccount, supabase])

  // Data Transformation (no changes needed here)
  useEffect(() => {
    if (isAccountSwitching || isLoadingAnalytics) {
       setChartData([]) // Clear data while loading/switching
      return
    }
    if (!monthlyData || monthlyData.length === 0 || !currentAccount || analyticsError) {
      setChartData([])
      return
    }
    try {
      const transformedData = monthlyData.map(item => ({
        month: item.month,
        income: Number(item.income.toFixed(2)),
        expense: Number(item.expenses.toFixed(2))
      }))
      setChartData(transformedData)
    } catch (err) {
      console.error('Error transforming chart data:', err)
      setChartData([])
    }
  }, [monthlyData, currentAccount, analyticsError, isAccountSwitching, isLoadingAnalytics])

  const renderContent = () => {
    if (isAccountSwitching || isLoadingAnalytics) {
      // Optional: Add a Skeleton Loader here for better UX
      return (
        <div className="flex h-[350px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )
    }

    if (analyticsError) {
      return (
        <div className="flex flex-col justify-center items-center h-[350px] space-y-3 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <p className="text-base font-medium text-destructive">Error loading chart data</p>
          <p className="text-sm text-muted-foreground max-w-xs">{analyticsError}</p>
        </div>
      )
    }

    if (chartData.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-[350px] space-y-3 text-center">
          <BarChartIcon className="h-10 w-10 text-muted-foreground" />
          <p className="text-base font-medium text-muted-foreground">No income or expense data yet</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Add transactions to visualize your income versus expenses over time.
          </p>
          <Link href="/transactions" className="mt-4">
            <Button size="sm"> {/* Removed outline variant for primary action */}
              <Plus className="mr-2 h-4 w-4" />
              Add Transactions
            </Button>
          </Link>
        </div>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--border))" // Use theme border color
          />
          <XAxis
            dataKey="month"
            stroke="hsl(var(--muted-foreground))" // Use theme muted color
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={5} // Adjust vertical position
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${new Intl.NumberFormat('en-US', { notation: "compact" , maximumFractionDigits: 1 }).format(value)}`} // Compact notation for cleaner axis
            width={60} // Give Y Axis labels some space
            dx={-5} // Adjust horizontal position
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.1 }} // Subtle hover effect
            content={<CustomTooltip />} // Use custom styled tooltip
          />
          {/* Removed Legend for cleaner look, Tooltip provides info */}
          {/* <Legend /> */}
          <Bar
             dataKey="income"
             name="Income"
             fill="hsl(var(--chart-positive))" // Use CSS variable for themeable color (define in global css)
             radius={[4, 4, 0, 0]}
             maxBarSize={40} // Optional: Limit bar width
           />
          <Bar
            dataKey="expense"
            name="Expense"
            fill="hsl(var(--chart-negative))" // Use CSS variable for themeable color (define in global css)
            radius={[4, 4, 0, 0]}
            maxBarSize={40} // Optional: Limit bar width
          />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Card>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  )
}

// Add these CSS Variables to your global CSS file (e.g., app/globals.css)
/*
:root {
  --chart-positive: 142 76% 36%; // Green HSL
  --chart-negative: 0 72% 51%; // Red HSL
}

.dark {
  --chart-positive: 142 71% 41%; // Darker Green HSL for dark mode
  --chart-negative: 0 84% 60%; // Lighter Red HSL for dark mode
}
*/

// Make sure you have Card components imported/available
// npm install @radix-ui/react-slot class-variance-authority clsx lucide-react tailwind-merge tailwindcss-animate
// npx shadcn-ui@latest add card button
