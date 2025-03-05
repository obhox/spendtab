import type React from "react"

import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { LoadingBar } from "@/components/ui/loading-bar"
import { DataProvider } from "@/lib/context/DataProvider"
import { cn } from "@/lib/utils"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/app/providers/theme-provider"
import { PostHogProvider } from "@/app/providers/posthog-provider"

export const metadata = {
  title: "SpendTab - Personal Finance Manager",
  description: "Track your expenses, manage budgets, and analyze your spending habits.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PostHogProvider>
            {children}
            <Toaster />
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
