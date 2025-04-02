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

// Helper function for currency formatting (consistent)
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export function CashFlowChart() {
  const { monthlyData, error } = useAnalytics()
  const { currentAccount } = useAccounts()
  const [chartData, setChartData] = useState<DataPoint[]>([])
  const [transformError, setTransformError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Set up real-time subscription for transactions (removed logic as per original code)
  useEffect(() => {
    if (!currentAccount) return
    return () => {}
  }, [currentAccount, supabase])

  // Transform analytics data for chart display with validation
  useEffect(() => {
    try {
      if (!monthlyData || monthlyData.length === 0 || !currentAccount) {
        setChartData([])
        setTransformError(null); // Clear previous transform error if data becomes empty
        return
      }

      const transformedData = monthlyData.map(item => {
        if (!item || typeof item.month !== 'string' ||
            typeof item.income !== 'number' ||
            typeof item.expenses !== 'number') {
          console.warn('Invalid data format encountered in monthly data:', item);
          throw new Error('Invalid data format in monthly data')
        }
        // Ensure calculation results in a valid number
        const cashFlow = Number((item.income - item.expenses).toFixed(2));
        if (isNaN(cashFlow)) {
           console.warn('NaN detected during cash flow calculation:', item);
           throw new Error('Calculation resulted in NaN');
        }
        return {
          month: item.month,
          cashFlow: cashFlow
        }
      })
      setChartData(transformedData)
      setTransformError(null) // Clear error on success
    } catch (err) {
      console.error('Error transforming data:', err)
      setTransformError(err instanceof Error ? err.message : 'Error processing chart data')
      setChartData([]) // Clear data on error
    }
  }, [monthlyData, currentAccount])

  // --- Responsive Error State ---
  if (error || transformError) {
    return (
      <div className="flex flex-col justify-center items-center text-center h-[250px] sm:h-[300px] md:h-[350px] bg-muted/5 rounded-lg border border-dashed p-4 sm:p-6 space-y-2">
        <p className="text-sm font-medium text-red-500">Error loading chart data</p>
        <p className="text-xs text-muted-foreground max-w-xs sm:max-w-sm">
          {error || transformError}
        </p>
      </div>
    )
  }

  // --- Responsive Empty State ---
  if (chartData.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center text-center h-[250px] sm:h-[300px] md:h-[350px] bg-muted/5 rounded-lg border border-dashed p-4 sm:p-6">
        <p className="text-sm sm:text-base text-muted-foreground mb-2">
          No cash flow data available
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-xs sm:max-w-sm md:max-w-md">
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

  // --- Responsive Chart ---
  return (
    // Apply responsive height to the container div
    <div className="h-[250px] sm:h-[300px] md:h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          // Add more left margin for Y-axis labels, adjust bottom for X-axis tick offset
          margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
          <XAxis
            dataKey="month"
            stroke="hsl(var(--muted-foreground))" // Use theme variable
            fontSize={11} // Slightly smaller font size for better fit on small screens
            tickLine={false}
            axisLine={false}
            interval={0} // Suggest showing all labels; recharts may thin if needed
            tick={{ dy: 5, fill: "hsl(var(--muted-foreground))" }} // Add padding below ticks & set color
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))" // Use theme variable
            fontSize={11} // Slightly smaller font size
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}`} // Use compact notation for large numbers if needed
            // Or keep original formatting if space allows:
            // tickFormatter={(value) => `$${new Intl.NumberFormat('en-US').format(value)}`}
            tick={{ fill: "hsl(var(--muted-foreground))" }} // Set tick color
            // Allow more width if needed, e.g. width={60}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
               // Use consistent formatting helper
              const formattedValue = formatCurrency(value);
              // Add +/- sign explicitly
              const displayValue = `${value >= 0 ? '+' : ''}${formattedValue}`;
              return [displayValue, "Cash Flow"]; // Return array [value, name]
            }}
            labelFormatter={(label: string) => `Month: ${label}`} // Keep label simple
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)', // Use CSS var for radius
              padding: '8px 12px', // Adjust padding
              boxShadow: 'var(--shadow-md)', // Optional: add shadow
            }}
            itemStyle={{ // Style for each item line in tooltip
                padding: '2px 0',
                fontSize: '12px'
            }}
            labelStyle={{ // Style for the label (Month: ...)
                marginBottom: '4px',
                fontSize: '13px',
                fontWeight: '500',
                color: 'hsl(var(--foreground))'
            }}
            cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Line
            type="monotone"
            dataKey="cashFlow"
            stroke="hsl(var(--primary))" // Use theme variable for line
            strokeWidth={2}
            dot={({ cx, cy, payload }) => { // Pass cx, cy for correct positioning
              const { cashFlow } = payload;
              const isPositive = cashFlow >= 0;
              // Use theme variables for dot colors
              const fillColor = isPositive ? "hsl(142.1 76.2% 46.1%)" : "hsl(0 84.2% 60.2%)"; // Example: Direct HSL for green/red if variables not available
              const strokeColor = isPositive ? "hsl(142.1 70.2% 36.1%)" : "hsl(0 74.2% 50.2%)"; // Darker stroke

              // Fallback to original if theme variables aren't setup for success/destructive
              // const fillColor = isPositive ? "#4ade80" : "#f87171";
              // const strokeColor = isPositive ? "#22c55e" : "#ef4444";

              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={1}
                />
              );
            }}
            activeDot={{
              r: 6,
              fill: "hsl(var(--primary))",
              stroke: "hsl(var(--background))", // Use background for contrast
              strokeWidth: 2
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
