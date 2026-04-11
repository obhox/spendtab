import { Skeleton } from "@/components/ui/skeleton"

export default function TaxCentreLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-36" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <Skeleton className="h-3 w-24 mb-3" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        ))}
      </div>
      <Skeleton className="h-[300px] w-full" />
    </div>
  )
}
