"use client"

import React from 'react'
import { BankReconciliationProvider } from '@/lib/context/BankReconciliationContext'
import { BankReconciliationDashboard } from '@/components/bank-reconciliation/bank-reconciliation-dashboard'

export default function BankReconciliationPage() {
  return (
    <BankReconciliationProvider>
      <div className="pt-0 px-4 pb-4 md:pt-0 md:px-6 md:pb-6 lg:pt-0 lg:px-8 lg:pb-8 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Bank Reconciliation</h1>
        <BankReconciliationDashboard />
      </div>
    </BankReconciliationProvider>
  )
}