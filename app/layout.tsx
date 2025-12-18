import type React from "react"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'

import { PostHogProvider } from "@/components/posthog-provider"
import { ThemeProvider } from "@/app/providers/theme-provider"
import { QueryProvider } from "@/app/providers/query-provider"
import { DataProvider } from "@/lib/context/DataProvider"
import { CurrencyProvider } from "@/components/currency-switcher"
import { Toaster } from "sonner"
import { LoadingBar } from "@/components/ui/loading-bar"
import "./globals.css"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
  other: {
    'robots': 'noindex, nofollow, noarchive, nosnippet, noimageindex, nocache',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={GeistSans.variable}>
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex, nocache" />
        <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="bingbot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="slurp" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="duckduckbot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="baiduspider" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="yandexbot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="facebookexternalhit" content="noindex, nofollow" />
        <meta name="twitterbot" content="noindex, nofollow" />
        <meta name="pinterest" content="nopin" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PostHogProvider>
            <QueryProvider>
              <DataProvider>
                <CurrencyProvider>
                  <LoadingBar />
                  {children}
                  <Toaster richColors closeButton />
                </CurrencyProvider>
              </DataProvider>
            </QueryProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
