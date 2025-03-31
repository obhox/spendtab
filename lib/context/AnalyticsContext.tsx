"use client"

import { createContext, useContext, ReactNode, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTransactions } from "./TransactionContext" // Assuming TransactionContext provides raw transactions
import { useAccounts } from "./AccountContext"
import { format, subMonths, isWithinInterval, parse } from "date-fns"
// If dates are ISO strings (e.g., from Supabase timestampz), use parseISO:
// import { format, subMonths, isWithinInterval, parseISO } from "date-fns"

// Financial data interfaces (assuming these are defined correctly)
export interface MonthlyData {
  month: string // Format: YYYY-MM
  income: number
  expenses: number
  profit: number
}

export interface CategoryData {
  category: string
  amount: number
  percentage: number // Percentage of total income or total expense
}

export interface FinancialSummary {
  totalRevenue: number // Total Income in the period
  totalExpenses: number // Total Expenses in the period
  totalProfit: number // Revenue - Expenses
  profitMargin: number // (Profit / Revenue) * 100
  cashFlow: number // Alias for Total Profit in this context
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
  refreshData: () => void // Function to manually trigger a refetch
}

// Create the context with a default value
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

// Provider component
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { transactions, isLoading: transactionsLoading } = useTransactions() // Get raw transactions
  const { currentAccount, isAccountSwitching } = useAccounts()

  // State for the date range, default to the last 6 months including today
  const [dateRange, setDateRange] = useState({
    startDate: subMonths(new Date(), 6),
    endDate: new Date(),
  })

  // --- Date Parsing Configuration ---
  // IMPORTANT: Choose the correct format string or function based on how dates are stored
  const DATE_FORMAT_STRING = 'yyyy-MM-dd' // Example: Assumes dates are like '2023-10-26'
  // If using ISO strings (e.g., '2023-10-26T10:00:00+00:00'), use parseISO:
  // const parseDateString = (dateStr: string) => parseISO(dateStr);
  const parseDateString = (dateStr: string): Date => {
      // Provide a reference date for formats that might need it
      return parse(dateStr, DATE_FORMAT_STRING, new Date());
  }
  // ---------------------------------


  // The core function to calculate all analytics data
  // Wrapped by react-query's useQuery below
  const calculateAnalyticsData = async () => {
    if (!currentAccount || !transactions || transactions.length === 0) {
       // Return default empty state if prerequisites aren't met
       return {
         monthlyData: [],
         incomeByCategory: [],
         expensesByCategory: [],
         financialSummary: { totalRevenue: 0, totalExpenses: 0, totalProfit: 0, profitMargin: 0, cashFlow: 0 }
       };
    }

    try {
      // Filter transactions by current account and date range using robust parsing
      const filteredTransactions = transactions.filter(t => {
        if (!t.date || t.account_id !== currentAccount.id) {
          return false;
        }
        try {
          const transactionDate = parseDateString(t.date);
          return isWithinInterval(transactionDate, {
            start: dateRange.startDate,
            end: dateRange.endDate,
          });
        } catch (error) {
          console.warn(`Skipping transaction due to invalid date format: ${t.date}`, error);
          return false; // Skip transactions with unparseable dates
        }
      });

      // --- Calculate Monthly Data ---
      const monthlyMap = new Map<string, MonthlyData>()
      filteredTransactions.forEach(transaction => {
         try {
            // Ensure date is parsed correctly for formatting the month key
            const transactionDate = parseDateString(transaction.date);
            const monthKey = format(transactionDate, 'yyyy-MM'); // Group by year and month

            const existing = monthlyMap.get(monthKey) || {
              month: monthKey, // Use the formatted month string
              income: 0,
              expenses: 0,
              profit: 0,
            };

            if (transaction.type === 'income') {
              existing.income += transaction.amount;
            } else { // Assuming type is 'expense'
              existing.expenses += transaction.amount;
            }
            existing.profit = existing.income - existing.expenses;
            monthlyMap.set(monthKey, existing);

         } catch (error) {
             console.warn(`Skipping transaction during monthly aggregation due to invalid date format: ${transaction.date}`, error);
         }
      });

      // Convert map to array and sort chronologically
      const monthlyDataArray = Array.from(monthlyMap.values())
        .sort((a, b) => a.month.localeCompare(b.month)); // Sort by YYYY-MM string


      // --- Calculate Category Data & Totals ---
      const incomeMap = new Map<string, number>();
      const expensesMap = new Map<string, number>();
      let totalIncome = 0;
      let totalExpenses = 0;

      filteredTransactions.forEach(transaction => {
        // Use 'Uncategorized' if category is missing or empty
        const category = transaction.category?.trim() || 'Uncategorized';
        const amount = transaction.amount;

        if (transaction.type === 'income') {
          incomeMap.set(category, (incomeMap.get(category) || 0) + amount);
          totalIncome += amount;
        } else { // Assuming type is 'expense'
          expensesMap.set(category, (expensesMap.get(category) || 0) + amount);
          totalExpenses += amount;
        }
      });

      // Convert category maps to arrays including percentages
      const incomeCategoryData = Array.from(incomeMap.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount); // Sort by amount descending

      const expensesCategoryData = Array.from(expensesMap.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount); // Sort by amount descending

      // --- Calculate Financial Summary ---
      const totalProfit = totalIncome - totalExpenses;
      // Handle division by zero for profit margin
      const profitMargin = totalIncome > 0 ? (totalProfit / totalIncome) * 100 : 0;
      const cashFlow = totalProfit; // Cash flow is simply income - expenses here

      return {
        monthlyData: monthlyDataArray,
        incomeByCategory: incomeCategoryData,
        expensesByCategory: expensesCategoryData,
        financialSummary: {
          totalRevenue: totalIncome,
          totalExpenses,
          totalProfit,
          profitMargin,
          cashFlow,
        },
      };
    } catch (error) {
      console.error('Error calculating analytics:', error);
      // Throw the error so react-query can catch it
      throw new Error('Failed to calculate analytics data');
    }
  };

  // --- React Query Setup ---
  // Query key includes dependencies that should trigger a refetch when changed
  const queryKey = [
      'analytics',
      currentAccount?.id,
      dateRange.startDate.toISOString(), // Use ISO string for reliable key serialization
      dateRange.endDate.toISOString()
  ];

  const {
    data: analyticsData,
    isLoading: queryLoading,
    error,
    refetch: refreshData // Expose refetch function
  } = useQuery({
    queryKey: queryKey,
    queryFn: calculateAnalyticsData,
    // Only run the query if we have an account and transactions are loaded (or loading is finished)
    enabled: !!currentAccount && !transactionsLoading && !isAccountSwitching,
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    gcTime: 30 * 60 * 1000,  // Cache kept for 30 minutes after inactive
    // Placeholder data can be useful for smoother initial loads
    // placeholderData: keepPreviousData, // Option from react-query v5+
  });

  // Combine loading states
  const isLoading = queryLoading || transactionsLoading || isAccountSwitching;

  // --- Context Provider Value ---
  const contextValue: AnalyticsContextType = {
    // Provide calculated data or defaults if data is not yet available
    monthlyData: analyticsData?.monthlyData ?? [],
    incomeByCategory: analyticsData?.incomeByCategory ?? [],
    expensesByCategory: analyticsData?.expensesByCategory ?? [],
    financialSummary: analyticsData?.financialSummary ?? {
      totalRevenue: 0, totalExpenses: 0, totalProfit: 0, profitMargin: 0, cashFlow: 0
    },
    dateRange,
    setDateRange, // Function to update the date range
    isLoading,
    error: error ? (error as Error).message : null, // Provide error message string
    refreshData, // Provide the refetch function
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Custom hook to consume the context
export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
