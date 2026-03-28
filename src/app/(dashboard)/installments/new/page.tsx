'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import PageHeader from '@/components/shared/PageHeader'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

function generatePlanNumber() {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `INS${yy}${mm}${dd}-${rand}`
}

export default function NewInstallmentPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    description: '',
    total_amount: '',
    down_payment: '',
    num_installments: '3',
    interval_days: '30',
    start_date: new Date().toISOString().split('T')[0],
  })

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const totalAmount = Number(form.total_amount) || 0
  const downPayment = Number(form.down_payment) || 0
  const balance = totalAmount - downPayment
  const numInstallments = Number(form.num_installments) || 1
  const perInstallment = numInstallments > 0 ? balance / numInstallments : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customer_name.trim()) { toast.error('กรุณาใส่ชื่อลูกค้า'); return }
    if (!form.description.trim()) { toast.error('กรุณาใส่รายการ'); return }
    if (totalAmount <= 0) { toast.error('กรุณาใส่ยอดรวม'); return }
    if (downPayment > totalAmount) { toast.error('เงินดาวน์เกินยอดรวม'); return }

    setLoading(true)
    try {
      const supabase = createClient()
      const planNumber = generatePlanNumber()

      // Insert plan
      const { data: plan, error: planErr } = await supabase
        .from('installment_plans')
        .insert({
          plan_number: planNumber,
          customer_name: form.customer_name.trim(),
          customer_phone: form.customer_phone.trim(),
          description: form.description.trim(),
          total_amount: totalAmount,
          down_payment: downPayment,
          num_installments: numInstallments,
          interval_days: Number(form.interval_days) || 30,
          start_date: form.start_date,
          status: 'active',
          created_by: profile!.id,
        })
        .select('id')
        .single()

      if (planErr) throw planErr

      // Generate payment schedule
      const intervalDays = Number(form.interval_days) || 30
      const payments = Array.from({ length: numInstallments }, (_, i) => {
        const due = new Date(form.start_date)
        due.setDate(due.getDate() + (i + 1) * intervalDays)
        return {
          plan_id: plan!.id,
          installment_number: i + 1,
          due_date: due.toISOString().split('T')[0],
          amount: Math.round(perInstallment * 100) / 100,
          status: 'pending',
        }
      })

      const { error: payErr } = await supabase.from('installment_payments').insert(payments)
      if (payErr) throw payErr

      toast.success(`สร้างแผนผ่อน ${planNumber} สำเร็จ`)
      router.push(`/installments/${plan!.id}`)
    } catch (err: any) {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="สร้างแผนผ่อนชำระ" backHref="/installments" />
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Customer */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">ข้อมูลลูกค้า</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="pos-label">ชื่อลูกค้า *</label>
              <input type="text" value={form.customer_name} onChange={e => update('customer_name', e.target.value)} className="pos-input" placeholder="ชื่อ-นามสกุล" required />
            </div>
            <div>
              <label className="pos-label">เบอร์โทร</label>
              <input type="tel" value={form.customer_phone} onChange={e => update('customer_phone', e.target.value)} className="pos-input" placeholder="08x-xxx-xxxx" />
            </div>
          </div>
        </div>

        {/* Item */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">รายการ</h2>
          <div>
            <label className="pos-label">รายละเอียดสินค้า *</label>
            <input type="text" value={form.description} onChange={e => update('description', e.target.value)} className="pos-input" placeholder="เช่น เสื้อโปโล 5 ตัว / คอมพิวเตอร์" required />
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">รายละเอียดการผ่อน</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="pos-label">ราคารวม (บาท) *</label>
              <input type="number" value={form.total_amount} onChange={e => update('total_amount', e.target.value)} className="pos-input" min="0" placeholder="0" />
            </div>
            <div>
              <label className="pos-label">เงินดาวน์ (บาท)</label>
              <input type="number" value={form.down_payment} onChange={e => update('down_payment', e.target.value)} className="pos-input" min="0" placeholder="0" />
            </div>
            <div>
              <label className="pos-label">จำนวนงวด</label>
              <select value={form.num_installments} onChange={e => update('num_installments', e.target.value)} className="pos-input">
                {[1,2,3,4,5,6,8,10,12].map(n => <option key={n} value={n}>{n} งวด</option>)}
              </select>
            </div>
            <div>
              <label className="pos-label">ระยะห่างแต่ละงวด (วัน)</label>
              <select value={form.interval_days} onChange={e => update('interval_days', e.target.value)} className="pos-input">
                <option value="7">7 วัน (รายสัปดาห์)</option>
                <option value="14">14 วัน</option>
                <option value="30">30 วัน (รายเดือน)</option>
                <option value="90">90 วัน (รายไตรมาส)</option>
              </select>
            </div>
            <div>
              <label className="pos-label">วันที่เริ่มผ่อน</label>
              <input type="date" value={form.start_date} onChange={e => update('start_date', e.target.value)} className="pos-input" />
            </div>
          </div>

          {totalAmount > 0 && (
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ยอดรวม</span>
                <span className="font-semibold">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">เงินดาวน์</span>
                <span className="font-semibold text-green-600">-{formatCurrency(downPayment)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-brand-200 pt-2 mt-1">
                <span>ยอดที่ต้องผ่อน</span>
                <span className="text-brand-700">{formatCurrency(balance)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>ต่องวด ({numInstallments} งวด)</span>
                <span className="font-semibold text-brand-600">{formatCurrency(perInstallment)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={() => router.back()} className="pos-btn-secondary flex-1 py-4 text-lg" disabled={loading}>ยกเลิก</button>
          <button type="submit" className="pos-btn-primary flex-1 py-4 text-lg" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                กำลังบันทึก...
              </span>
            ) : '✅ สร้างแผนผ่อน'}
          </button>
        </div>
      </form>
    </div>
  )
}
