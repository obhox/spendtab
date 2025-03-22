import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAccounts } from '../context/AccountContext';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
  account_id: string;
}

const CACHE_TIME = 30 * 60 * 1000; // 30 minutes
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useCategoryQuery() {
  const { currentAccount } = useAccounts();
  const queryClient = useQueryClient();

  const fetchCategories = async () => {
    if (!currentAccount) {
      return [];
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('account_id', currentAccount.id)
      .order('name', { ascending: true });

    if (error) {
      toast(error.message);
      throw error;
    }

    return data?.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      color: item.color || undefined,
      icon: item.icon || undefined,
      account_id: item.account_id
    })) || [];
  };

  const query = useQuery<Category[], Error>({
    queryKey: ['categories', currentAccount?.id],
    queryFn: fetchCategories,
    enabled: !!currentAccount,
    gcTime: CACHE_TIME,
    staleTime: STALE_TIME
  });

  const addCategory = useMutation({
    mutationFn: async (newCategory: Omit<Category, 'id'>) => {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...newCategory,
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
      queryClient.invalidateQueries({ queryKey: ['categories', currentAccount?.id] });
      toast('Category added successfully');
    }
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...category }: Category) => {
      const { error } = await supabase
        .from('categories')
        .update({
          ...category,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        toast(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', currentAccount?.id] });
      toast('Category updated successfully');
    }
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        toast(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', currentAccount?.id] });
      toast('Category deleted successfully');
    }
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addCategory: addCategory.mutate,
    updateCategory: updateCategory.mutate,
    deleteCategory: deleteCategory.mutate,
    refetch: query.refetch
  };
}