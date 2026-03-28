import { SkeletonTable } from '@/components/shared/Skeleton'

export default function CustomersLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between animate-pulse">
        <div className="h-7 w-32 bg-gray-200 rounded" />
        <div className="h-10 w-36 bg-gray-200 rounded-xl" />
      </div>
      <div className="mb-6 animate-pulse">
        <div className="h-10 w-full bg-gray-200 rounded-xl" />
      </div>
      <SkeletonTable rows={6} />
    </div>
  )
}
