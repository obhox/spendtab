'use client'

import { useState } from 'react'
import { Plus, Search, TrendingDown, CreditCard, Building2, AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { LiabilityForm } from '@/components/liabilities/liability-form'
import { LiabilityTable } from '@/components/liabilities/liability-table'
import { useLiabilities } from '@/lib/context/LiabilityContext'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export default function LiabilitiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { liabilities, totalLiabilityBalance, liabilitiesByType, isLoading } = useLiabilities()

  const currentLiabilitiesBalance = liabilitiesByType.current.reduce((sum, liability) => sum + liability.current_balance, 0)
  const longTermLiabilitiesBalance = liabilitiesByType.long_term.reduce((sum, liability) => sum + liability.current_balance, 0)

  // Calculate overdue liabilities
  const overdueLiabilities = liabilities.filter(liability => {
    if (!liability.due_date) return false
    return new Date(liability.due_date) < new Date()
  })

  // Calculate liabilities due soon (within 30 days)
  const dueSoonLiabilities = liabilities.filter(liability => {
    if (!liability.due_date) return false
    const dueDate = new Date(liability.due_date)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    return dueDate >= today && dueDate <= thirtyDaysFromNow
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Liabilities</h2>
        <div className="flex items-center space-x-2">
          <LiabilityForm>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Liability
            </Button>
          </LiabilityForm>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalLiabilityBalance)}</div>
            <p className="text-xs text-muted-foreground">
              {liabilities.length} liabilit{liabilities.length !== 1 ? 'ies' : 'y'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Liabilities</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentLiabilitiesBalance)}</div>
            <p className="text-xs text-muted-foreground">
              {liabilitiesByType.current.length} liabilit{liabilitiesByType.current.length !== 1 ? 'ies' : 'y'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Long-term Liabilities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(longTermLiabilitiesBalance)}</div>
            <p className="text-xs text-muted-foreground">
              {liabilitiesByType.long_term.length} liabilit{liabilitiesByType.long_term.length !== 1 ? 'ies' : 'y'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueLiabilities.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive">{overdueLiabilities.length}</Badge>
                  <span className="text-sm text-red-600">Overdue</span>
                </div>
              )}
              {dueSoonLiabilities.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{dueSoonLiabilities.length}</Badge>
                  <span className="text-sm text-yellow-600">Due Soon</span>
                </div>
              )}
              {overdueLiabilities.length === 0 && dueSoonLiabilities.length === 0 && (
                <p className="text-sm text-muted-foreground">All up to date</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search liabilities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Liabilities Table */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Liabilities</TabsTrigger>
          <TabsTrigger value="current">Current Liabilities</TabsTrigger>
          <TabsTrigger value="long-term">Long-term Liabilities</TabsTrigger>
          <TabsTrigger value="alerts">Payment Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Liabilities</CardTitle>
              <CardDescription>
                Manage all your liabilities in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiabilityTable searchTerm={searchTerm} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Liabilities</CardTitle>
              <CardDescription>
                Debts and obligations due within one year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiabilityTable searchTerm={searchTerm} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="long-term" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Long-term Liabilities</CardTitle>
              <CardDescription>
                Debts and obligations due after one year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiabilityTable searchTerm={searchTerm} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Alerts</CardTitle>
              <CardDescription>
                Overdue and upcoming payment obligations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiabilityTable searchTerm={searchTerm} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}