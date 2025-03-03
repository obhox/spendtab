import type React from "react"
import { Suspense } from "react"
import { DollarSign, LayoutDashboard, PieChart, LineChart, FileText, Settings, CreditCard, Menu, X, Tag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex h-16 items-center border-b">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <DollarSign className="h-6 w-6" />
                <span>spendtab</span>
              </Link>
              <Button variant="ghost" size="icon" className="ml-auto">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="grid gap-2 py-4">
              <Link href="/dashboard" className="flex items-center gap-2 font-medium p-2 hover:bg-muted">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
              <Link href="/dashboard/transactions" className="flex items-center gap-2 font-medium p-2 hover:bg-muted">
                <CreditCard className="h-5 w-5" />
                Transactions
              </Link>
              <Link href="/dashboard/analytics" className="flex items-center gap-2 font-medium p-2 hover:bg-muted">
                <PieChart className="h-5 w-5" />
                Analytics
              </Link>
              <Link href="/dashboard/reports" className="flex items-center gap-2 font-medium p-2 hover:bg-muted">
                <FileText className="h-5 w-5" />
                Reports
              </Link>
              <Link href="/dashboard/budgets" className="flex items-center gap-2 font-medium p-2 hover:bg-muted">
                <LineChart className="h-5 w-5" />
                Budgets
              </Link>
              <Link href="/dashboard/categories" className="flex items-center gap-2 font-medium p-2 hover:bg-muted">
                <Tag className="h-5 w-5" />
                Categories
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <DollarSign className="h-6 w-6" />
          <span className="hidden md:inline-block">spendtab</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <ModeToggle />
          {/* TODO: Implement your own user menu here */}
          <Button variant="ghost" size="icon">
            <span className="sr-only">User menu</span>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-background md:block">
          <nav className="grid gap-2 p-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-medium">
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link href="/transactions" className="flex items-center gap-2 font-medium">
              <CreditCard className="h-5 w-5" />
              Transactions
            </Link>
            <Link href="/analytics" className="flex items-center gap-2 font-medium">
              <PieChart className="h-5 w-5" />
              Analytics
            </Link>
            <Link href="/reports" className="flex items-center gap-2 font-medium">
              <FileText className="h-5 w-5" />
              Reports
            </Link>
            <Link href="/budgets" className="flex items-center gap-2 font-medium">
              <LineChart className="h-5 w-5" />
              Budgets
            </Link>
            <Link href="/categories" className="flex items-center gap-2 font-medium">
              <Tag className="h-5 w-5" />
              Categories
            </Link>
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </main>
      </div>
    </div>
  )
}
