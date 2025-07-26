'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import { useAccounts } from './AccountContext'

// Types
export interface Asset {
  id: string
  name: string
  description?: string
  category: string
  current_value: number
  purchase_value?: number
  purchase_date?: string
  depreciation_rate?: number
  asset_type: 'current' | 'fixed' | 'intangible'
  account_id?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface AssetFormData {
  name: string
  description?: string
  category: string
  current_value: number
  purchase_value?: number
  purchase_date?: string
  depreciation_rate?: number
  asset_type: 'current' | 'fixed' | 'intangible'
}

interface AssetContextType {
  assets: Asset[]
  isLoading: boolean
  error: Error | null
  addAsset: (asset: AssetFormData) => Promise<void>
  updateAsset: (id: string, asset: Partial<AssetFormData>) => Promise<void>
  deleteAsset: (id: string) => Promise<void>
  totalAssetValue: number
  assetsByType: {
    current: Asset[]
    fixed: Asset[]
    intangible: Asset[]
  }
}

const AssetContext = createContext<AssetContextType | undefined>(undefined)

export function useAssets() {
  const context = useContext(AssetContext)
  if (context === undefined) {
    throw new Error('useAssets must be used within an AssetProvider')
  }
  return context
}

interface AssetProviderProps {
  children: ReactNode
}

export function AssetProvider({ children }: AssetProviderProps) {
  const { currentAccount } = useAccounts()
  const queryClient = useQueryClient()

  // Fetch assets query
  const { data: assets = [], isLoading, error } = useQuery<Asset[], Error>({
    queryKey: ['assets', currentAccount?.id],
    queryFn: async () => {
      if (!currentAccount) {
        return []
      }

      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('account_id', currentAccount.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    },
    enabled: !!currentAccount,
  })

  // Add asset mutation
  const addAssetMutation = useMutation({
    mutationFn: async (asset: AssetFormData) => {
      if (!currentAccount) {
        throw new Error('No account selected')
      }

      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('assets')
        .insert({
          ...asset,
          account_id: currentAccount.id,
          user_id: user.user.id,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', currentAccount?.id] })
    },
  })

  // Update asset mutation
  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, asset }: { id: string; asset: Partial<AssetFormData> }) => {
      if (!currentAccount) {
        throw new Error('No account selected')
      }

      const { data, error } = await supabase
        .from('assets')
        .update(asset)
        .eq('id', id)
        .eq('account_id', currentAccount.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', currentAccount?.id] })
    },
  })

  // Delete asset mutation
  const deleteAssetMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentAccount) {
        throw new Error('No account selected')
      }

      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id)
        .eq('account_id', currentAccount.id)

      if (error) {
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', currentAccount?.id] })
    },
  })

  // Computed values
  const totalAssetValue = assets.reduce((total, asset) => total + asset.current_value, 0)

  const assetsByType = {
    current: assets.filter(asset => asset.asset_type === 'current'),
    fixed: assets.filter(asset => asset.asset_type === 'fixed'),
    intangible: assets.filter(asset => asset.asset_type === 'intangible'),
  }

  const value: AssetContextType = {
    assets,
    isLoading,
    error,
    addAsset: addAssetMutation.mutateAsync,
    updateAsset: (id: string, asset: Partial<AssetFormData>) => 
      updateAssetMutation.mutateAsync({ id, asset }),
    deleteAsset: deleteAssetMutation.mutateAsync,
    totalAssetValue,
    assetsByType,
  }

  return (
    <AssetContext.Provider value={value}>
      {children}
    </AssetContext.Provider>
  )
}