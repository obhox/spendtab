"use client";

import { useAccountQuery } from "@/lib/hooks/useAccountQuery";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccounts } from "@/lib/context/AccountContext";

export default function AccountsPage() {
  const { accounts, addAccount, updateAccount, deleteAccount, isLoading, isError, error } = useAccountQuery();
  const { setCurrentAccount } = useAccounts();
  const router = useRouter();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountName, setAccountName] = useState("");
  const [accountDescription, setAccountDescription] = useState("");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  const handleAddAccount = async () => {
    if (!accountName) return;
    try {
      await addAccount({ name: accountName, description: accountDescription });
      setAccountName("");
      setAccountDescription("");
      setAddDialogOpen(false);
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
    if (!selectedAccount || !accountName) return;
    try {
      await updateAccount({ id: selectedAccount.id, name: accountName, description: accountDescription });
      setEditDialogOpen(false);
      setSelectedAccount(null);
      setAccountName("");
      setAccountDescription("");
      toast("Account updated", {
        description: "Your account has been updated successfully."
      });
    } catch (error) {
      toast("Error", {
        description: "Failed to update account."
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;
    try {
      await deleteAccount(selectedAccount.id);
      setDeleteDialogOpen(false);
      setSelectedAccount(null);
      toast("Account deleted", {
        description: "Your account has been deleted successfully."
      });
    } catch (error) {
      toast("Error", {
        description: "Failed to delete account."
      });
    }
  };

  async function handleAccountClick(account) {
    try {
      await setCurrentAccount(account);
      router.push('/dashboard');
    } catch (error) {
      toast("Error", {
        description: "Failed to switch account. Please try again."
      });
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Accounts</CardTitle>
          <Button
            onClick={() => {
              setAccountName("");
              setAccountDescription("");
              setAddDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Account
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id} className="cursor-pointer hover:bg-accent" onClick={() => handleAccountClick(account)}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{account.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAccount(account);
                          setAccountName(account.name);
                          setAccountDescription(account.description || "");
                          setEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAccount(account);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Account Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogTitle>Add New Account</DialogTitle>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Enter account name"
              />
            </div>
            <div className="grid gap-2">
              <Textarea
                id="description"
                value={accountDescription}
                onChange={(e) => setAccountDescription(e.target.value)}
                placeholder="Enter account description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddAccount} disabled={!accountName}>
              Add Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogTitle>Edit Account</DialogTitle>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="edit-name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Enter account name"
              />
            </div>
            <div className="grid gap-2">
              <Textarea
                id="edit-description"
                value={accountDescription}
                onChange={(e) => setAccountDescription(e.target.value)}
                placeholder="Enter account description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditAccount} disabled={!accountName}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              account and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}