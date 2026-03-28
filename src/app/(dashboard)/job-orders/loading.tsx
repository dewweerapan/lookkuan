import { SkeletonTable } from '@/components/shared/Skeleton';

export default function JobOrdersLoading() {
  return (
    <div>
      <div className='mb-6 flex items-center justify-between animate-pulse'>
        <div className='h-7 w-40 bg-gray-200 rounded' />
        <div className='h-10 w-32 bg-gray-200 rounded-xl' />
      </div>
      <div className='flex gap-3 mb-6 animate-pulse'>
        <div className='h-10 flex-1 bg-gray-200 rounded-xl' />
        <div className='h-10 w-24 bg-gray-200 rounded-xl' />
        <div className='h-10 w-24 bg-gray-200 rounded-xl' />
      </div>
      <div className='hidden md:grid md:grid-cols-2 xl:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className='bg-gray-50 rounded-xl p-4 space-y-3 animate-pulse'
          >
            <div className='h-6 w-24 bg-gray-200 rounded-full' />
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={j}
                className='bg-white rounded-xl border border-gray-200 p-4 space-y-2'
              >
                <div className='h-4 w-20 bg-gray-200 rounded' />
                <div className='h-5 w-32 bg-gray-200 rounded' />
                <div className='h-3 w-full bg-gray-200 rounded' />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
