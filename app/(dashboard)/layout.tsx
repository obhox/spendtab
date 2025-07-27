"use client"

import type React from "react"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import { DollarSign, LayoutDashboard, PieChart, LineChart, FileText, Settings, CreditCard, Menu, X, Tag, Calculator, TrendingUp, TrendingDown, GitCompare } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { CurrencySwitcher, useTaxFeaturesVisible } from "@/components/currency-switcher"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAccounts } from "@/lib/context/AccountContext"
import { useState, useEffect } from "react"
import { getCookie } from "@/lib/cookie-utils"
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
  const isTaxFeaturesVisible = useTaxFeaturesVisible();
 const [subscriptionTier, setSubscriptionTier] = useState('trial');
  const [trialEndDate, setTrialEndDate] = useState<string | null>(null);
  useEffect(() => {
    const userSubscriptionTier = getCookie('userSubscriptionTier') || 'trial';
    const userTrialEndDate = getCookie('userTrialEndDate');
    setSubscriptionTier(userSubscriptionTier);
    setTrialEndDate(userTrialEndDate);
  }, []);

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
            <SheetContent side="left" className="w-72 p-0" style={{ backgroundColor: '#000000' }}>
              <nav className="h-full flex flex-col text-white">
                <div className="flex h-14 items-center justify-between px-4">
                  <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-white">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-lg">spendtab</span>
                  </Link>
                  <ModeToggle />
                </div>
                <ScrollArea className="flex-1 px-3">
                  <div className="space-y-4 py-4">
                    <div className="px-3 py-2">
                      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-white">Main</h2>
                      <div className="space-y-1">
                        <Link
                          href="/dashboard"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/transactions"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span>Transactions</span>
                        </Link>
                        <Link
                          href="/assets-liabilities"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          <span>Assets & Liabilities</span>
                        </Link>
                        <Link
                          href="/bank-reconciliation"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                        >
                          <GitCompare className="mr-2 h-4 w-4" />
                          <span>Bank Reconciliation</span>
                        </Link>
                      </div>
                    </div>
                    <div className="px-3 py-2">
                      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-white">Analytics</h2>
                      <div className="space-y-1">
                        <Link
                          href="/analytics"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                        >
                          <PieChart className="mr-2 h-4 w-4" />
                          <span>Analytics</span>
                        </Link>
                        <Link
                          href="/reports"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Reports</span>
                        </Link>
                        {isTaxFeaturesVisible && (
                          <Link
                            href="/tax-reports"
                            className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                          >
                            <Calculator className="mr-2 h-4 w-4" />
                            <span>Tax Reports</span>
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="px-3 py-2">
                      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-white">Planning</h2>
                      <div className="space-y-1">
                        <Link
                          href="/budgets"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                        >
                          <LineChart className="mr-2 h-4 w-4" />
                          <span>Budget</span>
                        </Link>
                        <Link
                          href="/categories"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                        >
                          <Tag className="mr-2 h-4 w-4" />
                          <span>Categories</span>
                        </Link>
                      </div>
                    </div>
                    <div className="px-3 py-2">
                      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-white">Account</h2>
                      <div className="space-y-1">
                        <Link
                          href="/profile"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <div className="mt-auto p-4 space-y-4">
                  <Suspense fallback={<div className="text-white">Loading account selector...</div>}>
                    <AccountSelector />
                  </Suspense>
                  {(!subscriptionTier || subscriptionTier.toLowerCase() !== 'pro') && (
                    <Link href="https://buy.polar.sh/polar_cl_QP6eSG473oww6LecS9xOiFRhXkRhci3xD7BCk0qjjno" className="block">
                      <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white">
                        Upgrade to Pro
                      </Button>
                    </Link>
                  )}
                  <CurrencySwitcher />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <aside className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:overflow-y-auto" style={{ backgroundColor: '#000000' }}>
          <div className="sticky top-0 flex h-16 items-center justify-between px-6" style={{ backgroundColor: '#000000' }}>
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-white">
              <DollarSign className="h-6 w-6 text-primary" />
              <span>spendtab</span>
            </Link>
            <ModeToggle />
          </div>
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-4 py-4">
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-white">Main</h2>
                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/transactions"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Transactions</span>
                  </Link>
                  <Link
                    href="/assets-liabilities"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    <span>Assets & Liabilities</span>
                  </Link>
                  <Link
                    href="/bank-reconciliation"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                  >
                    <GitCompare className="mr-2 h-4 w-4" />
                    <span>Bank Reconciliation</span>
                  </Link>
                </div>
              </div>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-white">Analytics</h2>
                <div className="space-y-1">
                  <Link
                    href="/analytics"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                  >
                    <PieChart className="mr-2 h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                  <Link
                    href="/reports"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Reports</span>
                  </Link>
                  {isTaxFeaturesVisible && (
                    <Link
                      href="/tax-reports"
                      className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                    >
                      <Calculator className="mr-2 h-4 w-4" />
                      <span>Tax Reports</span>
                    </Link>
                  )}
                </div>
              </div>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-white">Planning</h2>
                <div className="space-y-1">
                  <Link
                    href="/budgets"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                  >
                    <LineChart className="mr-2 h-4 w-4" />
                    <span>Budget</span>
                  </Link>
                  <Link
                    href="/categories"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    <span>Categories</span>
                  </Link>
                </div>
              </div>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-white">Account</h2>
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="mt-auto p-4 space-y-4">
            <Suspense fallback={<div className="text-white">Loading account selector...</div>}>
              <AccountSelector />
            </Suspense>
            {subscriptionTier === 'trial' && (
              <div className="space-y-2">
                {trialEndDate && (
                  <div className="text-xs text-muted-foreground text-center">
                    Trial ends: {new Date(trialEndDate).toLocaleDateString()}
                  </div>
                )}
                <Link href="https://buy.polar.sh/polar_cl_QP6eSG473oww6LecS9xOiFRhXkRhci3xD7BCk0qjjno" className="block">
                  <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            )}
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
