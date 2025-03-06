import type React from "react"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { GeistSans } from "geist/font"
import { GeistMono } from "geist/font"
import { Suspense } from "react"
import { PostHogProvider } from "./providers/posthog-provider"
import { ThemeProvider } from "./providers/theme-provider"
import { LoadingBarWrapper } from "@/components/ui/loading-bar-wrapper"
import { DataProvider } from "@/lib/context/DataProvider"
import { Toaster } from "@/components/ui/sonner" // Updated import path
import { cn } from "@/lib/utils"
import "./globals.css"

const fontSans = GeistSans
const fontMono = GeistMono

export const metadata = {
  title: "spendtab - Business Financial Management",
  description: "Comprehensive financial tracking and modeling for businesses",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <LoadingBarWrapper />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PostHogProvider>
            <DataProvider>
              {children}
              <Toaster />
            </DataProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}