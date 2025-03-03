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
  AreaChart,
  Area,
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
  const { cashFlowData, isLoading } = useReports();
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

  if (isLoading) {
    return <div className="flex justify-center items-center py-8">Loading report data...</div>;
  }

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
          <Button size="sm" variant="outline" className="mt-2">
            <Plus className="mr-2 h-4 w-4" />
            Add Transactions
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Period: {cashFlowData.period}</h3>
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

      {/* Cash Flow Chart */}
      <div className="rounded-md border p-4">
        <h3 className="mb-4 text-lg font-medium">Cash Flow Trend</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={cashFlowData.monthlyCashFlow}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
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
              <TableCell className="text-right font-medium">{formatCurrency(cashFlowData.startingBalance)}</TableCell>
            </TableRow>
            
            {/* Cash In Section */}
            <TableRow className="bg-muted/50">
              <TableCell className="font-medium">Cash Inflows</TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>
            
            {cashFlowData.cashIn.map((category, idx) => (
              <>
                <TableRow key={`cash-in-${idx}`}>
                  <TableCell className="pl-6 font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(category.amount)}</TableCell>
                </TableRow>
                {category.subItems?.map((subItem, subIdx) => (
                  <TableRow key={`cash-in-sub-${idx}-${subIdx}`} className="text-sm text-muted-foreground">
                    <TableCell className="pl-10">{subItem.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(subItem.amount)}</TableCell>
                  </TableRow>
                ))}
              </>
            ))}
            
            <TableRow className="font-medium text-green-600">
              <TableCell>Total Cash In</TableCell>
              <TableCell className="text-right">{formatCurrency(cashFlowData.totalCashIn)}</TableCell>
            </TableRow>
            
            {/* Cash Out Section */}
            <TableRow className="bg-muted/50">
              <TableCell className="font-medium">Cash Outflows</TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>
            
            {cashFlowData.cashOut.map((category, idx) => (
              <>
                <TableRow key={`cash-out-${idx}`}>
                  <TableCell className="pl-6 font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(category.amount)}</TableCell>
                </TableRow>
                {category.subItems?.map((subItem, subIdx) => (
                  <TableRow key={`cash-out-sub-${idx}-${subIdx}`} className="text-sm text-muted-foreground">
                    <TableCell className="pl-10">{subItem.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(subItem.amount)}</TableCell>
                  </TableRow>
                ))}
              </>
            ))}
            
            <TableRow className="font-medium text-red-600">
              <TableCell>Total Cash Out</TableCell>
              <TableCell className="text-right">{formatCurrency(cashFlowData.totalCashOut)}</TableCell>
            </TableRow>
            
            {/* Summary Section */}
            <TableRow className="bg-muted/50">
              <TableCell className="font-medium">Summary</TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>
            
            <TableRow className="font-medium">
              <TableCell>Net Cash Flow</TableCell>
              <TableCell className={`text-right ${cashFlowData.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(cashFlowData.netCashFlow)}
              </TableCell>
            </TableRow>
            
            <TableRow className="font-medium text-lg">
              <TableCell>Ending Balance</TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(cashFlowData.endingBalance)}
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
