"use client"

import type React from "react"
import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const plans = [
  {
    name: "Free",
    price: "$0/month",
    description: "Basic plan",
    features: ["Basic features", "Limited storage (5GB)", "Email support"],
  },
  {
    name: "Pro",
    price: "$29/month",
    description: "Unlock all features",
    features: [
      "All Free features",
      "Advanced analytics",
      "Unlimited storage",
      "Priority support",
      "Custom domain"
    ],
  },
]

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState("Free")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would handle the subscription change
    console.log("Changing subscription to:", selectedPlan)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Subscription</h2>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <Card key={plan.name} className={selectedPlan === plan.name ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {plan.name}
                    <span className="text-xl font-bold">{plan.price}</span>
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-none pl-0 space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <RadioGroupItem value={plan.name} id={plan.name} className="sr-only" />
                  <Label
                    htmlFor={plan.name}
                    className="flex items-center justify-center w-full py-2 border rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {selectedPlan === plan.name ? "Current Plan" : `Select ${plan.name} Plan`}
                  </Label>
                </CardFooter>
              </Card>
            ))}
          </div>
        </RadioGroup>
        <Button type="submit" className="w-full">
          {selectedPlan === "Free" ? "Upgrade to Pro" : "Downgrade to Free"}
        </Button>
      </form>
    </div>
  )
}