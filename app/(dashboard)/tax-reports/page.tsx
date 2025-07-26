"use client"

import { DataProvider } from "@/lib/context/DataProvider"
import { TaxReports } from "@/components/tax-reports"

export default function TaxReportsPage() {
  return (
    <DataProvider>
      <TaxReports />
    </DataProvider>
  )
}