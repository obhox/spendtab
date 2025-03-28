export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 shadow-lg rounded-lg border">
        <div className="text-center space-y-2">
          <div className="h-8 w-3/4 mx-auto bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-5/6 mx-auto bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-1/4 bg-gray-200 animate-pulse rounded" />
            <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}