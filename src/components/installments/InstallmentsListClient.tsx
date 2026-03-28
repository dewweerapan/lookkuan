'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  active: 'กำลังผ่อน',
  completed: 'ชำระครบ',
  overdue: 'เกินกำหนด',
  cancelled: 'ยกเลิก',
};
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

type Plan = {
  id: string;
  plan_number: string;
  customer_name: string;
  customer_phone: string;
  description: string;
  total_amount: number;
  down_payment: number;
  balance_amount: number;
  num_installments: number;
  start_date: string;
  status: string;
  created_at: string;
};

interface Props {
  plans: Plan[];
}

const FILTER_TABS = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'active', label: 'กำลังผ่อน' },
  { key: 'overdue', label: 'เกินกำหนด' },
  { key: 'completed', label: 'ชำระครบ' },
  { key: 'cancelled', label: 'ยกเลิก' },
];

export default function InstallmentsListClient({ plans }: Props) {
  const [filter, setFilter] = useState<string>('all');

  const countByStatus = {
    all: plans.length,
    active: plans.filter((p) => p.status === 'active').length,
    overdue: plans.filter((p) => p.status === 'overdue').length,
    completed: plans.filter((p) => p.status === 'completed').length,
    cancelled: plans.filter((p) => p.status === 'cancelled').length,
  };

  const filtered =
    filter === 'all' ? plans : plans.filter((p) => p.status === filter);

  return (
    <div>
      {/* Filter Tabs */}
      <div className='flex gap-2 overflow-x-auto pb-1 mb-4'>
        {FILTER_TABS.map((tab) => {
          const count = countByStatus[tab.key as keyof typeof countByStatus];
          if (tab.key !== 'all' && count === 0) return null;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  filter === tab.key
                    ? 'bg-white/20 text-white'
                    : tab.key === 'overdue' && count > 0
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Cards */}
      <div className='block sm:hidden space-y-3'>
        {filtered.map((p) => (
          <Link
            key={p.id}
            href={`/installments/${p.id}`}
            className='block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm'
          >
            <div className='flex items-start justify-between mb-2'>
              <div>
                <span className='text-xs font-mono text-gray-400'>
                  {p.plan_number}
                </span>
                <p className='font-bold text-gray-800'>{p.customer_name}</p>
                <p className='text-sm text-gray-500'>{p.customer_phone}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS_COLORS[p.status]}`}
              >
                {STATUS_LABELS[p.status]}
              </span>
            </div>
            <p className='text-sm text-gray-600 mb-2'>{p.description}</p>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-500'>
                ยอดรวม: {formatCurrency(p.total_amount)}
              </span>
              <span className='font-semibold text-orange-600'>
                คงเหลือ: {formatCurrency(p.balance_amount)}
              </span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className='text-center py-12 text-gray-400'>
            <p className='text-4xl mb-2'>💳</p>
            <p>ไม่มีแผนผ่อนชำระในหมวดนี้</p>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className='hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <table className='data-table'>
          <thead>
            <tr>
              <th>เลขที่</th>
              <th>ลูกค้า</th>
              <th>รายการ</th>
              <th>สถานะ</th>
              <th className='text-right'>ยอดรวม</th>
              <th className='text-right'>คงเหลือ</th>
              <th>เริ่มต้น</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className='font-mono text-sm'>{p.plan_number}</td>
                <td>
                  <p className='font-semibold'>{p.customer_name}</p>
                  <p className='text-sm text-gray-500'>{p.customer_phone}</p>
                </td>
                <td className='max-w-[160px]'>
                  <p className='truncate text-sm'>{p.description}</p>
                  <p className='text-xs text-gray-400'>
                    {p.num_installments} งวด
                  </p>
                </td>
                <td>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS_COLORS[p.status]}`}
                  >
                    {STATUS_LABELS[p.status]}
                  </span>
                </td>
                <td className='text-right'>{formatCurrency(p.total_amount)}</td>
                <td
                  className={`text-right font-bold ${Number(p.balance_amount) > 0 ? 'text-orange-600' : 'text-green-600'}`}
                >
                  {formatCurrency(p.balance_amount)}
                </td>
                <td className='text-sm text-gray-500'>
                  {formatDate(p.start_date)}
                </td>
                <td>
                  <Link
                    href={`/installments/${p.id}`}
                    className='text-brand-600 hover:text-brand-700 font-medium text-sm'
                  >
                    ดูรายละเอียด
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className='text-center py-12 text-gray-400'>
            <p className='text-4xl mb-2'>💳</p>
            <p className='text-lg'>ไม่มีแผนผ่อนชำระในหมวดนี้</p>
          </div>
        )}
      </div>
    </div>
  );
}
