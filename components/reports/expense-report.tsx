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

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B'];

// Custom tooltip for the pie chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md p-2 shadow-sm">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm">{`$${payload[0].value.toLocaleString()}`}</p>
        <p className="text-xs text-muted-foreground">{`${payload[0].payload.percentage}%`}</p>
      </div>
    );
  }
  return null;
};

export function ExpenseReport() {
  const { expenseData, isLoading } = useReports();
  const [selectedPeriod, setSelectedPeriod] = useState("");
  
  // Initialize selected period on client-side to avoid hydration mismatch
  useEffect(() => {
    setSelectedPeriod("current-quarter");
  }, []);

  // Format currency value
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Format date value
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-8">Loading report data...</div>;
  }

  const showEmptyState = !expenseData;

  if (showEmptyState) {
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Period: {expenseData.period}</h3>
          <p className="text-sm text-muted-foreground">Total Expenses: {formatCurrency(expenseData.totalExpenses)}</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
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
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                >
                  {expenseData.categoryTotals.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense by Payment Method Chart */}
        <div className="rounded-md border p-4">
          <h3 className="mb-2 text-lg font-medium">Expenses by Payment Method</h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData.paymentMethodTotals}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                >
                  {expenseData.paymentMethodTotals.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Expenses Chart */}
      <div className="rounded-md border p-4">
        <h3 className="mb-4 text-lg font-medium">Top Expenses</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={expenseData.topExpenses.map(expense => ({
                name: expense.description,
                amount: expense.amount,
                category: expense.category
              }))}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => `$${value / 1000}k`} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, "Amount"]}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="amount" fill="#ff6b6b" name="Amount" />
            </BarChart>
          </ResponsiveContainer>
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
            {expenseData.expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{expense.paymentMethod}</TableCell>
                <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-medium">
              <TableCell colSpan={4}>Total</TableCell>
              <TableCell className="text-right">{formatCurrency(expenseData.totalExpenses)}</TableCell>
            </TableRow>
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
