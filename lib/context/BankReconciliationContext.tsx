"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAccounts } from './AccountContext'
import { toast } from 'sonner'

// Bank reconciliation interfaces
export interface BankStatement {
  id: string
  account_id: string
  statement_date: string
  opening_balance: number
  closing_balance: number
  statement_period_start: string
  statement_period_end: string
  file_name?: string
  file_url?: string
  status: 'pending' | 'reconciled' | 'discrepancy'
  reconciled_at?: string
  reconciled_by?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface BankTransaction {
  id: string
  bank_statement_id: string
  transaction_date: string
  description: string
  amount: number
  transaction_type: 'debit' | 'credit'
  reference_number?: string
  balance_after?: number
  category_suggested?: string
  matched_transaction_id?: string
  match_confidence: number
  match_status: 'unmatched' | 'matched' | 'manual_match' | 'ignored'
  created_at: string
  updated_at: string
}

export interface ReconciliationSession {
  id: string
  account_id: string
  bank_statement_id: string
  session_date: string
  status: 'in_progress' | 'completed' | 'abandoned'
  total_bank_transactions: number
  matched_transactions: number
  unmatched_transactions: number
  discrepancy_amount: number
  notes?: string
  completed_at?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface ReconciliationDiscrepancy {
  id: string
  reconciliation_session_id: string
  discrepancy_type: 'missing_bank_transaction' | 'missing_app_transaction' | 'amount_mismatch' | 'date_mismatch'
  bank_transaction_id?: string
  app_transaction_id?: string
  expected_amount?: number
  actual_amount?: number
  description: string
  resolution_status: 'pending' | 'resolved' | 'ignored'
  resolution_notes?: string
  resolved_at?: string
  resolved_by?: string
  created_at: string
  updated_at: string
}

export interface ReconciliationSummary {
  total_bank_transactions: number
  matched_transactions: number
  unmatched_transactions: number
  bank_balance: number
  app_balance: number
  discrepancy_amount: number
}

interface BankReconciliationContextType {
  // Bank Statements
  bankStatements: BankStatement[]
  isLoadingStatements: boolean
  addBankStatement: (statement: Omit<BankStatement, 'id' | 'created_at' | 'updated_at'>) => Promise<BankStatement>
  updateBankStatement: (id: string, updates: Partial<BankStatement>) => Promise<BankStatement>
  deleteBankStatement: (id: string) => Promise<void>
  
  // Bank Transactions
  getBankTransactions: (statementId: string) => Promise<BankTransaction[]>
  addBankTransaction: (transaction: Omit<BankTransaction, 'id' | 'created_at' | 'updated_at'>) => Promise<BankTransaction>
  updateBankTransaction: (id: string, updates: Partial<BankTransaction>) => Promise<BankTransaction>
  matchTransaction: (bankTransactionId: string, appTransactionId: string) => Promise<void>
  unmatchTransaction: (bankTransactionId: string) => Promise<void>
  
  // Reconciliation Sessions
  reconciliationSessions: ReconciliationSession[]
  isLoadingSessions: boolean
  startReconciliation: (accountId: string, statementId: string) => Promise<ReconciliationSession>
  completeReconciliation: (sessionId: string, notes?: string) => Promise<void>
  abandonReconciliation: (sessionId: string) => Promise<void>
  
  // Auto-matching and utilities
  autoMatchTransactions: (statementId: string) => Promise<void>
  getReconciliationSummary: (statementId: string) => Promise<ReconciliationSummary>
  importBankStatement: (file: File, accountId: string) => Promise<BankStatement>
}

const BankReconciliationContext = createContext<BankReconciliationContextType | undefined>(undefined)

export function BankReconciliationProvider({ children }: { children: ReactNode }) {
  const { currentAccount } = useAccounts()
  const queryClient = useQueryClient()

  // Fetch bank statements
  const { data: bankStatements = [], isLoading: isLoadingStatements } = useQuery<BankStatement[]>({
    queryKey: ['bankStatements', currentAccount?.id],
    queryFn: async () => {
      if (!currentAccount) return []

      const { data, error } = await supabase
        .from('bank_statements')
        .select('*')
        .eq('account_id', currentAccount.id)
        .order('statement_date', { ascending: false })

      if (error) {
        toast('Failed to fetch bank statements')
        throw error
      }

      return data || []
    },
    enabled: !!currentAccount,
  })

  // Fetch reconciliation sessions
  const { data: reconciliationSessions = [], isLoading: isLoadingSessions } = useQuery<ReconciliationSession[]>({
    queryKey: ['reconciliationSessions', currentAccount?.id],
    queryFn: async () => {
      if (!currentAccount) return []

      const { data, error } = await supabase
        .from('reconciliation_sessions')
        .select('*')
        .eq('account_id', currentAccount.id)
        .order('session_date', { ascending: false })

      if (error) {
        toast('Failed to fetch reconciliation sessions')
        throw error
      }

      return data || []
    },
    enabled: !!currentAccount,
  })

  // Add bank statement mutation
  const addBankStatementMutation = useMutation({
    mutationFn: async (newStatement: Omit<BankStatement, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('bank_statements')
        .insert(newStatement)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankStatements', currentAccount?.id] })
      toast('Bank statement added successfully')
    },
    onError: (error: any) => {
      toast(`Failed to add bank statement: ${error.message}`)
    },
  })

  // Update bank statement mutation
  const updateBankStatementMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BankStatement> }) => {
      const { data, error } = await supabase
        .from('bank_statements')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankStatements', currentAccount?.id] })
      toast('Bank statement updated successfully')
    },
    onError: (error: any) => {
      toast(`Failed to update bank statement: ${error.message}`)
    },
  })

  // Delete bank statement mutation
  const deleteBankStatementMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bank_statements')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankStatements', currentAccount?.id] })
      toast('Bank statement deleted successfully')
    },
    onError: (error: any) => {
      toast(`Failed to delete bank statement: ${error.message}`)
    },
  })

  // Get bank transactions for a statement
  const getBankTransactions = async (statementId: string): Promise<BankTransaction[]> => {
    const { data, error } = await supabase
      .from('bank_transactions')
      .select('*')
      .eq('bank_statement_id', statementId)
      .order('transaction_date', { ascending: false })

    if (error) {
      toast('Failed to fetch bank transactions')
      throw error
    }

    return data || []
  }

  // Add bank transaction mutation
  const addBankTransactionMutation = useMutation({
    mutationFn: async (newTransaction: Omit<BankTransaction, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('bank_transactions')
        .insert(newTransaction)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast('Bank transaction added successfully')
    },
    onError: (error: any) => {
      toast(`Failed to add bank transaction: ${error.message}`)
    },
  })

  // Update bank transaction mutation
  const updateBankTransactionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BankTransaction> }) => {
      const { data, error } = await supabase
        .from('bank_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast('Bank transaction updated successfully')
    },
    onError: (error: any) => {
      toast(`Failed to update bank transaction: ${error.message}`)
    },
  })

  // Match transaction
  const matchTransaction = async (bankTransactionId: string, appTransactionId: string) => {
    await updateBankTransactionMutation.mutateAsync({
      id: bankTransactionId,
      updates: {
        matched_transaction_id: appTransactionId,
        match_status: 'manual_match',
        match_confidence: 1.0,
      },
    })
  }

  // Unmatch transaction
  const unmatchTransaction = async (bankTransactionId: string) => {
    await updateBankTransactionMutation.mutateAsync({
      id: bankTransactionId,
      updates: {
        matched_transaction_id: undefined,
        match_status: 'unmatched',
        match_confidence: 0,
      },
    })
  }

  // Start reconciliation session
  const startReconciliationMutation = useMutation({
    mutationFn: async ({ accountId, statementId }: { accountId: string; statementId: string }) => {
      const { data, error } = await supabase
        .from('reconciliation_sessions')
        .insert({
          account_id: accountId,
          bank_statement_id: statementId,
          status: 'in_progress',
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliationSessions', currentAccount?.id] })
      toast('Reconciliation session started')
    },
    onError: (error: any) => {
      toast(`Failed to start reconciliation: ${error.message}`)
    },
  })

  // Complete reconciliation
  const completeReconciliationMutation = useMutation({
    mutationFn: async ({ sessionId, notes }: { sessionId: string; notes?: string }) => {
      const { error } = await supabase
        .from('reconciliation_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          notes,
        })
        .eq('id', sessionId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliationSessions', currentAccount?.id] })
      toast('Reconciliation completed successfully')
    },
    onError: (error: any) => {
      toast(`Failed to complete reconciliation: ${error.message}`)
    },
  })

  // Auto-match transactions
  const autoMatchTransactions = async (statementId: string) => {
    try {
      const { error } = await supabase.rpc('auto_match_bank_transactions', {
        statement_id: statementId,
      })

      if (error) throw error
      toast('Auto-matching completed')
    } catch (error: any) {
      toast(`Auto-matching failed: ${error.message}`)
      throw error
    }
  }

  // Get reconciliation summary
  const getReconciliationSummary = async (statementId: string): Promise<ReconciliationSummary> => {
    const { data, error } = await supabase.rpc('get_reconciliation_summary', {
      statement_id: statementId,
    })

    if (error) {
      toast('Failed to get reconciliation summary')
      throw error
    }

    return data[0] || {
      total_bank_transactions: 0,
      matched_transactions: 0,
      unmatched_transactions: 0,
      bank_balance: 0,
      app_balance: 0,
      discrepancy_amount: 0,
    }
  }

  // Import bank statement (placeholder - would need actual CSV/OFX parsing)
  const importBankStatement = async (file: File, accountId: string): Promise<BankStatement> => {
    // This would typically involve:
    // 1. Upload file to storage
    // 2. Parse CSV/OFX/QIF format
    // 3. Extract transactions and statement info
    // 4. Create bank statement and transactions
    
    // For now, return a placeholder
    throw new Error('Bank statement import not yet implemented')
  }

  const contextValue: BankReconciliationContextType = {
    // Bank Statements
    bankStatements,
    isLoadingStatements,
    addBankStatement: addBankStatementMutation.mutateAsync,
    updateBankStatement: (id: string, updates: Partial<BankStatement>) =>
      updateBankStatementMutation.mutateAsync({ id, updates }),
    deleteBankStatement: deleteBankStatementMutation.mutateAsync,

    // Bank Transactions
    getBankTransactions,
    addBankTransaction: addBankTransactionMutation.mutateAsync,
    updateBankTransaction: (id: string, updates: Partial<BankTransaction>) =>
      updateBankTransactionMutation.mutateAsync({ id, updates }),
    matchTransaction,
    unmatchTransaction,

    // Reconciliation Sessions
    reconciliationSessions,
    isLoadingSessions,
    startReconciliation: (accountId: string, statementId: string) =>
      startReconciliationMutation.mutateAsync({ accountId, statementId }),
    completeReconciliation: (sessionId: string, notes?: string) =>
      completeReconciliationMutation.mutateAsync({ sessionId, notes }),
    abandonReconciliation: async (sessionId: string) => {
      await supabase
        .from('reconciliation_sessions')
        .update({ status: 'abandoned' })
        .eq('id', sessionId)
    },

    // Utilities
    autoMatchTransactions,
    getReconciliationSummary,
    importBankStatement,
  }

  return (
    <BankReconciliationContext.Provider value={contextValue}>
      {children}
    </BankReconciliationContext.Provider>
  )
}

export function useBankReconciliation() {
  const context = useContext(BankReconciliationContext)
  if (context === undefined) {
    throw new Error('useBankReconciliation must be used within a BankReconciliationProvider')
  }
  return context
}