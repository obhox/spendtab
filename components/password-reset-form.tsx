"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updatePassword } from "@/lib/auth-utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"

export default function PasswordResetForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      toast("Invalid reset token", {
        description: "Please use a valid password reset link",
      })
      return
    }

    if (password !== confirmPassword) {
      toast("Passwords do not match", {
        description: "Please ensure both passwords are identical",
      })
      return
    }

    setLoading(true)
    try {
      await updatePassword(password, token)
      toast("Password updated successfully", {
        description: "You can now log in with your new password",
      })
      router.push("/login")
    } catch (error: any) {
      console.error("Password update error:", error)
      toast("Password update failed", {
        description: error?.message || "Failed to update password",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 bg-white p-8 shadow-lg rounded-lg border">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Set new password</h2>
        <p className="text-sm text-muted-foreground">
          Please enter your new password below
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Updating password..." : "Update password"}
        </Button>
      </form>
    </div>
  )
}