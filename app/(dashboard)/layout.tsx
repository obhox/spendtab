import type React from "react"
import { Suspense } from "react"
import { DollarSign, LayoutDashboard, PieChart, LineChart, FileText, Settings, CreditCard, Menu, X, Tag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
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
              <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                  <DollarSign className="h-6 w-6 text-primary" />
                  <span>spendtab</span>
                </Link>
              </div>
              <ScrollArea className="flex-1 px-3">
                <div className="space-y-4 py-4">
                  {/* Copy the same navigation content here */}
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
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      <aside className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:overflow-y-auto border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="sticky top-0 flex h-16 items-center border-b px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
      </aside>
      <main className="flex-1 overflow-auto p-8 lg:pl-72">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </main>
    </div>
  )
}
