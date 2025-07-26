"use client"

import React from 'react'
import { BankReconciliationProvider } from '@/lib/context/BankReconciliationContext'
import { BankReconciliationDashboard } from '@/components/bank-reconciliation/bank-reconciliation-dashboard'

export default function BankReconciliationPage() {
  return (
    <BankReconciliationProvider>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Bank Reconciliation</h2>
        </div>
        <BankReconciliationDashboard />
      </div>
    </BankReconciliationProvider>
  )
}