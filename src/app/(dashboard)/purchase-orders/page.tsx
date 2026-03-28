import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import PurchaseOrdersClient from '@/components/purchase-orders/PurchaseOrdersClient'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function PurchaseOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('purchase_orders')
    .select('*, supplier:suppliers(id, name)')
    .order('ordered_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <PageHeader
        title='ใบสั่งซื้อ'
        description='จัดการใบสั่งซื้อสินค้าจากซัพพลายเออร์'
        actions={
          <Link
            href='/purchase-orders/new'
            className='flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm'
          >
            <Plus size={18} />
            สร้างใบสั่งซื้อ
          </Link>
        }
      />
      <PurchaseOrdersClient orders={orders ?? []} />
    </div>
  )
}
