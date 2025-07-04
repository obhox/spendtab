import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAccounts } from "@/lib/context/AccountContext"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"

export function AccountCreationModal() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const { accounts, addAccount, currentAccount } = useAccounts()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkUserAndAccounts = async () => {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession()
      
      // Only show modal if user is authenticated, has no accounts, and no current account
      if (session?.user && accounts.length === 0 && !currentAccount) {
        setOpen(true)
      } else {
        setOpen(false)
      }
    }

    checkUserAndAccounts()
  }, [accounts.length, currentAccount, supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      await addAccount(name, description)
      setOpen(false)
      setName("")
      setDescription("")
    } catch (error) {
      console.error("Error creating account:", error)
      toast("Error", {
        description: "Failed to create account. Please try again."
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to SpendTab!</DialogTitle>
          <DialogDescription>
            Let's create your first account to get started with managing your finances.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              placeholder="e.g., Personal Account"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a description for your account"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}