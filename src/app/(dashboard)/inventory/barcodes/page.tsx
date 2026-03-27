import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/shared/PageHeader'
import BarcodePrintClient from '@/components/inventory/BarcodePrintClient'

export default async function BarcodesPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('is_active', true)
    .order('name')

  return (
    <div>
      <PageHeader
        title="พิมพ์บาร์โค้ด"
        description="เลือกสินค้าและพิมพ์สติ๊กเกอร์บาร์โค้ดติดสินค้า"
        backHref="/inventory"
      />
      <BarcodePrintClient products={(products || []) as any} />
    </div>
  )
}
