"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Crown, X } from "lucide-react"

interface TrialExpirationPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpgrade?: () => void
  onRemindLater?: () => void
}

export function TrialExpirationPopup({ 
  open, 
  onOpenChange, 
  onUpgrade,
  onRemindLater 
}: TrialExpirationPopupProps) {
  
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade()
    } else {
      // Default upgrade action - you can customize this
      window.open('https://your-upgrade-url.com', '_blank')
    }
    onOpenChange(false)
  }

  const handleRemindLater = () => {
    // Set reminder timestamp in localStorage
    localStorage.setItem('trialExpirationRemindLater', Date.now().toString())
    if (onRemindLater) {
      onRemindLater()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <DialogTitle>Trial Expired</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Your free trial has expired. To continue adding transactions and accessing all features, please upgrade to our Pro plan.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 rounded-lg border">
            <h3 className="font-semibold text-sm mb-2">Pro Plan Benefits:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Unlimited transactions</li>
              <li>• Advanced reporting & analytics</li>
              <li>• Receipt upload & storage</li>
              <li>• Budget tracking & alerts</li>
              <li>• Tax optimization features</li>
              <li>• Priority support</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleRemindLater} className="w-full sm:w-auto">
            Remind Me Later
          </Button>
          <Button onClick={handleUpgrade} className="w-full sm:w-auto">
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}