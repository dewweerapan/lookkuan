'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS } from '@/lib/constants'
import SearchInput from '@/components/shared/SearchInput'
import type { JobOrder } from '@/types/database'

interface Props {
  jobOrders: JobOrder[]
}

const statusOrder = ['pending', 'in_progress', 'completed', 'delivered'] as const

export default function JobOrdersClient({ jobOrders }: Props) {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')

  const filtered = jobOrders.filter(j => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      j.order_number.toLowerCase().includes(q) ||
      j.customer_name.toLowerCase().includes(q) ||
      j.customer_phone.includes(q) ||
      j.description.toLowerCase().includes(q)
    )
  })

  const groupedByStatus = statusOrder.reduce((acc, status) => {
    acc[status] = filtered.filter(j => j.status === status)
    return acc
  }, {} as Record<string, JobOrder[]>)

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="ค้นหาเลขที่งาน, ชื่อลูกค้า, เบอร์โทร..."
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('board')}
            className={`pos-btn px-4 py-2 rounded-xl text-base ${
              viewMode === 'board' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            📋 บอร์ด
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`pos-btn px-4 py-2 rounded-xl text-base ${
              viewMode === 'list' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            📝 รายการ
          </button>
        </div>
      </div>

      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {statusOrder.map(status => (
            <div key={status} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className={`status-badge ${JOB_STATUS_COLORS[status]}`}>
                  {JOB_STATUS_LABELS[status]}
                </span>
                <span className="text-sm text-gray-500 font-semibold">
                  ({groupedByStatus[status]?.length || 0})
                </span>
              </div>
              <div className="space-y-3">
                {groupedByStatus[status]?.map(job => (
                  <Link
                    key={job.id}
                    href={`/job-orders/${job.id}`}
                    className="block bg-white rounded-xl border border-gray-200 p-4
                             hover:shadow-md hover:border-brand-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-mono text-gray-500">{job.order_number}</span>
                      <span className="text-sm font-semibold text-brand-600">
                        {formatCurrency(job.quoted_price)}
                      </span>
                    </div>
                    <p className="font-bold text-gray-800 mb-1">{job.customer_name}</p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{job.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{job.garment_type} × {job.quantity}</span>
                      {job.estimated_completion_date && (
                        <span className="text-gray-400">
                          กำหนด: {formatDate(job.estimated_completion_date)}
                        </span>
                      )}
                    </div>
                    {job.deposit_amount > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="text-green-600 font-medium">
                          มัดจำ: {formatCurrency(job.deposit_amount)}
                        </span>
                        <span className="text-gray-400 mx-1">|</span>
                        <span className="text-orange-600 font-medium">
                          ค้าง: {formatCurrency(job.balance_due)}
                        </span>
                      </div>
                    )}
                  </Link>
                ))}
                {(!groupedByStatus[status] || groupedByStatus[status].length === 0) && (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    ไม่มีงาน
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>เลขที่งาน</th>
                <th>ลูกค้า</th>
                <th>รายละเอียด</th>
                <th>สถานะ</th>
                <th className="text-right">ราคา</th>
                <th>กำหนดเสร็จ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(job => (
                <tr key={job.id}>
                  <td className="font-mono text-sm">{job.order_number}</td>
                  <td>
                    <p className="font-semibold">{job.customer_name}</p>
                    <p className="text-sm text-gray-500">{job.customer_phone}</p>
                  </td>
                  <td className="max-w-[200px]">
                    <p className="truncate text-sm">{job.description}</p>
                    <p className="text-sm text-gray-500">{job.garment_type} × {job.quantity}</p>
                  </td>
                  <td>
                    <span className={`status-badge ${JOB_STATUS_COLORS[job.status]}`}>
                      {JOB_STATUS_LABELS[job.status]}
                    </span>
                  </td>
                  <td className="text-right font-semibold">{formatCurrency(job.quoted_price)}</td>
                  <td className="text-sm text-gray-500">
                    {job.estimated_completion_date ? formatDate(job.estimated_completion_date) : '-'}
                  </td>
                  <td>
                    <Link
                      href={`/job-orders/${job.id}`}
                      className="text-brand-600 hover:text-brand-700 font-medium text-sm"
                    >
                      ดูรายละเอียด
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🧵</p>
              <p className="text-lg">ไม่พบงานปัก</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
