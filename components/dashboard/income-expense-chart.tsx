"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { useAnalytics } from "@/lib/context/AnalyticsContext"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface DataPoint {
  month: string
  income: number
  expense: number
}

export function IncomeExpenseChart() {
  const { monthlyData, isLoading } = useAnalytics()
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  
  // Transform analytics data for chart display
  useEffect(() => {
    if (monthlyData.length > 0) {
      const transformedData = monthlyData.map(item => ({
        month: item.month,
        income: item.income,
        expense: item.expenses
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
        <p className="text-muted-foreground mb-2">No income or expense data available</p>
        <p className="text-xs text-muted-foreground mb-6 max-w-md">
          Add income and expense transactions to see your financial comparison chart. 
          This chart will help you visualize and track income vs expenses over time.
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
      <BarChart data={chartData}>
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
          formatter={(value: number) => [`$${value}`, ""]}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#4ade80" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="#f87171" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
