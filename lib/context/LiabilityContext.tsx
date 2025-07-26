'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import { useAccounts } from './AccountContext'

// Types
export interface Liability {
  id: string
  name: string
  description?: string
  category: string
  current_balance: number
  original_amount?: number
  interest_rate?: number
  due_date?: string
  minimum_payment?: number
  liability_type: 'current' | 'long_term'
  account_id?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface LiabilityFormData {
  name: string
  description?: string
  category: string
  current_balance: number
  original_amount?: number
  interest_rate?: number
  due_date?: string
  minimum_payment?: number
  liability_type: 'current' | 'long_term'
}

interface LiabilityContextType {
  liabilities: Liability[]
  isLoading: boolean
  error: Error | null
  addLiability: (liability: LiabilityFormData) => Promise<void>
  updateLiability: (id: string, liability: Partial<LiabilityFormData>) => Promise<void>
  deleteLiability: (id: string) => Promise<void>
  totalLiabilityBalance: number
  liabilitiesByType: {
    current: Liability[]
    long_term: Liability[]
  }
}

const LiabilityContext = createContext<LiabilityContextType | undefined>(undefined)

export function useLiabilities() {
  const context = useContext(LiabilityContext)
  if (context === undefined) {
    throw new Error('useLiabilities must be used within a LiabilityProvider')
  }
  return context
}

interface LiabilityProviderProps {
  children: ReactNode
}

export function LiabilityProvider({ children }: LiabilityProviderProps) {
  const { currentAccount } = useAccounts()
  const queryClient = useQueryClient()

  // Fetch liabilities query
  const { data: liabilities = [], isLoading, error } = useQuery<Liability[], Error>({
    queryKey: ['liabilities', currentAccount?.id],
    queryFn: async () => {
      if (!currentAccount) {
        return []
      }

      const { data, error } = await supabase
        .from('liabilities')
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

  // Add liability mutation
  const addLiabilityMutation = useMutation({
    mutationFn: async (liability: LiabilityFormData) => {
      if (!currentAccount) {
        throw new Error('No account selected')
      }

      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('liabilities')
        .insert({
          ...liability,
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
      queryClient.invalidateQueries({ queryKey: ['liabilities', currentAccount?.id] })
    },
  })

  // Update liability mutation
  const updateLiabilityMutation = useMutation({
    mutationFn: async ({ id, liability }: { id: string; liability: Partial<LiabilityFormData> }) => {
      if (!currentAccount) {
        throw new Error('No account selected')
      }

      const { data, error } = await supabase
        .from('liabilities')
        .update(liability)
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
      queryClient.invalidateQueries({ queryKey: ['liabilities', currentAccount?.id] })
    },
  })

  // Delete liability mutation
  const deleteLiabilityMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentAccount) {
        throw new Error('No account selected')
      }

      const { error } = await supabase
        .from('liabilities')
        .delete()
        .eq('id', id)
        .eq('account_id', currentAccount.id)

      if (error) {
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities', currentAccount?.id] })
    },
  })

  // Computed values
  const totalLiabilityBalance = liabilities.reduce((total, liability) => total + liability.current_balance, 0)

  const liabilitiesByType = {
    current: liabilities.filter(liability => liability.liability_type === 'current'),
    long_term: liabilities.filter(liability => liability.liability_type === 'long_term'),
  }

  const value: LiabilityContextType = {
    liabilities,
    isLoading,
    error,
    addLiability: addLiabilityMutation.mutateAsync,
    updateLiability: (id: string, liability: Partial<LiabilityFormData>) => 
      updateLiabilityMutation.mutateAsync({ id, liability }),
    deleteLiability: deleteLiabilityMutation.mutateAsync,
    totalLiabilityBalance,
    liabilitiesByType,
  }

  return (
    <LiabilityContext.Provider value={value}>
      {children}
    </LiabilityContext.Provider>
  )
}