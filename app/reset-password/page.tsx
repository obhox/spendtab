"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/lib/auth-utils"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await resetPassword(email)
      toast("Password reset email sent", {
        description: "Please check your email for further instructions",
      })
    } catch (error: any) {
      console.error("Password reset error:", error)
      toast("Password reset failed", {
        description: error?.message || "Failed to send password reset email",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 shadow-lg rounded-lg border">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Reset your password</h2>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending reset link..." : "Send reset link"}
          </Button>
        </form>
      </div>
    </div>
  )
}