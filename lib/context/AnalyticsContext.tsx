"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useTransactions } from "./TransactionContext"
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
  const { transactions, isLoading: transactionsLoading } = useTransactions()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Default to last 6 months
  const [dateRange, setDateRange] = useState({
    startDate: subMonths(new Date(), 6),
    endDate: new Date(),
  })
  
  // State for analytics data
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [incomeByCategory, setIncomeByCategory] = useState<CategoryData[]>([])
  const [expensesByCategory, setExpensesByCategory] = useState<CategoryData[]>([])
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0,
    profitMargin: 0,
    cashFlow: 0,
  })

  // Calculate all analytics data based on transactions and date range
  const calculateAnalyticsData = () => {
    if (transactionsLoading) {
      setIsLoading(true)
      return
    }
    
    // Filter transactions by date range
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      return isWithinInterval(transactionDate, {
        start: dateRange.startDate,
        end: dateRange.endDate
      })
    })
    
    // Calculate monthly data
    const monthlyDataMap = new Map<string, MonthlyData>()
    
    // Create entries for each month in the range
    let currentDate = new Date(dateRange.startDate)
    while (currentDate <= dateRange.endDate) {
      const monthKey = format(currentDate, 'yyyy-MM')
      monthlyDataMap.set(monthKey, {
        month: format(currentDate, 'MMM yyyy'),
        income: 0,
        expenses: 0,
        profit: 0
      })
      currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1))
    }
    
    // Aggregate transaction data by month
    filteredTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date)
      const monthKey = format(transactionDate, 'yyyy-MM')
      
      if (monthlyDataMap.has(monthKey)) {
        const monthData = monthlyDataMap.get(monthKey)!
        if (transaction.type === 'income') {
          monthData.income += transaction.amount
        } else {
          monthData.expenses += Math.abs(transaction.amount)
        }
        monthData.profit = monthData.income - monthData.expenses
      }
    })
    
    // Convert map to sorted array
    const sortedMonthlyData = Array.from(monthlyDataMap.values())
      .sort((a, b) => {
        const dateA = parse(a.month, 'MMM yyyy', new Date())
        const dateB = parse(b.month, 'MMM yyyy', new Date())
        return dateA.getTime() - dateB.getTime()
      })
    
    setMonthlyData(sortedMonthlyData)
    
    // Calculate totals for financial summary
    const totalRevenue = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    const totalProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    const cashFlow = totalRevenue - totalExpenses
    
    setFinancialSummary({
      totalRevenue,
      totalExpenses,
      totalProfit,
      profitMargin,
      cashFlow
    })
    
    // Calculate income by category
    const incomeByCategoryMap = new Map<string, number>()
    
    filteredTransactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        const current = incomeByCategoryMap.get(t.category) || 0
        incomeByCategoryMap.set(t.category, current + t.amount)
      })
    
    const incomeCategories = Array.from(incomeByCategoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0
    }))
    
    setIncomeByCategory(incomeCategories.sort((a, b) => b.amount - a.amount))
    
    // Calculate expenses by category
    const expensesByCategoryMap = new Map<string, number>()
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = expensesByCategoryMap.get(t.category) || 0
        expensesByCategoryMap.set(t.category, current + Math.abs(t.amount))
      })
    
    const expenseCategories = Array.from(expensesByCategoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    }))
    
    setExpensesByCategory(expenseCategories.sort((a, b) => b.amount - a.amount))
    
    setIsLoading(false)
  }

  // Refresh data function - can be called when transactions change
  const refreshData = () => {
    calculateAnalyticsData()
  }

  // Calculate analytics when transactions or date range changes
  useEffect(() => {
    calculateAnalyticsData()
  }, [transactions, dateRange, transactionsLoading])

  // Context value
  const value = {
    monthlyData,
    incomeByCategory,
    expensesByCategory,
    financialSummary,
    dateRange,
    setDateRange,
    isLoading,
    error,
    refreshData
  }

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

// Custom hook to use the analytics context
export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider")
  }
  return context
}
