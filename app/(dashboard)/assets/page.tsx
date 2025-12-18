'use client'

import { useState } from 'react'
import { Plus, Search, TrendingUp, Building, Lightbulb } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AssetForm } from '@/components/assets/asset-form'
import { AssetTable } from '@/components/assets/asset-table'
import { useAssets } from '@/lib/context/AssetContext'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount)
}

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { assets, totalAssetValue, assetsByType, isLoading } = useAssets()

  const currentAssetsValue = assetsByType.current.reduce((sum, asset) => sum + asset.current_value, 0)
  const fixedAssetsValue = assetsByType.fixed.reduce((sum, asset) => sum + asset.current_value, 0)
  const intangibleAssetsValue = assetsByType.intangible.reduce((sum, asset) => sum + asset.current_value, 0)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assets</h2>
        <div className="flex items-center space-x-2">
          <AssetForm>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </AssetForm>
        </div>
      </div>

      {/* Summary Cards */}
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
            <div className="h-4 w-4 rounded-full bg-green-500" />
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
            <Building className="h-4 w-4 text-muted-foreground" />
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
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(intangibleAssetsValue)}</div>
            <p className="text-xs text-muted-foreground">
              {assetsByType.intangible.length} asset{assetsByType.intangible.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Assets Table */}
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
              <AssetTable searchTerm={searchTerm} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fixed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fixed Assets</CardTitle>
              <CardDescription>
                Long-term tangible assets used in business operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssetTable searchTerm={searchTerm} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intangible" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intangible Assets</CardTitle>
              <CardDescription>
                Non-physical assets with monetary value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssetTable searchTerm={searchTerm} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}