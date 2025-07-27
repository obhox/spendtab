'use client'

import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, CreditCard, Building2, AlertTriangle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AssetForm } from '@/components/assets/asset-form'
import { AssetTable } from '@/components/assets/asset-table'
import { LiabilityForm } from '@/components/liabilities/liability-form'
import { LiabilityTable } from '@/components/liabilities/liability-table'
import { useAssets } from '@/lib/context/AssetContext'
import { useLiabilities } from '@/lib/context/LiabilityContext'
import { useFormatCurrency } from '@/components/currency-switcher'

export default function AssetsLiabilitiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { assets, totalAssetValue, assetsByType, isLoading: assetsLoading } = useAssets()
  const { liabilities, totalLiabilityBalance, liabilitiesByType, isLoading: liabilitiesLoading } = useLiabilities()
  const formatCurrency = useFormatCurrency()

  // Asset calculations
  const currentAssetsValue = assetsByType.current.reduce((sum, asset) => sum + asset.current_value, 0)
  const fixedAssetsValue = assetsByType.fixed.reduce((sum, asset) => sum + asset.current_value, 0)
  const intangibleAssetsValue = assetsByType.intangible.reduce((sum, asset) => sum + asset.current_value, 0)

  // Liability calculations
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

  // Calculate net worth
  const netWorth = totalAssetValue - totalLiabilityBalance

  return (
    <div className="pt-0 px-4 pb-4 md:pt-0 md:px-6 md:pb-6 lg:pt-0 lg:px-8 lg:pb-8 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Assets & Liabilities</h1>

      {/* Net Worth Summary */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAssetValue)}</div>
            <p className="text-xs text-muted-foreground">
              {assets.length} asset{assets.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalLiabilityBalance)}</div>
            <p className="text-xs text-muted-foreground">
              {liabilities.length} liabilit{liabilities.length !== 1 ? 'ies' : 'y'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <TrendingUp className={`h-4 w-4 ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netWorth)}
            </div>
            <p className="text-xs text-muted-foreground">
              Assets - Liabilities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets and liabilities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
        </TabsList>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Assets</h3>
            <AssetForm>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </AssetForm>
          </div>

          {/* Asset Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalAssetValue)}</div>
                <p className="text-xs text-muted-foreground">
                  {assets.length} asset{assets.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Assets</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(currentAssetsValue)}</div>
                <p className="text-xs text-muted-foreground">
                  {assetsByType.current.length} asset{assetsByType.current.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fixed Assets</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(fixedAssetsValue)}</div>
                <p className="text-xs text-muted-foreground">
                  {assetsByType.fixed.length} asset{assetsByType.fixed.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Intangible Assets</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(intangibleAssetsValue)}</div>
                <p className="text-xs text-muted-foreground">
                  {assetsByType.intangible.length} asset{assetsByType.intangible.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Asset Sub-tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Assets</TabsTrigger>
              <TabsTrigger value="current">Current Assets</TabsTrigger>
              <TabsTrigger value="fixed">Fixed Assets</TabsTrigger>
              <TabsTrigger value="intangible">Intangible Assets</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Assets</CardTitle>
                  <CardDescription>
                    Manage all your assets in one place
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AssetTable searchTerm={searchTerm} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="current" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Assets</CardTitle>
                  <CardDescription>
                    Assets that can be converted to cash within one year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AssetTable searchTerm={searchTerm} filterType="current" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fixed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fixed Assets</CardTitle>
                  <CardDescription>
                    Long-term tangible assets used in operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AssetTable searchTerm={searchTerm} filterType="fixed" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="intangible" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Intangible Assets</CardTitle>
                  <CardDescription>
                    Non-physical assets with value
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AssetTable searchTerm={searchTerm} filterType="intangible" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Liabilities Tab */}
        <TabsContent value="liabilities" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Liabilities</h3>
            <LiabilityForm>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Liability
              </Button>
            </LiabilityForm>
          </div>

          {/* Liability Summary Cards */}
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

          {/* Liability Sub-tabs */}
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
                  <LiabilityTable searchTerm={searchTerm} filterType="current" />
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
                  <LiabilityTable searchTerm={searchTerm} filterType="long_term" />
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
                  <LiabilityTable searchTerm={searchTerm} filterType="alerts" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}