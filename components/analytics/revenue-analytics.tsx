"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTransactions } from "@/lib/context/TransactionContext"
import { useAnalytics } from "@/lib/context/AnalyticsContext"
import { format, subMonths, isWithinInterval } from "date-fns"
import { useSelectedCurrency, formatCurrency as formatCurrencyUtil } from "@/components/currency-switcher"

// Time period options
const timePeriods = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "12m", label: "Last 12 Months" },
  { value: "ytd", label: "Year to Date" }
]

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

// Define interfaces for our data
interface RevenueDataPoint {
  month: string;
  revenue: number;
}

interface CategoryDataPoint {
  name: string;
  value: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  payment_source?: string;
}

export default function RevenueAnalytics() {
  const { transactions } = useTransactions();
  const { incomeByCategory, monthlyData, isLoading, setDateRange } = useAnalytics();
  const selectedCurrency = useSelectedCurrency();
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
  
  // Process transactions data
  const processTransactionData = () => {
    if (!transactions || transactions.length === 0) return { revenueData: [], revenueByCategory: [], incomeTransactions: [] };

    // Filter income transactions and filter by date range
    const filteredTransactions = transactions.filter(t => {
      if (t.type !== "income") return false;
      
      try {
        const transactionDate = new Date(t.date);
        return true; // We're using AnalyticsContext for date filtering now
      } catch (err) {
        console.error('Error parsing transaction date:', err);
        return false;
      }
    });
    
    const incomeTransactions = filteredTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Transform monthly data from analytics context
    const revenueData: RevenueDataPoint[] = monthlyData.map(month => ({
      month: month.month,
      revenue: month.income
    }));

    // Transform category data from analytics context
    const revenueByCategory: CategoryDataPoint[] = incomeByCategory.map(category => ({
      name: category.category,
      value: category.amount
    }));

    return { revenueData, revenueByCategory, incomeTransactions };
  };

  const { revenueData, revenueByCategory, incomeTransactions } = processTransactionData();

  // Format currency
  const formatCurrency = (value: number): string => {
    return formatCurrencyUtil(value, selectedCurrency.code, selectedCurrency.symbol);
  }

  if (isLoading) {
    return <div>Loading analytics data...</div>;
  }
  
  const showEmptyState = !monthlyData || monthlyData.length === 0;
  
  if (showEmptyState) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <h3 className="text-lg font-medium">No Revenue Data Available</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Start adding income transactions to see your revenue analytics. 
          This will help you track your revenue patterns over time.
        </p>
        <Link href="/transactions">
          <Button size="sm" variant="outline" className="mt-2">
            <Plus className="mr-2 h-4 w-4" />
            Add Income Transactions
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Revenue Trend</CardTitle>
          <CardDescription>Monthly revenue trend over time</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 md:p-6">
          <div className="h-[200px] sm:h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
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
                <Tooltip formatter={(value) => [formatCurrencyUtil(Number(value), selectedCurrency.code, selectedCurrency.symbol), "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Revenue by Category</CardTitle>
          <CardDescription>Distribution of revenue by category</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 md:p-6">
          <div className="h-[200px] sm:h-[250px] md:h-[300px]">
            {revenueByCategory && revenueByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, payload }) => {
                      const category = payload.name || name;
                      const percentage = Math.round((value / revenueByCategory.reduce((sum, item) => sum + item.value, 0)) * 100);
                      return window.innerWidth < 768 ? `${percentage}%` : `${category}: ${percentage}%`;
                    }}
                    outerRadius={window.innerWidth < 768 ? 50 : window.innerWidth < 1024 ? 70 : 80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend wrapperStyle={{fontSize: '10px'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">No revenue category data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Income Transactions</CardTitle>
          <CardDescription>Detailed list of all income transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 md:p-6 overflow-x-auto">
          <div className="min-w-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead className="min-w-[200px]">Description</TableHead>
                  <TableHead className="min-w-[120px]">Category</TableHead>
                  <TableHead className="text-right w-[120px]">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeTransactions && incomeTransactions.length > 0 ? (
                  incomeTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="whitespace-nowrap">
                        {(() => {
                          try {
                            return format(new Date(transaction.date), 'MMM d, yyyy');
                          } catch (error) {
                            return 'Invalid date';
                          }
                        })()}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">{transaction.description}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No income transactions available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
