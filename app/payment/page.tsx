"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { usePaystackPayment } from "react-paystack"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [email, setEmail] = useState("")
  const [amount, setAmount] = useState(5000) // Default amount in NGN
  const [loading, setLoading] = useState(false)

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
    plan: process.env.NEXT_PUBLIC_PAYSTACK_PLAN_CODE || '', // Add your plan code here
  };

  const isPlaceholderKey = config.publicKey === 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

  const initializePayment = usePaystackPayment(config);

  const onSuccess = (reference: any) => {
    setLoading(false)
    console.log(reference);
    toast.success("Payment successful! Welcome to SpendTab.")
    router.push("/dashboard")
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
          
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Monthly Subscription</span>
              <span className="font-bold text-lg">₦{amount.toLocaleString()}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Unlimited access to all SpendTab features.
            </p>
          </div>
        </CardContent>
        <CardFooter>
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
        </CardFooter>
      </Card>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
