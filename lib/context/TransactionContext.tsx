"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "../supabase"
import { v4 as uuidv4 } from 'uuid'

// Transaction data interface
export interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: "income" | "expense"
  notes?: string
  budget_id?: string
}

// Context interface
interface TransactionContextType {
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>
  updateTransaction: (id: string, transaction: Omit<Transaction, "id">) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

// Create the context with a default value
const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

// Provider component
export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial data from Supabase
  useEffect(() => {
    async function fetchTransactions() {
      try {
        setIsLoading(true)
        
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false })
        
        if (error) {
          throw error
        }
        
        if (data) {
          setTransactions(data.map(item => ({
            id: item.id,
            date: item.date,
            description: item.description,
            category: item.category,
            amount: item.amount,
            type: item.type,
            notes: item.notes || undefined,
            budget_id: item.budget_id || undefined
          })))
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setError('Failed to load transactions')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTransactions()

    // Set up real-time subscription
    const channel = supabase
      .channel('transactions-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'transactions' 
        }, 
        () => {
          fetchTransactions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Add a new transaction
  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      setIsLoading(true)
      
      const newTransaction = {
        ...transaction,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('transactions')
        .insert(newTransaction)
      
      if (error) {
        throw error
      }
      
      // Optimistically update the UI
      setTransactions(prev => [...prev, { 
        id: newTransaction.id,
        date: transaction.date,
        description: transaction.description,
        category: transaction.category,
        amount: transaction.amount,
        type: transaction.type,
        notes: transaction.notes
      }])

      // Update budget spent amount
      const budgetCategory = transaction.category;
      const transactionAmount = transaction.amount;
      const isExpense = transaction.type === "expense";

      try {
        // Fetch the existing budget for the category
        const { data: budgetData, error: budgetError } = await supabase
          .from('budgets')
          .select('*')
          .eq('category', budgetCategory)
          .single();

        if (budgetError) {
          console.error('Error fetching budget:', budgetError);
          throw budgetError; // Re-throw to handle it in the outer catch
        }

        if (budgetData) {
          // Calculate the new spent amount
          const newSpent = isExpense
            ? budgetData.spent + transactionAmount
            : budgetData.spent - transactionAmount;

          // Update the budget in Supabase
          const { error: updateError } = await supabase
            .from('budgets')
            .update({ spent: newSpent })
            .eq('id', budgetData.id);

          if (updateError) {
            console.error('Error updating budget:', updateError);
            throw updateError; // Re-throw to handle it in the outer catch
          }
        }
      } catch (error) {
        console.error('Error updating budget spent amount:', error);
        setError('Failed to update budget spent amount');
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
      setError('Failed to add transaction')
    } finally {
      setIsLoading(false)
    }
  }

  // Update an existing transaction
  const updateTransaction = async (id: string, updatedTransaction: Omit<Transaction, "id">) => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase
        .from('transactions')
        .update({
          ...updatedTransaction,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      // Optimistically update the UI
      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === id ? { ...updatedTransaction, id } : transaction
        )
      )

      // Update budget spent amount
      try {
        // Fetch the old transaction details
        const { data: oldTransactionData, error: oldTransactionError } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', id)
          .single();

        if (oldTransactionError) {
          console.error('Error fetching old transaction:', oldTransactionError);
          throw oldTransactionError;
        }

        if (oldTransactionData) {
          const oldCategory = oldTransactionData.category;
          const oldAmount = oldTransactionData.amount;
          const oldIsExpense = oldTransactionData.type === "expense";

          // Update the old budget
          if (oldCategory) {
            const { data: oldBudgetData, error: oldBudgetError } = await supabase
              .from('budgets')
              .select('*')
              .eq('category', oldCategory)
              .single();

            if (oldBudgetError) {
              console.error('Error fetching old budget:', oldBudgetError);
              throw oldBudgetError;
            }

            if (oldBudgetData) {
              const newSpentOld = oldIsExpense
                ? oldBudgetData.spent - oldAmount
                : oldBudgetData.spent + oldAmount;

              const { error: updateOldBudgetError } = await supabase
                .from('budgets')
                .update({ spent: newSpentOld })
                .eq('id', oldBudgetData.id);

              if (updateOldBudgetError) {
                console.error('Error updating old budget:', updateOldBudgetError);
                throw updateOldBudgetError;
              }
            }
          }
        }

        // Fetch the new transaction details
        const newCategory = updatedTransaction.category;
        const newAmount = updatedTransaction.amount;
        const newIsExpense = updatedTransaction.type === "expense";

        // Update the new budget
        if (newCategory) {
          const { data: newBudgetData, error: newBudgetError } = await supabase
            .from('budgets')
            .select('*')
            .eq('category', newCategory)
            .single();

          if (newBudgetError) {
            console.error('Error fetching new budget:', newBudgetError);
            throw newBudgetError;
          }

          if (newBudgetData) {
            const newSpentNew = newIsExpense
              ? newBudgetData.spent + newAmount
              : newBudgetData.spent - newAmount;

            const { error: updateNewBudgetError } = await supabase
              .from('budgets')
              .update({ spent: newSpentNew })
              .eq('id', newBudgetData.id);

            if (updateNewBudgetError) {
              console.error('Error updating new budget:', updateNewBudgetError);
              throw updateNewBudgetError;
            }
          }
        }
      } catch (error) {
        console.error('Error updating budget spent amount:', error);
        setError('Failed to update budget spent amount');
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      setError('Failed to update transaction')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a transaction
  const deleteTransaction = async (id: string) => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      // Update the UI
      setTransactions(prev => prev.filter(transaction => transaction.id !== id))

      // Update budget spent amount
      try {
        // Fetch the transaction details
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', id)
          .single();

        if (transactionError) {
          console.error('Error fetching transaction:', transactionError);
          throw transactionError;
        }

        if (transactionData) {
          const category = transactionData.category;
          const amount = transactionData.amount;
          const isExpense = transactionData.type === "expense";

          // Update the budget
          if (category) {
            const { data: budgetData, error: budgetError } = await supabase
              .from('budgets')
              .select('*')
              .eq('category', category)
              .single();

            if (budgetError) {
              console.error('Error fetching budget:', budgetError);
              throw budgetError;
            }

            if (budgetData) {
              const newSpent = isExpense
                ? budgetData.spent - amount
                : budgetData.spent + amount;

              const { error: updateError } = await supabase
                .from('budgets')
                .update({ spent: newSpent })
                .eq('id', budgetData.id);

              if (updateError) {
                console.error('Error updating budget:', updateError);
                throw updateError;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error updating budget spent amount:', error);
        setError('Failed to update budget spent amount');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      setError('Failed to delete transaction')
    } finally {
      setIsLoading(false)
    }
  }

  // Context value
  const value = {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isLoading,
    error,
  }

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>
}

// Custom hook to use the transaction context
export function useTransactions() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider")
  }
  return context
}
