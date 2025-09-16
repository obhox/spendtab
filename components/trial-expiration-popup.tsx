"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Crown } from "lucide-react"
import { useSelectedCurrency } from "@/components/currency-switcher"

interface TrialExpirationPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function TrialExpirationPopup({ isOpen, onClose }: TrialExpirationPopupProps) {
  const selectedCurrency = useSelectedCurrency()
  
  // Determine upgrade URL based on currency
  const upgradeUrl = selectedCurrency.code === 'NGN' 
    ? 'https://paystack.shop/pay/spendtab-pro'
    : 'https://buy.polar.sh/polar_cl_X1FqBaICsJNrqs2KS6VIYBKzMgFtJuunckVUu24NsE3'

  const handleUpgrade = () => {
    window.open(upgradeUrl, '_blank')
    onClose()
  }

  const handleRemindLater = () => {
    // Store timestamp to remind later (e.g., in 24 hours)
    localStorage.setItem('trialExpirationRemindLater', Date.now().toString())
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Your Free Trial Has Expired
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Your free trial period has ended. To continue using SpendTab and access all features, please upgrade to Pro.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">SpendTab Pro Benefits</h3>
            </div>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Unlimited transactions and accounts</li>
              <li>• Advanced reporting and analytics</li>
              <li>• Priority customer support</li>
              <li>• Export data to Excel/CSV</li>
              <li>• Multi-currency support</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white"
            >
              Upgrade to Pro Now
            </Button>
            <Button 
              onClick={handleRemindLater}
              variant="outline"
              className="w-full"
            >
              Remind Me Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}