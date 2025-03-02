import { Button } from "@/components/ui/button"
import { ChevronRight, LineChart, PieChart, BarChart3, DollarSign } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <DollarSign className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold">FinTrack</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/about">
            About
          </Link>
        </nav>
        <div className="ml-4 flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Sign Up</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Financial Management Made Simple
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Track income, expenses, and budgets. Generate reports and gain insights into your business finances.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="px-8">
                      Get Started
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/features">
                    <Button variant="outline" size="lg">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 md:gap-8">
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-primary/10 p-4 md:p-6">
                    <BarChart3 className="h-10 w-10 text-primary" />
                    <h3 className="text-center font-bold">Income & Expenses</h3>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      Track all your financial transactions in one place
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-primary/10 p-4 md:p-6">
                    <PieChart className="h-10 w-10 text-primary" />
                    <h3 className="text-center font-bold">Budgeting</h3>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      Create and manage budgets for better financial control
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-primary/10 p-4 md:p-6">
                    <LineChart className="h-10 w-10 text-primary" />
                    <h3 className="text-center font-bold">Analytics</h3>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      Visualize your financial data with powerful analytics
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-primary/10 p-4 md:p-6">
                    <DollarSign className="h-10 w-10 text-primary" />
                    <h3 className="text-center font-bold">Financial Reports</h3>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      Generate comprehensive financial reports
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 FinTrack. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="/terms">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="/privacy">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

