import { Skeleton } from "@/components/ui/skeleton"

export default function AssetsLiabilitiesLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <Skeleton className="h-3 w-24 mb-3" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        ))}
      </div>
      <div className="border rounded-lg">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
