"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useTransactions } from "./TransactionContext"
import { format, subMonths, isWithinInterval, parse, startOfMonth, endOfMonth, subQuarters, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns"

// Cash Flow Report interfaces
interface CashFlowCategory {
  name: string
  amount: number
  subItems?: { name: string; amount: number }[]
}

interface CashFlowData {
  period: string
  startingBalance: number
  cashIn: CashFlowCategory[]
  cashOut: CashFlowCategory[]
  totalCashIn: number
  totalCashOut: number
  netCashFlow: number
  endingBalance: number
  monthlyCashFlow: { month: string; cashIn: number; cashOut: number; netFlow: number }[]
}

// Profit Loss Report interfaces
interface ProfitLossCategory {
  name: string
  amount: number
  subItems?: { name: string; amount: number }[]
}

interface ProfitLossData {
  period: string
  revenue: ProfitLossCategory[]
  expenses: ProfitLossCategory[]
  totalRevenue: number
  totalExpenses: number
  grossProfit: number
  netProfit: number
  profitMargin: number
}

// Expense Report interfaces
interface ExpenseItem {
  id: string
  date: string
  category: string
  description: string
  amount: number
  paymentMethod: string
}

interface CategoryTotal {
  name: string
  value: number
  percentage: number
}

interface ExpenseData {
  period: string
  expenses: ExpenseItem[]
  totalExpenses: number
  categoryTotals: CategoryTotal[]
  paymentMethodTotals: CategoryTotal[]
  topExpenses: ExpenseItem[]
}

// Context interface
interface ReportsContextType {
  cashFlowData: CashFlowData | null
  profitLossData: ProfitLossData | null
  expenseData: ExpenseData | null
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
const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

// Provider component
export function ReportsProvider({ children }: { children: ReactNode }) {
  const { transactions, isLoading: transactionsLoading } = useTransactions()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Default to current quarter
  const [dateRange, setDateRange] = useState({
    startDate: startOfQuarter(new Date()),
    endDate: endOfQuarter(new Date()),
  })
  
  // State for reports data
  const [cashFlowData, setCashFlowData] = useState<CashFlowData | null>(null)
  const [profitLossData, setProfitLossData] = useState<ProfitLossData | null>(null)
  const [expenseData, setExpenseData] = useState<ExpenseData | null>(null)

  // Calculate all reports data based on transactions and date range
  const calculateReportsData = () => {
    if (transactionsLoading) {
      setIsLoading(true)
      return
    }
    
    if (!transactions || transactions.length === 0) {
      setCashFlowData(null)
      setProfitLossData(null)
      setExpenseData(null)
      setIsLoading(false)
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
    
    if (filteredTransactions.length === 0) {
      setCashFlowData(null)
      setProfitLossData(null)
      setExpenseData(null)
      setIsLoading(false)
      return
    }
    
    // Calculate Profit Loss Report data
    calculateProfitLossData(filteredTransactions)
    
    // Calculate Cash Flow Report data
    calculateCashFlowData(filteredTransactions)
    
    // Calculate Expense Report data
    calculateExpenseData(filteredTransactions)
    
    setIsLoading(false)
  }
  
  const calculateProfitLossData = (filteredTransactions: any[]) => {
    // Group income transactions by category
    const revenueByCategory = new Map<string, number>()
    
    filteredTransactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        const current = revenueByCategory.get(t.category) || 0
        revenueByCategory.set(t.category, current + t.amount)
      })
    
    const revenue = Array.from(revenueByCategory.entries()).map(([name, amount]) => ({
      name,
      amount
    }))
    
    // Group expense transactions by category
    const expensesByCategory = new Map<string, number>()
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = expensesByCategory.get(t.category) || 0
        expensesByCategory.set(t.category, current + Math.abs(t.amount))
      })
    
    const expenses = Array.from(expensesByCategory.entries()).map(([name, amount]) => ({
      name,
      amount
    }))
    
    // Calculate totals
    const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0)
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0)
    const grossProfit = totalRevenue - totalExpenses
    const netProfit = grossProfit
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
    
    const periodText = `${format(dateRange.startDate, 'MMM d, yyyy')} - ${format(dateRange.endDate, 'MMM d, yyyy')}`
    
    setProfitLossData({
      period: periodText,
      revenue,
      expenses,
      totalRevenue,
      totalExpenses,
      grossProfit,
      netProfit,
      profitMargin
    })
  }
  
  const calculateCashFlowData = (filteredTransactions: any[]) => {
    // Calculate starting balance based on transactions before the start date
    const startingBalance = transactions
      .filter(t => new Date(t.date) < dateRange.startDate)
      .reduce((balance, t) => {
        return balance + (t.type === 'income' ? t.amount : -Math.abs(t.amount))
      }, 0)
    
    // Group income transactions by category for cash in
    const cashInByCategory = new Map<string, number>()
    
    filteredTransactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        const current = cashInByCategory.get(t.category) || 0
        cashInByCategory.set(t.category, current + t.amount)
      })
    
    const cashIn = Array.from(cashInByCategory.entries()).map(([name, amount]) => ({
      name,
      amount
    }))
    
    // Group expense transactions by category for cash out
    const cashOutByCategory = new Map<string, number>()
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = cashOutByCategory.get(t.category) || 0
        cashOutByCategory.set(t.category, current + Math.abs(t.amount))
      })
    
    const cashOut = Array.from(cashOutByCategory.entries()).map(([name, amount]) => ({
      name,
      amount
    }))
    
    // Calculate monthly cash flow
    const monthlyDataMap = new Map<string, { month: string; cashIn: number; cashOut: number; netFlow: number }>()
    
    // Create entries for each month in the range
    let currentDate = new Date(dateRange.startDate)
    while (currentDate <= dateRange.endDate) {
      const monthKey = format(currentDate, 'yyyy-MM')
      monthlyDataMap.set(monthKey, {
        month: format(currentDate, 'MMM yyyy'),
        cashIn: 0,
        cashOut: 0,
        netFlow: 0
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
          monthData.cashIn += transaction.amount
        } else {
          monthData.cashOut += Math.abs(transaction.amount)
        }
        monthData.netFlow = monthData.cashIn - monthData.cashOut
      }
    })
    
    // Convert map to sorted array
    const monthlyCashFlow = Array.from(monthlyDataMap.values())
      .sort((a, b) => {
        const dateA = parse(a.month, 'MMM yyyy', new Date())
        const dateB = parse(b.month, 'MMM yyyy', new Date())
        return dateA.getTime() - dateB.getTime()
      })
    
    // Calculate totals
    const totalCashIn = cashIn.reduce((sum, item) => sum + item.amount, 0)
    const totalCashOut = cashOut.reduce((sum, item) => sum + item.amount, 0)
    const netCashFlow = totalCashIn - totalCashOut
    const endingBalance = startingBalance + netCashFlow
    
    const periodText = `${format(dateRange.startDate, 'MMM d, yyyy')} - ${format(dateRange.endDate, 'MMM d, yyyy')}`
    
    setCashFlowData({
      period: periodText,
      startingBalance,
      cashIn,
      cashOut,
      totalCashIn,
      totalCashOut,
      netCashFlow,
      endingBalance,
      monthlyCashFlow
    })
  }
  
  const calculateExpenseData = (filteredTransactions: any[]) => {
    // Filter only expense transactions
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .map(t => ({
        id: t.id,
        date: t.date,
        category: t.category,
        description: t.description,
        amount: Math.abs(t.amount),
        paymentMethod: t.paymentMethod || 'Other' // Fallback if payment method is not specified
      }))
    
    if (expenses.length === 0) {
      setExpenseData(null)
      return
    }
    
    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    
    // Calculate expenses by category
    const categoryTotalsMap = new Map<string, number>()
    expenses.forEach(expense => {
      const current = categoryTotalsMap.get(expense.category) || 0
      categoryTotalsMap.set(expense.category, current + expense.amount)
    })
    
    const categoryTotals = Array.from(categoryTotalsMap.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0
    }))
    
    // Calculate expenses by payment method
    const paymentMethodTotalsMap = new Map<string, number>()
    expenses.forEach(expense => {
      const current = paymentMethodTotalsMap.get(expense.paymentMethod) || 0
      paymentMethodTotalsMap.set(expense.paymentMethod, current + expense.amount)
    })
    
    const paymentMethodTotals = Array.from(paymentMethodTotalsMap.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0
    }))
    
    // Get top expenses (sorted by amount)
    const topExpenses = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5)
    
    const periodText = `${format(dateRange.startDate, 'MMM d, yyyy')} - ${format(dateRange.endDate, 'MMM d, yyyy')}`
    
    setExpenseData({
      period: periodText,
      expenses,
      totalExpenses,
      categoryTotals,
      paymentMethodTotals,
      topExpenses
    })
  }

  // Refresh data function - can be called when transactions change
  const refreshData = () => {
    calculateReportsData()
  }

  // Calculate reports when transactions or date range changes
  useEffect(() => {
    calculateReportsData()
  }, [transactions, dateRange, transactionsLoading])

  // Context value
  const value = {
    cashFlowData,
    profitLossData,
    expenseData,
    dateRange,
    setDateRange,
    isLoading,
    error,
    refreshData
  }

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
}

// Custom hook to use the reports context
export function useReports() {
  const context = useContext(ReportsContext)
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportsProvider")
  }
  return context
}
