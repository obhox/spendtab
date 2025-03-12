"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useTransactions } from "./TransactionContext"
import { useAccounts } from "./AccountContext"
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
  const { currentAccount } = useAccounts()
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
    try {
      // Reset data if no account or transactions
      if (!currentAccount || !transactions || transactions.length === 0) {
        setCashFlowData(null)
        setProfitLossData(null)
        setExpenseData(null)
        setIsLoading(false)
        setError(null)
        return
      }

      // Filter transactions by date range and current account
      const filteredTransactions = transactions.filter(t => 
        t.account_id === currentAccount.id &&
        isWithinInterval(new Date(t.date), {
          start: dateRange.startDate,
          end: dateRange.endDate,
        })
      )

      // Calculate Cash Flow Report
      const cashInCategories = new Map<string, CashFlowCategory>()
      const cashOutCategories = new Map<string, CashFlowCategory>()
      let totalCashIn = 0
      let totalCashOut = 0

      filteredTransactions.forEach(transaction => {
        const map = transaction.type === 'income' ? cashInCategories : cashOutCategories
        const amount = transaction.amount
        
        const existing = map.get(transaction.category) || {
          name: transaction.category,
          amount: 0,
          subItems: []
        }
        
        existing.amount += amount
        existing.subItems?.push({
          name: transaction.description,
          amount: amount
        })
        
        map.set(transaction.category, existing)
        
        if (transaction.type === 'income') {
          totalCashIn += amount
        } else {
          totalCashOut += amount
        }
      })

      // Calculate monthly cash flow
      const monthlyCashFlow = new Map<string, { cashIn: number; cashOut: number; netFlow: number }>()
      filteredTransactions.forEach(transaction => {
        const month = format(new Date(transaction.date), 'yyyy-MM')
        const existing = monthlyCashFlow.get(month) || { cashIn: 0, cashOut: 0, netFlow: 0 }
        
        if (transaction.type === 'income') {
          existing.cashIn += transaction.amount
        } else {
          existing.cashOut += transaction.amount
        }
        existing.netFlow = existing.cashIn - existing.cashOut
        
        monthlyCashFlow.set(month, existing)
      })

      // Update Cash Flow Data
      setCashFlowData({
        period: `${format(dateRange.startDate, 'MMM d, yyyy')} - ${format(dateRange.endDate, 'MMM d, yyyy')}`,
        startingBalance: 0, // You might want to calculate this based on previous periods
        cashIn: Array.from(cashInCategories.values()),
        cashOut: Array.from(cashOutCategories.values()),
        totalCashIn,
        totalCashOut,
        netCashFlow: totalCashIn - totalCashOut,
        endingBalance: totalCashIn - totalCashOut, // This is simplified
        monthlyCashFlow: Array.from(monthlyCashFlow.entries()).map(([month, data]) => ({
          month,
          ...data
        })).sort((a, b) => a.month.localeCompare(b.month))
      })

      // Calculate Profit & Loss Report
      setProfitLossData({
        period: `${format(dateRange.startDate, 'MMM d, yyyy')} - ${format(dateRange.endDate, 'MMM d, yyyy')}`,
        revenue: Array.from(cashInCategories.values()),
        expenses: Array.from(cashOutCategories.values()),
        totalRevenue: totalCashIn,
        totalExpenses: totalCashOut,
        grossProfit: totalCashIn - totalCashOut,
        netProfit: totalCashIn - totalCashOut, // This is simplified
        profitMargin: totalCashIn ? ((totalCashIn - totalCashOut) / totalCashIn) * 100 : 0
      })

      // Calculate Expense Report
      const expenseItems = filteredTransactions
        .filter(t => t.type === 'expense')
        .map(t => ({
          id: t.id,
          date: t.date,
          category: t.category,
          description: t.description,
          amount: t.amount,
          paymentMethod: t.payment_source || 'Not specified'
        }))

      // Calculate category totals
      const categoryTotals = Array.from(cashOutCategories.entries())
        .map(([name, data]) => ({
          name,
          value: data.amount,
          percentage: totalCashOut ? (data.amount / totalCashOut) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value)

      // Calculate payment method totals
      const paymentMethodMap = new Map<string, number>()
      expenseItems.forEach(item => {
        const method = item.paymentMethod
        paymentMethodMap.set(method, (paymentMethodMap.get(method) || 0) + item.amount)
      })

      const paymentMethodTotals = Array.from(paymentMethodMap.entries())
        .map(([name, value]) => ({
          name,
          value,
          percentage: totalCashOut ? (value / totalCashOut) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value)

      setExpenseData({
        period: `${format(dateRange.startDate, 'MMM d, yyyy')} - ${format(dateRange.endDate, 'MMM d, yyyy')}`,
        expenses: expenseItems,
        totalExpenses: totalCashOut,
        categoryTotals,
        paymentMethodTotals,
        topExpenses: [...expenseItems].sort((a, b) => b.amount - a.amount).slice(0, 10)
      })

      setIsLoading(false)
      setError(null)
    } catch (error) {
      console.error('Error calculating reports:', error)
      setError('Failed to calculate reports data')
      setIsLoading(false)
    }
  }

  // Recalculate when transactions, date range, or account changes
  useEffect(() => {
    setIsLoading(true)
    calculateReportsData()
  }, [transactions, dateRange, currentAccount])

  // Function to manually refresh data
  const refreshData = () => {
    setIsLoading(true)
    calculateReportsData()
  }

  return (
    <ReportsContext.Provider
      value={{
        cashFlowData,
        profitLossData,
        expenseData,
        dateRange,
        setDateRange,
        isLoading,
        error,
        refreshData,
      }}
    >
      {children}
    </ReportsContext.Provider>
  )
}

export function useReports() {
  const context = useContext(ReportsContext)
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider')
  }
  return context
}
