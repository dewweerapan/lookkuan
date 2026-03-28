'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { MOVEMENT_TYPE_LABELS } from '@/lib/constants'
import { toast } from 'sonner'

interface Props {
  product: any
  movements: any[]
}

export default function ProductDetailClient({ product, movements }: Props) {
  const [activeTab, setActiveTab] = useState<'variants' | 'movements'>('variants')
  const [adjusting, setAdjusting] = useState<string | null>(null)
  const [adjustQty, setAdjustQty] = useState('')
  const [adjustNote, setAdjustNote] = useState('')
  const [loading, setLoading] = useState(false)
  const { profile } = useAuth()
  const router = useRouter()

  const handleStockAdjust = async (variantId: string) => {
    const qty = parseInt(adjustQty)
    if (isNaN(qty) || qty === 0) {
      toast.error('กรุณาใส่จำนวนที่ต้องการปรับ')
      return
    }
    if (!adjustNote.trim()) {
      toast.error('กรุณาใส่เหตุผลในการปรับสต็อก')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      // Update stock
      const variant = product.variants.find((v: any) => v.id === variantId)
      const newQty = Math.max(0, variant.stock_quantity + qty)

      const { error: updateError } = await supabase
        .from('product_variants')
        .update({ stock_quantity: newQty })
        .eq('id', variantId)

      if (updateError) throw updateError

      // Log movement
      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert({
          variant_id: variantId,
          type: qty > 0 ? 'receive' : 'adjust',
          quantity_change: qty,
          note: adjustNote.trim(),
          created_by: profile!.id,
        })

      if (movementError) throw movementError

      toast.success(`ปรับสต็อกสำเร็จ: ${qty > 0 ? '+' : ''}${qty}`)
      setAdjusting(null)
      setAdjustQty('')
      setAdjustNote('')
      router.refresh()
    } catch (error: any) {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('variants')}
          className={`pos-btn px-5 py-3 rounded-xl text-base ${
            activeTab === 'variants' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          📦 ตัวเลือกสินค้า ({product.variants?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`pos-btn px-5 py-3 rounded-xl text-base ${
            activeTab === 'movements' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          📋 ประวัติสต็อก ({movements.length})
        </button>
      </div>

      {activeTab === 'variants' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU / Barcode</th>
                <th>สี</th>
                <th>ไซส์</th>
                <th>ชั้นวาง</th>
                <th className="text-right">ราคา</th>
                <th className="text-right">สต็อก</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {product.variants?.map((v: any) => (
                <tr key={v.id}>
                  <td className="font-mono text-sm">{v.sku}</td>
                  <td>{v.color}</td>
                  <td>{v.size}</td>
                  <td>
                    {v.shelf_location ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-full text-xs font-bold font-mono">
                        🗺️ {v.shelf_location}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="text-right font-semibold">
                    {v.price_override ? formatCurrency(v.price_override) : formatCurrency(product.base_price)}
                  </td>
                  <td className="text-right">
                    <span className={`font-bold ${v.stock_quantity <= v.low_stock_threshold ? 'text-red-600' : 'text-gray-800'}`}>
                      {v.stock_quantity}
                    </span>
                    {v.stock_quantity <= v.low_stock_threshold && (
                      <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">ใกล้หมด</span>
                    )}
                  </td>
                  <td className="text-right">
                    {adjusting === v.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={adjustQty}
                          onChange={(e) => setAdjustQty(e.target.value)}
                          className="w-20 px-2 py-1 border rounded-lg text-center"
                          placeholder="+/-"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={adjustNote}
                          onChange={(e) => setAdjustNote(e.target.value)}
                          className="w-32 px-2 py-1 border rounded-lg"
                          placeholder="เหตุผล"
                        />
                        <button
                          onClick={() => handleStockAdjust(v.id)}
                          disabled={loading}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                        >
                          บันทึก
                        </button>
                        <button
                          onClick={() => { setAdjusting(null); setAdjustQty(''); setAdjustNote('') }}
                          className="px-3 py-1 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAdjusting(v.id)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                      >
                        ปรับสต็อก
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'movements' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>วันที่</th>
                <th>ประเภท</th>
                <th>ตัวเลือก</th>
                <th className="text-right">จำนวน</th>
                <th>หมายเหตุ</th>
                <th>โดย</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m: any) => (
                <tr key={m.id}>
                  <td className="text-sm text-gray-500">{formatDateTime(m.created_at)}</td>
                  <td>
                    <span className={`text-sm font-semibold ${
                      m.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {MOVEMENT_TYPE_LABELS[m.type] || m.type}
                    </span>
                  </td>
                  <td className="text-sm">{m.variant?.color} / {m.variant?.size}</td>
                  <td className={`text-right font-bold ${m.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {m.quantity_change > 0 ? '+' : ''}{m.quantity_change}
                  </td>
                  <td className="text-sm text-gray-600">{m.note || '-'}</td>
                  <td className="text-sm">{m.created_by_profile?.full_name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
