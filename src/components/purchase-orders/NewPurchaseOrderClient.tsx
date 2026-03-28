'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

interface SupplierOption {
  id: string
  name: string
}

interface VariantOption {
  id: string
  sku: string
  color: string
  size: string
  product: { name: string }[] | null
}

interface LineItem {
  variant_id: string
  quantity_ordered: number
  unit_cost: number
}

interface Props {
  suppliers: SupplierOption[]
  variants: VariantOption[]
  userId: string
}

function generateOrderNumber() {
  const now = new Date()
  const y = now.getFullYear().toString().slice(2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `PO${y}${m}${d}-${rand}`
}

export default function NewPurchaseOrderClient({ suppliers, variants, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [supplierId, setSupplierId] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([
    { variant_id: '', quantity_ordered: 1, unit_cost: 0 },
  ])
  const [saving, setSaving] = useState(false)

  const getVariantLabel = (v: VariantOption) => {
    const productName = v.product?.[0]?.name ?? ''
    return `${v.sku} — ${productName} (${v.color} / ${v.size})`
  }

  const addItem = () => {
    setItems((prev) => [...prev, { variant_id: '', quantity_ordered: 1, unit_cost: 0 }])
  }

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateItem = <K extends keyof LineItem>(idx: number, key: K, value: LineItem[K]) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)))
  }

  const totalAmount = items.reduce(
    (sum, it) => sum + it.quantity_ordered * it.unit_cost,
    0
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplierId) {
      toast.error('กรุณาเลือกซัพพลายเออร์')
      return
    }
    if (items.some((it) => !it.variant_id)) {
      toast.error('กรุณาเลือกสินค้าทุกรายการ')
      return
    }
    if (items.some((it) => it.quantity_ordered <= 0)) {
      toast.error('จำนวนสินค้าต้องมากกว่า 0')
      return
    }

    setSaving(true)

    const orderNumber = generateOrderNumber()

    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        supplier_id: supplierId,
        order_number: orderNumber,
        status: 'pending',
        total_amount: totalAmount,
        expected_date: expectedDate || null,
        created_by: userId,
        notes: notes.trim() || null,
      })
      .select()
      .single()

    if (poError) {
      toast.error('สร้างใบสั่งซื้อไม่สำเร็จ: ' + poError.message)
      setSaving(false)
      return
    }

    const lineItems = items.map((it) => ({
      purchase_order_id: po.id,
      variant_id: it.variant_id,
      quantity_ordered: it.quantity_ordered,
      quantity_received: 0,
      unit_cost: it.unit_cost,
    }))

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(lineItems)

    if (itemsError) {
      toast.error('บันทึกรายการสินค้าไม่สำเร็จ: ' + itemsError.message)
      setSaving(false)
      return
    }

    toast.success(`สร้างใบสั่งซื้อ ${orderNumber} สำเร็จ`)
    router.push(`/purchase-orders/${po.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className='max-w-3xl space-y-6'>
      {/* Header fields */}
      <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4'>
        <h2 className='font-semibold text-gray-800 dark:text-gray-100'>ข้อมูลใบสั่งซื้อ</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              ซัพพลายเออร์ <span className='text-red-500'>*</span>
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className='w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500'
              required
            >
              <option value=''>— เลือกซัพพลายเออร์ —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              วันที่คาดว่าจะรับสินค้า
            </label>
            <input
              type='date'
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className='w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500'
            />
          </div>
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>หมายเหตุ</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className='w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none'
            placeholder='หมายเหตุ (ถ้ามี)'
          />
        </div>
      </div>

      {/* Line items */}
      <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='font-semibold text-gray-800 dark:text-gray-100'>รายการสินค้า</h2>
          <button
            type='button'
            onClick={addItem}
            className='flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium'
          >
            <Plus size={16} />
            เพิ่มรายการ
          </button>
        </div>

        <div className='space-y-3'>
          {items.map((item, idx) => (
            <div key={idx} className='grid grid-cols-12 gap-2 items-end'>
              <div className='col-span-6'>
                {idx === 0 && (
                  <label className='block text-xs font-medium text-gray-500 mb-1'>สินค้า</label>
                )}
                <select
                  value={item.variant_id}
                  onChange={(e) => updateItem(idx, 'variant_id', e.target.value)}
                  className='w-full border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500'
                  required
                >
                  <option value=''>— เลือกสินค้า —</option>
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>{getVariantLabel(v)}</option>
                  ))}
                </select>
              </div>
              <div className='col-span-2'>
                {idx === 0 && (
                  <label className='block text-xs font-medium text-gray-500 mb-1'>จำนวน</label>
                )}
                <input
                  type='number'
                  min={1}
                  value={item.quantity_ordered}
                  onChange={(e) => updateItem(idx, 'quantity_ordered', Number(e.target.value))}
                  className='w-full border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 text-center'
                />
              </div>
              <div className='col-span-3'>
                {idx === 0 && (
                  <label className='block text-xs font-medium text-gray-500 mb-1'>ราคาต่อหน่วย (฿)</label>
                )}
                <input
                  type='number'
                  min={0}
                  step='0.01'
                  value={item.unit_cost}
                  onChange={(e) => updateItem(idx, 'unit_cost', Number(e.target.value))}
                  className='w-full border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500'
                />
              </div>
              <div className='col-span-1 flex justify-center'>
                {items.length > 1 && (
                  <button
                    type='button'
                    onClick={() => removeItem(idx)}
                    className='p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors'
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className='pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end'>
          <div className='text-right'>
            <p className='text-sm text-gray-500'>ยอดรวมทั้งหมด</p>
            <p className='text-xl font-bold text-gray-800 dark:text-gray-100'>
              ฿{totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className='flex gap-3'>
        <button
          type='button'
          onClick={() => router.push('/purchase-orders')}
          className='flex-1 sm:flex-none sm:w-32 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
        >
          ยกเลิก
        </button>
        <button
          type='submit'
          disabled={saving}
          className='flex-1 sm:flex-none sm:w-48 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg font-medium transition-colors'
        >
          {saving ? 'กำลังบันทึก...' : 'สร้างใบสั่งซื้อ'}
        </button>
      </div>
    </form>
  )
}
