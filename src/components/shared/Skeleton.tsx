export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}
    >
      <div className='animate-pulse space-y-3'>
        <SkeletonLine className='h-4 w-1/3' />
        <SkeletonLine className='h-6 w-2/3' />
        <SkeletonLine className='h-4 w-1/2' />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      <div className='p-4 border-b border-gray-100 animate-pulse'>
        <SkeletonLine className='h-5 w-48' />
      </div>
      <div className='divide-y divide-gray-100'>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className='p-4 flex gap-4 animate-pulse'>
            <SkeletonLine className='h-4 w-24' />
            <SkeletonLine className='h-4 flex-1' />
            <SkeletonLine className='h-4 w-20' />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonStatCards() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className='stat-card animate-pulse'>
          <div className='flex items-center gap-4'>
            <SkeletonLine className='w-12 h-12 rounded-xl' />
            <div className='space-y-2 flex-1'>
              <SkeletonLine className='h-3 w-24' />
              <SkeletonLine className='h-6 w-20' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
