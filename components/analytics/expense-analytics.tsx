"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Plus } from "lucide-react"
import { format, subMonths } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, BarChart, Bar, Area, AreaChart } from "recharts"
import { useAnalytics } from "@/lib/context/AnalyticsContext"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTransactions } from "@/lib/context/TransactionContext"

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
  const { monthlyData, expensesByCategory, financialSummary, isLoading, setDateRange } = useAnalytics();
  const { transactions } = useTransactions();
  const [timePeriod, setTimePeriod] = useState("");
  
  // Initialize time period on client-side to avoid hydration mismatch
  useEffect(() => {
    setTimePeriod("12m");
  }, []);
  
  // Update date range when time period changes
  useEffect(() => {
    if (!timePeriod) return;
    
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
  }, [timePeriod, setDateRange]);

  // Get expense transactions and filter by time period
  const expenseTransactions = transactions
    ? transactions
        .filter(t => t.type === "expense")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Format percentage for tooltip
  const formatPercent = (value: number) => {
    return `${value}%`;
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
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-[180px]">
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

      <Card>
        <CardHeader>
          <CardTitle>Expense Trend</CardTitle>
          <CardDescription>Monthly expense trend over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Expense"]} />
                <Area type="monotone" dataKey="expenses" stroke="#ff6b6b" fill="#ff6b6b" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription>Distribution of expense categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {expensesByCategory && expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, payload }) => {
                      // Use the correct property names based on the data structure
                      const category = payload.category || name;
                      const percentage = payload.percentage || 0;
                      return `${category}: ${formatPercent(percentage).replace('$', '')}`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="category"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
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

      <Card>
        <CardHeader>
          <CardTitle>Expense Transactions</CardTitle>
          <CardDescription>Detailed list of all expense transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseTransactions.length > 0 ? (
                  expenseTransactions.map((transaction, index) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {(() => {
                        try {
                          return format(new Date(transaction.date), 'MMM d, yyyy');
                        } catch (error) {
                          return 'Invalid date';
                        }
                      })()}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Math.abs(transaction.amount))}</TableCell>
                  </TableRow>
                ))) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
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
  );
}
