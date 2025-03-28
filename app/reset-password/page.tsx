import { Suspense } from "react"
import { ResetPasswordClient } from "@/components/reset-password-client"
import Loading from "./loading"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResetPasswordClient />
    </Suspense>
  )
}