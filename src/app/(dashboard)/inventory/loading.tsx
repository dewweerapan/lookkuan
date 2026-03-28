import { SkeletonTable } from '@/components/shared/Skeleton'

export default function InventoryLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between animate-pulse">
        <div className="h-7 w-32 bg-gray-200 rounded" />
        <div className="h-10 w-36 bg-gray-200 rounded-xl" />
      </div>
      <div className="flex gap-3 mb-6 animate-pulse">
        <div className="h-10 flex-1 bg-gray-200 rounded-xl" />
        <div className="h-10 w-40 bg-gray-200 rounded-xl" />
      </div>
      <SkeletonTable rows={8} />
    </div>
  )
}
