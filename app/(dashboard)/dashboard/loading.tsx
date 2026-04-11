import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-4 md:space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-px">
        <div className="bg-white border border-ibm-g20 h-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ibm-g20">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6">
              <Skeleton className="h-3 w-24 mb-4" />
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-px bg-ibm-g20">
        <div className="lg:col-span-4 bg-white p-6"><Skeleton className="h-[300px]" /></div>
        <div className="lg:col-span-3 bg-ibm-g10 p-6"><Skeleton className="h-[300px]" /></div>
      </div>
    </div>
  )
}
