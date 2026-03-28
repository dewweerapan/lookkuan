'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS } from '@/lib/constants';
import SearchInput from '@/components/shared/SearchInput';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { JobOrder } from '@/types/database';

interface Props {
  jobOrders: JobOrder[];
}

const statusOrder = [
  'pending',
  'in_progress',
  'completed',
  'delivered',
] as const;
type JobStatus = (typeof statusOrder)[number];

const STATUS_NEXT: Record<JobStatus, string> = {
  pending: 'รอดำเนินการ',
  in_progress: 'กำลังปัก',
  completed: 'เสร็จแล้ว',
  delivered: 'ส่งมอบแล้ว',
};

export default function JobOrdersClient({
  jobOrders: initialJobOrders,
}: Props) {
  const { profile } = useAuth();
  const router = useRouter();
  const [jobOrders, setJobOrders] = useState<JobOrder[]>(initialJobOrders);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [mobileActiveStatus, setMobileActiveStatus] =
    useState<JobStatus>('pending');
  const [swipingId, setSwipingId] = useState<string | null>(null);

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const dragSourceStatus = useRef<string | null>(null);

  const filtered = jobOrders.filter((j) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      j.order_number.toLowerCase().includes(q) ||
      j.customer_name.toLowerCase().includes(q) ||
      j.customer_phone.includes(q) ||
      j.description.toLowerCase().includes(q)
    );
  });

  const groupedByStatus = statusOrder.reduce(
    (acc, status) => {
      acc[status] = filtered.filter((j) => j.status === status);
      return acc;
    },
    {} as Record<string, JobOrder[]>,
  );

  // ---- Drag handlers ----
  const handleDragStart = (
    e: React.DragEvent,
    jobId: string,
    fromStatus: string,
  ) => {
    setDraggedId(jobId);
    dragSourceStatus.current = fromStatus;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', jobId);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverStatus(null);
    dragSourceStatus.current = null;
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStatus(status);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('text/plain');
    if (!jobId || dragSourceStatus.current === newStatus) {
      setDraggedId(null);
      setDragOverStatus(null);
      return;
    }

    // Remember original order for rollback
    const originalOrder = jobOrders.find((j) => j.id === jobId);
    if (!originalOrder) {
      setDraggedId(null);
      setDragOverStatus(null);
      return;
    }
    const previousStatus = dragSourceStatus.current;

    // Optimistic update — apply immediately
    setJobOrders((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: newStatus as JobOrder['status'] } : j,
      ),
    );
    setDraggedId(null);
    setDragOverStatus(null);

    // Persist to DB
    try {
      const supabase = createClient();
      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from('job_orders')
        .update(updateData)
        .eq('id', jobId);

      if (error) throw error;

      // Log status change to audit trail (J-14)
      if (profile) {
        await supabase.from('audit_logs').insert({
          entity_type: 'job_order',
          entity_id: jobId,
          action: 'job_status_changed',
          old_value: { status: previousStatus },
          new_value: { status: newStatus },
          user_id: profile.id,
        });
      }

      toast.success(
        `เปลี่ยนสถานะ "${originalOrder.order_number}" เป็น ${STATUS_NEXT[newStatus as JobStatus]}`,
      );
    } catch {
      // Rollback to the exact previous state of this order
      setJobOrders((prev) =>
        prev.map((j) =>
          j.id === jobId ? { ...j, status: originalOrder.status } : j,
        ),
      );
      toast.error('เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  // Advance a job order to the next status (used by mobile swipe)
  const handleAdvanceStatus = useCallback(async (job: JobOrder) => {
    const currentIdx = statusOrder.indexOf(job.status as JobStatus);
    if (currentIdx === -1 || currentIdx >= statusOrder.length - 1) return;
    const newStatus = statusOrder[currentIdx + 1];

    setJobOrders((prev) =>
      prev.map((j) => j.id === job.id ? { ...j, status: newStatus } : j),
    );

    try {
      const supabase = createClient();
      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'delivered') updateData.delivered_at = new Date().toISOString();
      if (newStatus === 'completed') updateData.actual_completion_date = new Date().toISOString();
      const { error } = await supabase.from('job_orders').update(updateData).eq('id', job.id);
      if (error) throw error;
      if (profile) {
        await supabase.from('audit_logs').insert({
          entity_type: 'job_order', entity_id: job.id,
          action: 'job_status_changed',
          old_value: { status: job.status }, new_value: { status: newStatus },
          user_id: profile.id,
        });
      }
      toast.success(`"${job.order_number}" → ${JOB_STATUS_LABELS[newStatus]}`);
    } catch {
      setJobOrders((prev) => prev.map((j) => j.id === job.id ? { ...j, status: job.status } : j));
      toast.error('เปลี่ยนสถานะไม่สำเร็จ');
    }
  }, [profile]);

  return (
    <div>
      <div className='flex flex-col sm:flex-row gap-3 mb-6'>
        <div className='flex-1'>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder='ค้นหาเลขที่งาน, ชื่อลูกค้า, เบอร์โทร...'
          />
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => setViewMode('board')}
            className={`pos-btn px-4 py-2 rounded-xl text-base ${
              viewMode === 'board'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            📋 บอร์ด
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`pos-btn px-4 py-2 rounded-xl text-base ${
              viewMode === 'list'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            📝 รายการ
          </button>
        </div>
      </div>

      {viewMode === 'board' ? (
        <>
          {/* Drag hint — desktop only */}
          <p className='hidden md:block text-sm text-gray-400 mb-3 text-center'>
            💡 ลากการ์ดข้ามคอลัมน์เพื่อเปลี่ยนสถานะ
          </p>

          {/* Mobile: status tabs */}
          <div className='flex md:hidden overflow-x-auto gap-2 pb-2 mb-4 no-scrollbar'>
            {statusOrder.map((s) => (
              <button
                key={s}
                onClick={() => setMobileActiveStatus(s)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 border-2 transition-all ${
                  mobileActiveStatus === s
                    ? 'bg-brand-500 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {JOB_STATUS_LABELS[s]}
                <span className='ml-1.5 bg-black/10 rounded-full px-1.5 py-0.5 text-xs'>
                  {groupedByStatus[s]?.length || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Mobile: single-column list for active status */}
          <p className='md:hidden text-xs text-gray-400 text-center mb-3'>
            💡 ปัดขวาเพื่อเลื่อนสถานะถัดไป • แตะเพื่อดูรายละเอียด
          </p>
          <div className='md:hidden space-y-3'>
            {(groupedByStatus[mobileActiveStatus] || []).map((job) => {
              const canAdvance =
                statusOrder.indexOf(job.status as JobStatus) < statusOrder.length - 1 &&
                job.status !== 'cancelled';
              const nextStatus = canAdvance
                ? statusOrder[statusOrder.indexOf(job.status as JobStatus) + 1]
                : null;
              let touchStartX = 0;
              let touchStartY = 0;
              return (
                <div
                  key={job.id}
                  className='relative overflow-hidden rounded-xl'
                >
                  {/* Swipe hint layer */}
                  {canAdvance && swipingId === job.id && (
                    <div className='absolute inset-y-0 left-0 right-0 bg-green-500 flex items-center px-5 rounded-xl'>
                      <span className='text-white font-bold text-sm'>
                        → {JOB_STATUS_LABELS[nextStatus!]}
                      </span>
                    </div>
                  )}
                  <div
                    className='relative bg-white rounded-xl border border-gray-200 p-4 shadow-sm transition-transform'
                    style={{ touchAction: 'pan-y' }}
                    onTouchStart={(e) => {
                      touchStartX = e.touches[0].clientX;
                      touchStartY = e.touches[0].clientY;
                    }}
                    onTouchMove={(e) => {
                      if (!canAdvance) return;
                      const dx = e.touches[0].clientX - touchStartX;
                      const dy = e.touches[0].clientY - touchStartY;
                      if (Math.abs(dx) > Math.abs(dy) && dx > 30) {
                        setSwipingId(job.id);
                        e.currentTarget.style.transform = `translateX(${Math.min(dx * 0.4, 60)}px)`;
                      }
                    }}
                    onTouchEnd={(e) => {
                      const dx = e.changedTouches[0].clientX - touchStartX;
                      const dy = e.changedTouches[0].clientY - touchStartY;
                      e.currentTarget.style.transform = '';
                      setSwipingId(null);
                      if (canAdvance && Math.abs(dx) > Math.abs(dy) && dx > 60) {
                        handleAdvanceStatus(job);
                      } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
                        router.push(`/job-orders/${job.id}`);
                      }
                    }}
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <span className='text-sm font-mono text-gray-500'>
                        {job.order_number}
                      </span>
                      <span className='font-bold text-brand-600'>
                        {formatCurrency(job.quoted_price)}
                      </span>
                    </div>
                    <p className='font-bold text-gray-800 text-lg mb-1'>
                      {job.customer_name}
                    </p>
                    <p className='text-sm text-gray-600 line-clamp-2 mb-3'>
                      {job.description}
                    </p>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-500'>
                        {job.garment_type} × {job.quantity}
                      </span>
                      {job.estimated_completion_date && (
                        <span
                          className={`text-sm ${
                            !['completed', 'delivered', 'cancelled'].includes(job.status) &&
                            new Date(job.estimated_completion_date) <=
                              new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                              ? 'text-orange-600 font-semibold'
                              : 'text-gray-400'
                          }`}
                        >
                          {!['completed', 'delivered', 'cancelled'].includes(job.status) &&
                            new Date(job.estimated_completion_date) <=
                              new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) &&
                            '⏰ '}
                          กำหนด: {formatDate(job.estimated_completion_date)}
                        </span>
                      )}
                    </div>
                    {job.balance_due > 0 && (
                      <div className='mt-2 pt-2 border-t border-gray-100'>
                        <span className='text-orange-600 font-medium text-sm'>
                          ค้างชำระ: {formatCurrency(job.balance_due)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {(groupedByStatus[mobileActiveStatus] || []).length === 0 && (
              <div className='text-center py-12 text-gray-400'>
                <p className='text-4xl mb-2'>📭</p>
                <p>ไม่มีงานในสถานะนี้</p>
              </div>
            )}
          </div>

          {/* Desktop: 4-column board */}
          <div className='hidden md:grid md:grid-cols-2 xl:grid-cols-4 gap-4'>
            {statusOrder.map((status) => (
              <div
                key={status}
                onDragOver={(e) => handleDragOver(e, status)}
                onDrop={(e) => handleDrop(e, status)}
                onDragLeave={() => setDragOverStatus(null)}
                className={`rounded-xl p-4 min-h-[200px] transition-all border-2 ${
                  dragOverStatus === status &&
                  dragSourceStatus.current !== status
                    ? 'border-brand-400 bg-brand-50 scale-[1.01]'
                    : 'border-transparent bg-gray-50'
                }`}
              >
                <div className='flex items-center gap-2 mb-4'>
                  <span className={`status-badge ${JOB_STATUS_COLORS[status]}`}>
                    {JOB_STATUS_LABELS[status]}
                  </span>
                  <span className='text-sm text-gray-500 font-semibold'>
                    ({groupedByStatus[status]?.length || 0})
                  </span>
                </div>
                <div className='space-y-3'>
                  {groupedByStatus[status]?.map((job) => (
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
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-mono text-gray-500'>
                          {job.order_number}
                        </span>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-semibold text-brand-600'>
                            {formatCurrency(job.quoted_price)}
                          </span>
                          <span className='text-gray-300 text-lg leading-none select-none'>
                            ⠿
                          </span>
                        </div>
                      </div>
                      <p className='font-bold text-gray-800 mb-1'>
                        {job.customer_name}
                      </p>
                      <p className='text-sm text-gray-600 line-clamp-2 mb-2'>
                        {job.description}
                      </p>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-gray-500'>
                          {job.garment_type} × {job.quantity}
                        </span>
                        {job.estimated_completion_date && (
                          <span
                            className={
                              !['completed', 'delivered', 'cancelled'].includes(
                                job.status,
                              ) &&
                              new Date(job.estimated_completion_date) <=
                                new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                                ? 'text-orange-600 font-semibold text-xs'
                                : 'text-gray-400 text-xs'
                            }
                          >
                            {!['completed', 'delivered', 'cancelled'].includes(
                              job.status,
                            ) &&
                              new Date(job.estimated_completion_date) <=
                                new Date(
                                  Date.now() + 3 * 24 * 60 * 60 * 1000,
                                ) &&
                              '⏰ '}
                            กำหนด: {formatDate(job.estimated_completion_date)}
                          </span>
                        )}
                      </div>
                      {job.balance_due > 0 && (
                        <div className='mt-2 text-sm'>
                          <span className='text-orange-600 font-medium'>
                            ค้างชำระ: {formatCurrency(job.balance_due)}
                          </span>
                        </div>
                      )}
                      <Link
                        href={`/job-orders/${job.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className='mt-2 block text-xs text-brand-500 hover:text-brand-700 text-right'
                      >
                        ดูรายละเอียด →
                      </Link>
                    </div>
                  ))}
                  {(!groupedByStatus[status] ||
                    groupedByStatus[status].length === 0) && (
                    <div
                      className={`text-center py-8 rounded-xl border-2 border-dashed transition-all ${
                        dragOverStatus === status
                          ? 'border-brand-400 text-brand-400'
                          : 'border-gray-200 text-gray-400'
                      }`}
                    >
                      <p className='text-2xl mb-1'>
                        {dragOverStatus === status ? '📥' : '📭'}
                      </p>
                      <p className='text-sm'>
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
        <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
          <table className='data-table'>
            <thead>
              <tr>
                <th>เลขที่งาน</th>
                <th>ลูกค้า</th>
                <th>รายละเอียด</th>
                <th>สถานะ</th>
                <th className='text-right'>ราคา</th>
                <th>กำหนดเสร็จ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => (
                <tr key={job.id}>
                  <td className='font-mono text-sm'>{job.order_number}</td>
                  <td>
                    <p className='font-semibold'>{job.customer_name}</p>
                    <p className='text-sm text-gray-500'>
                      {job.customer_phone}
                    </p>
                  </td>
                  <td className='max-w-[200px]'>
                    <p className='truncate text-sm'>{job.description}</p>
                    <p className='text-sm text-gray-500'>
                      {job.garment_type} × {job.quantity}
                    </p>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${JOB_STATUS_COLORS[job.status as JobStatus]}`}
                    >
                      {JOB_STATUS_LABELS[job.status as JobStatus]}
                    </span>
                  </td>
                  <td className='text-right font-semibold'>
                    {formatCurrency(job.quoted_price)}
                  </td>
                  <td className='text-sm'>
                    {job.estimated_completion_date ? (
                      <span
                        className={
                          !['completed', 'delivered', 'cancelled'].includes(
                            job.status,
                          ) &&
                          new Date(job.estimated_completion_date) <=
                            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                            ? 'text-orange-600 font-semibold'
                            : 'text-gray-500'
                        }
                      >
                        {!['completed', 'delivered', 'cancelled'].includes(
                          job.status,
                        ) &&
                          new Date(job.estimated_completion_date) <=
                            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) &&
                          '⏰ '}
                        {formatDate(job.estimated_completion_date)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <Link
                      href={`/job-orders/${job.id}`}
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
              <p className='text-4xl mb-2'>🧵</p>
              <p className='text-lg'>ไม่พบงานปัก</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
