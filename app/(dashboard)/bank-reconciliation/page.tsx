"use client"

import React from 'react'
import { BankReconciliationProvider } from '@/lib/context/BankReconciliationContext'
import { BankReconciliationDashboard } from '@/components/bank-reconciliation/bank-reconciliation-dashboard'

export default function BankReconciliationPage() {
  return (
    <BankReconciliationProvider>
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight mb-6">Bank Reconciliation</h1>
        <BankReconciliationDashboard />
      </div>
    </BankReconciliationProvider>
  )
}