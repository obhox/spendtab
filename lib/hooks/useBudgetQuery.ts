import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAccounts } from '../context/AccountContext';
import { toast } from 'sonner';

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  startDate?: string;
  endDate?: string;
  period?: string;
  account_id: string;
}

const CACHE_TIME = 30 * 60 * 1000; // 30 minutes
const STALE_TIME = 2 * 60 * 1000; // 2 minutes

export function useBudgetQuery() {
  const { currentAccount } = useAccounts();
  const queryClient = useQueryClient();

  const fetchBudgets = async () => {
    if (!currentAccount) {
      return [];
    }

    const { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select('*')
      .eq('account_id', currentAccount.id)
      .order('created_at', { ascending: false });

    if (budgetsError) {
      toast(budgetsError.message);
      throw budgetsError;
    }

    // Fetch spent amounts for each budget
    const budgetsWithSpent = await Promise.all(
      (budgets || []).map(async (budget) => {
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('budget_id', budget.id)
          .eq('account_id', currentAccount.id);

        if (transactionsError) {
          console.error('Error fetching transactions:', transactionsError);
          return {
            ...budget,
            spent: 0
          };
        }

        const spent = transactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

        return {
          ...budget,
          spent
        };
      })
    );

    return budgetsWithSpent;
  };

  const query = useQuery<Budget[], Error>({
    queryKey: ['budgets', currentAccount?.id],
    queryFn: fetchBudgets,
    enabled: !!currentAccount,
    gcTime: CACHE_TIME,
    staleTime: STALE_TIME
  });

  const addBudget = useMutation({
    mutationFn: async (newBudget: Omit<Budget, 'id' | 'spent'>) => {
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          ...newBudget,
          account_id: currentAccount?.id,
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
      queryClient.invalidateQueries({ queryKey: ['budgets', currentAccount?.id] });
      toast('Budget created successfully');
    }
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, ...budget }: Budget) => {
      const { error } = await supabase
        .from('budgets')
        .update({
          ...budget,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        toast(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', currentAccount?.id] });
      toast('Budget updated successfully');
    }
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) {
        toast(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', currentAccount?.id] });
      toast('Budget deleted successfully');
    }
  });

  return {
    budgets: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addBudget: addBudget.mutate,
    updateBudget: updateBudget.mutate,
    deleteBudget: deleteBudget.mutate,
    refetch: query.refetch
  };
}