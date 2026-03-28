import type { Promotion } from '@/types/database'

export interface AppliedPromotion {
  promotion: Promotion
  discountAmount: number
  description: string
}

export function getBestPromotion(
  promotions: Promotion[],
  subtotal: number
): AppliedPromotion | null {
  const today = new Date().toISOString().split('T')[0]

  const candidates = promotions
    .filter((p) => {
      if (!p.is_active) return false
      if (p.start_date && today < p.start_date) return false
      if (p.end_date && today > p.end_date) return false
      if (subtotal < p.min_purchase) return false
      return true
    })
    .map((p): AppliedPromotion => {
      let discountAmount = 0
      let description = ''
      if (p.type === 'percent_off') {
        discountAmount = subtotal * (p.value / 100)
        description = `${p.name}: ลด ${p.value}%`
      } else if (p.type === 'fixed_off') {
        discountAmount = Math.min(p.value, subtotal)
        description = `${p.name}: ลด ฿${p.value}`
      } else if (p.type === 'min_purchase_discount') {
        discountAmount = Math.min(p.value, subtotal)
        description = `${p.name}: ซื้อครบ ฿${p.min_purchase} ลด ฿${p.value}`
      }
      return { promotion: p, discountAmount, description }
    })
    .filter((x) => x.discountAmount > 0)
    .sort((a, b) => b.discountAmount - a.discountAmount)

  return candidates[0] ?? null
}
