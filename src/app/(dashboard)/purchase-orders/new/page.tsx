import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import NewPurchaseOrderClient from '@/components/purchase-orders/NewPurchaseOrderClient'

export default async function NewPurchaseOrderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: suppliers }, { data: variants }] = await Promise.all([
    supabase
      .from('suppliers')
      .select('id, name')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('product_variants')
      .select('id, sku, color, size, product:products(name)')
      .eq('is_active', true)
      .order('sku'),
  ])

  return (
    <div>
      <PageHeader
        title='สร้างใบสั่งซื้อ'
        description='สร้างใบสั่งซื้อสินค้าจากซัพพลายเออร์'
        backHref='/purchase-orders'
      />
      <NewPurchaseOrderClient
        suppliers={suppliers ?? []}
        variants={variants ?? []}
        userId={user.id}
      />
    </div>
  )
}
