"use client"

import type React from "react"

import posthog from "posthog-js"
import { PostHogProvider as Provider } from "posthog-js/react"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"

function PostHogProviderContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
        capture_pageview: false,
      })
    }
  }, [])

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
      posthog.capture("$pageview", { $current_url: url })
    }
  }, [pathname, searchParams])

  return <Provider client={posthog}>{children}</Provider>
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <PostHogProviderContent>{children}</PostHogProviderContent>
    </Suspense>
  )
}

