"use client"

import { createContext, useContext, ReactNode } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../supabase"
import { useAccounts } from './AccountContext'
import { toast } from "sonner"
import { getCookie } from "@/lib/cookie-utils"

// Transaction data interface
export interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: "income" | "expense"
  notes?: string
  account_id: string
  payment_source?: string
  budget_id?: string | null
}

// Context interface
interface TransactionContextType {
  transactions: Transaction[]
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>
  updateTransaction: (id: string, transaction: Omit<Transaction, "id">) => Promise<Transaction>
  deleteTransaction: (id: string) => Promise<void>
  isLoading: boolean
  error: Error | null
}

// Create the context with a default value
const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

// Cache time constants
const CACHE_TIME = 30 * 60 * 1000 // 30 minutes
const STALE_TIME = 5 * 60 * 1000 // 5 minutes

// Provider component
export function TransactionProvider({ children }: { children: ReactNode }) {
  const { currentAccount, isAccountSwitching } = useAccounts()
  const queryClient = useQueryClient()

  // Function to manually set transactions
  const setTransactions = (newTransactions: Transaction[]) => {
    queryClient.setQueryData(['transactions', currentAccount?.id], newTransactions)
  }

  // Fetch transactions query
  const { data: transactions = [], isLoading, error } = useQuery<Transaction[], Error>({
    queryKey: ['transactions', currentAccount?.id],
    queryFn: async () => {
      if (!currentAccount || isAccountSwitching) {
        return []
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', currentAccount.id)
        .order('date', { ascending: false })

      if (error) {
         toast('Unable to process your request. Please try again.')
        throw error
      }

      return data?.map(item => ({
        id: item.id,
        date: item.date,
        description: item.description,
        category: item.category,
        amount: item.amount,
        type: item.type,
        notes: item.notes || undefined,
        account_id: item.account_id,
        payment_source: item.payment_source || undefined,
        budget_id: item.budget_id || null
      })) || []
    },
    enabled: !!currentAccount && !isAccountSwitching,
    gcTime: CACHE_TIME,
    staleTime: STALE_TIME,
    refetchInterval: 30000 // Refetch every 30 seconds
  })

  const addTransactionMutation = useMutation({
    mutationFn: async (newTransaction: Omit<Transaction, "id">) => {
      if (!currentAccount) throw new Error('No account selected')

      const userSubscriptionTier = getCookie('userSubscriptionTier') || 'free'
      
      if (userSubscriptionTier === 'free') {
        const { count, error: countError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('account_id', currentAccount.id)
          .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString())

        if (countError) {
          // toast(countError.message)
          throw countError
        }

        if (count && count >= 50) {
          const errorMsg = 'Free users are limited to 50 transactions per month. Please upgrade to add more transactions.'
           toast('Free users are limited to 50 transactions per month. Please upgrade to add more transactions.')
          throw new Error(errorMsg)
        }
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...newTransaction,
          account_id: currentAccount.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        // toast('Unable to process your request. Please try again.')
        throw error
      }

      return data
    },
    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({ queryKey: ['transactions', currentAccount?.id] })
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions', currentAccount?.id])

      const optimisticTransaction = {
        ...newTransaction,
        id: `temp-${Date.now()}`,
        account_id: currentAccount?.id || ''
      }

      queryClient.setQueryData<Transaction[]>(['transactions', currentAccount?.id], old => [
        optimisticTransaction,
        ...(old || [])
      ])

      return { previousTransactions }
    },
    onError: (error: Error, _, context: any) => {
      queryClient.setQueryData(['transactions', currentAccount?.id], context.previousTransactions)
      // toast(error.message || 'Failed to add transaction')
    },
    onSuccess: (newTransaction) => {
      queryClient.setQueryData<Transaction[]>(['transactions', currentAccount?.id], old => {
        const transactions = old || []
        return transactions.map(t => t.id.startsWith('temp-') ? newTransaction : t)
      })
      // toast('Transaction added successfully')
    }
  })

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, ...transaction }: Transaction) => {
      if (!currentAccount) throw new Error('No account selected')

      const { error } = await supabase
        .from('transactions')
        .update({
          ...transaction,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('account_id', currentAccount.id)

      if (error) {
        // toast('Unable to process your request. Please try again.')
        throw error
      }

      return { id, ...transaction }
    },
    onMutate: async ({ id, ...newTransaction }) => {
      await queryClient.cancelQueries({ queryKey: ['transactions', currentAccount?.id] })
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions', currentAccount?.id])

      queryClient.setQueryData<Transaction[]>(['transactions', currentAccount?.id], old => {
        return (old || []).map(transaction =>
          transaction.id === id
            ? { ...transaction, ...newTransaction }
            : transaction
        )
      })

      return { previousTransactions }
    },
    onError: (error: Error, _, context: any) => {
      queryClient.setQueryData(['transactions', currentAccount?.id], context.previousTransactions)
      // toast(error.message || 'Failed to update transaction')
    },
    onSuccess: (updatedTransaction) => {
      queryClient.setQueryData<Transaction[]>(['transactions', currentAccount?.id], old => {
        return (old || []).map(t => t.id === updatedTransaction.id ? { ...t, ...updatedTransaction } : t)
      })
      // toast('Transaction updated successfully')
    }
  })

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentAccount) throw new Error('No account selected')

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('account_id', currentAccount.id)

      if (error) {
        // toast('Unable to process your request. Please try again.')
        throw error
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['transactions', currentAccount?.id] })
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions', currentAccount?.id])

      queryClient.setQueryData<Transaction[]>(['transactions', currentAccount?.id], old => 
        (old || []).filter(t => t.id !== id)
      )

      return { previousTransactions }
    },
    onError: (error: Error, _, context: any) => {
      queryClient.setQueryData(['transactions', currentAccount?.id], context.previousTransactions)
      // toast(error.message || 'Failed to delete transaction')
    },
    onSuccess: () => {
      // toast('Transaction deleted successfully')
    }
  })

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        setTransactions,
        addTransaction: addTransactionMutation.mutateAsync,
        updateTransaction: (id: string, transaction: Omit<Transaction, "id">) => updateTransactionMutation.mutateAsync({ id, ...transaction }),
        deleteTransaction: deleteTransactionMutation.mutateAsync,
        isLoading,
        error,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider')
  }
  return context
}

