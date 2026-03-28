'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { PurchaseOrder, PurchaseOrderItem } from '@/types/database'
import { toast } from 'sonner'
import { PackageCheck, X } from 'lucide-react'

type VariantInfo = {
  id: string
  sku: string
  color: string
  size: string
  stock_quantity: number
  product: { name: string }[] | null
}

type ItemWithVariant = PurchaseOrderItem & { variant?: VariantInfo | null }

type SupplierInfo = {
  id: string
  name: string
  phone: string | null
  email: string | null
}

type OrderWithSupplier = PurchaseOrder & { supplier?: SupplierInfo | null }

interface Props {
  order: OrderWithSupplier
  items: ItemWithVariant[]
  userId: string
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
    month: 'long',
    day: 'numeric',
  })
}

export default function PurchaseOrderDetailClient({ order, items, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [currentOrder, setCurrentOrder] = useState(order)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [receiveQtys, setReceiveQtys] = useState<Record<string, number>>(
    Object.fromEntries(items.map((it) => [it.id, it.quantity_ordered - it.quantity_received]))
  )
  const [processing, setProcessing] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const canReceive = currentOrder.status !== 'received' && currentOrder.status !== 'cancelled'
  const canUpdateStatus = currentOrder.status !== 'received' && currentOrder.status !== 'cancelled'

  const handleUpdateStatus = async (newStatus: 'ordered' | 'cancelled') => {
    setUpdatingStatus(true)
    const { error } = await supabase
      .from('purchase_orders')
      .update({ status: newStatus })
      .eq('id', currentOrder.id)

    if (error) {
      toast.error('อัปเดตสถานะไม่สำเร็จ')
    } else {
      setCurrentOrder((prev) => ({ ...prev, status: newStatus }))
      toast.success(`อัปเดตสถานะเป็น "${statusLabel[newStatus]}" สำเร็จ`)
    }
    setUpdatingStatus(false)
  }

  const handleConfirmReceive = async () => {
    setProcessing(true)

    for (const item of items) {
      const qty = receiveQtys[item.id] ?? 0
      if (qty <= 0) continue

      // 1. Update stock_quantity
      const { data: variant, error: variantFetchError } = await supabase
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', item.variant_id)
        .single()

      if (variantFetchError || !variant) {
        toast.error(`ดึงข้อมูลสินค้าไม่สำเร็จ: ${item.variant?.sku}`)
        setProcessing(false)
        return
      }

      const { error: stockError } = await supabase
        .from('product_variants')
        .update({ stock_quantity: variant.stock_quantity + qty })
        .eq('id', item.variant_id)

      if (stockError) {
        toast.error(`อัปเดตสต็อกไม่สำเร็จ: ${item.variant?.sku}`)
        setProcessing(false)
        return
      }

      // 2. Insert inventory movement
      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert({
          variant_id: item.variant_id,
          type: 'receive',
          quantity_change: qty,
          reference_id: currentOrder.id,
          reference_type: 'purchase_order',
          note: `รับสินค้าจากใบสั่งซื้อ ${currentOrder.order_number}`,
          created_by: userId,
        })

      if (movementError) {
        toast.error(`บันทึก inventory movement ไม่สำเร็จ: ${item.variant?.sku}`)
        setProcessing(false)
        return
      }

      // 3. Update quantity_received on item
      const { error: itemError } = await supabase
        .from('purchase_order_items')
        .update({ quantity_received: item.quantity_received + qty })
        .eq('id', item.id)

      if (itemError) {
        toast.error(`อัปเดตรายการสินค้าไม่สำเร็จ`)
        setProcessing(false)
        return
      }
    }

    // 4. Update PO status to received
    const { error: poError } = await supabase
      .from('purchase_orders')
      .update({ status: 'received', received_at: new Date().toISOString() })
      .eq('id', currentOrder.id)

    if (poError) {
      toast.error('อัปเดตสถานะใบสั่งซื้อไม่สำเร็จ')
      setProcessing(false)
      return
    }

    toast.success('รับสินค้าและอัปเดตสต็อกสำเร็จ')
    setShowReceiveModal(false)
    setProcessing(false)
    router.refresh()
  }

  return (
    <div className='max-w-3xl space-y-6'>
      {/* Order summary */}
      <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5'>
        <div className='flex flex-wrap items-center gap-3 justify-between mb-4'>
          <div>
            <p className='text-sm text-gray-500'>สถานะ</p>
            <span className={`inline-block mt-1 text-sm px-3 py-1 rounded-full font-medium ${statusColor[currentOrder.status]}`}>
              {statusLabel[currentOrder.status]}
            </span>
          </div>
          <div className='flex gap-2 flex-wrap'>
            {currentOrder.status === 'pending' && canUpdateStatus && (
              <button
                onClick={() => handleUpdateStatus('ordered')}
                disabled={updatingStatus}
                className='text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-medium transition-colors'
              >
                {updatingStatus ? '...' : 'ยืนยันการสั่งซื้อ'}
              </button>
            )}
            {canReceive && (
              <button
                onClick={() => setShowReceiveModal(true)}
                className='flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors'
              >
                <PackageCheck size={16} />
                รับสินค้า
              </button>
            )}
            {currentOrder.status !== 'received' && currentOrder.status !== 'cancelled' && (
              <button
                onClick={() => handleUpdateStatus('cancelled')}
                disabled={updatingStatus}
                className='text-sm border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 px-3 py-1.5 rounded-lg font-medium transition-colors'
              >
                ยกเลิก
              </button>
            )}
          </div>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm'>
          <div>
            <p className='text-gray-500'>ซัพพลายเออร์</p>
            <p className='font-medium text-gray-800 dark:text-gray-100 mt-0.5'>
              {currentOrder.supplier?.name ?? '—'}
            </p>
            {currentOrder.supplier?.phone && (
              <p className='text-gray-500 text-xs mt-0.5'>{currentOrder.supplier.phone}</p>
            )}
          </div>
          <div>
            <p className='text-gray-500'>วันที่สั่ง</p>
            <p className='font-medium text-gray-800 dark:text-gray-100 mt-0.5'>
              {formatDate(currentOrder.ordered_at)}
            </p>
          </div>
          {currentOrder.expected_date && (
            <div>
              <p className='text-gray-500'>วันที่คาดว่าจะรับ</p>
              <p className='font-medium text-gray-800 dark:text-gray-100 mt-0.5'>
                {formatDate(currentOrder.expected_date)}
              </p>
            </div>
          )}
          {currentOrder.received_at && (
            <div>
              <p className='text-gray-500'>วันที่รับสินค้า</p>
              <p className='font-medium text-gray-800 dark:text-gray-100 mt-0.5'>
                {formatDate(currentOrder.received_at)}
              </p>
            </div>
          )}
          <div>
            <p className='text-gray-500'>ยอดรวม</p>
            <p className='font-bold text-lg text-gray-800 dark:text-gray-100 mt-0.5'>
              ฿{Number(currentOrder.total_amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {currentOrder.notes && (
          <div className='mt-4 pt-4 border-t border-gray-100 dark:border-gray-800'>
            <p className='text-sm text-gray-500'>หมายเหตุ</p>
            <p className='text-sm text-gray-700 dark:text-gray-300 mt-0.5'>{currentOrder.notes}</p>
          </div>
        )}
      </div>

      {/* Items table */}
      <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden'>
        <div className='px-5 py-3 border-b border-gray-100 dark:border-gray-800'>
          <h2 className='font-semibold text-gray-800 dark:text-gray-100'>รายการสินค้า</h2>
        </div>
        <table className='w-full text-sm'>
          <thead className='bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'>
            <tr>
              <th className='px-4 py-3 text-left font-medium'>สินค้า</th>
              <th className='px-4 py-3 text-center font-medium'>สั่ง</th>
              <th className='px-4 py-3 text-center font-medium'>รับแล้ว</th>
              <th className='px-4 py-3 text-right font-medium'>ราคาต่อหน่วย</th>
              <th className='px-4 py-3 text-right font-medium'>รวม</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
            {items.map((item) => {
              const productName = item.variant?.product?.[0]?.name ?? ''
              const label = item.variant
                ? `${productName} (${item.variant.color} / ${item.variant.size})`
                : item.variant_id
              return (
                <tr key={item.id}>
                  <td className='px-4 py-3'>
                    <p className='font-medium text-gray-800 dark:text-gray-100'>{label}</p>
                    <p className='text-xs text-gray-400'>{item.variant?.sku}</p>
                  </td>
                  <td className='px-4 py-3 text-center text-gray-600 dark:text-gray-300'>
                    {item.quantity_ordered}
                  </td>
                  <td className='px-4 py-3 text-center'>
                    <span className={item.quantity_received > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {item.quantity_received}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-right text-gray-600 dark:text-gray-300'>
                    ฿{Number(item.unit_cost).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className='px-4 py-3 text-right font-medium text-gray-800 dark:text-gray-100'>
                    ฿{(item.quantity_ordered * Number(item.unit_cost)).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Receive modal */}
      {showReceiveModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800'>
              <h2 className='text-lg font-bold text-gray-800 dark:text-gray-100'>รับสินค้า</h2>
              <button
                onClick={() => setShowReceiveModal(false)}
                className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
              >
                <X size={20} />
              </button>
            </div>
            <div className='p-5 space-y-4'>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                กรอกจำนวนสินค้าที่รับจริง จำนวนสต็อกจะถูกอัปเดตอัตโนมัติ
              </p>
              <div className='space-y-3'>
                {items.map((item) => {
                  const productName = item.variant?.product?.[0]?.name ?? ''
                  const remaining = item.quantity_ordered - item.quantity_received
                  return (
                    <div key={item.id} className='flex items-center gap-3'>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-gray-800 dark:text-gray-100 truncate'>
                          {productName} ({item.variant?.color} / {item.variant?.size})
                        </p>
                        <p className='text-xs text-gray-400'>
                          รอรับ: {remaining} / สั่ง: {item.quantity_ordered}
                        </p>
                      </div>
                      <input
                        type='number'
                        min={0}
                        max={remaining}
                        value={receiveQtys[item.id] ?? 0}
                        onChange={(e) =>
                          setReceiveQtys((prev) => ({
                            ...prev,
                            [item.id]: Math.min(Number(e.target.value), remaining),
                          }))
                        }
                        className='w-20 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 text-center'
                      />
                    </div>
                  )
                })}
              </div>
              <div className='flex gap-3 pt-2'>
                <button
                  type='button'
                  onClick={() => setShowReceiveModal(false)}
                  className='flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                >
                  ยกเลิก
                </button>
                <button
                  type='button'
                  onClick={handleConfirmReceive}
                  disabled={processing}
                  className='flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors'
                >
                  {processing ? 'กำลังบันทึก...' : 'ยืนยันรับสินค้า'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
