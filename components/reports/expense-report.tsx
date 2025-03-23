"use client"

import { useEffect, useState } from "react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { useReports } from "@/lib/context/ReportsContext"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  startOfQuarter, 
  endOfQuarter, 
  subQuarters, 
  startOfYear, 
  endOfYear,
  isSameMonth,
  isSameQuarter,
  isSameYear 
} from "date-fns"

// Types for expense data
interface ExpenseItem {
  id: string
  date: string
  category: string
  description: string
  amount: number
  paymentMethod: string
}

interface CategoryTotal {
  name: string
  value: number
  percentage: number
}

interface ExpenseData {
  period: string
  expenses: ExpenseItem[]
  totalExpenses: number
  categoryTotals: CategoryTotal[]
  paymentMethodTotals: CategoryTotal[]
  topExpenses: ExpenseItem[]
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

// Expanded color palette for charts
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B',
  '#36A2EB', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
  '#7FDBFF', '#2ECC40', '#FFDC00', '#FF4136', '#F012BE', '#39CCCC'
];

// Function to get color from palette with fallback for many categories
const getColor = (index) => {
  // If we have more categories than colors, cycle through the palette
  return COLORS[index % COLORS.length];
};

// Custom tooltip for the pie chart
// Define explicit types for the props to fix TypeScript errors
const CustomTooltip = (props) => {
  const { active, payload } = props || {};
  if (active && payload && payload.length > 0) {
    const data = payload[0];
    return (
      <div className="bg-background border rounded-md p-2 shadow-sm">
        <p className="font-medium">{data.name || 'Unknown'}</p>
        <p className="text-sm">{`$${(data.value || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`}</p>
        <p className="text-xs text-muted-foreground">
          {`${data.payload && data.payload.percentage ? data.payload.percentage : 0}%`}
        </p>
      </div>
    );
  }
  return null;
};

// Format currency consistently throughout the component
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Format date value safely
const formatDate = (dateStr: string): string => {
  try {
    // Ensure we have a valid date string
    if (!dateStr) {
      throw new Error('Date string is empty');
    }

    // Try parsing with different date formats
    let date = new Date(dateStr);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      // Try parsing ISO format specifically
      date = new Date(dateStr.replace(/-/g, '/'));
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
    }

    // Format the date consistently
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC' // Ensure consistent timezone handling
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error, 'Date string:', dateStr);
    return 'Invalid date';
  }
};

// Truncate text with ellipsis and add full text as title attribute
const truncateText = (text, maxLength = 15) => {
  if (!text) return 'Unnamed';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export function ExpenseReport() {
  const { expenseData, dateRange, setDateRange, isLoading, error } = useReports();
  const [selectedPeriod, setSelectedPeriod] = useState("");
  
  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    
    const now = new Date();
    let newStartDate, newEndDate;
    
    switch (period) {
      case "current-month":
        newStartDate = startOfMonth(now);
        newEndDate = endOfMonth(now);
        break;
      case "previous-month":
        newStartDate = startOfMonth(subMonths(now, 1));
        newEndDate = endOfMonth(subMonths(now, 1));
        break;
      case "current-quarter":
        newStartDate = startOfQuarter(now);
        newEndDate = endOfQuarter(now);
        break;
      case "previous-quarter":
        newStartDate = startOfQuarter(subQuarters(now, 1));
        newEndDate = endOfQuarter(subQuarters(now, 1));
        break;
      case "ytd":
        newStartDate = startOfYear(now);
        newEndDate = now;
        break;
      case "previous-year":
        // Simplified previous year logic
        newStartDate = startOfYear(new Date(now.getFullYear() - 1, 0, 1));
        newEndDate = endOfYear(new Date(now.getFullYear() - 1, 11, 31));
        break;
      default:
        newStartDate = startOfMonth(now);
        newEndDate = endOfMonth(now);
    }
    
    setDateRange({ startDate: newStartDate, endDate: newEndDate });
  };
  
  // Determine initial period based on context's date range using date-fns helpers
  useEffect(() => {
    if (!selectedPeriod && dateRange) {
      const now = new Date();
      const { startDate, endDate } = dateRange;
      
      if (isSameMonth(startDate, startOfMonth(now)) && isSameMonth(endDate, endOfMonth(now))) {
        setSelectedPeriod("current-month");
      } else if (isSameMonth(startDate, startOfMonth(subMonths(now, 1))) && 
                isSameMonth(endDate, endOfMonth(subMonths(now, 1)))) {
        setSelectedPeriod("previous-month");
      } else if (isSameQuarter(startDate, startOfQuarter(now)) && 
                isSameQuarter(endDate, endOfQuarter(now))) {
        setSelectedPeriod("current-quarter");
      } else if (isSameQuarter(startDate, startOfQuarter(subQuarters(now, 1))) && 
                isSameQuarter(endDate, endOfQuarter(subQuarters(now, 1)))) {
        setSelectedPeriod("previous-quarter");
      } else if (isSameYear(startDate, startOfYear(now))) {
        setSelectedPeriod("ytd");
      } else {
        // Default to current quarter if no match is found
        setSelectedPeriod("current-quarter");
      }
    }
  }, [dateRange, selectedPeriod]);

  // Handle error state
  if (error) {
    return (
      <div className="flex justify-center items-center py-8 text-red-500">
        <p>Error loading expense data: {error}</p>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return <div className="flex justify-center items-center py-8">Loading report data...</div>;
  }

  // Check if we have valid data to display - including topExpenses validation
  const hasValidData = expenseData && 
    Array.isArray(expenseData.expenses) && expenseData.expenses.length > 0 && 
    Array.isArray(expenseData.categoryTotals) && expenseData.categoryTotals.length > 0 && 
    Array.isArray(expenseData.paymentMethodTotals) && expenseData.paymentMethodTotals.length > 0 &&
    Array.isArray(expenseData.topExpenses) && expenseData.topExpenses.length > 0;

  // Show empty state if no data
  if (!hasValidData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <h3 className="text-lg font-medium">No Expense Data Available</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Start adding expense transactions to generate your expense report.
          This report will help you track and analyze your spending patterns over time.
        </p>
        <Link href="/transactions">
          <Button size="sm" variant="outline" className="mt-2">
            <Plus className="mr-2 h-4 w-4" />
            Add Expenses
          </Button>
        </Link>
      </div>
    );
  }

  // Sort top expenses by amount in descending order
  const sortedTopExpenses = [...expenseData.topExpenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10); // Limit to top 10 for better visualization

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Period: {expenseData.period}</h3>
          <p className="text-sm text-muted-foreground">Total Expenses: {formatCurrency(expenseData.totalExpenses)}</p>
        </div>
        <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense by Category Chart */}
        <div className="rounded-md border p-4">
          <h3 className="mb-2 text-lg font-medium">Expenses by Category</h3>
          <div className="h-[300px] flex items-center justify-center">
            {expenseData.categoryTotals.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData.categoryTotals}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percentage }) => {
                      if (!name) return '';
                      return `${truncateText(name)} (${Math.round(percentage || 0)}%)`;
                    }}
                  >
                    {expenseData.categoryTotals.map((entry, index) => (
                      <Cell 
                        key={`category-${entry.name}-${index}`} 
                        fill={getColor(index)} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={CustomTooltip} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No category data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Expense by Payment Method Chart */}
        <div className="rounded-md border p-4">
          <h3 className="mb-2 text-lg font-medium">Expenses by Payment Method</h3>
          <div className="h-[300px] flex items-center justify-center">
            {expenseData.paymentMethodTotals.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData.paymentMethodTotals.map(total => ({
                      ...total,
                      name: formatPaymentMethod(total.name)
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percentage }) => {
                      if (!name) return '';
                      return `${truncateText(name)} (${Math.round(percentage || 0)}%)`;
                    }}
                  >
                    {expenseData.paymentMethodTotals.map((entry, index) => (
                      <Cell 
                        key={`payment-${entry.name}-${index}`} 
                        fill={getColor(index)} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={CustomTooltip} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No payment method data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Expenses Chart - Now properly sorted */}
      <div className="rounded-md border p-4">
        <h3 className="mb-4 text-lg font-medium">Top Expenses</h3>
        <div className="h-[300px]">
          {sortedTopExpenses.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedTopExpenses.map(expense => ({
                  id: expense.id,
                  name: expense.description || 'Unnamed expense',
                  fullName: expense.description || 'Unnamed expense',
                  amount: expense.amount,
                  category: expense.category
                }))}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => formatCurrency(value)} 
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120} 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => truncateText(value, 20)}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), "Amount"]}
                  labelFormatter={(label, payload) => {
                    // Use the full name from our data object for the tooltip
                    return payload && payload[0] ? payload[0].payload.fullName : label;
                  }}
                />
                <Bar dataKey="amount" fill="#ff6b6b" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No top expenses data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Expense Details Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenseData.expenses.length > 0 ? (
              <>
                {expenseData.expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell 
                      title={expense.description} // Show full description on hover
                    >
                      {truncateText(expense.description, 30)}
                    </TableCell>
                    <TableCell>{formatPaymentMethod(expense.paymentMethod)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-medium">
                  <TableCell colSpan={4}>Total</TableCell>
                  <TableCell className="text-right">{formatCurrency(expenseData.totalExpenses)}</TableCell>
                </TableRow>
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">No expense transactions found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>This report provides a detailed breakdown of your business expenses over the selected period. 
        It shows expense trends by category and payment method, highlights your top expenses, 
        and provides a detailed transaction log.</p>
      </div>
    </div>
  );
}

// Format payment method to be more readable
const formatPaymentMethod = (method: string): string => {
  if (!method) return 'Unknown';
  return method
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};