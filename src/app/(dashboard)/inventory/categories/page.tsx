'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { toast } from 'sonner'

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*, products:products(count)')
      .order('sort_order')
    if (error) {
      console.error('Error loading categories:', error)
    }
    setCategories(data || [])
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('categories').insert({
      name: newName.trim(),
      sort_order: categories.length,
    })
    if (error) {
      toast.error('เกิดข้อผิดพลาด')
    } else {
      toast.success('เพิ่มหมวดหมู่สำเร็จ')
      setNewName('')
      loadCategories()
    }
    setSaving(false)
  }

  const handleEdit = async () => {
    if (!editingId || !editName.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('categories').update({ name: editName.trim() }).eq('id', editingId)
    if (error) {
      toast.error('เกิดข้อผิดพลาด')
    } else {
      toast.success('แก้ไขสำเร็จ')
      setEditingId(null)
      setEditName('')
      loadCategories()
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', deleteId)
    if (error) {
      toast.error('ไม่สามารถลบได้ อาจมีสินค้าอยู่ในหมวดหมู่นี้')
    } else {
      toast.success('ลบหมวดหมู่สำเร็จ')
      loadCategories()
    }
    setDeleteId(null)
  }

  return (
    <div>
      <PageHeader title="จัดการหมวดหมู่" backHref="/inventory" />

      {/* Add new */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">เพิ่มหมวดหมู่ใหม่</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="pos-input flex-1"
            placeholder="ชื่อหมวดหมู่"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={saving || !newName.trim()}
            className="pos-btn-primary px-6"
          >
            ➕ เพิ่ม
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-gray-400">กำลังโหลด...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ชื่อหมวดหมู่</th>
                <th className="text-right">จำนวนสินค้า</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td>
                    {editingId === cat.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-3 py-1 border rounded-lg flex-1"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                        />
                        <button onClick={handleEdit} disabled={saving} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">บันทึก</button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-200 rounded-lg text-sm">ยกเลิก</button>
                      </div>
                    ) : (
                      <span className="font-semibold text-gray-800">{cat.name}</span>
                    )}
                  </td>
                  <td className="text-right text-gray-600">
                    {cat.products?.[0]?.count || 0} รายการ
                  </td>
                  <td className="text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setEditingId(cat.id); setEditName(cat.name) }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => setDeleteId(cat.id)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="ลบหมวดหมู่?"
        message="หมวดหมู่นี้จะถูกลบ สินค้าในหมวดหมู่นี้จะกลายเป็น 'ไม่ระบุหมวดหมู่'"
        confirmLabel="ลบหมวดหมู่"
        variant="danger"
      />
    </div>
  )
}
