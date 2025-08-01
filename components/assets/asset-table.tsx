'use client'

import { useState } from 'react'
import { MoreHorizontal, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { useAssets, type Asset } from '@/lib/context/AssetContext'
import { AssetForm } from './asset-form'
import { toast } from 'sonner'
import { useFormatCurrency } from '@/components/currency-switcher'

const getAssetTypeColor = (type: string) => {
  switch (type) {
    case 'current':
      return 'bg-green-100 text-green-800'
    case 'fixed':
      return 'bg-blue-100 text-blue-800'
    case 'intangible':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getAssetTypeLabel = (type: string) => {
  switch (type) {
    case 'current':
      return 'Current'
    case 'fixed':
      return 'Fixed'
    case 'intangible':
      return 'Intangible'
    default:
      return type
  }
}

interface AssetTableProps {
  searchTerm: string
  filterType?: 'current' | 'fixed' | 'intangible'
}

export function AssetTable({ searchTerm, filterType }: AssetTableProps) {
  const { assets, deleteAsset, isLoading } = useAssets()
  const formatCurrency = useFormatCurrency()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null)

  // Filter assets based on search term and type
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !filterType || asset.asset_type === filterType
    
    return matchesSearch && matchesType
  })

  const handleDeleteAsset = async () => {
    if (!assetToDelete) return

    try {
      await deleteAsset(assetToDelete.id)
      toast.success('Asset deleted successfully')
      setDeleteDialogOpen(false)
      setAssetToDelete(null)
    } catch (error) {
      toast.error('Failed to delete asset')
      console.error('Error deleting asset:', error)
    }
  }

  const calculateGainLoss = (asset: Asset) => {
    if (!asset.purchase_value) return null
    
    const gainLoss = asset.current_value - asset.purchase_value
    const percentage = (gainLoss / asset.purchase_value) * 100
    
    return {
      amount: gainLoss,
      percentage,
      isGain: gainLoss >= 0
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  if (filteredAssets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {searchTerm ? 'No assets found matching your search.' : 'No assets found. Add your first asset to get started.'}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Asset Name</TableHead>
              <TableHead className="min-w-[120px]">Category</TableHead>
              <TableHead className="min-w-[100px] hidden sm:table-cell">Type</TableHead>
              <TableHead className="text-right min-w-[120px]">Current Value</TableHead>
              <TableHead className="text-right min-w-[120px] hidden md:table-cell">Purchase Value</TableHead>
              <TableHead className="text-right min-w-[120px] hidden lg:table-cell">Gain/Loss</TableHead>
              <TableHead className="min-w-[120px] hidden lg:table-cell">Purchase Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.map((asset) => {
              const gainLoss = calculateGainLoss(asset)
              
              return (
                <TableRow key={asset.id}>
                  <TableCell className="min-w-[150px]">
                    <div>
                      <div className="font-medium">{asset.name}</div>
                      {asset.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {asset.description}
                        </div>
                      )}
                      {/* Show type on mobile */}
                      <div className="sm:hidden mt-1">
                        <Badge className={getAssetTypeColor(asset.asset_type)}>
                          {getAssetTypeLabel(asset.asset_type)}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[120px]">{asset.category}</TableCell>
                  <TableCell className="min-w-[100px] hidden sm:table-cell">
                    <Badge className={getAssetTypeColor(asset.asset_type)}>
                      {getAssetTypeLabel(asset.asset_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium min-w-[120px]">
                    <div>
                      {formatCurrency(asset.current_value)}
                      {/* Show purchase value on mobile */}
                      <div className="md:hidden text-xs text-muted-foreground mt-1">
                        Purchase: {asset.purchase_value ? formatCurrency(asset.purchase_value) : '-'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right min-w-[120px] hidden md:table-cell">
                    {asset.purchase_value ? formatCurrency(asset.purchase_value) : '-'}
                  </TableCell>
                  <TableCell className="text-right min-w-[120px] hidden lg:table-cell">
                    {gainLoss ? (
                      <div className={`flex items-center justify-end ${gainLoss.isGain ? 'text-green-600' : 'text-red-600'}`}>
                        {gainLoss.isGain ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        <div>
                          <div>{formatCurrency(Math.abs(gainLoss.amount))}</div>
                          <div className="text-xs">
                            ({gainLoss.percentage.toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="min-w-[120px] hidden lg:table-cell">
                    {asset.purchase_date ? format(new Date(asset.purchase_date), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <AssetForm asset={asset}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </AssetForm>
                        <DropdownMenuItem
                          className="text-red-600"
                          onSelect={() => {
                            setAssetToDelete(asset)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{assetToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAsset}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}