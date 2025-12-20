import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAccounts } from '../context/AccountContext';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  notes?: string;
  account_id: string;
  payment_source?: string;
  budget_id?: string | null;
  tax_deductible?: boolean;
  tax_category?: string | null;
  business_purpose?: string | null;
  receipt_url?: string | null;
  mileage?: number | null;
}

const CACHE_TIME = 30 * 60 * 1000; // 30 minutes
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useTransactionQuery() {
  const { currentAccount } = useAccounts();
  const queryClient = useQueryClient();

  const fetchTransactions = async () => {
    if (!currentAccount) {
      return [];
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', currentAccount.id)
      .order('date', { ascending: false });

    if (error) {
      toast(error.message);
      throw error;
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
      budget_id: item.budget_id || null,
      // Tax optimization fields
      tax_deductible: item.tax_deductible || false,
      tax_category: item.tax_category ?? undefined,
      business_purpose: item.business_purpose ?? undefined,
      receipt_url: item.receipt_url ?? undefined,
      mileage: item.mileage ?? undefined
    })) || [];
  };

  const query = useQuery<Transaction[], Error>({
    queryKey: ['transactions', currentAccount?.id],
    queryFn: fetchTransactions,
    enabled: !!currentAccount,
    gcTime: CACHE_TIME,
    staleTime: STALE_TIME
  });

  const addTransaction = useMutation({
    mutationFn: async (newTransaction: Omit<Transaction, 'id'>) => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...newTransaction,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        toast(error.message);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', currentAccount?.id] });
      toast('Transaction added successfully');
    }
  });

  const updateTransaction = useMutation({
    mutationFn: async (params: { id: string, data: Omit<Transaction, 'id'> }) => {
      const { error } = await supabase
        .from('transactions')
        .update({
          ...params.data,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);

      if (error) {
        toast(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', currentAccount?.id] });
      toast('Transaction updated successfully');
    }
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        toast(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', currentAccount?.id] });
      toast('Transaction deleted successfully');
    }
  });

  return {
    transactions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addTransaction: addTransaction.mutate,
    updateTransaction: updateTransaction.mutate,
    deleteTransaction: deleteTransaction.mutate,
    refetch: query.refetch
  };
}
