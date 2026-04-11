import type React from "react"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
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
    <html lang="en" suppressHydrationWarning>
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
        {/* IBM Plex fonts via Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
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
