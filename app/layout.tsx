import type React from "react"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { PostHogProvider } from "@/app/providers/posthog-provider"
import { ThemeProvider } from "@/app/providers/theme-provider"
import { DataProvider } from "@/lib/context/DataProvider"
import { Toaster } from "sonner"
import { LoadingBar } from "@/components/ui/loading-bar"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PostHogProvider>
            <DataProvider>
              <LoadingBar />
              {children}
              <Toaster richColors closeButton />
            </DataProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}