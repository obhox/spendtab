import type React from "react"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Inter } from "next/font/google"
import { PostHogProvider } from "./providers/posthog-provider"
import { ThemeProvider } from "./providers/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { DataProvider } from "@/lib/context/DataProvider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FinTrack - Business Financial Management",
  description: "Comprehensive financial tracking and modeling for businesses",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <PostHogProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <DataProvider>
              {children}
              <Toaster />
            </DataProvider>
          </ThemeProvider>
        </PostHogProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
