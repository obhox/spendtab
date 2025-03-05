"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getUserProfile, updateUserProfile, signOut } from "@/lib/auth-utils"

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 shadow-lg rounded-lg border">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Your Profile</h2>
          <p className="text-sm text-muted-foreground">Manage your account settings and preferences</p>
        </div>

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

        <div className="space-y-4">
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
      </div>
    </div>
  )
}