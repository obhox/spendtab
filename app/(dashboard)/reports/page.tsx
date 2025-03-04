"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfitLossReport } from "@/components/reports/profit-loss-report"
import { CashFlowReport } from "@/components/reports/cash-flow-report"
import { ExpenseReport } from "@/components/reports/expense-report"
import { Download, Printer } from 'lucide-react'
import { useReports } from "@/lib/context/ReportsContext"
import { exportReport } from "@/lib/export-utils"
import { toast } from "@/hooks/use-toast"

export default function ReportsPage() {
  const { profitLossData, cashFlowData, expenseData } = useReports();

  const handleExport = async () => {
    try {
      const activeTab = document.querySelector('[role="tabpanel"]:not([hidden])');
      const tabId = activeTab?.id.replace('tabpanel-', '');
      
      if (!tabId) {
        toast({
          title: "Export failed",
          description: "Could not determine which report to export. Please try again.",
          variant: "destructive"
        });
        return;
      }

      switch (tabId) {
        case 'profit-loss':
          await exportReport({ type: 'profit-loss', data: profitLossData });
          break;
        case 'cash-flow':
          await exportReport({ type: 'cash-flow', data: cashFlowData });
          break;
        case 'expense':
          await exportReport({ type: 'expense', data: expenseData });
          break;
        default:
          toast({
            title: "Export failed",
            description: "Invalid report type selected.",
            variant: "destructive"
          });
          return;
      }

      toast({
        title: "Export successful",
        description: "Your report has been exported as PDF."
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting the report. Please try again.",
        variant: "destructive"
      });
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
                View your business's revenue, costs, and expenses over a specific time period.
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

