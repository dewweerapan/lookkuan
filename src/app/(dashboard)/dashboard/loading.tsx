import { SkeletonStatCards, SkeletonCard, SkeletonTable } from '@/components/shared/Skeleton'

export default function DashboardLoading() {
  return (
    <div>
      <div className="mb-6 animate-pulse">
        <div className="h-7 w-32 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-48 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="pos-card animate-pulse bg-gray-50 border-gray-200">
            <div className="w-8 h-8 bg-gray-200 rounded" />
            <div className="h-5 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <SkeletonStatCards />
    </div>
  )
}
