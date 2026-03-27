'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS } from '@/lib/constants'
import SearchInput from '@/components/shared/SearchInput'
import { toast } from 'sonner'
import type { JobOrder } from '@/types/database'

interface Props {
  jobOrders: JobOrder[]
}

const statusOrder = ['pending', 'in_progress', 'completed', 'delivered'] as const
type JobStatus = typeof statusOrder[number]

const STATUS_NEXT: Record<JobStatus, string> = {
  pending: 'รอดำเนินการ',
  in_progress: 'กำลังปัก',
  completed: 'เสร็จแล้ว',
  delivered: 'ส่งมอบแล้ว',
}

export default function JobOrdersClient({ jobOrders: initialJobOrders }: Props) {
  const [jobOrders, setJobOrders] = useState<JobOrder[]>(initialJobOrders)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null)
  const dragSourceStatus = useRef<string | null>(null)

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

  // ---- Drag handlers ----
  const handleDragStart = (e: React.DragEvent, jobId: string, fromStatus: string) => {
    setDraggedId(jobId)
    dragSourceStatus.current = fromStatus
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', jobId)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverStatus(null)
    dragSourceStatus.current = null
  }

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStatus(status)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const jobId = e.dataTransfer.getData('text/plain')
    if (!jobId || dragSourceStatus.current === newStatus) {
      setDraggedId(null)
      setDragOverStatus(null)
      return
    }

    // Optimistic update
    setJobOrders(prev =>
      prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j)
    )
    setDraggedId(null)
    setDragOverStatus(null)

    // Persist to DB
    try {
      const supabase = createClient()
      const updateData: Record<string, unknown> = { status: newStatus }
      if (newStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString()
      }
      const { error } = await supabase
        .from('job_orders')
        .update(updateData)
        .eq('id', jobId)

      if (error) throw error

      const job = jobOrders.find(j => j.id === jobId)
      toast.success(`เปลี่ยนสถานะ "${job?.order_number}" เป็น ${STATUS_NEXT[newStatus as JobStatus]}`)
    } catch {
      // Rollback on error
      setJobOrders(initialJobOrders)
      toast.error('เปลี่ยนสถานะไม่สำเร็จ')
    }
  }

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
        <>
          {/* Drag hint */}
          <p className="text-sm text-gray-400 mb-3 text-center">
            💡 ลากการ์ดข้ามคอลัมน์เพื่อเปลี่ยนสถานะ
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {statusOrder.map(status => (
              <div
                key={status}
                onDragOver={(e) => handleDragOver(e, status)}
                onDrop={(e) => handleDrop(e, status)}
                onDragLeave={() => setDragOverStatus(null)}
                className={`rounded-xl p-4 min-h-[200px] transition-all border-2 ${
                  dragOverStatus === status && dragSourceStatus.current !== status
                    ? 'border-brand-400 bg-brand-50 scale-[1.01]'
                    : 'border-transparent bg-gray-50'
                }`}
              >
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
                    <div
                      key={job.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, job.id, status)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white rounded-xl border border-gray-200 p-4
                               cursor-grab active:cursor-grabbing select-none
                               transition-all hover:shadow-md hover:border-brand-300
                               ${draggedId === job.id ? 'opacity-40 scale-95 shadow-lg' : ''}`}
                    >
                      {/* Drag handle indicator */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-mono text-gray-500">{job.order_number}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-brand-600">
                            {formatCurrency(job.quoted_price)}
                          </span>
                          <span className="text-gray-300 text-lg leading-none select-none">⠿</span>
                        </div>
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
                      {job.balance_due > 0 && (
                        <div className="mt-2 text-sm">
                          <span className="text-orange-600 font-medium">
                            ค้างชำระ: {formatCurrency(job.balance_due)}
                          </span>
                        </div>
                      )}
                      <Link
                        href={`/job-orders/${job.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 block text-xs text-brand-500 hover:text-brand-700 text-right"
                      >
                        ดูรายละเอียด →
                      </Link>
                    </div>
                  ))}
                  {(!groupedByStatus[status] || groupedByStatus[status].length === 0) && (
                    <div className={`text-center py-8 rounded-xl border-2 border-dashed transition-all ${
                      dragOverStatus === status ? 'border-brand-400 text-brand-400' : 'border-gray-200 text-gray-400'
                    }`}>
                      <p className="text-2xl mb-1">{dragOverStatus === status ? '📥' : '📭'}</p>
                      <p className="text-sm">
                        {dragOverStatus === status ? 'วางที่นี่' : 'ไม่มีงาน'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
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
                    <span className={`status-badge ${JOB_STATUS_COLORS[job.status as JobStatus]}`}>
                      {JOB_STATUS_LABELS[job.status as JobStatus]}
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
