"use client"

import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Monitor } from "lucide-react"

const RevenueAnalytics = dynamic(() => import("@/components/analytics/revenue-analytics"), { ssr: false })
const ExpenseAnalytics = dynamic(() => import("@/components/analytics/expense-analytics"), { ssr: false })
const ProfitabilityAnalytics = dynamic(() => import("@/components/analytics/profitability-analytics"), { ssr: false })

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Mobile warning card */}
      <div className="lg:hidden">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="h-6 w-6 text-primary" />
              <CardTitle>Desktop View Recommended</CardTitle>
            </div>
            <CardDescription>
              The analytics dashboard is optimized for desktop viewing. Please open this page on your PC for the best experience.
              Mobile version is currently under development.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Desktop analytics content */}
      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold tracking-tight">Financial Analytics</h1>
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="profitability">Profitability</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Analyze your revenue streams and trends over time.</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueAnalytics />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense Analytics</CardTitle>
                <CardDescription>Analyze your expense patterns and identify cost-saving opportunities.</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseAnalytics />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="profitability" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profitability Analytics</CardTitle>
                <CardDescription>Analyze your profit margins and financial performance.</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfitabilityAnalytics />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

