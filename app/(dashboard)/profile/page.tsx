"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getUserProfile, updateUserProfile, signOut } from "@/lib/auth-utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Plus, Trash } from "lucide-react"
import { useAccounts } from "@/lib/context/AccountContext"
import { useAccountQuery, type Account } from "@/lib/hooks/useAccountQuery"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { accounts, addAccount, updateAccount, deleteAccount, isLoading, isError, error } = useAccountQuery()
  const { setCurrentAccount } = useAccounts()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [accountName, setAccountName] = useState("")
  const [accountDescription, setAccountDescription] = useState("")

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getUserProfile()
      if (profile) {
        setFirstName(profile.first_name || "")
        setLastName(profile.last_name || "")
        setCompanyName(profile.company_name || "")
      }
    }
    loadProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await updateUserProfile({
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        ...(newPassword ? { password: newPassword } : {}),
      })
      toast("Your profile has been successfully updated")
    } catch (error: any) {
      console.error("Profile update error:", error)
      toast(error?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleAddAccount = async () => {
    if (!accountName) return;
    try {
      const newAccount: Account | undefined = await addAccount({ name: accountName, description: accountDescription });
      setAccountName("");
      setAccountDescription("");
      setAddDialogOpen(false);

      if (newAccount) {
        const user = (await supabase.auth.getUser()).data.user;
        if(user){
          const defaultCategories = [
            {
              name: 'Uncategorized',
              type: 'income',
              account_id: newAccount.id,
              user_id: user.id
            },
            {
              name: 'Uncategorized',
              type: 'expense',
              account_id: newAccount.id,
              user_id: user.id
            }
          ];
    
          const { error: categoryError } = await supabase
            .from('categories')
            .insert(defaultCategories);
    
          if (categoryError) {
            console.error('Failed to create default categories:', categoryError);
            toast("Error", {
              description: "Account created, but failed to create default categories."
            });
          } else {
            toast("Account created", {
              description: "Your new account has been created successfully."
            });
          }
        }

      } else {
        toast("Error", {
          description: "Failed to create account."
        });
      }
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

  async function handleAccountClick(account: Account) {
    try {
      await setCurrentAccount(account);
      router.push('/dashboard');
    } catch (error) {
      toast("Error", {
        description: "Failed to switch account. Please try again."
      });
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div className="pt-0 px-4 pb-4 md:pt-0 md:px-6 md:pb-6 lg:pt-0 lg:px-8 lg:pb-8 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Profile</h1>
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Account</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Account</CardTitle>
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
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>

              <div className="mt-6">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={async () => {
                    try {
                      await signOut()
                      router.push('/login')
                      toast("You have been successfully logged out")
                    } catch (error: any) {
                      console.error('Logout error:', error)
                      toast(error?.message || "Failed to logout")
                    }
                  }}
                >
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
              Add account
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
  )
}