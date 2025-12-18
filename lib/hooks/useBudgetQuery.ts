import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAccounts } from '../context/AccountContext';
import { toast } from 'sonner';

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  start_date?: string;
  end_date?: string;
  period?: string;
  account_id: string;
  category_id?: number;
  category_name?: string;
  is_recurring?: boolean;
  recurring_type?: 'monthly' | 'weekly' | 'yearly' | 'quarterly';
  parent_budget_id?: string;
  created_at?: string;
  updated_at?: string;
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

    // Use the budget_summary view for better performance and data consistency
    const { data: budgets, error: budgetsError } = await supabase
      .from('budget_summary')
      .select('*')
      .eq('account_id', currentAccount.id)
      .order('created_at', { ascending: false });

    if (budgetsError) {
      // Fallback to direct table query if view doesn't exist yet
      const { data: fallbackBudgets, error: fallbackError } = await supabase
        .from('budgets')
        .select(`
          *,
          categories:category_id(name)
        `)
        .eq('account_id', currentAccount.id)
        .order('created_at', { ascending: false });

      if (fallbackError) {
        toast.error('Failed to fetch budgets: ' + fallbackError.message);
        throw fallbackError;
      }

      // Transform fallback data to match expected format
      return (fallbackBudgets || []).map(budget => ({
        ...budget,
        category_name: budget.categories?.name || null,
        // Ensure spent is a number
        spent: typeof budget.spent === 'number' ? budget.spent : 0
      }));
    }

    // Transform data to ensure consistency
    return (budgets || []).map(budget => ({
      ...budget,
      // Ensure spent is a number
      spent: typeof budget.spent === 'number' ? budget.spent : 0,
      // Convert date fields for compatibility
      startDate: budget.start_date,
      endDate: budget.end_date
    }));
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
      if (!currentAccount) {
        throw new Error('No account selected');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const budgetData = {
        name: newBudget.name,
        amount: newBudget.amount,
        start_date: newBudget.start_date,
        end_date: newBudget.end_date,
        period: newBudget.period,
        category_id: newBudget.category_id,
        account_id: currentAccount.id,
        user_id: user.id,
        spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('budgets')
        .insert(budgetData)
        .select()
        .single();

      if (error) {
        toast.error('Failed to create budget: ' + error.message);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', currentAccount?.id] });
      toast.success('Budget created successfully');
    },
    onError: (error) => {
      console.error('Budget creation error:', error);
      toast.error('Failed to create budget');
    }
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, ...budget }: Budget) => {
      const updateData = {
        name: budget.name,
        amount: budget.amount,
        start_date: budget.start_date,
        end_date: budget.end_date,
        period: budget.period,
        category_id: budget.category_id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('budgets')
        .update(updateData)
        .eq('id', id);

      if (error) {
        toast.error('Failed to update budget: ' + error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', currentAccount?.id] });
      toast.success('Budget updated successfully');
    },
    onError: (error) => {
      console.error('Budget update error:', error);
      toast.error('Failed to update budget');
    }
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Failed to delete budget: ' + error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', currentAccount?.id] });
      toast.success('Budget deleted successfully');
    },
    onError: (error) => {
      console.error('Budget deletion error:', error);
      toast.error('Failed to delete budget');
    }
  });

  // Create next recurring budget mutation
  const createNextRecurringBudgetMutation = useMutation({
    mutationFn: async (budgetId: string) => {
      const { data, error } = await supabase.rpc('create_next_recurring_budget', {
        budget_uuid: budgetId
      })
      
      if (error) {
        console.error('Error creating next recurring budget:', error)
        throw error
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', currentAccount?.id] })
      toast.success('Next recurring budget created successfully!')
    },
    onError: (error) => {
      console.error('Error creating next recurring budget:', error)
      toast.error('Failed to create next recurring budget')
    }
  })

  // Set multiple categories for a budget
  const setBudgetCategoriesMutation = useMutation({
    mutationFn: async ({ budgetId, categoryIds }: { budgetId: string, categoryIds: number[] }) => {
      const { data, error } = await supabase.rpc('set_budget_categories', {
        budget_uuid: budgetId,
        category_ids: categoryIds
      })
      
      if (error) {
        console.error('Error setting budget categories:', error)
        throw error
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', currentAccount?.id] })
      toast.success('Budget categories updated successfully!')
    },
    onError: (error) => {
      console.error('Error setting budget categories:', error)
      toast.error('Failed to update budget categories')
    }
  })

  // Add a category to a budget
  const addCategoryToBudgetMutation = useMutation({
    mutationFn: async ({ budgetId, categoryId }: { budgetId: string, categoryId: number }) => {
      const { data, error } = await supabase.rpc('add_category_to_budget', {
        budget_uuid: budgetId,
        category_id_param: categoryId
      })
      
      if (error) {
        console.error('Error adding category to budget:', error)
        throw error
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', currentAccount?.id] })
      toast.success('Category added to budget successfully!')
    },
    onError: (error) => {
      console.error('Error adding category to budget:', error)
      toast.error('Failed to add category to budget')
    }
  })

  // Remove a category from a budget
  const removeCategoryFromBudgetMutation = useMutation({
    mutationFn: async ({ budgetId, categoryId }: { budgetId: string, categoryId: number }) => {
      const { data, error } = await supabase.rpc('remove_category_from_budget', {
        budget_uuid: budgetId,
        category_id_param: categoryId
      })
      
      if (error) {
        console.error('Error removing category from budget:', error)
        throw error
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', currentAccount?.id] })
      toast.success('Category removed from budget successfully!')
    },
    onError: (error) => {
      console.error('Error removing category from budget:', error)
      toast.error('Failed to remove category from budget')
    }
  })

  // Fetch categories for a specific budget
  const fetchBudgetCategories = async (budgetId: string) => {
    const { data, error } = await supabase
      .from('budget_categories')
      .select(`
        category_id,
        categories:category_id(id, name, type, color)
      `)
      .eq('budget_id', budgetId)

    if (error) {
      console.error('Error fetching budget categories:', error)
      throw error
    }

    return data?.map(item => item.categories).filter(Boolean) || []
  }

  return {
    budgets: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addBudget: addBudget.mutate,
    updateBudget: updateBudget.mutate,
    deleteBudget: deleteBudget.mutate,
    createNextRecurringBudget: createNextRecurringBudgetMutation.mutate,
    setBudgetCategories: setBudgetCategoriesMutation.mutate,
    addCategoryToBudget: addCategoryToBudgetMutation.mutate,
    removeCategoryFromBudget: removeCategoryFromBudgetMutation.mutate,
    fetchBudgetCategories,
    refetch: query.refetch
  };
}