"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download } from 'lucide-react'
import { useReports } from "@/lib/context/ReportsContext"
import { exportReport } from "@/lib/export-utils"
import { toast } from "sonner"
import { useSelectedCurrency } from "@/components/currency-switcher"

const CashFlowReport = dynamic(
  () => import("@/components/reports/cash-flow-report").then((mod) => mod.CashFlowReport),
  { ssr: false }
)

const ExpenseReport = dynamic(
  () => import("@/components/reports/expense-report").then((mod) => mod.ExpenseReport),
  { ssr: false }
)

const ProfitLossReport = dynamic(
  () => import("@/components/reports/profit-loss-report").then((mod) => mod.ProfitLossReport),
  { ssr: false }
)

export default function ReportsPage() {
  const { profitLossData, cashFlowData, expenseData } = useReports();
  const selectedCurrency = useSelectedCurrency();

  const handleExport = async () => {
    try {
      const activeTab = document.querySelector('[role="tabpanel"]:not([hidden])');
      const tabId = activeTab?.id.replace('tabpanel-', '');
      
      if (!tabId) {
        toast("Could not determine which report to export. Please try again.");
        return;
      }

      switch (tabId) {
        case 'profit-loss':
          if (!profitLossData) {
            toast("No profit & loss data available to export.");
            return;
          }
          await exportReport({ type: 'profit-loss', data: profitLossData, currency: selectedCurrency });
          break;
        case 'cash-flow':
          if (!cashFlowData) {
            toast("No cash flow data available to export.");
            return;
          }
          await exportReport({ type: 'cash-flow', data: cashFlowData, currency: selectedCurrency });
          break;
        case 'expense':
          if (!expenseData) {
            toast("No expense data available to export.");
            return;
          }
          await exportReport({ type: 'expense', data: expenseData.expenses, currency: selectedCurrency });
          break;
        default:
          toast("Invalid report type selected.");
          return;
      }

      toast("Your report has been exported as PDF.");
    } catch (error) {
      console.error('Error exporting report:', error);
      toast("An error occurred while exporting the report. Please try again.");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Financial Reports</h1>
        <Button variant="outline" size="sm" onClick={handleExport} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>
      <Tabs defaultValue="profit-loss" className="space-y-4">
        <div className="overflow-x-auto -mx-1 px-1">
          <TabsList className="w-full sm:w-auto inline-flex min-w-max">
            <TabsTrigger value="profit-loss" className="text-xs sm:text-sm">Profit & Loss</TabsTrigger>
            <TabsTrigger value="cash-flow" className="text-xs sm:text-sm">Cash Flow</TabsTrigger>
            <TabsTrigger value="expense" className="text-xs sm:text-sm">Expenses</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="profit-loss" className="space-y-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold">Profit & Loss Statement</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Revenue, costs, and expenses over a specific time period.
            </p>
          </div>
          <ProfitLossReport />
        </TabsContent>
        <TabsContent value="cash-flow" className="space-y-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold">Cash Flow Statement</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Cash inflows and outflows over time.
            </p>
          </div>
          <CashFlowReport />
        </TabsContent>
        <TabsContent value="expense" className="space-y-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold">Expense Report</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Spending patterns and expense categories.
            </p>
          </div>
          <ExpenseReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}

