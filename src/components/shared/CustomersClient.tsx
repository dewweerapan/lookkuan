'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { exportToCSV } from '@/lib/export';
import SearchInput from '@/components/shared/SearchInput';
import EmptyState from '@/components/shared/EmptyState';
import type { Customer } from '@/types/database';

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
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

export default function CustomersClient({
  customers,
  totalPages,
  currentPage,
}: {
  customers: Customer[];
  totalPages: number;
  currentPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  const tierConfig = {
    gold: { label: '🥇 ทอง', className: 'bg-yellow-100 text-yellow-800' },
    silver: { label: '🥈 เงิน', className: 'bg-gray-100 text-gray-700' },
    bronze: { label: '🥉 ทองแดง', className: 'bg-orange-100 text-orange-700' },
  };

  return (
    <div>
      <div className='flex gap-3 mb-6'>
        <div className='flex-1'>
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              // Reset to page 1 when search changes
              const params = new URLSearchParams(searchParams.toString());
              params.delete('page');
              router.push(`${window.location.pathname}?${params.toString()}`);
            }}
            placeholder='ค้นหาลูกค้า, เบอร์โทร, อีเมล...'
          />
        </div>
        <button
          onClick={() =>
            exportToCSV(
              'customers',
              filtered.map((c) => ({
                ชื่อ: c.name,
                เบอร์โทร: c.phone || '',
                อีเมล: c.email || '',
                LINE: c.line_id || '',
                ยอดใช้จ่าย: c.total_spent,
                แต้มสะสม: c.loyalty_points ?? 0,
                ระดับ: c.tier ?? 'bronze',
                จำนวนครั้ง: c.visit_count,
              })),
            )
          }
          className='pos-btn-secondary text-sm px-4 py-2 flex-shrink-0'
        >
          📥 Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon='👥'
          title='ไม่พบลูกค้า'
          description='ลูกค้าจะถูกเพิ่มอัตโนมัติเมื่อมีการขายหรือรับงานปัก'
        />
      ) : (
        <>
          {/* Mobile Card View */}
          <div className='block sm:hidden space-y-3'>
            {filtered.map((c) => (
              <div
                key={c.id}
                className='bg-white rounded-xl border border-gray-200 p-4'
              >
                <div className='flex items-center gap-3 mb-3'>
                  <div className='w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg flex-shrink-0'>
                    {c.name.charAt(0)}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <p className='font-bold text-gray-800 truncate'>
                        {c.name}
                      </p>
                      {c.tier && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${tierConfig[c.tier as keyof typeof tierConfig]?.className}`}
                        >
                          {tierConfig[c.tier as keyof typeof tierConfig]?.label}
                        </span>
                      )}
                    </div>
                    {c.phone ? (
                      <a
                        href={`tel:${c.phone}`}
                        className='text-sm text-brand-600 hover:underline'
                      >
                        {c.phone}
                      </a>
                    ) : (
                      <p className='text-sm text-gray-400'>ไม่มีเบอร์โทร</p>
                    )}
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <div>
                    <span className='text-gray-500'>แต้มสะสม: </span>
                    <span className='font-semibold text-brand-600'>
                      {(c.loyalty_points ?? 0).toLocaleString()} แต้ม
                    </span>
                  </div>
                  <div>
                    <span className='text-gray-500'>เข้าร้าน: </span>
                    <span className='font-semibold'>{c.visit_count} ครั้ง</span>
                  </div>
                </div>
                <div className='mt-2 pt-2 border-t border-gray-100 flex justify-between items-center'>
                  <span className='text-sm text-gray-500'>ยอดใช้จ่ายรวม</span>
                  <span className='font-bold text-brand-600'>
                    {formatCurrency(c.total_spent)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className='hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden'>
            <table className='data-table'>
              <thead>
                <tr>
                  <th>ชื่อลูกค้า</th>
                  <th>เบอร์โทร</th>
                  <th>ระดับสมาชิก</th>
                  <th className='text-right'>แต้มสะสม</th>
                  <th className='text-right'>ยอดใช้จ่ายรวม</th>
                  <th className='text-right'>จำนวนครั้ง</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td className='font-semibold text-gray-800'>{c.name}</td>
                    <td>
                      {c.phone ? (
                        <a
                          href={`tel:${c.phone}`}
                          className='text-brand-600 hover:underline'
                        >
                          {c.phone}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {c.tier && <span className={`text-xs px-2 py-1 rounded-full font-semibold ${tierConfig[c.tier as keyof typeof tierConfig]?.className}`}>{tierConfig[c.tier as keyof typeof tierConfig]?.label}</span>}
                    </td>
                    <td className='text-right font-semibold text-brand-600'>
                      {(c.loyalty_points ?? 0).toLocaleString()}
                    </td>
                    <td className='text-right font-semibold'>
                      {formatCurrency(c.total_spent)}
                    </td>
                    <td className='text-right'>{c.visit_count} ครั้ง</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
