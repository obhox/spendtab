"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { usePaystackPayment } from "react-paystack"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PaymentForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [email, setEmail] = useState("")
  const [planType, setPlanType] = useState<'monthly' | 'yearly'>('monthly')
  const [amount, setAmount] = useState(3999.99) // Default amount in NGN
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (planType === 'monthly') {
      setAmount(3999.99)
    } else {
      setAmount(39999.99)
    }
  }, [planType])

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  // Replace with your actual Paystack public key
  // ideally this should be in an environment variable: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
  const config = {
    reference: (new Date()).getTime().toString(),
    email: email,
    amount: amount * 100, // Paystack expects amount in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    plan: planType === 'monthly' 
      ? (process.env.NEXT_PUBLIC_PAYSTACK_PLAN_MONTHLY || process.env.NEXT_PUBLIC_PAYSTACK_PLAN_CODE || '') 
      : (process.env.NEXT_PUBLIC_PAYSTACK_PLAN_YEARLY || ''),
  };

  const isPlaceholderKey = config.publicKey === 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    try {
      // Call our API to verify and update subscription
      const response = await fetch('/api/payment/success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: reference.reference,
          email: email
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Payment verification failed. Status:', response.status, 'Data:', JSON.stringify(errorData, null, 2))
        throw new Error(errorData.error || 'Failed to verify payment')
      }

      setLoading(false)
      console.log(reference);
      toast.success("Payment successful! Welcome to SpendTab.")
      router.push("/dashboard")
    } catch (error) {
      console.error('Payment verification error:', error)
      toast.error("Payment successful but verification failed. Please contact support.")
      setLoading(false)
    }
  };

  const onClose = () => {
    setLoading(false)
    toast("Payment cancelled")
  }

  const handlePayment = () => {
    if (!email) {
      toast.error("Please provide an email address")
      return
    }
    
    if (isPlaceholderKey) {
       toast.warning("Paystack Public Key is not set. Please set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in your .env file.")
       // Allow to proceed for testing UI, but Paystack will fail or use test mode if key is partial
    }

    if (!config.plan) {
        // If plan is missing, it will process as one-time payment. 
        // We might want to warn the user or developer.
        console.warn("No plan code provided. Payment will be processed as one-time payment.")
    }

    setLoading(true)
    initializePayment({onSuccess, onClose})
  }

  const isFromSignup = !!searchParams.get("email")

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Subscription</CardTitle>
          <CardDescription>
            To activate your SpendTab account, please subscribe to a plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              disabled={isFromSignup}
              className={isFromSignup ? "bg-muted text-muted-foreground" : ""}
            />
            {isFromSignup && (
              <p className="text-xs text-muted-foreground">
              Using the email address from your registration.
              </p>
            )}
          </div>
          
          <div className="grid gap-4">
            <div 
              className={cn(
                "rounded-lg border p-4 cursor-pointer transition-all",
                planType === 'monthly' 
                  ? "border-primary bg-primary/5 ring-1 ring-primary" 
                  : "bg-muted/50 hover:bg-muted"
              )}
              onClick={() => setPlanType('monthly')}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Monthly Subscription</span>
                <span className="font-bold text-lg">₦3,999.99</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Billed monthly. Unlimited access.
              </p>
            </div>

            <div 
              className={cn(
                "rounded-lg border p-4 cursor-pointer transition-all",
                planType === 'yearly' 
                  ? "border-primary bg-primary/5 ring-1 ring-primary" 
                  : "bg-muted/50 hover:bg-muted"
              )}
              onClick={() => setPlanType('yearly')}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Yearly Subscription</span>
                <span className="font-bold text-lg">₦39,999.99</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Billed annually. Save ~17%.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full" 
            onClick={handlePayment}
            disabled={loading || !email}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ₦${amount.toLocaleString()}`
            )}
          </Button>
          <div className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-green-600">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
            </svg>
            Secured by Paystack
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
