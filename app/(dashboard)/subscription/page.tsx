"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Loader2, CreditCard, CheckCircle, AlertCircle, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { differenceInCalendarDays, format } from "date-fns"

interface SubscriptionDetails {
  subscription_status: string
  subscription_plan_code: string | null
  current_period_end: string | null
  paystack_subscription_code: string | null
  trial_ends_at: string | null
}

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadSubscription() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        setUserEmail(user.email || null)

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_plan_code, current_period_end, trial_ends_at, paystack_subscription_code')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching subscription:', error)
          // If profile doesn't exist, it might be a new user or error.
          // We can assume free/trial if no profile found or just handle error.
        } else {
          setSubscription(profile)
        }
      } catch (error) {
        console.error('Error loading subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubscription()
  }, [router])

  const handleUpgrade = () => {
    if (userEmail) {
      router.push(`/payment?email=${encodeURIComponent(userEmail)}`)
    } else {
      router.push('/payment')
    }
  }

  const handleManage = () => {
    // For now, we can't easily deep link to Paystack customer portal without more setup.
    // We could implement a cancel button here that calls our API.
    toast.info("To manage or cancel your subscription, please contact support at support@spendtab.com")
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const isActive = subscription?.subscription_status === 'active'
  const isPastDue = subscription?.subscription_status === 'past_due'
  const isCancelled = subscription?.subscription_status === 'cancelled'
  const isTrial = subscription?.subscription_status === 'trial'

  const trialEndsAt = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null
  const isTrialActive = isTrial && !!trialEndsAt && trialEndsAt.getTime() > Date.now()
  const trialDaysLeft = isTrialActive && trialEndsAt
    ? Math.max(0, differenceInCalendarDays(trialEndsAt, new Date()))
    : null

  let statusColor = "bg-gray-500"
  let statusText = "Unknown"

  if (isActive) {
    statusColor = "bg-green-500"
    statusText = "Active"
  } else if (isTrialActive) {
    statusColor = "bg-blue-500"
    statusText = "Trial"
  } else if (isPastDue) {
    statusColor = "bg-yellow-500"
    statusText = "Past Due"
  } else if (isCancelled) {
    statusColor = "bg-red-500"
    statusText = "Cancelled"
  } else {
    // Default for inactive
    statusColor = "bg-gray-500"
    statusText = "Inactive"
  }

  const endDate = subscription?.current_period_end 
    ? new Date(subscription.current_period_end) 
    : null

  const canUpgrade = !isActive && !isTrialActive

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-semibold tracking-tight mb-6">Subscription Management</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
            <CardDescription>
              Manage your subscription and billing details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className={`${statusColor} hover:${statusColor} text-white`}>
                  {statusText}
                </Badge>
              </div>
              {endDate && (
                <div className="space-y-1 text-right">
                  <p className="text-sm font-medium text-muted-foreground">
                    {isActive ? "Renews on" : "Expires on"}
                  </p>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(endDate, 'PPP')}
                  </div>
                </div>
              )}
            </div>

            {isTrialActive && trialEndsAt && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm font-medium">Free trial</p>
                <p className="text-sm text-muted-foreground">
                  {trialDaysLeft === 0
                    ? `Ends today (${format(trialEndsAt, 'PPP')})`
                    : `Ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} (${format(trialEndsAt, 'PPP')})`
                  }
                </p>
              </div>
            )}

            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  {isActive ? (
                    <CheckCircle className="h-6 w-6 text-primary" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {isActive ? "SpendTab Pro" : "No Active Plan"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isActive 
                      ? "You have full access to all features." 
                      : "Subscribe to unlock full access."
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            {isActive ? (
              <Button variant="outline" onClick={handleManage}>
                Manage Subscription
              </Button>
            ) : canUpgrade ? (
              <Button onClick={handleUpgrade} className="w-full sm:w-auto">
                Upgrade Plan
              </Button>
            ) : null}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
            <CardDescription>
              What's included in SpendTab Pro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[
                "Unlimited Transactions",
                "Advanced Reports & Analytics",
                "Bank Reconciliation",
                "Multi-currency Support",
                "Asset & Liability Tracking",
                "Priority Support"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
