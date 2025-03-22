"use client"

import { createContext, useContext, ReactNode, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTransactions } from "./TransactionContext"
import { useAccounts } from "./AccountContext"
import { format, subMonths, isWithinInterval, parse } from "date-fns"

// Financial data interfaces
export interface MonthlyData {
  month: string
  income: number
  expenses: number
  profit: number
}

export interface CategoryData {
  category: string
  amount: number
  percentage: number
}

export interface FinancialSummary {
  totalRevenue: number
  totalExpenses: number
  totalProfit: number
  profitMargin: number
  cashFlow: number
}

// Context interface
interface AnalyticsContextType {
  monthlyData: MonthlyData[]
  incomeByCategory: CategoryData[]
  expensesByCategory: CategoryData[]
  financialSummary: FinancialSummary
  dateRange: {
    startDate: Date
    endDate: Date
  }
  setDateRange: (range: { startDate: Date; endDate: Date }) => void
  isLoading: boolean
  error: string | null
  refreshData: () => void
}

// Create the context with a default value
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

// Provider component
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { transactions } = useTransactions()
  const { currentAccount } = useAccounts()
  
  // Default to last 6 months
  const [dateRange, setDateRange] = useState({
    startDate: subMonths(new Date(), 6),
    endDate: new Date(),
  })

  // Calculate all analytics data based on transactions and date range
  const calculateAnalyticsData = async () => {


    try {


      // Filter transactions by date range and current account
      const filteredTransactions = transactions.filter(t => 
        t.account_id === currentAccount.id &&
        isWithinInterval(new Date(t.date), {
          start: dateRange.startDate,
          end: dateRange.endDate,
        })
      )

      // Calculate monthly data
      const monthlyMap = new Map<string, MonthlyData>()
      filteredTransactions.forEach(transaction => {
        const month = format(new Date(transaction.date), 'yyyy-MM')
        const existing = monthlyMap.get(month) || {
          month,
          income: 0,
          expenses: 0,
          profit: 0,
        }

        if (transaction.type === 'income') {
          existing.income += transaction.amount
        } else {
          existing.expenses += transaction.amount
        }
        existing.profit = existing.income - existing.expenses
        monthlyMap.set(month, existing)
      })

      // Convert to array and sort by month
      const monthlyDataArray = Array.from(monthlyMap.values())
        .sort((a, b) => a.month.localeCompare(b.month))

      // Calculate category data
      const incomeMap = new Map<string, number>()
      const expensesMap = new Map<string, number>()
      let totalIncome = 0
      let totalExpenses = 0

      filteredTransactions.forEach(transaction => {
        const map = transaction.type === 'income' ? incomeMap : expensesMap
        const amount = transaction.amount
        map.set(
          transaction.category,
          (map.get(transaction.category) || 0) + amount
        )
        if (transaction.type === 'income') {
          totalIncome += amount
        } else {
          totalExpenses += amount
        }
      })

      // Convert to arrays with percentages
      const incomeCategoryData = Array.from(incomeMap.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalIncome ? (amount / totalIncome) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount)

      const expensesCategoryData = Array.from(expensesMap.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpenses ? (amount / totalExpenses) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount)

      // Calculate financial summary
      const totalProfit = totalIncome - totalExpenses
      const profitMargin = totalIncome ? (totalProfit / totalIncome) * 100 : 0
      const cashFlow = totalIncome - totalExpenses

      return {
        monthlyData: monthlyDataArray,
        incomeByCategory: incomeCategoryData,
        expensesByCategory: expensesCategoryData,
        financialSummary: {
          totalRevenue: totalIncome,
          totalExpenses,
          totalProfit,
          profitMargin,
          cashFlow
        }
      }
    } catch (error) {
      console.error('Error calculating analytics:', error)
      throw new Error('Failed to calculate analytics data')
    }
  }

  const queryKey = ['analytics', currentAccount?.id, dateRange.startDate.toISOString(), dateRange.endDate.toISOString()]
  
  const {
    data: analyticsData,
    isLoading,
    error,
    refetch: refreshData
  } = useQuery({
    queryKey,
    queryFn: calculateAnalyticsData,
    enabled: !!currentAccount && !!transactions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })


  return (
    <AnalyticsContext.Provider
      value={{
        monthlyData: analyticsData?.monthlyData ?? [],
        incomeByCategory: analyticsData?.incomeByCategory ?? [],
        expensesByCategory: analyticsData?.expensesByCategory ?? [],
        financialSummary: analyticsData?.financialSummary ?? {
          totalRevenue: 0,
          totalExpenses: 0,
          totalProfit: 0,
          profitMargin: 0,
          cashFlow: 0,
        },
        dateRange,
        setDateRange,
        isLoading,
        error: error ? (error as Error).message : null,
        refreshData,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}