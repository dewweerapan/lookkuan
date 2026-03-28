'use client'

import Link from 'next/link'
import type { PurchaseOrder } from '@/types/database'
import { ClipboardList } from 'lucide-react'

interface Props {
  orders: (PurchaseOrder & { supplier?: { id: string; name: string } | null })[]
}

const statusLabel: Record<string, string> = {
  pending: 'รอดำเนินการ',
  ordered: 'สั่งซื้อแล้ว',
  received: 'รับสินค้าแล้ว',
  cancelled: 'ยกเลิก',
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  ordered: 'bg-blue-100 text-blue-700',
  received: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function PurchaseOrdersClient({ orders }: Props) {
  return (
    <div>
      {/* Mobile cards */}
      <div className='lg:hidden space-y-3'>
        {orders.length === 0 && (
          <div className='text-center py-12 text-gray-400'>ยังไม่มีใบสั่งซื้อ</div>
        )}
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/purchase-orders/${o.id}`}
            className='block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:border-brand-300 transition-colors'
          >
            <div className='flex items-start justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <ClipboardList size={18} className='text-brand-500 flex-shrink-0' />
                <span className='font-semibold text-gray-800 dark:text-gray-100'>{o.order_number}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[o.status]}`}>
                {statusLabel[o.status]}
              </span>
            </div>
            <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
              {o.supplier?.name ?? '—'}
            </p>
            <div className='mt-2 flex items-center justify-between text-sm'>
              <span className='text-gray-500'>{formatDate(o.ordered_at)}</span>
              <span className='font-semibold text-gray-800 dark:text-gray-100'>
                ฿{Number(o.total_amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop table */}
      <div className='hidden lg:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden'>
        <table className='w-full text-sm'>
          <thead className='bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'>
            <tr>
              <th className='px-4 py-3 text-left font-medium'>เลขที่ใบสั่งซื้อ</th>
              <th className='px-4 py-3 text-left font-medium'>ซัพพลายเออร์</th>
              <th className='px-4 py-3 text-left font-medium'>วันที่สั่ง</th>
              <th className='px-4 py-3 text-left font-medium'>วันที่รับสินค้า</th>
              <th className='px-4 py-3 text-right font-medium'>ยอดรวม</th>
              <th className='px-4 py-3 text-center font-medium'>สถานะ</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className='text-center py-12 text-gray-400'>
                  ยังไม่มีใบสั่งซื้อ
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className='hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'>
                <td className='px-4 py-3'>
                  <Link
                    href={`/purchase-orders/${o.id}`}
                    className='font-medium text-brand-600 hover:text-brand-700 hover:underline'
                  >
                    {o.order_number}
                  </Link>
                </td>
                <td className='px-4 py-3 text-gray-600 dark:text-gray-300'>{o.supplier?.name ?? '—'}</td>
                <td className='px-4 py-3 text-gray-600 dark:text-gray-300'>{formatDate(o.ordered_at)}</td>
                <td className='px-4 py-3 text-gray-600 dark:text-gray-300'>
                  {o.received_at ? formatDate(o.received_at) : '—'}
                </td>
                <td className='px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100'>
                  ฿{Number(o.total_amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className='px-4 py-3 text-center'>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[o.status]}`}>
                    {statusLabel[o.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
