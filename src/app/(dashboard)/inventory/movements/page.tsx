import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'
import { MOVEMENT_TYPE_LABELS } from '@/lib/constants'
import PageHeader from '@/components/shared/PageHeader'

async function getMovements() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory_movements')
    .select(`
      *,
      variant:product_variants(sku, color, size, product:products(name)),
      performed_by_profile:profiles!performed_by(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching movements:', error)
    return []
  }
  return data || []
}

export default async function MovementsPage() {
  const movements = await getMovements()

  return (
    <div>
      <PageHeader
        title="ประวัติสต็อก"
        description="ความเคลื่อนไหวสินค้าคงคลังทั้งหมด"
        backHref="/inventory"
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>วันที่</th>
              <th>ประเภท</th>
              <th>สินค้า</th>
              <th>ตัวเลือก</th>
              <th className="text-right">จำนวน</th>
              <th>หมายเหตุ</th>
              <th>โดย</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m: any) => (
              <tr key={m.id}>
                <td className="text-sm text-gray-500 whitespace-nowrap">{formatDateTime(m.created_at)}</td>
                <td>
                  <span className={`text-sm font-semibold ${
                    m.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {MOVEMENT_TYPE_LABELS[m.type] || m.type}
                  </span>
                </td>
                <td className="font-medium">{m.variant?.product?.name || '-'}</td>
                <td className="text-sm text-gray-600">
                  {m.variant?.color} / {m.variant?.size}
                  <br />
                  <span className="text-gray-400 font-mono text-xs">{m.variant?.sku}</span>
                </td>
                <td className={`text-right font-bold text-lg ${m.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {m.quantity_change > 0 ? '+' : ''}{m.quantity_change}
                </td>
                <td className="text-sm text-gray-600 max-w-[200px] truncate">{m.note || '-'}</td>
                <td className="text-sm">{m.performed_by_profile?.full_name || '-'}</td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400 text-lg">
                  ยังไม่มีประวัติการเคลื่อนไหว
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
