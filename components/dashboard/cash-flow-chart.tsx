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
  // Handle potential non-number inputs gracefully
  if (typeof value !== 'number' || isNaN(value)) {
    value = 0;
  }
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
  const supabase = createClientComponentClient() // Initialize Supabase client

  // Removed realtime subscription logic as per original code
  useEffect(() => {
    if (!currentAccount) return
    // No subscription needed here based on context setup
    return () => {} // Cleanup function
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
        // Add stronger validation
        if (!item || typeof item.month !== 'string' ||
            typeof item.income !== 'number' || isNaN(item.income) ||
            typeof item.expenses !== 'number' || isNaN(item.expenses)) {
          console.warn('Invalid data format encountered in monthly data:', item);
          throw new Error('Invalid data format in monthly data');
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
  }, [monthlyData, currentAccount]) // Dependencies for transformation

  // --- Responsive Error State ---
  // Uses responsive height matching the chart container
  if (error || transformError) {
    return (
      <div className="flex flex-col justify-center items-center text-center h-[220px] sm:h-[300px] md:h-[350px] bg-muted/5 rounded-lg border border-dashed p-4 sm:p-6 space-y-2">
        <p className="text-sm font-medium text-red-500">Error loading chart data</p>
        {/* Adjusted max-width for better text flow */}
        <p className="text-xs text-muted-foreground max-w-[90%] sm:max-w-sm">
          {error || transformError}
        </p>
      </div>
    )
  }

  // --- Responsive Empty State ---
  // Uses responsive height matching the chart container
  if (chartData.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center text-center h-[220px] sm:h-[300px] md:h-[350px] bg-muted/5 rounded-lg border border-dashed p-4 sm:p-6">
        <p className="text-sm sm:text-base text-muted-foreground mb-2">
          No cash flow data available
        </p>
        {/* Adjusted max-width for better text flow */}
        <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-[90%] sm:max-w-sm md:max-w-md">
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
    // Reduced base height slightly to 220px
    <div className="h-[220px] sm:h-[300px] md:h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          // Minimal margins, adjusted left slightly for Y-axis labels
          margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" /> {/* Use border color */}
          <XAxis
            dataKey="month"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11} // Keep small for mobile
            tickLine={false}
            axisLine={false}
            interval={0} // Suggest all ticks
            tick={{ dy: 5, fill: "hsl(var(--muted-foreground))" }} // Padding and color
            height={25} // Explicit height for axis area if needed
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={11} // Keep small for mobile
            tickLine={false}
            axisLine={false}
            // Use compact notation for Y-axis labels on all sizes for consistency & space saving
            tickFormatter={(value) => `$${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}`}
            tick={{ fill: "hsl(var(--muted-foreground))" }} // Color
            width={45} // Slightly increase width for Y-axis labels like "$1.5K"
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const formattedValue = formatCurrency(value);
              const displayValue = `${value >= 0 ? '+' : ''}${formattedValue}`;
              return [displayValue, "Cash Flow"]; // Tooltip value and label
            }}
            labelFormatter={(label: string) => `Month: ${label}`} // Tooltip title
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)',
              padding: '8px 12px', // Standard padding
              boxShadow: 'var(--shadow-md)',
            }}
            itemStyle={{ padding: '2px 0', fontSize: '12px' }}
            labelStyle={{ marginBottom: '4px', fontSize: '13px', fontWeight: '500', color: 'hsl(var(--foreground))' }}
            cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Line
            type="monotone"
            dataKey="cashFlow"
            stroke="hsl(var(--primary))" // Use theme primary color
            strokeWidth={2}
            dot={({ cx, cy, payload }) => { // Custom dot rendering
              // Added check for payload existence
              if (!payload) return null;
              const { cashFlow } = payload;
               // Ensure cashFlow is a number before comparison
              const isPositive = typeof cashFlow === 'number' && cashFlow >= 0;
              // Define colors (using direct HSL as robust fallback, replace with theme vars if available)
              // Example: hsl(var(--success)) or hsl(var(--destructive))
              const fillColor = isPositive ? "hsl(142.1 76.2% 46.1%)" : "hsl(0 84.2% 60.2%)"; // Green : Red
              const strokeColor = isPositive ? "hsl(142.1 70.2% 36.1%)" : "hsl(0 74.2% 50.2%)"; // Darker stroke

              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4} // Dot radius
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={1}
                />
              );
            }}
            activeDot={{ // Style for dot when hovered
              r: 6,
              fill: "hsl(var(--primary))",
              stroke: "hsl(var(--background))", // Use background for contrast border
              strokeWidth: 2
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
