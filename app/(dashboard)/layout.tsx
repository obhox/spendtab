"use client"

import { Activity, BarChart3, CreditCard, DollarSign, Home, PieChart, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Reports", href: "/reports", icon: Activity },
  { name: "Budgets", href: "/budgets", icon: DollarSign },
  { name: "Categories", href: "/categories", icon: PieChart },
  { name: "Profile", href: "/profile", icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-64 flex-col border-r bg-gray-100/40 p-6 lg:flex">
        <nav className="flex flex-1 flex-col space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-gray-900 dark:hover:text-gray-50 ${isActive ? "bg-gray-200/80 text-gray-900 dark:bg-gray-800 dark:text-gray-50" : "text-gray-500 dark:text-gray-400"}`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}
