import { Skeleton } from "@/components/ui/skeleton"

export default function SubscriptionLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-9 w-36" />
      </div>
    </div>
  )
}
