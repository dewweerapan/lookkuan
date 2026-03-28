'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Supplier } from '@/types/database'
import { toast } from 'sonner'
import { Plus, Phone, Mail, MapPin, Building2, ToggleLeft, ToggleRight, X } from 'lucide-react'

interface Props {
  suppliers: Supplier[]
}

interface SupplierForm {
  name: string
  contact_name: string
  phone: string
  email: string
  address: string
  payment_terms: string
  notes: string
}

const emptyForm: SupplierForm = {
  name: '',
  contact_name: '',
  phone: '',
  email: '',
  address: '',
  payment_terms: '',
  notes: '',
}

export default function SuppliersClient({ suppliers: initial }: Props) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initial)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<SupplierForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('กรุณากรอกชื่อซัพพลายเออร์')
      return
    }
    setSaving(true)

    const optimistic: Supplier = {
      id: `temp-${Date.now()}`,
      name: form.name.trim(),
      contact_name: form.contact_name.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      payment_terms: form.payment_terms.trim() || null,
      notes: form.notes.trim() || null,
      is_active: true,
      created_at: new Date().toISOString(),
    }

    setSuppliers((prev) => [optimistic, ...prev])
    setShowModal(false)
    setForm(emptyForm)

    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        name: optimistic.name,
        contact_name: optimistic.contact_name,
        phone: optimistic.phone,
        email: optimistic.email,
        address: optimistic.address,
        payment_terms: optimistic.payment_terms,
        notes: optimistic.notes,
      })
      .select()
      .single()

    if (error) {
      toast.error('เพิ่มซัพพลายเออร์ไม่สำเร็จ: ' + error.message)
      setSuppliers((prev) => prev.filter((s) => s.id !== optimistic.id))
      setSaving(false)
      return
    }

    setSuppliers((prev) => prev.map((s) => (s.id === optimistic.id ? data : s)))
    toast.success('เพิ่มซัพพลายเออร์สำเร็จ')
    setSaving(false)
  }

  const handleToggleActive = async (supplier: Supplier) => {
    const newStatus = !supplier.is_active
    setSuppliers((prev) =>
      prev.map((s) => (s.id === supplier.id ? { ...s, is_active: newStatus } : s))
    )

    const { error } = await supabase
      .from('suppliers')
      .update({ is_active: newStatus })
      .eq('id', supplier.id)

    if (error) {
      toast.error('อัปเดตสถานะไม่สำเร็จ')
      setSuppliers((prev) =>
        prev.map((s) => (s.id === supplier.id ? { ...s, is_active: !newStatus } : s))
      )
    } else {
      toast.success(newStatus ? 'เปิดใช้งานซัพพลายเออร์' : 'ปิดการใช้งานซัพพลายเออร์')
    }
  }

  return (
    <div>
      {/* Action bar */}
      <div className='flex justify-end mb-4'>
        <button
          onClick={() => setShowModal(true)}
          className='flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
        >
          <Plus size={18} />
          เพิ่มซัพพลายเออร์
        </button>
      </div>

      {/* Mobile cards */}
      <div className='lg:hidden space-y-3'>
        {suppliers.length === 0 && (
          <div className='text-center py-12 text-gray-400'>ยังไม่มีซัพพลายเออร์</div>
        )}
        {suppliers.map((s) => (
          <div
            key={s.id}
            className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm'
          >
            <div className='flex items-start justify-between gap-2'>
              <div className='flex items-center gap-2 min-w-0'>
                <Building2 size={18} className='text-brand-500 flex-shrink-0' />
                <p className='font-semibold text-gray-800 dark:text-gray-100 truncate'>{s.name}</p>
              </div>
              <button
                onClick={() => handleToggleActive(s)}
                className='flex-shrink-0'
                title={s.is_active ? 'ปิดการใช้งาน' : 'เปิดใช้งาน'}
              >
                {s.is_active ? (
                  <ToggleRight size={28} className='text-green-500' />
                ) : (
                  <ToggleLeft size={28} className='text-gray-400' />
                )}
              </button>
            </div>
            {s.contact_name && (
              <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>{s.contact_name}</p>
            )}
            <div className='mt-2 space-y-1'>
              {s.phone && (
                <div className='flex items-center gap-1.5 text-sm text-gray-500'>
                  <Phone size={14} />
                  {s.phone}
                </div>
              )}
              {s.email && (
                <div className='flex items-center gap-1.5 text-sm text-gray-500'>
                  <Mail size={14} />
                  {s.email}
                </div>
              )}
              {s.address && (
                <div className='flex items-center gap-1.5 text-sm text-gray-500'>
                  <MapPin size={14} />
                  <span className='truncate'>{s.address}</span>
                </div>
              )}
            </div>
            {s.payment_terms && (
              <p className='mt-2 text-xs text-gray-400 dark:text-gray-500'>
                เงื่อนไขชำระ: {s.payment_terms}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className='hidden lg:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden'>
        <table className='w-full text-sm'>
          <thead className='bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'>
            <tr>
              <th className='px-4 py-3 text-left font-medium'>ชื่อบริษัท</th>
              <th className='px-4 py-3 text-left font-medium'>ผู้ติดต่อ</th>
              <th className='px-4 py-3 text-left font-medium'>โทรศัพท์</th>
              <th className='px-4 py-3 text-left font-medium'>อีเมล</th>
              <th className='px-4 py-3 text-left font-medium'>เงื่อนไขชำระ</th>
              <th className='px-4 py-3 text-center font-medium'>สถานะ</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={6} className='text-center py-12 text-gray-400'>
                  ยังไม่มีซัพพลายเออร์
                </td>
              </tr>
            )}
            {suppliers.map((s) => (
              <tr key={s.id} className='hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'>
                <td className='px-4 py-3'>
                  <p className='font-medium text-gray-800 dark:text-gray-100'>{s.name}</p>
                  {s.address && (
                    <p className='text-xs text-gray-400 truncate max-w-xs'>{s.address}</p>
                  )}
                </td>
                <td className='px-4 py-3 text-gray-600 dark:text-gray-300'>{s.contact_name ?? '—'}</td>
                <td className='px-4 py-3 text-gray-600 dark:text-gray-300'>{s.phone ?? '—'}</td>
                <td className='px-4 py-3 text-gray-600 dark:text-gray-300'>{s.email ?? '—'}</td>
                <td className='px-4 py-3 text-gray-600 dark:text-gray-300'>{s.payment_terms ?? '—'}</td>
                <td className='px-4 py-3 text-center'>
                  <button
                    onClick={() => handleToggleActive(s)}
                    title={s.is_active ? 'ปิดการใช้งาน' : 'เปิดใช้งาน'}
                  >
                    {s.is_active ? (
                      <ToggleRight size={28} className='text-green-500' />
                    ) : (
                      <ToggleLeft size={28} className='text-gray-400' />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Supplier Modal */}
      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800'>
              <h2 className='text-lg font-bold text-gray-800 dark:text-gray-100'>เพิ่มซัพพลายเออร์</h2>
              <button
                onClick={() => { setShowModal(false); setForm(emptyForm) }}
                className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className='p-5 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  ชื่อบริษัท <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className='w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500'
                  placeholder='ชื่อบริษัทหรือร้านค้า'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>ชื่อผู้ติดต่อ</label>
                <input
                  type='text'
                  value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  className='w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500'
                  placeholder='ชื่อผู้ติดต่อ'
                />
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>โทรศัพท์</label>
                  <input
                    type='tel'
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className='w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500'
                    placeholder='0XX-XXX-XXXX'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>อีเมล</label>
                  <input
                    type='email'
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className='w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500'
                    placeholder='email@example.com'
                  />
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>ที่อยู่</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className='w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none'
                  placeholder='ที่อยู่'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>เงื่อนไขชำระเงิน</label>
                <input
                  type='text'
                  value={form.payment_terms}
                  onChange={(e) => setForm({ ...form, payment_terms: e.target.value })}
                  className='w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500'
                  placeholder='เช่น เงินสด, 30 วัน, COD'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>หมายเหตุ</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className='w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none'
                  placeholder='หมายเหตุเพิ่มเติม'
                />
              </div>
              <div className='flex gap-3 pt-2'>
                <button
                  type='button'
                  onClick={() => { setShowModal(false); setForm(emptyForm) }}
                  className='flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                >
                  ยกเลิก
                </button>
                <button
                  type='submit'
                  disabled={saving}
                  className='flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors'
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
