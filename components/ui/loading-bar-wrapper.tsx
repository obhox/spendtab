"use client"

import { Suspense } from "react"
import { LoadingBar } from "./loading-bar"

export function LoadingBarWrapper() {
  return (
    <Suspense fallback={null}>
      <LoadingBar />
    </Suspense>
  )
}