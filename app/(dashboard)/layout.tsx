"use client"

import type React from "react"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import { LayoutDashboard, FileText, LineChart, Tag, Settings, CreditCard, Menu, GitCompare, Receipt, Building2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CurrencySwitcher, useSelectedCurrency } from "@/components/currency-switcher"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAccounts } from "@/lib/context/AccountContext"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { usePathname } from "next/navigation"

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
import { TaxProvider } from "@/lib/context/TaxContext"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

const navSections = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/transactions", label: "Transactions", icon: CreditCard },
      { href: "/assets-liabilities", label: "Assets & Liabilities", icon: TrendingUp },
      { href: "/bank-reconciliation", label: "Bank Reconciliation", icon: GitCompare },
      { href: "/invoices", label: "Invoices", icon: Receipt },
      { href: "/customers", label: "Customers", icon: Building2 },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/reports", label: "Reports", icon: FileText },
    ],
  },
  {
    label: "Planning",
    items: [
      { href: "/budgets", label: "Budget", icon: LineChart },
      { href: "/categories", label: "Categories", icon: Tag },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/profile", label: "Profile", icon: Settings },
      { href: "/subscription", label: "Subscription", icon: CreditCard },
    ],
  },
]

function NavLink({ href, label, icon: Icon, onClick }: { href: string; label: string; icon: React.ElementType; onClick?: () => void }) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href))
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
        isActive
          ? "border-l-2 border-ibm-blue bg-ibm-g10 pl-[calc(1rem-2px)] text-ibm-black font-medium"
          : "text-ibm-g70 hover:bg-ibm-g10 hover:text-ibm-black"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  )
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  return (
    <nav className="h-full flex flex-col bg-white border-r border-ibm-g20">
      {/* Logo */}
      <div className="flex h-14 items-center px-4 border-b border-ibm-g20">
        <Link href="/dashboard" className="font-semibold text-ibm-black tracking-tight text-base">
          spendtab
        </Link>
      </div>

      {/* Nav sections */}
      <ScrollArea className="flex-1">
        <div className="py-4">
          {navSections.map((section) => (
            <div key={section.label} className="mb-1">
              <p className="ibm-label px-4 py-2 mt-2">{section.label}</p>
              {section.items.map((item) => (
                <NavLink key={item.href} {...item} icon={item.icon} onClick={onNavClick} />
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom controls */}
      <div className="border-t border-ibm-g20 p-4 space-y-3">
        <Suspense fallback={<div className="text-ibm-g70 text-sm">Loading…</div>}>
          <AccountSelector />
        </Suspense>
        <CurrencySwitcher />
      </div>
    </nav>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentAccount } = useAccounts();
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const checkSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, trial_ends_at')
        .eq('id', user.id)
        .single()

      if (profile) {
        const status = profile.subscription_status
        const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
        const isTrialActive = status === 'trial' && !!trialEndsAt && trialEndsAt.getTime() > Date.now()
        const isEntitled = status === 'active' || isTrialActive

        if (!isEntitled) {
          if (status === 'trial') {
            await supabase
              .from('profiles')
              .update({ subscription_status: 'inactive' })
              .eq('id', user.id)
          }
          toast.error("Your trial has ended. Please subscribe to continue.")
          router.push(`/payment?email=${encodeURIComponent(user.email || '')}`)
        }
      }
    }

    checkSubscription()
  }, [router])

  const selectedCurrency = useSelectedCurrency();

  return (
    <DataProvider>
      <AssetProvider>
        <LiabilityProvider>
          <TaxProvider>
            <AccountCreationModal />
            <div className="flex min-h-screen bg-ibm-g10">

              {/* Mobile hamburger */}
              <div className="lg:hidden fixed right-3 top-3 z-50">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-10 w-10 bg-white border-ibm-g20">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0 border-r border-ibm-g20">
                    <SidebarContent onNavClick={() => setMobileOpen(false)} />
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop sidebar */}
              <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:flex-col">
                <SidebarContent />
              </aside>

              {/* Main content */}
              <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8 lg:pl-72">
                <Suspense fallback={<div className="text-ibm-g70">Loading…</div>}>{children}</Suspense>
              </main>

              <Analytics />
              <SpeedInsights />
            </div>
          </TaxProvider>
        </LiabilityProvider>
      </AssetProvider>
    </DataProvider>
  )
}
