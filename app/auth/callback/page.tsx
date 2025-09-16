"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ensureUserHasAccount } from '@/lib/account-utils'
import { toast } from 'sonner'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          toast('Authentication failed', {
            description: error.message || 'Failed to complete authentication'
          })
          router.push('/login')
          return
        }

        if (session?.user) {
          // Ensure user has a default account
          await ensureUserHasAccount(session.user)
          
          // Send welcome email for new users
          try {
            await fetch('/api/email/welcome', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: session.user.email,
                firstName: session.user.user_metadata?.given_name || '',
                fullName: session.user.user_metadata?.name
              })
            })
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError)
            // Don't throw error as sign-in was successful
          }
          
          toast('Successfully signed in with Google', {
            description: 'Welcome to SpendTab!'
          })
          
          // Redirect to dashboard
          router.push('/dashboard')
        } else {
          // No session found, redirect to login
          toast('Authentication incomplete', {
            description: 'Please try signing in again'
          })
          router.push('/login')
        }
      } catch (error: any) {
        console.error('Auth callback error:', error)
        toast('Authentication failed', {
          description: error?.message || 'An unexpected error occurred'
        })
        router.push('/login')
      }
    }

    handleAuthCallback()
  }, [router, supabase.auth])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}