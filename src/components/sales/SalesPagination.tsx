'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SalesPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6 pb-2">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
      >
        ← ก่อนหน้า
      </button>
      <span className="text-sm text-gray-500 px-2">
        หน้า <span className="font-semibold text-gray-800">{currentPage}</span> / {totalPages}
      </span>
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
      >
        ถัดไป →
      </button>
    </div>
  );
}
