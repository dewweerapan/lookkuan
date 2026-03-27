'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import SearchInput from '@/components/shared/SearchInput'
import EmptyState from '@/components/shared/EmptyState'
import type { Customer } from '@/types/database'

export default function CustomersClient({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState('')

  const filtered = customers.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="ค้นหาลูกค้า, เบอร์โทร, อีเมล..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="👥" title="ไม่พบลูกค้า" description="ลูกค้าจะถูกเพิ่มอัตโนมัติเมื่อมีการขายหรือรับงานปัก" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>ชื่อลูกค้า</th>
                <th>เบอร์โทร</th>
                <th>LINE ID</th>
                <th className="text-right">ยอดใช้จ่ายรวม</th>
                <th className="text-right">จำนวนครั้ง</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td className="font-semibold text-gray-800">{c.name}</td>
                  <td>
                    {c.phone ? (
                      <a href={`tel:${c.phone}`} className="text-brand-600 hover:underline">{c.phone}</a>
                    ) : '-'}
                  </td>
                  <td className="text-gray-600">{c.line_id || '-'}</td>
                  <td className="text-right font-semibold">{formatCurrency(c.total_spent)}</td>
                  <td className="text-right">{c.visit_count} ครั้ง</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
