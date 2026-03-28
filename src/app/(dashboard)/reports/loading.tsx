import { SkeletonStatCards, SkeletonCard } from '@/components/shared/Skeleton'

export default function ReportsLoading() {
  return (
    <div>
      <div className="mb-6 animate-pulse">
        <div className="h-7 w-24 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-40 bg-gray-200 rounded" />
      </div>
      <div className="mb-8">
        <SkeletonStatCards />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
      </div>
    </div>
  )
}
