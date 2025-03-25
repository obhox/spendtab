"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAccounts } from "@/lib/context/AccountContext";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Pencil, Trash } from "lucide-react";

export function AccountSelector() {
  const { accounts, currentAccount, setCurrentAccount, addAccount, updateAccount, deleteAccount, loadAccounts } = useAccounts();

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);
  
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountDescription, setNewAccountDescription] = useState("");
  const [editAccountName, setEditAccountName] = useState("");
  const [editAccountDescription, setEditAccountDescription] = useState("");

  const handleAddAccount = async () => {
    if (!newAccountName) return;
    try {
      await addAccount(newAccountName, newAccountDescription);
      setNewAccountName("");
      setNewAccountDescription("");
      setOpen(false);
      toast("Account created", {
        description: "Your new account has been created successfully."
      });
    } catch (error) {
      toast("Error", {
        description: "Failed to create account."
      });
    }
  };

  const handleEditAccount = async () => {
    if (!selectedAccount || !editAccountName) return;
    try {
      await updateAccount(selectedAccount.id, editAccountName, editAccountDescription);
      setEditOpen(false);
      setSelectedAccount(null);
      setEditAccountName("");
      setEditAccountDescription("");
      toast("Account updated", {
        description: "Your account has been updated successfully."
      });
    } catch (error) {
      toast("Error", {
        description: "Failed to update account."
      });
    }
  };

  const [manageDialogOpen, setManageDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;
    try {
      await deleteAccount(selectedAccount.id);
      setDeleteConfirmOpen(false);
      setSelectedAccount(null);
      setManageDialogOpen(false);
      toast("Account deleted", {
        description: "Your account has been deleted successfully."
      });
    } catch (error) {
      toast("Error", {
        description: "Failed to delete account."
      });
    }
  };

  // Render actions for the current account only
  const renderCurrentAccountActions = () => {
    if (!currentAccount) return null;
    
    return (
      <div className="flex items-center justify-between w-full py-1">
        <span className="flex-grow">{currentAccount.name}</span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedAccount(currentAccount);
              setEditAccountName(currentAccount.name);
              setEditAccountDescription(currentAccount.description || "");
              setEditOpen(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => {
              setSelectedAccount(currentAccount);
              setDeleteConfirmOpen(true);
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center gap-2 max-w-md">
      <Select
        value={currentAccount?.id}
        onValueChange={async (value) => {
          const account = accounts.find((a) => a.id === value);
          if (account) {
            await setCurrentAccount(account);
            window.location.reload();
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select account">
            {currentAccount?.name || "Select account"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Account management */}
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => setOpen(true)}
      >
        +
      </Button>

      {/* Add account dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Add New Account</DialogTitle>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="name"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="Enter account name"
              />
            </div>
            <div className="grid gap-2">
              <Textarea
                id="description"
                value={newAccountDescription}
                onChange={(e) => setNewAccountDescription(e.target.value)}
                placeholder="Enter account description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddAccount} disabled={!newAccountName}>
              Add Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit account dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogTitle>Edit Account</DialogTitle>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="edit-name"
                value={editAccountName}
                onChange={(e) => setEditAccountName(e.target.value)}
                placeholder="Enter account name"
              />
            </div>
            <div className="grid gap-2">
              <Textarea
                id="edit-description"
                value={editAccountDescription}
                onChange={(e) => setEditAccountDescription(e.target.value)}
                placeholder="Enter account description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditAccount} disabled={!editAccountName}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the account "{selectedAccount?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Context menu for account management */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Manage Accounts</DialogTitle>
          <div className="max-h-64 overflow-y-auto">
            {renderCurrentAccountActions()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}