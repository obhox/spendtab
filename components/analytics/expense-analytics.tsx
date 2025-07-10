"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Plus } from "lucide-react"
import { format, subMonths } from "date-fns"
import { useSelectedCurrency, formatCurrency as formatCurrencyUtil } from "@/components/currency-switcher"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, BarChart, Bar, Area, AreaChart } from "recharts"
import { useAnalyticsQuery } from "@/lib/hooks/useAnalyticsQuery"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Time period options
const timePeriods = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "12m", label: "Last 12 Months" },
  { value: "ytd", label: "Year to Date" }
];

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#00A2FF'];

export default function ExpenseAnalytics() {
  const selectedCurrency = useSelectedCurrency();
  const [timePeriod, setTimePeriod] = useState("12m");
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({ 
    startDate: subMonths(new Date(), 12),
    endDate: new Date()
  });

  // Get analytics data using the custom hook
  const { monthlyData = [], expensesByCategory = [], transactions = [], isLoading } = useAnalyticsQuery(dateRange);

  // Update date range when time period changes
  useEffect(() => {
    const now = new Date();
    let startDate = new Date();
    
    switch (timePeriod) {
      case "7d":
        startDate = subMonths(now, 0.25); // Approximately 7 days
        break;
      case "30d":
        startDate = subMonths(now, 1);
        break;
      case "90d":
        startDate = subMonths(now, 3);
        break;
      case "12m":
        startDate = subMonths(now, 12);
        break;
      case "ytd":
        startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
        break;
      default:
        startDate = subMonths(now, 12); // Default to 12 months
    }
    
    setDateRange({ startDate, endDate: now });
  }, [timePeriod]);


  // Get expense transactions and filter by time period
  const expenseTransactions = transactions
    ? transactions
        .filter(t => t.type === "expense")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return formatCurrencyUtil(value, selectedCurrency.code, selectedCurrency.symbol);
  };

  // Format percentage for tooltip
  const formatPercent = (value: number) => {
    return `${Math.round(value)}%`;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-8">Loading analytics data...</div>;
  }

  const showEmptyState = !monthlyData || monthlyData.length === 0;

  if (showEmptyState) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <h3 className="text-lg font-medium">No Expense Data Available</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Start adding transactions to see your expense analytics. 
          Add expense transactions to track your spending patterns over time.
        </p>
        <Link href="/transactions">
          <Button size="sm" variant="outline" className="mt-2">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense Transactions
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-4 mb-4">
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            {timePeriods.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:gap-6">
        <Card className="w-full">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Expense Trend</CardTitle>
            <CardDescription>Monthly expense trend over time</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 md:p-6">
            <div className="h-[200px] sm:h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -10,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{fontSize: 10}} angle={-45} textAnchor="end" height={50} />
                  <YAxis tickFormatter={(value) => `${selectedCurrency.symbol}${value/1000}k`} tick={{fontSize: 10}} width={50} />
                  <Tooltip formatter={(value) => [formatCurrencyUtil(Number(value), selectedCurrency.code, selectedCurrency.symbol), "Expense"]} />
                  <Area type="monotone" dataKey="expenses" stroke="#ff6b6b" fill="#ff6b6b" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Expenses by Category</CardTitle>
            <CardDescription>Distribution of expense categories</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 md:p-6">
            <div className="h-[200px] sm:h-[250px] md:h-[300px]">
              {expensesByCategory && expensesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, payload }) => {
                        const category = payload.category || name;
                        const percentage = Math.round(payload.percentage || 0);
                        return window.innerWidth < 768 ? `${percentage}%` : `${category}: ${percentage}%`;
                      }}
                      outerRadius={window.innerWidth < 768 ? 50 : window.innerWidth < 1024 ? 70 : 80}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="category"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend wrapperStyle={{fontSize: '10px'}} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">No expense category data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Expense Transactions</CardTitle>
            <CardDescription>Detailed list of all expense transactions</CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-2">
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap px-4 py-2 text-xs sm:text-sm">Date</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-2 text-xs sm:text-sm">Description</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-2 text-xs sm:text-sm">Category</TableHead>
                    <TableHead className="text-right whitespace-nowrap px-4 py-2 text-xs sm:text-sm">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseTransactions.length > 0 ? (
                    expenseTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="whitespace-nowrap px-4 py-2 text-xs sm:text-sm">
                          {(() => {
                            try {
                              return format(new Date(transaction.date), 'MMM d, yyyy');
                            } catch (error) {
                              return 'Invalid date';
                            }
                          })()}
                        </TableCell>
                        <TableCell className="max-w-[120px] sm:max-w-[200px] truncate px-4 py-2 text-xs sm:text-sm">{transaction.description}</TableCell>
                        <TableCell className="whitespace-nowrap px-4 py-2 text-xs sm:text-sm">{transaction.category}</TableCell>
                        <TableCell className="text-right whitespace-nowrap px-4 py-2 text-xs sm:text-sm">{formatCurrency(Math.abs(transaction.amount))}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground px-4 py-2 text-xs sm:text-sm">
                        No expense transactions available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
