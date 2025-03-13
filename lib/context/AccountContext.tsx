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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        toast("Authentication Error", {
          description: "Please sign in to access your accounts."
        });
        return;
      }

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("owner_id", session.user.id);

      if (error) throw error;

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
    } catch (error) {
      console.error("Error loading accounts:", error);
      toast("Failed to load accounts", {
        description: "There was a problem loading your accounts"
      });
    }
  };

  const addAccount = async (name: string, description?: string) => {
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          // Try to refresh the session
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError || !refreshData.session) {
            toast("Authentication Error", {
              description: "Your session has expired. Please sign in again."
            });
            return;
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

        if (error) throw error;

        // Reload accounts to get the new account with its ID
        await loadAccounts();
        return;

      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          console.error("Error adding account:", error);
          toast("Failed to create account", {
            description: "There was a problem creating the account. Please try again."
          });
          throw error;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const updateAccount = async (id: string, name: string, description?: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        toast("Authentication Error", {
          description: "Please sign in to update the account."
        });
        return;
      }

      const { data, error } = await supabase
        .from("accounts")
        .update({ name, description, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("owner_id", session.user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedAccounts = accounts.map(a => a.id === id ? data : a);
      setAccounts(updatedAccounts);
      
      if (currentAccount?.id === id) {
        _setCurrentAccount(data);
      }
      
      toast("Account updated", {
        description: `Successfully updated account: ${name}`
      });
    } catch (error) {
      console.error("Error updating account:", error);
      toast("Failed to update account", {
        description: "There was a problem updating the account"
      });
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        toast("Authentication Error", {
          description: "Please sign in to delete the account."
        });
        return;
      }

      if (accounts.length === 1) {
        toast("Cannot delete account", {
          description: "You must have at least one account"
        });
        return;
      }
      
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", id)
        .eq("owner_id", session.user.id);

      if (error) throw error;

      const remainingAccounts = accounts.filter(a => a.id !== id);
      setAccounts(remainingAccounts);
      
      if (currentAccount?.id === id) {
        const nextAccount = remainingAccounts[0];
        if (nextAccount) {
          setCurrentAccount(nextAccount);
        } else {
          _setCurrentAccount(null);
          localStorage.removeItem('currentAccountId');
        }
      } else {
        toast("Account deleted", {
          description: "The account has been successfully deleted"
        });
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast("Failed to delete account", {
        description: "There was a problem deleting the account"
      });
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

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

export function useAccounts() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccounts must be used within an AccountProvider");
  }
  return context;
}