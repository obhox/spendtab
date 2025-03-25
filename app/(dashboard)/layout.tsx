"use client"

import type React from "react"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import { DollarSign, LayoutDashboard, PieChart, LineChart, FileText, Settings, CreditCard, Menu, X, Tag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAccounts } from "@/lib/context/AccountContext"
import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentAccount } = useAccounts();
 const [subscriptionTier, setSubscriptionTier] = useState('free');

const supabase = createClientComponentClient()

useEffect(() => {
  const fetchSubscriptionTier = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', session.user.id)
      .single();

    if (userData) {
      setSubscriptionTier(userData.subscription_tier);
    }
  };

  fetchSubscriptionTier();
}, []);

  return (
    <DataProvider>
      <AccountCreationModal />
      <div className="flex min-h-screen">
        <div className="lg:hidden fixed right-4 top-4 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <nav className="h-full flex flex-col">
                <div className="flex h-16 items-center px-6">
                  <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <DollarSign className="h-6 w-6 text-primary" />
                    <span>spendtab</span>
                  </Link>
                </div>
                <ScrollArea className="flex-1 px-3">
                  <div className="space-y-4 py-4">
                    <div className="px-3 py-2">
                      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Main</h2>
                      <div className="space-y-1">
                        <Link
                          href="/dashboard"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/transactions"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span>Transactions</span>
                        </Link>
                      </div>
                    </div>
                    <div className="px-3 py-2">
                      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Analytics</h2>
                      <div className="space-y-1">
                        <Link
                          href="/analytics"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                          <PieChart className="mr-2 h-4 w-4" />
                          <span>Analytics</span>
                        </Link>
                        <Link
                          href="/reports"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Reports</span>
                        </Link>
                      </div>
                    </div>
                    <div className="px-3 py-2">
                      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Planning</h2>
                      <div className="space-y-1">
                        <Link
                          href="/budgets"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                          <LineChart className="mr-2 h-4 w-4" />
                          <span>Budget</span>
                        </Link>
                        <Link
                          href="/categories"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                          <Tag className="mr-2 h-4 w-4" />
                          <span>Categories</span>
                        </Link>
                      </div>
                    </div>
                    <div className="px-3 py-2">
                      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Account</h2>
                      <div className="space-y-1">
                        <Link
                          href="/profile"
                          className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <div className="mt-auto p-4 space-y-4">
                  <Suspense fallback={<div>Loading account selector...</div>}>
                    <AccountSelector />
                  </Suspense>
                  {!subscriptionTier || !['pro', 'PRO'].includes(subscriptionTier) && (
                    <Link href="https://buy.polar.sh/polar_cl_QP6eSG473oww6LecS9xOiFRhXkRhci3xD7BCk0qjjno" className="block">
                      <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white">
                        Upgrade to Pro
                      </Button>
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <aside className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="sticky top-0 flex h-16 items-center px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <DollarSign className="h-6 w-6 text-primary" />
              <span>spendtab</span>
            </Link>
          </div>
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-4 py-4">
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Main</h2>
                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/transactions"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Transactions</span>
                  </Link>
                </div>
              </div>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Analytics</h2>
                <div className="space-y-1">
                  <Link
                    href="/analytics"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <PieChart className="mr-2 h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                  <Link
                    href="/reports"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Reports</span>
                  </Link>
                </div>
              </div>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Planning</h2>
                <div className="space-y-1">
                  <Link
                    href="/budgets"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <LineChart className="mr-2 h-4 w-4" />
                    <span>Budget</span>
                  </Link>
                  <Link
                    href="/categories"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    <span>Categories</span>
                  </Link>
                </div>
              </div>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Account</h2>
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="mt-auto p-4 space-y-4">
            <Suspense fallback={<div>Loading account selector...</div>}>
              <AccountSelector />
            </Suspense>
            {subscriptionTier?.toLowerCase() !== 'pro' && (
              <Link href="https://buy.polar.sh/polar_cl_QP6eSG473oww6LecS9xOiFRhXkRhci3xD7BCk0qjjno" className="block">
                <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white">
                  Upgrade to Pro
                </Button>
              </Link>
            )}
          </div>
        </aside>
        <main className="flex-1 overflow-auto p-8 lg:pl-72">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </main>
        <Analytics />
        <SpeedInsights />
      </div>
    </DataProvider>
  )
}
