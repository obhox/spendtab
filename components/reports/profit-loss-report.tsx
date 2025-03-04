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
import { useReports } from "@/lib/context/ReportsContext"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

// Types for financial data
interface FinancialCategory {
  name: string
  amount: number
  subItems?: { name: string; amount: number }[]
}

interface ProfitLossData {
  period: string
  revenue: FinancialCategory[]
  expenses: FinancialCategory[]
  totalRevenue: number
  totalExpenses: number
  grossProfit: number
  netProfit: number
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

export function ProfitLossReport() {
  const { profitLossData, isLoading } = useReports();
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

  const showEmptyState = !profitLossData;

  if (showEmptyState) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <h3 className="text-lg font-medium">No Profit & Loss Data Available</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Start adding income and expense transactions to generate your profit and loss report.
          This report will help you track your business's financial performance over time.
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Period: {profitLossData.period}</h3>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60%]">Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Revenue Section */}
            <TableRow className="bg-muted/50">
              <TableCell className="font-medium">Revenue</TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>
            
            {profitLossData.revenue.map((category, idx) => (
              <>
                <TableRow key={`revenue-${idx}`}>
                  <TableCell className="pl-6 font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(category.amount)}</TableCell>
                </TableRow>
                {category.subItems?.map((subItem, subIdx) => (
                  <TableRow key={`revenue-sub-${idx}-${subIdx}`} className="text-sm text-muted-foreground">
                    <TableCell className="pl-10">{subItem.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(subItem.amount)}</TableCell>
                  </TableRow>
                ))}
              </>
            ))}
            
            <TableRow className="font-medium">
              <TableCell>Total Revenue</TableCell>
              <TableCell className="text-right">{formatCurrency(profitLossData.totalRevenue)}</TableCell>
            </TableRow>
            
            {/* Expenses Section */}
            <TableRow className="bg-muted/50">
              <TableCell className="font-medium">Expenses</TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>
            
            {profitLossData.expenses.map((category, idx) => (
              <>
                <TableRow key={`expense-${idx}`}>
                  <TableCell className="pl-6 font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(category.amount)}</TableCell>
                </TableRow>
                {category.subItems?.map((subItem, subIdx) => (
                  <TableRow key={`expense-sub-${idx}-${subIdx}`} className="text-sm text-muted-foreground">
                    <TableCell className="pl-10">{subItem.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(subItem.amount)}</TableCell>
                  </TableRow>
                ))}
              </>
            ))}
            
            <TableRow className="font-medium">
              <TableCell>Total Expenses</TableCell>
              <TableCell className="text-right">{formatCurrency(profitLossData.totalExpenses)}</TableCell>
            </TableRow>
            
            {/* Summary Section */}
            <TableRow className="bg-muted/50">
              <TableCell className="font-medium">Summary</TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>
            
            <TableRow className="font-medium">
              <TableCell>Gross Profit</TableCell>
              <TableCell className="text-right">{formatCurrency(profitLossData.grossProfit)}</TableCell>
            </TableRow>
            
            <TableRow className="font-medium text-lg">
              <TableCell>Net Profit</TableCell>
              <TableCell className={`text-right ${profitLossData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(profitLossData.netProfit)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>This report provides a summary of your business's financial performance over the selected period. 
        It shows your revenue streams, expenses by category, and overall profitability.</p>
      </div>
    </div>
  );
}
