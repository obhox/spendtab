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
  ComposedChart,
  Area
} from "recharts"
import { subMonths } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAnalytics } from "@/lib/context/AnalyticsContext"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

// Time period options
const timePeriods = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "12m", label: "Last 12 Months" },
  { value: "ytd", label: "Year to Date" }
];

export default function ProfitabilityAnalytics() {
  const { monthlyData, financialSummary, isLoading, setDateRange, error } = useAnalytics();
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
  
  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Format percentage for tooltip
  const formatPercent = (value: number) => {
    return `${Math.round(value)}%`;
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center py-8">Loading analytics data...</div>;
  }
  
  if (error) {
    return <div className="flex justify-center items-center py-8 text-red-500">Error: {error}</div>;
  }
  
  const showEmptyState = !monthlyData || monthlyData.length === 0;
  
  if (showEmptyState) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <h3 className="text-lg font-medium">No Profitability Data Available</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Start adding both income and expense transactions to see your profitability analytics. 
          This will help you track your profit margins and financial performance over time.
        </p>
        <Link href="/transactions">
          <Button size="sm" variant="outline" className="mt-2">
            <Plus className="mr-2 h-4 w-4" />
            Add Transactions
          </Button>
        </Link>
      </div>
    );
  }
  
  // Transform monthly data for the chart
  const profitData = monthlyData.map(month => ({
    month: month.month,
    revenue: month.income,
    expense: month.expenses,
    profit: month.profit,
    margin: month.income > 0 ? (month.profit / month.income) * 100 : 0
  })).filter(data => data.revenue > 0 || data.expense > 0);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financialSummary.totalRevenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financialSummary.totalExpenses)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financialSummary.totalProfit)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercent(financialSummary.profitMargin)}</div>
            </CardContent>
          </Card>
        </div>
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
          <CardTitle>Revenue, Expenses & Profit</CardTitle>
          <CardDescription>Monthly financial performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={profitData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis yAxisId="left" tickFormatter={(value) => `$${value / 1000}k`} stroke="#666" />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    return [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)];
                  }}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "6px",
                    border: "1px solid #eee",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Area 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="revenue" 
                  fill="#4f46e5" 
                  stroke="#4f46e5" 
                  fillOpacity={0.2} 
                  strokeWidth={2}
                  name="Revenue" 
                />
                <Area 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="expense" 
                  fill="#ef4444" 
                  stroke="#ef4444" 
                  fillOpacity={0.2} 
                  strokeWidth={2}
                  name="Expenses" 
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Profit"
                  dot={{ fill: "#22c55e", r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Profit Margin Trend</CardTitle>
          <CardDescription>Monthly profit margin percentage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={profitData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis tickFormatter={(value) => `${value}%`} stroke="#666" />
                <Tooltip 
                  formatter={(value: number) => [formatPercent(value), "Profit Margin"]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "6px",
                    border: "1px solid #eee",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="margin"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Profit Margin"
                  dot={{ fill: "#f59e0b", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
