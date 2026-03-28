'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, TrendingUp, TrendingDown, Minus, ClipboardList, PackageSearch } from 'lucide-react'
import type { VariantSuggestion } from '@/app/(dashboard)/inventory/reorder/page'

interface Props {
  suggestions: VariantSuggestion[]
}

type Filter = 'all' | 'urgent' | 'warning'

const priorityConfig = {
  urgent: {
    label: 'ด่วน',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    dot: 'bg-red-500',
  },
  warning: {
    label: 'แนะนำ',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    dot: 'bg-amber-400',
  },
  ok: {
    label: 'ปกติ',
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-gray-200 dark:border-gray-800',
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-400',
  },
}

function TrendIcon({ v30, v14 }: { v30: number; v14: number }) {
  if (v30 === 0) return <Minus size={14} className='text-gray-400' />
  const ratio = v14 / (v30 === 0 ? 1 : v30)
  if (ratio > 1.1) return <TrendingUp size={14} className='text-green-500' />
  if (ratio < 0.9) return <TrendingDown size={14} className='text-red-500' />
  return <Minus size={14} className='text-gray-400' />
}

function DaysBar({ days }: { days: number | null }) {
  if (days === null) return <span className='text-gray-400 text-sm'>—</span>
  const capped = Math.min(days, 30)
  const pct = (capped / 30) * 100
  const color = days <= 7 ? 'bg-red-500' : days <= 14 ? 'bg-amber-400' : 'bg-green-500'
  return (
    <div className='flex items-center gap-2'>
      <div className='flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden'>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className='text-xs font-medium text-gray-700 dark:text-gray-300 w-12 text-right'>
        {Math.round(days)} วัน
      </span>
    </div>
  )
}

export default function ReorderSuggestionsClient({ suggestions }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const urgentCount = suggestions.filter((s) => s.priority === 'urgent').length
  const warningCount = suggestions.filter((s) => s.priority === 'warning').length

  const filtered = filter === 'all' ? suggestions : suggestions.filter((s) => s.priority === filter)

  if (suggestions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center'>
        <PackageSearch size={48} className='text-green-400 mb-4' />
        <p className='text-xl font-semibold text-gray-700 dark:text-gray-300'>สต็อกทุกรายการอยู่ในระดับดี</p>
        <p className='text-gray-500 text-sm mt-1'>ไม่มีสินค้าที่ต้องสั่งซื้อในขณะนี้</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Summary cards */}
      <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
        <div className='bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4'>
          <div className='flex items-center gap-2 mb-1'>
            <AlertTriangle size={16} className='text-red-500' />
            <span className='text-sm font-medium text-red-700 dark:text-red-300'>ด่วน</span>
          </div>
          <p className='text-2xl font-bold text-red-600 dark:text-red-400'>{urgentCount}</p>
          <p className='text-xs text-red-500 dark:text-red-400 mt-0.5'>รายการต้องสั่งทันที</p>
        </div>
        <div className='bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4'>
          <div className='flex items-center gap-2 mb-1'>
            <AlertTriangle size={16} className='text-amber-500' />
            <span className='text-sm font-medium text-amber-700 dark:text-amber-300'>แนะนำ</span>
          </div>
          <p className='text-2xl font-bold text-amber-600 dark:text-amber-400'>{warningCount}</p>
          <p className='text-xs text-amber-500 dark:text-amber-400 mt-0.5'>รายการควรสั่งเร็วๆ นี้</p>
        </div>
        <div className='sm:block hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4'>
          <p className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-1'>รวมที่ต้องดูแล</p>
          <p className='text-2xl font-bold text-gray-800 dark:text-gray-100'>{suggestions.length}</p>
          <p className='text-xs text-gray-400 mt-0.5'>รายการสินค้า</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className='flex gap-2 flex-wrap'>
        {(['all', 'urgent', 'warning'] as Filter[]).map((f) => {
          const labels = { all: `ทั้งหมด (${suggestions.length})`, urgent: `ด่วน (${urgentCount})`, warning: `แนะนำ (${warningCount})` }
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {labels[f]}
            </button>
          )
        })}

        <Link
          href='/purchase-orders/new'
          className='ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white transition-colors'
        >
          <ClipboardList size={15} />
          สร้างใบสั่งซื้อ
        </Link>
      </div>

      {/* Mobile cards */}
      <div className='lg:hidden space-y-3'>
        {filtered.map((s) => {
          const cfg = priorityConfig[s.priority]
          return (
            <div key={s.variantId} className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
              <div className='flex items-start justify-between gap-2 mb-2'>
                <div className='min-w-0'>
                  <p className='font-semibold text-gray-800 dark:text-gray-100 truncate'>{s.productName}</p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>{s.color} / {s.size} · {s.sku}</p>
                </div>
                <span className={`flex-shrink-0 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${cfg.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>

              {/* Days bar */}
              <div className='mb-3'>
                <p className='text-xs text-gray-500 dark:text-gray-400 mb-1'>สต็อกคงเหลือ</p>
                <DaysBar days={s.daysRemaining} />
              </div>

              <div className='grid grid-cols-3 gap-2 text-center mb-3'>
                <div>
                  <p className='text-xs text-gray-400'>คงเหลือ</p>
                  <p className='font-bold text-gray-800 dark:text-gray-100'>{s.stockQuantity}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-400 flex items-center justify-center gap-1'>
                    velocity <TrendIcon v30={s.velocity30d} v14={s.velocity14d} />
                  </p>
                  <p className='font-bold text-gray-800 dark:text-gray-100'>{s.velocity30d.toFixed(1)}<span className='text-xs font-normal text-gray-400'>/วัน</span></p>
                </div>
                <div>
                  <p className='text-xs text-gray-400'>แนะนำสั่ง</p>
                  <p className='font-bold text-brand-600 dark:text-brand-400'>{s.suggestedQty > 0 ? s.suggestedQty : '—'}</p>
                </div>
              </div>

              <p className='text-xs text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-800/40 rounded-lg px-3 py-2'>
                {s.reason}
              </p>
            </div>
          )
        })}
      </div>

      {/* Desktop table */}
      <div className='hidden lg:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden'>
        <table className='w-full text-sm'>
          <thead className='bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'>
            <tr>
              <th className='px-4 py-3 text-left font-medium'>สินค้า</th>
              <th className='px-4 py-3 text-center font-medium'>สถานะ</th>
              <th className='px-4 py-3 text-center font-medium'>คงเหลือ</th>
              <th className='px-4 py-3 text-left font-medium w-40'>อีกกี่วันหมด</th>
              <th className='px-4 py-3 text-center font-medium'>velocity</th>
              <th className='px-4 py-3 text-center font-medium'>แนะนำสั่ง</th>
              <th className='px-4 py-3 text-left font-medium'>เหตุผล</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
            {filtered.map((s) => {
              const cfg = priorityConfig[s.priority]
              return (
                <tr key={s.variantId} className={`${s.priority === 'urgent' ? 'bg-red-50/50 dark:bg-red-950/10' : ''}`}>
                  <td className='px-4 py-3'>
                    <p className='font-medium text-gray-800 dark:text-gray-100'>{s.productName}</p>
                    <p className='text-xs text-gray-400'>{s.color} / {s.size} · {s.sku}</p>
                  </td>
                  <td className='px-4 py-3 text-center'>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-center font-semibold text-gray-800 dark:text-gray-100'>
                    {s.stockQuantity}
                    <span className='text-xs font-normal text-gray-400 ml-0.5'>/{s.lowStockThreshold}</span>
                  </td>
                  <td className='px-4 py-3 w-40'>
                    <DaysBar days={s.daysRemaining} />
                  </td>
                  <td className='px-4 py-3 text-center'>
                    <span className='flex items-center justify-center gap-1'>
                      <TrendIcon v30={s.velocity30d} v14={s.velocity14d} />
                      <span className='font-medium text-gray-700 dark:text-gray-300'>
                        {s.velocity30d.toFixed(1)}
                      </span>
                      <span className='text-gray-400 text-xs'>/วัน</span>
                    </span>
                  </td>
                  <td className='px-4 py-3 text-center'>
                    <span className={`font-bold text-lg ${s.suggestedQty > 0 ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`}>
                      {s.suggestedQty > 0 ? s.suggestedQty : '—'}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-xs'>
                    {s.reason}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
