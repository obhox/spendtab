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
  ComposedChart,
  Area
} from "recharts"
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
  const { profitData, productProfitData, isLoading } = useAnalytics();
  const [timePeriod, setTimePeriod] = useState("");
  
  // Initialize time period on client-side to avoid hydration mismatch
  useEffect(() => {
    setTimePeriod("12m");
  }, []);

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

  const showEmptyState = !profitData || profitData.length === 0;

  if (showEmptyState) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <h3 className="text-lg font-medium">No Profitability Data Available</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Start adding both income and expense transactions to see your profitability analytics. 
          This will help you track your profit margins and financial performance over time.
        </p>
        <Link href="/dashboard/transactions">
          <Button size="sm" variant="outline" className="mt-2">
            <Plus className="mr-2 h-4 w-4" />
            Add Transactions
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
          <CardTitle>Profit & Margin Trend</CardTitle>
          <CardDescription>Monthly profit and profit margin over time</CardDescription>
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" tickFormatter={(value) => `$${value / 1000}k`} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value, name: any) => {
                    if (name === "margin") return [`${value}%`, "Profit Margin"];
                    return [`$${value.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)];
                  }}
                />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="revenue" fill="#8884d8" stroke="#8884d8" fillOpacity={0.3} />
                <Area yAxisId="left" type="monotone" dataKey="expense" fill="#ff6b6b" stroke="#ff6b6b" fillOpacity={0.3} />
                <Bar yAxisId="left" dataKey="profit" fill="#82ca9d" />
                <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#ff7300" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product/Service Profitability</CardTitle>
          <CardDescription>Profitability analysis by product and service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {productProfitData && productProfitData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productProfitData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" tickFormatter={(value) => `$${value / 1000}k`} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    formatter={(value, name: any) => {
                      if (name === "margin") return [`${value}%`, "Profit Margin"];
                      return [`$${value.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue" />
                  <Bar yAxisId="left" dataKey="cost" fill="#ff6b6b" name="Cost" />
                  <Bar yAxisId="left" dataKey="profit" fill="#82ca9d" name="Profit" />
                  <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#ff7300" strokeWidth={2} name="Margin %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">No product profitability data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
