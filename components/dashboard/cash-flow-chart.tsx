"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { useAnalytics } from "@/lib/context/AnalyticsContext"
import { useAccounts } from "@/lib/context/AccountContext"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface DataPoint {
  month: string
  cashFlow: number
}

export function CashFlowChart() {
  const { monthlyData, error } = useAnalytics()
  const { currentAccount } = useAccounts()
  const [chartData, setChartData] = useState<DataPoint[]>([])
  const [transformError, setTransformError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  
  // Set up real-time subscription for transactions
  useEffect(() => {
    if (!currentAccount) return

    // Removed realtime subscription - data will be updated through context
    return () => {}

  }, [currentAccount, supabase])
  
  // Transform analytics data for chart display with validation
  useEffect(() => {
    try {
      // Reset chart data when no data is available
      if (!monthlyData || monthlyData.length === 0 || !currentAccount) {
        setChartData([])
        return
      }

      const transformedData = monthlyData.map(item => {
        if (!item || typeof item.month !== 'string' || 
            typeof item.income !== 'number' || 
            typeof item.expenses !== 'number') {
          throw new Error('Invalid data format in monthly data')
        }
        return {
          month: item.month,
          cashFlow: Number((item.income - item.expenses).toFixed(2))
        }
      })
      setChartData(transformedData)
      setTransformError(null)
    } catch (err) {
      console.error('Error transforming data:', err)
      setTransformError(err instanceof Error ? err.message : 'Error processing chart data')
      setChartData([])
    }
  }, [monthlyData, currentAccount])

  if (error || transformError) {
    return (
      <div className="flex flex-col justify-center items-center h-[350px] bg-muted/5 rounded-lg border border-dashed space-y-2">
        <p className="text-sm font-medium text-red-500">Error loading chart data</p>
        <p className="text-xs text-muted-foreground">{error || transformError}</p>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[350px] bg-muted/5 rounded-lg border border-dashed p-4">
        <p className="text-muted-foreground mb-2">No cash flow data available</p>
        <p className="text-xs text-muted-foreground mb-6 max-w-md text-center">
          Add income and expense transactions to see your cash flow trends over time.
          This chart will help you track your business liquidity and financial health.
        </p>
        <Link href="/transactions">
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
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
          formatter={(value: number) => [
            `${value >= 0 ? '+' : ''}${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(value)}`, 
            "Cash Flow"
          ]}
          labelFormatter={(label) => `Month: ${label}`}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
            borderRadius: '6px',
            padding: '8px'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="cashFlow"
          stroke="#6366f1" 
          strokeWidth={2}
          dot={({ payload }) => {
            const { cashFlow } = payload;
            return (
              <circle 
                r={4} 
                fill={cashFlow >= 0 ? "#4ade80" : "#f87171"} 
                stroke={cashFlow >= 0 ? "#22c55e" : "#ef4444"} 
                strokeWidth={1}
              />
            );
          }}
          activeDot={{
            r: 6,
            fill: "#6366f1",
            stroke: "#4f46e5",
            strokeWidth: 2
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
