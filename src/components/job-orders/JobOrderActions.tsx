'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { toast } from 'sonner'
import type { JobOrder } from '@/types/database'

const statusTransitions: Record<string, { next: string; label: string; icon: string }[]> = {
  pending: [
    { next: 'in_progress', label: 'เริ่มปัก', icon: '🔨' },
    { next: 'cancelled', label: 'ยกเลิก', icon: '❌' },
  ],
  in_progress: [
    { next: 'completed', label: 'ปักเสร็จแล้ว', icon: '✅' },
    { next: 'cancelled', label: 'ยกเลิก', icon: '❌' },
  ],
  completed: [
    { next: 'delivered', label: 'ส่งมอบแล้ว', icon: '📦' },
  ],
}

export default function JobOrderActions({ jobOrder }: { jobOrder: JobOrder }) {
  const router = useRouter()
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ next: string; label: string } | null>(null)

  const transitions = statusTransitions[jobOrder.status] || []

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }

      if (newStatus === 'completed') {
        updates.actual_completion_date = new Date().toISOString().split('T')[0]
      }
      if (newStatus === 'delivered') {
        updates.delivered_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('job_orders')
        .update(updates)
        .eq('id', jobOrder.id)

      if (error) throw error

      // Audit log
      const auditClient = createClient()
      await auditClient.from('audit_logs').insert({
        user_id: profile!.id,
        action: 'update_job_status',
        entity_type: 'job_order',
        entity_id: jobOrder.id,
        old_value: { status: jobOrder.status },
        new_value: { status: newStatus },
      })

      toast.success('อัปเดตสถานะสำเร็จ')
      router.refresh()
    } catch (error: any) {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`)
    } finally {
      setLoading(false)
      setConfirmAction(null)
    }
  }

  if (transitions.length === 0) return null

  return (
    <>
      <div className="flex gap-3">
        {transitions.map(t => (
          <button
            key={t.next}
            onClick={() => setConfirmAction(t)}
            disabled={loading}
            className={`pos-btn text-base px-5 py-3 rounded-xl ${
              t.next === 'cancelled'
                ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                : 'bg-brand-500 text-white hover:bg-brand-600'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => { if (confirmAction) handleStatusUpdate(confirmAction.next) }}
        title={`เปลี่ยนสถานะเป็น "${confirmAction?.label}"?`}
        message={`ต้องการเปลี่ยนสถานะงาน ${jobOrder.order_number} หรือไม่?`}
        confirmLabel={confirmAction?.label || 'ยืนยัน'}
        variant={confirmAction?.next === 'cancelled' ? 'danger' : 'info'}
      />
    </>
  )
}
