"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { setCookie, getCookie, deleteCookie } from "@/lib/cookie-utils";

type Account = {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

type AccountContextType = {
  accounts: Account[];
  currentAccount: Account | null;
  isAccountSwitching: boolean;
  setCurrentAccount: (account: Account, showNotification?: boolean) => void;
  loadAccounts: () => Promise<void>;
  addAccount: (name: string, description?: string) => Promise<void>;
  updateAccount: (id: string, name: string, description?: string) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [currentAccount, _setCurrentAccount] = useState<Account | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isAccountSwitching, setIsAccountSwitching] = useState(false);
  const queryClient = useQueryClient();

  const { data: userData } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_tier')
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        toast('Unable to load your account information. Please try again later.');
        return { subscription_tier: 'free' };
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) return [];

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("owner_id", session.user.id);

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const setCurrentAccount = async (account: Account, showNotification = true) => {
    try {
      if (currentAccount?.id === account.id) return;
      
      setIsAccountSwitching(true);
      setCookie('currentAccountId', account.id);
      _setCurrentAccount(account);
      
      if (!isInitialLoad && showNotification) {
        toast("Switched to account", {
          description: `Now using ${account.name}`
        });
      }
      
      window.dispatchEvent(new CustomEvent('account-changed', { 
        detail: { accountId: account.id } 
      }));

      // Allow time for state updates and event propagation
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error switching account:', error);
      toast("Error", {
        description: "Failed to switch account. Please try again."
      });
    } finally {
      setIsAccountSwitching(false);
    }
  };

  useEffect(() => {
    if (accounts.length > 0) {
      const storedAccountId = getCookie('currentAccountId');
      const storedAccount = accounts.find(account => account.id === storedAccountId);
      if (storedAccount || accounts[0]) {
        _setCurrentAccount(storedAccount || accounts[0]);
        setCookie('currentAccountId', (storedAccount || accounts[0]).id);
      }
      setIsInitialLoad(false);
    }
  }, [accounts]);

  useEffect(() => {
    if (userData?.subscription_tier) {
      setCookie('userSubscriptionTier', userData.subscription_tier);
    }
  }, [userData?.subscription_tier]);

  const addAccountMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) throw refreshError;
        if (!refreshData.session) {
          throw new Error("Your session has expired. Please sign in again.");
        }
      }

      const userSubscriptionTier = getCookie('userSubscriptionTier') || 'free';
      if (userSubscriptionTier === 'free') {
        const { count: accountCount, error: countError } = await supabase
          .from('accounts')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', session.user.id);

        if (countError) throw countError;
        if (accountCount && accountCount >= 1) {
          throw new Error('Free users are limited to 1 account. Please upgrade to create more accounts.');
        }
      }

      const newAccount = {
        name,
        description,
        owner_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("accounts")
        .insert([newAccount])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast('Your new account has been created successfully!');
    },
    onError: (error: Error) => {
      toast('Unable to create your account. Please try again later.');
    }
  });

  const addAccount = (name: string, description?: string) => {
    return addAccountMutation.mutateAsync({ name, description });
  };

  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name: string; description?: string }) => {
      const { error } = await supabase
        .from("accounts")
        .update({ name, description, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast('Your account details have been updated successfully!');
    },
    onError: (error: Error) => {
      toast('Unable to update your account. Please check your changes and try again.');
    }
  });

  const updateAccount = (id: string, name: string, description?: string) => {
    return updateAccountMutation.mutateAsync({ id, name, description });
  };

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast('Your account has been permanently deleted.');
    },
    onError: (error: Error) => {
      toast('Unable to delete your account. Please try again later.');
    }
  });

  const deleteAccount = (id: string) => {
    return deleteAccountMutation.mutateAsync(id);
  };

  return (
    <AccountContext.Provider
      value={{
        accounts,
        currentAccount,
        isAccountSwitching,
        setCurrentAccount,
        loadAccounts: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
        addAccount,
        updateAccount,
        deleteAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

// Custom hook to use the account context
export function useAccounts() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccounts must be used within an AccountProvider");
  }
  return context;
}