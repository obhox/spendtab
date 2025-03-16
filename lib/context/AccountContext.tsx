"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, _setCurrentAccount] = useState<Account | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isAccountSwitching, setIsAccountSwitching] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const setCurrentAccount = (account: Account, showNotification = true) => {
    if (currentAccount?.id === account.id) return;
    
    setIsAccountSwitching(true);
    localStorage.setItem('currentAccountId', account.id);
    _setCurrentAccount(account);
    
    if (!isInitialLoad && showNotification) {
      toast("Switched to account", {
        description: `Now using ${account.name}`
      });
    }
    
    window.dispatchEvent(new CustomEvent('account-changed', { 
      detail: { accountId: account.id } 
    }));

    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  const loadAccounts = async () => {
    try {
      // Get user subscription tier
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('subscription_tier')
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        toast('Error fetching user data');
      }

      const subscriptionTier = userData?.subscription_tier || 'free';
      // Store subscription tier in localStorage for other contexts to use
      localStorage.setItem('userSubscriptionTier', subscriptionTier);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        toast(sessionError.message);
        throw sessionError;
      }
      
      if (!session) {
        toast("Please sign in to access your accounts.");
        return;
      }

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("owner_id", session.user.id);

      if (error) {
        toast(error.message);
        throw error;
      }

      setAccounts(data || []);
      
      if (data && data.length > 0) {
        const storedAccountId = localStorage.getItem('currentAccountId');
        const storedAccount = data.find(account => account.id === storedAccountId);
        if (storedAccount || data[0]) {
          _setCurrentAccount(storedAccount || data[0]);
          localStorage.setItem('currentAccountId', (storedAccount || data[0]).id);
        }
      }
      setIsInitialLoad(false);
    } catch (error: any) {
      console.error("Error loading accounts:", error);
      toast(error.message || "Failed to load accounts");
    }
  };

  const addAccount = async (name: string, description?: string) => {
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          toast(sessionError.message);
          throw sessionError;
        }
        
        if (!session) {
          // Try to refresh the session
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            toast(refreshError.message);
            throw refreshError;
          }
          if (!refreshData.session) {
            toast("Your session has expired. Please sign in again.");
            return;
          }
        }

        // Check if free tier user has reached the account limit
        const userSubscriptionTier = localStorage.getItem('userSubscriptionTier') || 'free';
        
        if (userSubscriptionTier === 'free') {
          const { count: accountCount, error: countError } = await supabase
            .from('accounts')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', session.user.id);
            
          if (countError) {
            toast(countError.message);
            throw countError;
          }
          
          if (accountCount && accountCount >= 1) {
            const errorMsg = 'Free users are limited to 1 account. Please upgrade to create more accounts.';
            toast(errorMsg);
            throw new Error(errorMsg);
          }
        }

        const newAccount = {
          name,
          description,
          owner_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from("accounts")
          .insert([newAccount])
          .select()
          .single();

        if (error) {
          toast(error.message);
          throw error;
        }

        // Reload accounts to get the new account with its ID
        await loadAccounts();
        return;

      } catch (error: any) {
        retryCount++;
        if (retryCount === maxRetries) {
          console.error("Error adding account:", error);
          toast(error.message || "Failed to add account");
          return;
        }
      }
    }
  };

  const updateAccount = async (id: string, name: string, description?: string) => {
    try {
      const { error } = await supabase
        .from("accounts")
        .update({ name, description, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        toast(error.message);
        throw error;
      }

      await loadAccounts();
    } catch (error: any) {
      console.error("Error updating account:", error);
      toast(error.message || "Failed to update account");
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", id);

      if (error) {
        toast(error.message);
        throw error;
      }

      await loadAccounts();
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast(error.message || "Failed to delete account");
    }
  };

  return (
    <AccountContext.Provider
      value={{
        accounts,
        currentAccount,
        isAccountSwitching,
        setCurrentAccount,
        loadAccounts,
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