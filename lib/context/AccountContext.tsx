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
    // Don't do anything if it's the same account
    if (currentAccount?.id === account.id) return;
    
    // Set account switching flag
    setIsAccountSwitching(true);
    
    // Store the current account ID in localStorage
    localStorage.setItem('currentAccountId', account.id);
    
    // Update the account state immediately
    _setCurrentAccount(account);
    
    // Only show toast if this is not the initial load AND showNotification is true
    if (!isInitialLoad && showNotification) {
      toast("Switched to account", {
        description: `Now using ${account.name}`
      });
    }
    
    // Always dispatch the event (other components need this)
    window.dispatchEvent(new CustomEvent('account-changed', { 
      detail: { accountId: account.id } 
    }));

    // Add a small delay before reloading to ensure the event completes
    setTimeout(() => {
      window.location.reload();
    }, 300); // Increased delay to give events time to complete
  };

  // Load all accounts for the current user
  const loadAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select("*");

      if (error) {
        throw error;
      }

      setAccounts(data || []);
      
      if (data && data.length > 0) {
        // Get the stored account ID from localStorage
        const storedAccountId = localStorage.getItem('currentAccountId');
        // Find the stored account in the loaded accounts
        const storedAccount = data.find(account => account.id === storedAccountId);
        // Set either the stored account or the first account, but with no notification
        if (storedAccount || data[0]) {
          _setCurrentAccount(storedAccount || data[0]); // Use _setCurrentAccount directly to avoid reload
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
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Insert new account with owner_id
      const { data, error } = await supabase
        .from("accounts")
        .insert([{ name, description, owner_id: userData.user.id }])
        .select()
        .single();

      if (error) throw error;

      // Update accounts state with the new account
      const updatedAccounts = [...accounts, data];
      setAccounts(updatedAccounts);
      
      // If this is the first account, set it as current
      if (!currentAccount) {
        _setCurrentAccount(data); // Use _setCurrentAccount to avoid reload
        localStorage.setItem('currentAccountId', data.id);
      }
      
      toast("Account created", {
        description: `Successfully created account: ${name}`
      });
    } catch (error) {
      console.error("Error adding account:", error);
      toast("Failed to create account", {
        description: "There was a problem creating the account"
      });
    }
  };

  const updateAccount = async (id: string, name: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from("accounts")
        .update({ name, description, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update the accounts state
      const updatedAccounts = accounts.map(a => a.id === id ? data : a);
      setAccounts(updatedAccounts);
      
      // If we're updating the current account, update that too
      if (currentAccount?.id === id) {
        _setCurrentAccount(data); // Use _setCurrentAccount to avoid reload
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
      // First check if this is the only account
      if (accounts.length === 1) {
        toast("Cannot delete account", {
          description: "You must have at least one account"
        });
        return;
      }
      
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Update accounts state
      const remainingAccounts = accounts.filter(a => a.id !== id);
      setAccounts(remainingAccounts);
      
      // If we're deleting the current account, switch to another one
      if (currentAccount?.id === id) {
        const nextAccount = remainingAccounts[0]; // There should always be at least one account left
        if (nextAccount) {
          setCurrentAccount(nextAccount); // Use full setCurrentAccount as we DO want to reload in this case
        } else {
          _setCurrentAccount(null); // This should never happen due to the check above
          localStorage.removeItem('currentAccountId'); // Clear localStorage if no accounts left
        }
      } else {
        // If we're not deleting the current account, just show a toast
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
    // Only load accounts on initial mount
    if (isInitialLoad) {
      loadAccounts();
    }

    // Clean up any existing subscription
    const cleanupSubscription = () => {
      const existingChannel = supabase.getChannels().find(ch => ch.topic === 'accounts');
      if (existingChannel) {
        supabase.removeChannel(existingChannel);
      }
    };

    // Set up real-time subscription
    cleanupSubscription();
    
    const channel = supabase
      .channel('accounts')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'accounts'
        }, 
        () => {
          // Only reload accounts if we're not currently switching
          if (!isAccountSwitching) {
            loadAccounts();
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isInitialLoad, isAccountSwitching]);

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