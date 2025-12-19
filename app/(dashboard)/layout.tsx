"use client"

import type React from "react"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import { DollarSign, LayoutDashboard, PieChart, LineChart, FileText, Settings, CreditCard, Menu, X, Tag, Calculator, TrendingUp, TrendingDown, GitCompare, Receipt, Building2, Sliders } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CurrencySwitcher, useSelectedCurrency } from "@/components/currency-switcher"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAccounts } from "@/lib/context/AccountContext"
import { useState, useEffect } from "react"
import { getCookie } from "@/lib/cookie-utils"
import { supabase } from "@/lib/supabase"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

const AccountSelector = dynamic(
  () => import("@/components/account-selector").then((mod) => mod.AccountSelector),
  { ssr: false }
)

const AccountCreationModal = dynamic(
  () => import("@/components/account-creation-modal").then((mod) => mod.AccountCreationModal),
  { ssr: false }
)

import { DataProvider } from "@/lib/context/DataProvider"
import { AssetProvider } from "@/lib/context/AssetContext"
import { LiabilityProvider } from "@/lib/context/LiabilityContext"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentAccount } = useAccounts();

  const selectedCurrency = useSelectedCurrency();

  return (
    <DataProvider>
      <AssetProvider>
        <LiabilityProvider>
          <AccountCreationModal />
          <div className="flex min-h-screen">
        <div className="lg:hidden fixed right-3 top-3 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-r border-gray-300" style={{ backgroundColor: '#ffffff' }}>
              <nav className="h-full flex flex-col text-black">
                <div className="flex h-14 items-center px-4">
                  <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-black">
                    <span className="text-lg">spendtab</span>
                  </Link>
                </div>
                <ScrollArea className="flex-1 px-3">
                  <div className="space-y-4 py-4">
                    <div className="px-3 py-2">
                      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-black">Main</h2>
                      <div className="space-y-1">
                        <Link
                          href="/dashboard"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/transactions"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span>Transactions</span>
                        </Link>
                        <Link
                          href="/assets-liabilities"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          <span>Assets & Liabilities</span>
                        </Link>
                        <Link
                          href="/bank-reconciliation"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                        >
                          <GitCompare className="mr-2 h-4 w-4" />
                          <span>Bank Reconciliation</span>
                        </Link>
                        <Link
                          href="/invoices"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                        >
                          <Receipt className="mr-2 h-4 w-4" />
                          <span>Invoices</span>
                        </Link>
                        <Link
                          href="/customers"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                        >
                          <Building2 className="mr-2 h-4 w-4" />
                          <span>Customers</span>
                        </Link>
                      </div>
                    </div>
                    <div className="px-3 py-2">
                      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-black">Analytics</h2>
                      <div className="space-y-1">
                        <Link
                          href="/reports"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Reports</span>
                        </Link>

                      </div>
                    </div>
                    <div className="px-3 py-2">
                      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-black">Planning</h2>
                      <div className="space-y-1">
                        <Link
                          href="/budgets"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                        >
                          <LineChart className="mr-2 h-4 w-4" />
                          <span>Budget</span>
                        </Link>
                        <Link
                          href="/categories"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                        >
                          <Tag className="mr-2 h-4 w-4" />
                          <span>Categories</span>
                        </Link>
                      </div>
                    </div>
                    <div className="px-3 py-2">
                      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-black">Account</h2>
                      <div className="space-y-1">
                        <Link
                          href="/profile"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          href="/invoice-settings"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                        >
                          <Sliders className="mr-2 h-4 w-4" />
                          <span>Invoice Settings</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <div className="mt-auto p-4 space-y-4">
                  <Suspense fallback={<div className="text-black">Loading account selector...</div>}>
                    <AccountSelector />
                  </Suspense>
                  <CurrencySwitcher />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <aside className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:overflow-y-auto border-r border-gray-300" style={{ backgroundColor: '#ffffff' }}>
          <div className="sticky top-0 flex h-16 items-center px-6" style={{ backgroundColor: '#ffffff' }}>
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-black">
              <span>spendtab</span>
            </Link>
          </div>
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-4 py-4">
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-black">Main</h2>
                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/transactions"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Transactions</span>
                  </Link>
                  <Link
                    href="/assets-liabilities"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    <span>Assets & Liabilities</span>
                  </Link>
                  <Link
                    href="/bank-reconciliation"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                  >
                    <GitCompare className="mr-2 h-4 w-4" />
                    <span>Bank Reconciliation</span>
                  </Link>
                  <Link
                    href="/invoices"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    <span>Invoices</span>
                  </Link>
                  <Link
                    href="/customers"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    <span>Customers</span>
                  </Link>
                </div>
              </div>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-black">Analytics</h2>
                <div className="space-y-1">
                  <Link
                    href="/reports"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Reports</span>
                  </Link>

                </div>
              </div>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-black">Planning</h2>
                <div className="space-y-1">
                  <Link
                    href="/budgets"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                  >
                    <LineChart className="mr-2 h-4 w-4" />
                    <span>Budget</span>
                  </Link>
                  <Link
                    href="/categories"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    <span>Categories</span>
                  </Link>
                </div>
              </div>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-black">Account</h2>
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/invoice-settings"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 hover:text-black"
                  >
                    <Sliders className="mr-2 h-4 w-4" />
                    <span>Invoice Settings</span>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="mt-auto p-4 space-y-4">
            <Suspense fallback={<div className="text-black">Loading account selector...</div>}>
              <AccountSelector />
            </Suspense>
            <CurrencySwitcher />
          </div>
        </aside>
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8 lg:pl-72">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </main>
        
        <Analytics />
        <SpeedInsights />
      </div>
        </LiabilityProvider>
      </AssetProvider>
    </DataProvider>
  )
}
