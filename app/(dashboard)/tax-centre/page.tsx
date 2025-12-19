"use client"

import { TaxSummary } from "@/components/tax/tax-summary"
import { TaxSettingsForm } from "@/components/tax/tax-settings-form"
import { TaxBreakdown } from "@/components/tax/tax-breakdown"
import { TaxChecklist } from "@/components/tax/tax-checklist"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TaxCentrePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tax Centre</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Tax Overview</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              Monitor your tax obligations and deductible expenses.
            </p>
          </div>
          <TaxSummary />
          <TaxBreakdown />
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Tax Checklist</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              Track your tax preparation tasks and filing deadlines.
            </p>
          </div>
          <TaxChecklist />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Tax Settings</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              Configure your business tax profile to ensure accurate calculations.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Tax Profile</CardTitle>
              <CardDescription>
                Set up your tax rates and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaxSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
