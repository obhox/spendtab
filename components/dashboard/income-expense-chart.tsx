"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { useAnalytics } from "@/lib/context/AnalyticsContext"
import { useAccounts } from "@/lib/context/AccountContext"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface DataPoint {
  month: string
  income: number
  expense: number
}

export function IncomeExpenseChart() {
  const { monthlyData, error } = useAnalytics()
  const { currentAccount, isAccountSwitching } = useAccounts()
  const [chartData, setChartData] = useState<DataPoint[]>([])
  const supabase = createClientComponentClient()
  
  // Set up real-time subscription for transactions
  useEffect(() => {
    if (!currentAccount) return

    // Removed realtime subscription - data will be updated through context
    return () => {}

  }, [currentAccount, supabase])
  
  useEffect(() => {
    // Reset chart data during account switching
    if (isAccountSwitching) {
      return
    }

    // Reset chart data when no data is available
    if (!monthlyData || monthlyData.length === 0 || !currentAccount) {
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
  }, [monthlyData, currentAccount, error, isAccountSwitching])


  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[350px] bg-muted/5 rounded-lg border border-dashed space-y-2">
        <p className="text-sm font-medium text-red-500">Error loading chart data</p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[350px] bg-muted/5 rounded-lg border border-dashed p-4 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">No income or expense data available</p>
        <p className="text-xs text-muted-foreground text-center max-w-md">
          Add income and expense transactions to see your financial comparison chart. 
          This chart will help you visualize and track income vs expenses over time.
        </p>
        <Link href="/transactions" className="mt-4">
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Transactions
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
        <XAxis 
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${new Intl.NumberFormat('en-US').format(value)}`}
        />
        <Tooltip 
          formatter={(value: number, name: string) => [
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2
            }).format(value), 
            name.charAt(0).toUpperCase() + name.slice(1)
          ]}
          labelFormatter={(label) => `Month: ${label}`}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
            borderRadius: '6px'
          }}
        />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
