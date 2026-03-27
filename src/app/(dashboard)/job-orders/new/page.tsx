'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { generateOrderNumber } from '@/lib/utils'
import PageHeader from '@/components/shared/PageHeader'
import { toast } from 'sonner'

export default function NewJobOrderPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [staff, setStaff] = useState<any[]>([])
  const [staffLoaded, setStaffLoaded] = useState(false)

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    description: '',
    garment_type: '',
    quantity: '1',
    quoted_price: '',
    deposit_amount: '',
    estimated_completion_date: '',
    assigned_to: '',
    notes: '',
  })

  // Load staff on mount
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('profiles').select('id, full_name, role')
          .in('role', ['embroidery_staff', 'admin', 'manager'])
          .eq('is_active', true)
        setStaff(data || [])
      } catch (err) {
        console.error('Error loading staff:', err)
      } finally {
        setStaffLoaded(true)
      }
    }
    if (!staffLoaded) loadStaff()
  }, [staffLoaded])

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.customer_name.trim()) {
      toast.error('กรุณาใส่ชื่อลูกค้า')
      return
    }
    if (!form.customer_phone.trim()) {
      toast.error('กรุณาใส่เบอร์โทรลูกค้า')
      return
    }
    if (!form.description.trim()) {
      toast.error('กรุณาใส่รายละเอียดงานปัก')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const quotedPrice = Number(form.quoted_price) || 0
      const depositAmount = Number(form.deposit_amount) || 0
      const balanceDue = quotedPrice - depositAmount

      const { error } = await supabase.from('job_orders').insert({
        order_number: generateOrderNumber('JOB'),
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        description: form.description.trim(),
        garment_type: form.garment_type.trim() || 'เสื้อ',
        quantity: Number(form.quantity) || 1,
        quoted_price: quotedPrice,
        deposit_amount: depositAmount,
        balance_due: balanceDue,
        estimated_completion_date: form.estimated_completion_date || null,
        assigned_to: form.assigned_to || null,
        received_by: profile!.id,
        notes: form.notes.trim() || null,
        status: 'pending',
      })

      if (error) throw error

      toast.success('สร้างใบสั่งงานปักสำเร็จ')
      router.push('/job-orders')
      router.refresh()
    } catch (error: any) {
      console.error('Error creating job order:', error)
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const garmentTypes = ['เสื้อโปโล', 'เสื้อยืด', 'เสื้อช็อป', 'เสื้อเชิ้ต', 'หมวก', 'กางเกง', 'กระเป๋า', 'อื่นๆ']

  return (
    <div>
      <PageHeader title="รับงานปักใหม่" backHref="/job-orders" />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">ข้อมูลลูกค้า</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="pos-label">ชื่อลูกค้า *</label>
              <input
                type="text"
                value={form.customer_name}
                onChange={(e) => updateForm('customer_name', e.target.value)}
                className="pos-input"
                placeholder="ชื่อ-นามสกุล"
                required
              />
            </div>
            <div>
              <label className="pos-label">เบอร์โทร *</label>
              <input
                type="tel"
                value={form.customer_phone}
                onChange={(e) => updateForm('customer_phone', e.target.value)}
                className="pos-input"
                placeholder="08x-xxx-xxxx"
                required
              />
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">รายละเอียดงานปัก</h2>
          <div>
            <label className="pos-label">รายละเอียดงาน *</label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              className="pos-input min-h-[100px]"
              placeholder="เช่น ปักชื่อ 'ABC Company' ด้านหน้าอกซ้าย สีทอง"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="pos-label">ประเภทเสื้อผ้า</label>
              <select
                value={form.garment_type}
                onChange={(e) => updateForm('garment_type', e.target.value)}
                className="pos-input"
              >
                <option value="">เลือก...</option>
                {garmentTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="pos-label">จำนวน (ตัว)</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => updateForm('quantity', e.target.value)}
                className="pos-input"
                min="1"
              />
            </div>
            <div>
              <label className="pos-label">กำหนดเสร็จ</label>
              <input
                type="date"
                value={form.estimated_completion_date}
                onChange={(e) => updateForm('estimated_completion_date', e.target.value)}
                className="pos-input"
              />
            </div>
          </div>
          <div>
            <label className="pos-label">มอบหมายให้ช่าง</label>
            <select
              value={form.assigned_to}
              onChange={(e) => updateForm('assigned_to', e.target.value)}
              className="pos-input"
            >
              <option value="">ยังไม่กำหนด</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">ราคาและการชำระเงิน</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="pos-label">ราคาที่เสนอ (บาท)</label>
              <input
                type="number"
                value={form.quoted_price}
                onChange={(e) => updateForm('quoted_price', e.target.value)}
                className="pos-input"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="pos-label">เงินมัดจำ (บาท)</label>
              <input
                type="number"
                value={form.deposit_amount}
                onChange={(e) => updateForm('deposit_amount', e.target.value)}
                className="pos-input"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          {form.quoted_price && form.deposit_amount && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-base font-semibold text-orange-800">
                ยอดค้างชำระ: {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(
                  Math.max(0, Number(form.quoted_price) - Number(form.deposit_amount))
                )}
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="pos-label">หมายเหตุ</label>
          <textarea
            value={form.notes}
            onChange={(e) => updateForm('notes', e.target.value)}
            className="pos-input min-h-[80px]"
            placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="pos-btn-secondary flex-1 py-4 text-lg"
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="pos-btn-primary flex-1 py-4 text-lg"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                กำลังบันทึก...
              </span>
            ) : (
              '✅ สร้างใบสั่งงาน'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
