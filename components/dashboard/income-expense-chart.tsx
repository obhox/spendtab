"use client"

import { useEffect, useState } from "react"
import { BarChart } from "@tremor/react"
import CountUp from "react-countup"
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
  
  // For CountUp animation - will be used to display the selected value
  const [values, setValues] = useState({
    start: 0,
    end: 0,
    label: "Select a bar to see details"
  })
  
  // Set up real-time subscription for transactions
  useEffect(() => {
    if (!currentAccount) return
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
      
      // Initialize with no specific value selected
      setValues({
        start: 0,
        end: 0,
        label: "Select a bar to see details"
      })
    } catch (err) {
      console.error('Error transforming chart data:', err)
      setChartData([])
    }
  }, [monthlyData, currentAccount, error, isAccountSwitching])

  // Value formatter for chart tooltips and axes
  const valueFormatter = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value)
  }

  // Handler for chart interactions
  function onValueChangeHandler(value) {
    if (!value) {
      // Reset to no selection
      setValues(prev => ({
        start: prev.end,
        end: 0,
        label: "Select a bar to see details"
      }))
      return
    }
    
    switch (value.eventType) {
      case 'bar':
        // When a specific bar is clicked
        setValues(prev => ({
          start: prev.end,
          end: value[value.categoryClicked],
          label: `${value.categoryClicked.charAt(0).toUpperCase() + value.categoryClicked.slice(1)} (${value.month})`
        }))
        break
        
      case 'category':
        // When a category in the legend is clicked
        const totalCategoryValue = chartData.reduce(
          (sum, dataPoint) => sum + dataPoint[value.categoryClicked], 
          0
        )
        
        setValues(prev => ({
          start: prev.end,
          end: totalCategoryValue,
          label: `Total ${value.categoryClicked.charAt(0).toUpperCase() + value.categoryClicked.slice(1)}`
        }))
        break
        
      default:
        // Reset to default - no selection
        setValues(prev => ({
          start: prev.end,
          end: 0,
          label: "Select a bar to see details"
        }))
        break
    }
  }

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
      <div className="flex flex-col justify-center items-center h-[350px] bg-gradient-to-b from-muted/5 to-muted/10 rounded-xl border border-dashed border-muted/20 p-8 space-y-4 transition-all duration-200 hover:border-muted/30">
        <div className="rounded-full bg-muted/10 p-4">
          <Plus className="h-6 w-6 text-muted-foreground/60" />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-base font-medium text-muted-foreground/80">No income or expense data</p>
          <p className="text-sm text-muted-foreground/60 max-w-md leading-relaxed">
            Start tracking your financial journey by adding income and expense transactions.
            This chart will help you visualize your financial flow over time.
          </p>
        </div>
        <Link href="/transactions">
          <Button 
            size="sm" 
            variant="outline"
            className="transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add First Transaction
          </Button>
        </Link>
      </div>
    )
  }

  // Define vibrant financial colors
  const incomeColor = "#4ade80" // bright green
  const expenseColor = "#f87171" // bright red

  return (
    <div className="p-4 w-full">
      {values.end > 0 && (
        <div className="mb-6 transition-all duration-200 ease-in-out">
          <p className="text-sm font-medium text-muted-foreground/80">
            {values.label}
          </p>
          <p 
            className="text-3xl font-bold tracking-tight transition-colors duration-200" 
            style={{ 
              color: values.label.toLowerCase().includes('income') ? incomeColor : 
                    values.label.toLowerCase().includes('expense') ? expenseColor : 'inherit' 
            }}
          >
            <CountUp 
              start={values.start} 
              end={values.end} 
              duration={0.8}
              decimals={2}
              prefix="$" 
              separator=","
              className="tabular-nums"
            />
          </p>
        </div>
      )}
      
      {/* Desktop view */}
      <div className="w-full h-[350px] transition-opacity duration-300 ease-in-out">
        <BarChart
          className="hidden h-full w-full sm:block rounded-xl"
          data={chartData}
          index="month"
          categories={["income", "expense"]}
          colors={[incomeColor, expenseColor]}
          valueFormatter={valueFormatter}
          yAxisWidth={80}
          onValueChange={(value) => onValueChangeHandler(value)}
          stack={false}
          showLegend={true}
          showAnimation={true}
          animationDuration={750}
        />
      </div>
      
      {/* Mobile view */}
      <div className="w-full h-[300px] transition-opacity duration-300 ease-in-out sm:hidden">
        <BarChart
          className="h-full w-full rounded-xl"
          data={chartData}
          index="month"
          categories={["income", "expense"]}
          colors={[incomeColor, expenseColor]}
          valueFormatter={valueFormatter}
          showYAxis={false}
          onValueChange={(value) => onValueChangeHandler(value)}
          stack={false}
          showLegend={true}
          showAnimation={true}
          animationDuration={750}
        />
      </div>
    </div>
  )
}
