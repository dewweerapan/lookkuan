import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import ReorderSuggestionsClient from '@/components/inventory/ReorderSuggestionsClient'

export interface VariantSuggestion {
  variantId: string
  sku: string
  productName: string
  color: string
  size: string
  stockQuantity: number
  lowStockThreshold: number
  velocity30d: number   // units/day over last 30 days
  velocity14d: number   // units/day over last 14 days (recent trend)
  daysRemaining: number | null  // null = no sales history
  suggestedQty: number
  priority: 'urgent' | 'warning' | 'ok'
  reason: string
}

export default async function ReorderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'manager'].includes(profile.role)) redirect('/dashboard')

  // Fetch all active variants
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, sku, color, size, stock_quantity, low_stock_threshold, product:products(name)')
    .eq('is_active', true)

  if (!variants || variants.length === 0) {
    return (
      <div>
        <PageHeader title='AI แนะนำการสั่งซื้อ' description='วิเคราะห์สต็อกและแนะนำการสั่งซื้อ' backHref='/inventory' />
        <p className='text-gray-500 text-center py-12'>ไม่พบสินค้าในระบบ</p>
      </div>
    )
  }

  const now = new Date()
  const d30ago = new Date(now); d30ago.setDate(d30ago.getDate() - 30)
  const d14ago = new Date(now); d14ago.setDate(d14ago.getDate() - 14)
  const d28ago = new Date(now); d28ago.setDate(d28ago.getDate() - 28)

  // Fetch all sale_items from completed sales in the last 30 days
  const { data: items30d } = await supabase
    .from('sale_items')
    .select('variant_id, quantity, sale:sales!inner(created_at, status)')
    .gte('sale.created_at', d30ago.toISOString())
    .eq('sale.status', 'completed')

  // Aggregate sold quantities per variant
  const soldLast30: Record<string, number> = {}
  const soldLast14: Record<string, number> = {}  // last 14 days
  const soldPrev14: Record<string, number> = {}  // 28-14 days ago (for trend)

  for (const item of items30d ?? []) {
    const saleArr = item.sale as { created_at: string; status: string }[] | { created_at: string; status: string } | null
    const sale = Array.isArray(saleArr) ? saleArr[0] : saleArr
    if (!sale) continue
    const createdAt = new Date(sale.created_at)
    const vid = item.variant_id
    soldLast30[vid] = (soldLast30[vid] ?? 0) + item.quantity
    if (createdAt >= d14ago) {
      soldLast14[vid] = (soldLast14[vid] ?? 0) + item.quantity
    } else if (createdAt >= d28ago) {
      soldPrev14[vid] = (soldPrev14[vid] ?? 0) + item.quantity
    }
  }

  // Build suggestions
  const LEAD_DAYS = 14   // assume 2-week supplier lead time
  const SAFETY_DAYS = 7  // 1-week safety buffer

  const suggestions: VariantSuggestion[] = []

  for (const v of variants) {
    const productArr = v.product as { name: string }[] | { name: string } | null
    const productName = Array.isArray(productArr) ? (productArr[0]?.name ?? '') : (productArr?.name ?? '')
    const sold30 = soldLast30[v.id] ?? 0
    const sold14 = soldLast14[v.id] ?? 0
    const prev14 = soldPrev14[v.id] ?? 0

    const velocity30d = sold30 / 30
    const velocity14d = sold14 / 14

    const daysRemaining = velocity30d > 0 ? v.stock_quantity / velocity30d : null

    // Suggested quantity: cover lead time + safety stock based on recent velocity
    const effectiveVelocity = sold14 > 0 ? velocity14d : velocity30d
    const targetQty = Math.ceil(effectiveVelocity * (LEAD_DAYS + SAFETY_DAYS))
    const suggestedQty = Math.max(0, targetQty - v.stock_quantity)

    // Priority
    let priority: 'urgent' | 'warning' | 'ok'
    if (daysRemaining !== null && daysRemaining <= 7) {
      priority = 'urgent'
    } else if (v.stock_quantity <= v.low_stock_threshold) {
      priority = 'urgent'
    } else if (daysRemaining !== null && daysRemaining <= 21) {
      priority = 'warning'
    } else if (v.stock_quantity <= v.low_stock_threshold * 2) {
      priority = 'warning'
    } else {
      priority = 'ok'
    }

    // Reason text
    let reason = ''
    if (velocity30d === 0) {
      reason = `ไม่มีประวัติการขาย 30 วัน · สต็อก ${v.stock_quantity} ชิ้น`
    } else {
      const trendIcon = velocity14d > prev14 / 14 * 1.1 ? '↑' : velocity14d < prev14 / 14 * 0.9 ? '↓' : '→'
      const trendLabel = trendIcon === '↑' ? 'ยอดขายเพิ่มขึ้น' : trendIcon === '↓' ? 'ยอดขายลดลง' : 'ยอดขายคงที่'
      reason = `ขายเฉลี่ย ${velocity30d.toFixed(1)} ชิ้น/วัน · ${trendLabel} ${trendIcon} · คาดหมดใน ${daysRemaining !== null ? Math.round(daysRemaining) + ' วัน' : '—'}`
    }

    // Only include items that need attention
    if (priority === 'urgent' || priority === 'warning') {
      suggestions.push({
        variantId: v.id,
        sku: v.sku,
        productName,
        color: v.color,
        size: v.size,
        stockQuantity: v.stock_quantity,
        lowStockThreshold: v.low_stock_threshold,
        velocity30d,
        velocity14d,
        daysRemaining,
        suggestedQty,
        priority,
        reason,
      })
    }
  }

  // Sort: urgent first, then by daysRemaining ascending
  suggestions.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority === 'urgent' ? -1 : 1
    const aDays = a.daysRemaining ?? 999
    const bDays = b.daysRemaining ?? 999
    return aDays - bDays
  })

  const urgentCount = suggestions.filter((s) => s.priority === 'urgent').length
  const warningCount = suggestions.filter((s) => s.priority === 'warning').length

  return (
    <div>
      <PageHeader
        title='AI แนะนำการสั่งซื้อ'
        description={`วิเคราะห์จากยอดขาย 30 วัน · ด่วน ${urgentCount} รายการ · แนะนำ ${warningCount} รายการ`}
        backHref='/inventory'
      />
      <ReorderSuggestionsClient suggestions={suggestions} />
    </div>
  )
}
