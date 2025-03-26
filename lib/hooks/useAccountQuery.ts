import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import { setCookie, getCookie } from '../cookie-utils';

export interface Account {
  id: string;
  name: string;
  owner_id: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Constants
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes
const STALE_TIME = 5 * 60 * 1000;  // 5 minutes
const ACCOUNT_COOKIE_KEY = 'currentAccountId';
const ACCOUNTS_QUERY_KEY = ['accounts'];
const CURRENT_ACCOUNT_QUERY_KEY = ['currentAccount'];

export function useAccountQuery() {
  const queryClient = useQueryClient();
  const [isAccountSwitching, setIsAccountSwitching] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch all accounts using React Query
  const accountsQuery = useQuery({
    queryKey: ACCOUNTS_QUERY_KEY,
    queryFn: async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!session) return [];

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    gcTime: CACHE_TIME,
    staleTime: STALE_TIME
  });

  // Store and retrieve current account using React Query
  const currentAccountQuery = useQuery({
    queryKey: CURRENT_ACCOUNT_QUERY_KEY,
    queryFn: async () => {
      const accounts = queryClient.getQueryData<Account[]>(ACCOUNTS_QUERY_KEY) || [];
      if (accounts.length === 0) return null;
      
      const storedAccountId = getCookie(ACCOUNT_COOKIE_KEY);
      const storedAccount = accounts.find(account => account.id === storedAccountId);
      
      const accountToUse = storedAccount || accounts[0];
      setCookie(ACCOUNT_COOKIE_KEY, accountToUse.id);
      
      return accountToUse;
    },
    enabled: !!accountsQuery.data && accountsQuery.data.length > 0,
    gcTime: CACHE_TIME,
    staleTime: STALE_TIME
  });

  // Initialize current account on first load
  useEffect(() => {
    if (accountsQuery.data && accountsQuery.data.length > 0 && isInitialLoad) {
      queryClient.invalidateQueries({ queryKey: CURRENT_ACCOUNT_QUERY_KEY });
      setIsInitialLoad(false);
    }
  }, [accountsQuery.data, isInitialLoad, queryClient]);

  // Add account mutation
  const addAccount = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          name,
          description,
          owner_id: user.id,
          created_at: timestamp,
          updated_at: timestamp
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newAccount) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
      toast('Account created successfully');
      
      // Auto-switch to the new account
      setCurrentAccount(newAccount, false);
    },
    onError: (error: Error) => {
      toast(`Failed to create account: ${error.message}`);
    }
  });

  // Update account mutation
  const updateAccount = useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name: string; description?: string }) => {
      const { error } = await supabase
        .from('accounts')
        .update({
          name,
          description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return { id, name, description };
    },
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
      toast('Account updated successfully');
      
      // Update current account in cache if it was the one updated
      const currentAccount = queryClient.getQueryData<Account>(CURRENT_ACCOUNT_QUERY_KEY);
      if (currentAccount?.id === updatedData.id) {
        queryClient.setQueryData(CURRENT_ACCOUNT_QUERY_KEY, {
          ...currentAccount,
          ...updatedData
        });
      }
    },
    onError: (error: Error) => {
      toast(`Failed to update account: ${error.message}`);
    }
  });

  // Delete account mutation
  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      const accounts = queryClient.getQueryData<Account[]>(ACCOUNTS_QUERY_KEY) || [];
      const currentAccount = queryClient.getQueryData<Account>(CURRENT_ACCOUNT_QUERY_KEY);
      
      // Filter out the deleted account
      const remainingAccounts = accounts.filter(a => a.id !== deletedId);
      queryClient.setQueryData(ACCOUNTS_QUERY_KEY, remainingAccounts);
      
      // Switch accounts if needed
      if (currentAccount?.id === deletedId && remainingAccounts.length > 0) {
        setCurrentAccount(remainingAccounts[0], true);
      }
      
      toast('Account deleted successfully');
    },
    onError: (error: Error) => {
      toast(`Failed to delete account: ${error.message}`);
    }
  });

  // Set current account function
  const setCurrentAccount = useCallback(async (account: Account, showNotification = true) => {
    try {
      const currentAccount = queryClient.getQueryData<Account>(CURRENT_ACCOUNT_QUERY_KEY);
      if (currentAccount?.id === account.id) return;
      
      setIsAccountSwitching(true);
      
      // Update the current account in React Query cache
      queryClient.setQueryData(CURRENT_ACCOUNT_QUERY_KEY, account);
      setCookie(ACCOUNT_COOKIE_KEY, account.id);
      
      if (!isInitialLoad && showNotification) {
        toast("Switched to account", {
          description: `Now using ${account.name}`
        });
      }
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('account-changed', { 
        detail: { accountId: account.id } 
      }));
    } catch (error) {
      console.error('Error switching account:', error);
      toast("Error", {
        description: "Failed to switch account. Please try again."
      });
    } finally {
      setIsAccountSwitching(false);
    }
  }, [isInitialLoad, queryClient]);

  return {
    accounts: accountsQuery.data || [],
    currentAccount: currentAccountQuery.data,
    isAccountSwitching,
    isLoading: accountsQuery.isLoading || currentAccountQuery.isLoading,
    isError: accountsQuery.isError || currentAccountQuery.isError,
    error: accountsQuery.error || currentAccountQuery.error,
    addAccount: addAccount.mutate,
    updateAccount: updateAccount.mutate,
    deleteAccount: deleteAccount.mutate,
    setCurrentAccount,
    refetch: () => {
      accountsQuery.refetch();
      currentAccountQuery.refetch();
    }
  };
}
