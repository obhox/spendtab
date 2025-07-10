"use client"

import React, { useEffect, useState } from "react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useAccounts } from "@/lib/context/AccountContext"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { useReportQuery } from "@/lib/hooks/useReportQuery"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useSelectedCurrency, formatCurrency as formatCurrencyUtil } from "@/components/currency-switcher"
// Ensure date-fns functions are available
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  startOfQuarter, 
  endOfQuarter, 
  subQuarters, 
  startOfYear, 
  endOfYear 
} from "date-fns"

// Types for cash flow data
interface CashFlowCategory {
  name: string
  amount: number
  subItems?: { name: string; amount: number }[]
}

interface CashFlowData {
  period: string
  startingBalance: number
  cashIn: CashFlowCategory[]
  cashOut: CashFlowCategory[]
  totalCashIn: number
  totalCashOut: number
  netCashFlow: number
  endingBalance: number
  monthlyCashFlow: { month: string; cashIn: number; cashOut: number; netFlow: number }[]
}

// Financial period options
const financialPeriods = [
  { value: "current-month", label: "Current Month" },
  { value: "previous-month", label: "Previous Month" },
  { value: "current-quarter", label: "Current Quarter" },
  { value: "previous-quarter", label: "Previous Quarter" },
  { value: "ytd", label: "Year to Date" },
  { value: "previous-year", label: "Previous Year" }
];

export function CashFlowReport() {
  // Define getPeriodDateRange before using it
  const getPeriodDateRange = (period: string): { startDate: Date, endDate: Date } => {
    const now = new Date();
    
    // Mapping of period values to date range calculations
    const periodMap: Record<string, () => { startDate: Date, endDate: Date }> = {
      "current-month": () => ({
        startDate: startOfMonth(now),
        endDate: endOfMonth(now)
      }),
      "previous-month": () => {
        const prevMonth = subMonths(now, 1);
        return {
          startDate: startOfMonth(prevMonth),
          endDate: endOfMonth(prevMonth)
        };
      },
      "current-quarter": () => ({
        startDate: startOfQuarter(now),
        endDate: endOfQuarter(now)
      }),
      "previous-quarter": () => {
        const prevQuarter = subQuarters(now, 1);
        return {
          startDate: startOfQuarter(prevQuarter),
          endDate: endOfQuarter(prevQuarter)
        };
      },
      "ytd": () => ({
        startDate: startOfYear(now),
        endDate: now
      }),
      "previous-year": () => {
        const prevYear = new Date(now.getFullYear() - 1, 0, 1);
        return {
          startDate: startOfYear(prevYear),
          endDate: endOfYear(prevYear)
        };
      }
    };
    
    // Get date range using the mapping or return a default
    const getRangeFn = periodMap[period];
    if (!getRangeFn) {
      console.warn(`Unknown period: ${period}, using current quarter as default`);
      return periodMap["current-quarter"]();
    }
    
    return getRangeFn();
  };

  const [dateRange, setDateRange] = useState(getPeriodDateRange("current-quarter"));
  const { currentAccount } = useAccounts();
  const { cashFlowData, isLoading, refetch: refreshData } = useReportQuery(
    new Date(dateRange.startDate),
    new Date(dateRange.endDate)
  );
  // Initialize with "current-quarter" to match the default in ReportsContext
  const [selectedPeriod, setSelectedPeriod] = useState("current-quarter");
  const [error, setError] = useState<string | null>(null);
  const selectedCurrency = useSelectedCurrency();
  
  // Format currency value
  const formatCurrency = (value: number): string => {
    return formatCurrencyUtil(value, selectedCurrency.code, selectedCurrency.symbol);
  };
  
  // Validate a date range to ensure it contains valid dates
  const validateDateRange = (range: { startDate: Date, endDate: Date }) => {
    if (!(range.startDate instanceof Date) || isNaN(range.startDate.getTime())) {
      throw new Error("Invalid start date");
    }
    if (!(range.endDate instanceof Date) || isNaN(range.endDate.getTime())) {
      throw new Error("Invalid end date");
    }
    if (range.startDate > range.endDate) {
      throw new Error("Start date must be before end date");
    }
    return range;
  };

  // Handle period change with improved error handling
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    try {
      // Get and validate the date range
      const newDateRange = validateDateRange(getPeriodDateRange(value));
      
      // Update the context with the new range
      setDateRange(newDateRange);
      setError(null);
    } catch (err) {
      console.error("Error updating date range:", err);
      setError(`Failed to update date range: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8" aria-live="polite" role="status">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading report data...</p>
        </div>
      </div>
    );
  }

  // Display error state if there's an error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4 text-red-500" role="alert">
        <AlertTriangle size={32} />
        <h3 className="text-lg font-medium">Error Loading Data</h3>
        <p>{error}</p>
        <Button onClick={() => refreshData()} variant="outline">Retry</Button>
      </div>
    );
  }

  // Display empty state if no data
  const showEmptyState = !cashFlowData;
  if (showEmptyState) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <h3 className="text-lg font-medium">No Cash Flow Data Available</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Start adding income and expense transactions to generate your cash flow report.
          This report will help you track money moving in and out of your business over time.
        </p>
        <Link href="/transactions">
          <Button size="sm" variant="outline" className="mt-2" aria-label="Add transactions">
            <Plus className="mr-2 h-4 w-4" />
            Add Transactions
          </Button>
        </Link>
      </div>
    );
  }

  // Safely access data properties with null checks
  const safeData = {
    period: cashFlowData?.period || "Unknown Period",
    startingBalance: cashFlowData?.startingBalance || 0,
    cashIn: cashFlowData?.cashIn || [],
    cashOut: cashFlowData?.cashOut || [],
    totalCashIn: cashFlowData?.totalCashIn || 0,
    totalCashOut: cashFlowData?.totalCashOut || 0,
    netCashFlow: cashFlowData?.netCashFlow || 0,
    endingBalance: cashFlowData?.endingBalance || 0,
    monthlyCashFlow: cashFlowData?.monthlyCashFlow || []
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Period: {safeData.period}</h3>
        </div>
        <Select 
          value={selectedPeriod} 
          onValueChange={handlePeriodChange} 
          aria-label="Select time period"
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {financialPeriods.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cash Flow Chart */}
      <div className="rounded-md border p-4">
        <h3 className="mb-4 text-lg font-medium">Cash Flow Trend</h3>
        <div className="h-[300px]">
          {safeData.monthlyCashFlow.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={safeData.monthlyCashFlow}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${selectedCurrency.symbol}${value / 1000}k`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="cashIn" 
                  name="Cash In" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3} 
                />
                <Area 
                  type="monotone" 
                  dataKey="cashOut" 
                  name="Cash Out" 
                  stroke="#ff6b6b" 
                  fill="#ff6b6b" 
                  fillOpacity={0.3} 
                />
                <Area 
                  type="monotone" 
                  dataKey="netFlow" 
                  name="Net Flow" 
                  stroke="#4ade80" 
                  fill="#4ade80" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No monthly data available for the selected period</p>
            </div>
          )}
        </div>
      </div>

      {/* Cash Flow Statement */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60%]">Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Starting Balance */}
            <TableRow className="bg-muted/50">
              <TableCell className="font-medium">Starting Balance</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(safeData.startingBalance)}</TableCell>
            </TableRow>
            
            {/* Cash In Section */}
            <TableRow className="bg-muted/50">
              <TableCell className="font-medium">Cash Inflows</TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>
            
            {safeData.cashIn.length > 0 ? (
              safeData.cashIn.map((category, idx) => (
                <React.Fragment key={`cash-in-${idx}`}>
                  <TableRow>
                    <TableCell className="pl-6 font-medium">{category.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(category.amount)}</TableCell>
                  </TableRow>
                  {category.subItems?.map((subItem, subIdx) => (
                    <TableRow key={`cash-in-sub-${idx}-${subIdx}`} className="text-sm text-muted-foreground">
                      <TableCell className="pl-10">{subItem.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(subItem.amount)}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">No cash inflows recorded</TableCell>
              </TableRow>
            )}
            
            <TableRow className="font-medium">
              <TableCell>
                <span className="text-green-600">Total Cash In</span>
                <span className="sr-only">(positive value)</span>
              </TableCell>
              <TableCell className="text-right text-green-600">{formatCurrency(safeData.totalCashIn)}</TableCell>
            </TableRow>
            
            {/* Cash Out Section */}
            <TableRow className="bg-muted/50">
              <TableCell className="font-medium">Cash Outflows</TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>
            
            {safeData.cashOut.length > 0 ? (
              safeData.cashOut.map((category, idx) => (
                <React.Fragment key={`cash-out-${idx}`}>
                  <TableRow>
                    <TableCell className="pl-6 font-medium">{category.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(category.amount)}</TableCell>
                  </TableRow>
                  {category.subItems?.map((subItem, subIdx) => (
                    <TableRow key={`cash-out-sub-${idx}-${subIdx}`} className="text-sm text-muted-foreground">
                      <TableCell className="pl-10">{subItem.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(subItem.amount)}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">No cash outflows recorded</TableCell>
              </TableRow>
            )}
            
            <TableRow className="font-medium">
              <TableCell>
                <span className="text-red-600">Total Cash Out</span>
                <span className="sr-only">(negative value)</span>
              </TableCell>
              <TableCell className="text-right text-red-600">{formatCurrency(safeData.totalCashOut)}</TableCell>
            </TableRow>
            
            {/* Summary Section */}
            <TableRow className="bg-muted/50">
              <TableCell className="font-medium">Summary</TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>
            
            <TableRow className="font-medium">
              <TableCell>
                <span>Net Cash Flow</span>
                <span className="sr-only">{safeData.netCashFlow >= 0 ? "(positive value)" : "(negative value)"}</span>
              </TableCell>
              <TableCell className={`text-right ${safeData.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(safeData.netCashFlow)}
              </TableCell>
            </TableRow>
            
            <TableRow className="font-medium text-lg">
              <TableCell>Ending Balance</TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(safeData.endingBalance)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>This report shows the flow of cash in and out of your business over the selected period. 
        It tracks operating, investing, and financing activities to help you understand your 
        business's cash position and liquidity.</p>
      </div>
    </div>
  );
}