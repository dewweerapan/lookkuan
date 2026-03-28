import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import PurchaseOrderDetailClient from '@/components/purchase-orders/PurchaseOrderDetailClient'

interface Props {
  params: { id: string }
}

export default async function PurchaseOrderDetailPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('purchase_orders')
    .select('*, supplier:suppliers(id, name, phone, email)')
    .eq('id', params.id)
    .single()

  if (!order) notFound()

  const { data: items } = await supabase
    .from('purchase_order_items')
    .select('*, variant:product_variants(id, sku, color, size, stock_quantity, product:products(name))')
    .eq('purchase_order_id', params.id)

  return (
    <div>
      <PageHeader
        title={`ใบสั่งซื้อ ${order.order_number}`}
        description={`ซัพพลายเออร์: ${(order.supplier as { name: string } | null)?.name ?? '—'}`}
        backHref='/purchase-orders'
      />
      <PurchaseOrderDetailClient
        order={order}
        items={items ?? []}
        userId={user.id}
      />
    </div>
  )
}
