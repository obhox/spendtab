"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { useAnalytics } from "@/lib/context/AnalyticsContext"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface DataPoint {
  month: string
  cashFlow: number
}

export function CashFlowChart() {
  const { monthlyData, isLoading } = useAnalytics()
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  
  // Transform analytics data for chart display
  useEffect(() => {
    if (monthlyData.length > 0) {
      const transformedData = monthlyData.map(item => ({
        month: item.month,
        cashFlow: item.income - item.expenses // Calculate net cash flow
      }));
      setChartData(transformedData);
    }
  }, [monthlyData]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-[350px]">Loading chart data...</div>
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[350px] text-center p-4">
        <p className="text-muted-foreground mb-2">No cash flow data available</p>
        <p className="text-xs text-muted-foreground mb-6 max-w-md">
          Add income and expense transactions to see your cash flow trends over time.
          This chart will help you track your business liquidity and financial health.
        </p>
        <Link href="/dashboard/transactions">
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
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          formatter={(value: number) => [`$${value}`, "Cash Flow"]}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Line 
          type="monotone" 
          dataKey="cashFlow"
          stroke="#6366f1" 
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
