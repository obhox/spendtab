import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAccounts } from '../context/AccountContext';
import { toast } from 'sonner';

export interface CashFlowData {
  period: string;
  startingBalance: number;
  cashIn: { name: string; amount: number; subItems?: { name: string; amount: number }[] }[];
  cashOut: { name: string; amount: number; subItems?: { name: string; amount: number }[] }[];
  totalCashIn: number;
  totalCashOut: number;
  netCashFlow: number;
  endingBalance: number;
  monthlyCashFlow: { month: string; cashIn: number; cashOut: number; netFlow: number }[];
}

const CACHE_TIME = 30 * 60 * 1000; // 30 minutes
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useReportQuery(startDate: Date, endDate: Date) {
  const { currentAccount } = useAccounts();

  const fetchCashFlowData = async () => {
    if (!currentAccount) {
      return null;
    }

    // Fetch transactions for the period
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', currentAccount.id)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: true });

    if (transactionsError) {
      toast(transactionsError.message);
      throw transactionsError;
    }

    // Process transactions into cash flow data
    const cashIn = transactions
      ?.filter(tx => tx.type === 'income')
      .reduce((acc, tx) => {
        const category = tx.category;
        const existing = acc.find(item => item.name === category);
        if (existing) {
          existing.amount += tx.amount;
          existing.subItems = existing.subItems || [];
          existing.subItems.push({ name: tx.description, amount: tx.amount });
        } else {
          acc.push({
            name: category,
            amount: tx.amount,
            subItems: [{ name: tx.description, amount: tx.amount }]
          });
        }
        return acc;
      }, [] as CashFlowData['cashIn']) || [];

    const cashOut = transactions
      ?.filter(tx => tx.type === 'expense')
      .reduce((acc, tx) => {
        const category = tx.category;
        const existing = acc.find(item => item.name === category);
        if (existing) {
          existing.amount += tx.amount;
          existing.subItems = existing.subItems || [];
          existing.subItems.push({ name: tx.description, amount: tx.amount });
        } else {
          acc.push({
            name: category,
            amount: tx.amount,
            subItems: [{ name: tx.description, amount: tx.amount }]
          });
        }
        return acc;
      }, [] as CashFlowData['cashOut']) || [];

    const totalCashIn = cashIn.reduce((sum, item) => sum + item.amount, 0);
    const totalCashOut = cashOut.reduce((sum, item) => sum + item.amount, 0);
    const netCashFlow = totalCashIn - totalCashOut;

    // Calculate monthly cash flow
    const monthlyCashFlow = transactions
      ?.reduce((acc, tx) => {
        const month = new Date(tx.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        const existing = acc.find(item => item.month === month);
        if (existing) {
          if (tx.type === 'income') existing.cashIn += tx.amount;
          if (tx.type === 'expense') existing.cashOut += tx.amount;
          existing.netFlow = existing.cashIn - existing.cashOut;
        } else {
          acc.push({
            month,
            cashIn: tx.type === 'income' ? tx.amount : 0,
            cashOut: tx.type === 'expense' ? tx.amount : 0,
            netFlow: tx.type === 'income' ? tx.amount : -tx.amount
          });
        }
        return acc;
      }, [] as CashFlowData['monthlyCashFlow'])
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()) || [];

    return {
      period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      startingBalance: 0, // You might want to calculate this based on your needs
      cashIn,
      cashOut,
      totalCashIn,
      totalCashOut,
      netCashFlow,
      endingBalance: netCashFlow, // This might need adjustment based on starting balance
      monthlyCashFlow
    };
  };

  const query = useQuery<CashFlowData | null, Error>({
    queryKey: ['reports', 'cashflow', currentAccount?.id, startDate.toISOString(), endDate.toISOString()],
    queryFn: fetchCashFlowData,
    enabled: !!currentAccount,
    gcTime: CACHE_TIME,
    staleTime: STALE_TIME
  });

  return {
    cashFlowData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
}