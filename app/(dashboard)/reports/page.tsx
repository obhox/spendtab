"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CashFlowReport } from "@/components/reports/cash-flow-report"
import { ExpenseReport } from "@/components/reports/expense-report"
import { ProfitLossReport } from "@/components/reports/profit-loss-report"
import { Download } from 'lucide-react'
import { useReports } from "@/lib/context/ReportsContext"
import { exportReport } from "@/lib/export-utils"
import { toast } from "sonner"

export default function ReportsPage() {
  const { profitLossData, cashFlowData, expenseData } = useReports();

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
            toast({
              title: "Export failed",
              description: "No profit & loss data available to export.",
              variant: "destructive"
            });
            return;
          }
          await exportReport({ type: 'profit-loss', data: profitLossData });
          break;
        case 'cash-flow':
          if (!cashFlowData) {
            toast({
              title: "Export failed",
              description: "No cash flow data available to export.",
              variant: "destructive"
            });
            return;
          }
          await exportReport({ type: 'cash-flow', data: cashFlowData });
          break;
        case 'expense':
          if (!expenseData) {
            toast({
              title: "Export failed",
              description: "No expense data available to export.",
              variant: "destructive"
            });
            return;
          }
          await exportReport({ type: 'expense', data: expenseData.expenses });
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Financial Reports</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <Tabs defaultValue="profit-loss" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="expense">Expense Report</TabsTrigger>
        </TabsList>
        <TabsContent value="profit-loss" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
              <CardDescription>
                View your business&apos;s revenue, costs, and expenses over a specific time period.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfitLossReport />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cash-flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Statement</CardTitle>
              <CardDescription>Track how cash is flowing in and out of your business.</CardDescription>
            </CardHeader>
            <CardContent>
              <CashFlowReport />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expense" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Report</CardTitle>
              <CardDescription>Analyze your business expenses by category.</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseReport />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

