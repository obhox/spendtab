import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { toast } from 'sonner';

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

const CACHE_TIME = 30 * 60 * 1000; // 30 minutes
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useAccountQuery() {
  const queryClient = useQueryClient();

  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast(error.message);
      throw error;
    }

    return data?.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      balance: item.balance,
      currency: item.currency,
      user_id: item.user_id,
      created_at: item.created_at,
      updated_at: item.updated_at
    })) || [];
  };

  const query = useQuery<Account[], Error>({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
    gcTime: CACHE_TIME,
    staleTime: STALE_TIME
  });

  const addAccount = useMutation({
    mutationFn: async (newAccount: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          ...newAccount,
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
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast('Account created successfully');
    }
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...account }: Account) => {
      const { error } = await supabase
        .from('accounts')
        .update({
          ...account,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        toast(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast('Account updated successfully');
    }
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) {
        toast(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast('Account deleted successfully');
    }
  });

  return {
    accounts: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addAccount: addAccount.mutate,
    updateAccount: updateAccount.mutate,
    deleteAccount: deleteAccount.mutate,
    refetch: query.refetch
  };
}