import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTransactions } from '../context/TransactionContext';
import { useAccounts } from '../context/AccountContext';
import { format, isWithinInterval } from 'date-fns';
import { toast } from 'sonner';
import { useState } from 'react';
import { Transaction } from './useTransactionQuery';

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  profitMargin: number;
  cashFlow: number;
}

const CACHE_TIME = 30 * 60 * 1000; // 30 minutes
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useAnalyticsQuery(dateRange: { startDate: Date; endDate: Date }) {
  const { transactions } = useTransactions();
  const { currentAccount } = useAccounts();
  const queryClient = useQueryClient();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  const calculateAnalyticsData = async () => {
    if (!currentAccount || !transactions || transactions.length === 0) {
      return {
        monthlyData: [],
        incomeByCategory: [],
        expensesByCategory: [],
        financialSummary: {
          totalRevenue: 0,
          totalExpenses: 0,
          totalProfit: 0,
          profitMargin: 0,
          cashFlow: 0,
        }
      };
    }

    // Filter transactions by date range and current account
    const filtered = transactions.filter(t => 
      t.account_id === currentAccount.id &&
      isWithinInterval(new Date(t.date), {
        start: dateRange.startDate,
        end: dateRange.endDate,
      })
    );
    setFilteredTransactions(filtered);

    // Calculate monthly data
    const monthlyMap = new Map<string, MonthlyData>();
    filteredTransactions.forEach(transaction => {
      const month = format(new Date(transaction.date), 'yyyy-MM');
      const existing = monthlyMap.get(month) || {
        month,
        income: 0,
        expenses: 0,
        profit: 0,
      };

      if (transaction.type === 'income') {
        existing.income += transaction.amount;
      } else {
        existing.expenses += transaction.amount;
      }
      existing.profit = existing.income - existing.expenses;
      monthlyMap.set(month, existing);
    });

    // Convert to array and sort by month
    const monthlyData = Array.from(monthlyMap.values())
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate category data
    const incomeMap = new Map<string, number>();
    const expensesMap = new Map<string, number>();
    let totalIncome = 0;
    let totalExpenses = 0;

    filteredTransactions.forEach(transaction => {
      const map = transaction.type === 'income' ? incomeMap : expensesMap;
      const amount = transaction.amount;
      map.set(
        transaction.category,
        (map.get(transaction.category) || 0) + amount
      );
      if (transaction.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpenses += amount;
      }
    });

    // Convert to arrays with percentages
    const incomeByCategory = Array.from(incomeMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalIncome ? (amount / totalIncome) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const expensesByCategory = Array.from(expensesMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Calculate financial summary
    const totalProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome ? (totalProfit / totalIncome) * 100 : 0;
    const cashFlow = totalIncome - totalExpenses;

    return {
      monthlyData,
      incomeByCategory,
      expensesByCategory,
      financialSummary: {
        totalRevenue: totalIncome,
        totalExpenses,
        totalProfit,
        profitMargin,
        cashFlow,
      }
    };
  };

  const query = useQuery({
    queryKey: ['analytics', currentAccount?.id, dateRange.startDate.toISOString(), dateRange.endDate.toISOString()],
    queryFn: calculateAnalyticsData,
    enabled: !!currentAccount && !!transactions,
    gcTime: CACHE_TIME,
    staleTime: STALE_TIME,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  return {
    monthlyData: query.data?.monthlyData || [],
    incomeByCategory: query.data?.incomeByCategory || [],
    expensesByCategory: query.data?.expensesByCategory || [],
    financialSummary: query.data?.financialSummary || {
      totalRevenue: 0,
      totalExpenses: 0,
      totalProfit: 0,
      profitMargin: 0,
      cashFlow: 0,
    },
    transactions: filteredTransactions,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof Error ? query.error.message : 'An error occurred',
    refetch: query.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['analytics', currentAccount?.id] })
  };
}