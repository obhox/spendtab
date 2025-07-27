"use client"

import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Monitor } from "lucide-react"
import { DataProvider } from "@/lib/context/DataProvider"

const RevenueAnalytics = dynamic(() => import("@/components/analytics/revenue-analytics"), { ssr: false })
const ExpenseAnalytics = dynamic(() => import("@/components/analytics/expense-analytics"), { ssr: false })
const ProfitabilityAnalytics = dynamic(() => import("@/components/analytics/profitability-analytics"), { ssr: false })

export default function AnalyticsPage() {
  return (
    <DataProvider>
      <div className="pt-0 px-4 pb-4 md:pt-0 md:px-6 md:pb-6 lg:pt-0 lg:px-8 lg:pb-8 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Financial Analytics</h1>
        <Tabs defaultValue="revenue" className="space-y-3 sm:space-y-4">
          <TabsList className="w-full flex justify-start overflow-x-auto">
            <TabsTrigger value="revenue" className="flex-1 sm:flex-none text-xs sm:text-sm">Revenue</TabsTrigger>
            <TabsTrigger value="expenses" className="flex-1 sm:flex-none text-xs sm:text-sm">Expenses</TabsTrigger>
            <TabsTrigger value="profitability" className="flex-1 sm:flex-none text-xs sm:text-sm">Profitability</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue" className="space-y-3 sm:space-y-4">
            <Card>
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg">Revenue Analytics</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Analyze your revenue streams and trends over time.</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                <RevenueAnalytics />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="expenses" className="space-y-3 sm:space-y-4">
            <Card>
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg">Expense Analytics</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Analyze your expense patterns and identify cost-saving opportunities.</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                <ExpenseAnalytics />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="profitability" className="space-y-3 sm:space-y-4">
            <Card>
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg">Profitability Analytics</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Analyze your profit margins and financial performance.</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                <ProfitabilityAnalytics />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DataProvider>
  )
}

