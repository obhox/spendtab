import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAccounts } from '../context/AccountContext';
import { toast } from 'sonner';

export interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country: string;
  tax_id?: string | null;
  notes?: string | null;
  user_id: string;
  account_id?: string | null;
  created_at: string;
  updated_at: string;
}

const CACHE_TIME = 30 * 60 * 1000; // 30 minutes
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useClientQuery() {
  const { currentAccount } = useAccounts();
  const queryClient = useQueryClient();

  const fetchClients = async () => {
    if (!currentAccount) return [];

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('account_id', currentAccount.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
      throw error;
    }

    return data || [];
  };

  const query = useQuery<Client[], Error>({
    queryKey: ['clients', currentAccount?.id],
    queryFn: fetchClients,
    enabled: !!currentAccount,
    gcTime: CACHE_TIME,
    staleTime: STALE_TIME
  });

  const addClient = useMutation({
    mutationFn: async (newClient: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'account_id'>) => {
      if (!currentAccount) {
        throw new Error('No account selected');
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...newClient,
          account_id: currentAccount.id,
          user_id: user.id,
          country: newClient.country || 'United States'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', currentAccount?.id] });
      toast.success('Client added successfully');
    },
    onError: (error: Error) => {
      console.error('Error adding client:', error);
      toast.error('Failed to add client: ' + error.message);
    }
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Client> }) => {
      const { error } = await supabase
        .from('clients')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', currentAccount?.id] });
      toast.success('Client updated successfully');
    },
    onError: (error: Error) => {
      console.error('Error updating client:', error);
      toast.error('Failed to update client: ' + error.message);
    }
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', currentAccount?.id] });
      toast.success('Client deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client: ' + error.message);
    }
  });

  return {
    clients: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addClient: addClient.mutate,
    addClientAsync: addClient.mutateAsync,
    updateClient: updateClient.mutate,
    deleteClient: deleteClient.mutate,
    refetch: query.refetch
  };
}
