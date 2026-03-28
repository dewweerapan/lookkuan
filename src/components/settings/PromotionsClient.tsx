'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Promotion } from '@/types/database'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

const TYPE_LABELS: Record<Promotion['type'], string> = {
  percent_off: 'ลดเป็น %',
  fixed_off: 'ลดเป็นบาท',
  min_purchase_discount: 'ซื้อครบได้ส่วนลด',
}

export default function PromotionsClient({ promotions: initial }: { promotions: Promotion[] }) {
  const [promotions, setPromotions] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  const toggleActive = async (id: string, current: boolean) => {
    setPromotions((p) => p.map((x) => (x.id === id ? { ...x, is_active: !current } : x)))
    const { error } = await supabase.from('promotions').update({ is_active: !current }).eq('id', id)
    if (error) {
      setPromotions((p) => p.map((x) => (x.id === id ? { ...x, is_active: current } : x)))
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const deletePromotion = async (id: string) => {
    if (!confirm('ลบโปรโมชันนี้?')) return
    setPromotions((p) => p.filter((x) => x.id !== id))
    const { error } = await supabase.from('promotions').delete().eq('id', id)
    if (error) toast.error('เกิดข้อผิดพลาดในการลบ')
    else toast.success('ลบโปรโมชันแล้ว')
  }

  const formatPromoValue = (p: Promotion) => {
    if (p.type === 'percent_off') return `${p.value}%`
    return formatCurrency(p.value)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{promotions.length} โปรโมชัน</p>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors"
        >
          + เพิ่มโปรโมชัน
        </button>
      </div>

      {/* Mobile-first: cards on small, table on large */}
      <div className="space-y-3 lg:hidden">
        {promotions.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{TYPE_LABELS[p.type]} · ลด {formatPromoValue(p)}</p>
                {p.min_purchase > 0 && (
                  <p className="text-xs text-gray-400">ซื้อขั้นต่ำ {formatCurrency(p.min_purchase)}</p>
                )}
              </div>
              <button
                onClick={() => toggleActive(p.id, p.is_active)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {p.is_active ? 'เปิด' : 'ปิด'}
              </button>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
              <p className="text-xs text-gray-400">
                {p.start_date ?? 'ไม่กำหนด'} → {p.end_date ?? 'ไม่กำหนด'}
              </p>
              <button onClick={() => deletePromotion(p.id)} className="text-xs text-red-400 hover:text-red-600">
                ลบ
              </button>
            </div>
          </div>
        ))}
        {promotions.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">🏷️</p>
            <p>ยังไม่มีโปรโมชัน</p>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">ชื่อโปรโมชัน</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">ประเภท</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">ส่วนลด</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">ขั้นต่ำ</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">วันที่</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">สถานะ</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {promotions.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                <td className="px-4 py-3 text-gray-600">{TYPE_LABELS[p.type]}</td>
                <td className="px-4 py-3 font-semibold text-brand-600">{formatPromoValue(p)}</td>
                <td className="px-4 py-3 text-gray-500">{p.min_purchase > 0 ? formatCurrency(p.min_purchase) : '—'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{p.start_date ?? '—'} → {p.end_date ?? 'ไม่กำหนด'}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleActive(p.id, p.is_active)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {p.is_active ? 'เปิดใช้' : 'ปิดใช้'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => deletePromotion(p.id)} className="text-red-400 hover:text-red-600 text-xs">ลบ</button>
                </td>
              </tr>
            ))}
            {promotions.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">ยังไม่มีโปรโมชัน</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <PromotionFormModal
          onClose={() => setShowForm(false)}
          onSaved={(p) => { setPromotions((prev) => [p, ...prev]); setShowForm(false); toast.success('เพิ่มโปรโมชันแล้ว') }}
        />
      )}
    </div>
  )
}

function PromotionFormModal({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: (p: Promotion) => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<Promotion['type']>('percent_off')
  const [value, setValue] = useState('')
  const [minPurchase, setMinPurchase] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    if (!name.trim() || !value) return toast.error('กรุณากรอกชื่อและค่าส่วนลด')
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('promotions')
        .insert({
          name: name.trim(),
          type,
          value: Number(value),
          min_purchase: Number(minPurchase) || 0,
          start_date: startDate || null,
          end_date: endDate || null,
          is_active: true,
        })
        .select()
        .single()
      if (error) throw error
      onSaved(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-lg">เพิ่มโปรโมชัน</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">ชื่อโปรโมชัน</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ลดต้อนรับปีใหม่"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">ประเภทส่วนลด</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Promotion['type'])}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {(Object.entries(TYPE_LABELS) as [Promotion['type'], string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {type === 'percent_off' ? 'ลด (%)' : 'ลด (บาท)'}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === 'percent_off' ? '10' : '50'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">ยอดขั้นต่ำ (บาท)</label>
              <input
                type="number"
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">วันเริ่ม</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">วันสิ้นสุด</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">ยกเลิก</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-brand-600 transition-colors">
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}
