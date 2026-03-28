import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import PageHeader from '@/components/shared/PageHeader'
import ProductDetailClient from '@/components/inventory/ProductDetailClient'
import type { ProductVariant } from '@/types/database'

async function getProduct(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      variants:product_variants(*)
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

async function getMovements(productId: string) {
  const supabase = await createClient()
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id')
    .eq('product_id', productId)

  if (!variants || variants.length === 0) return []

  const variantIds = variants.map(v => v.id)
  const { data } = await supabase
    .from('inventory_movements')
    .select(`
      *,
      variant:product_variants(sku, color, size),
      performed_by_profile:profiles!performed_by(full_name)
    `)
    .in('variant_id', variantIds)
    .order('created_at', { ascending: false })
    .limit(50)

  return data || []
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, movements] = await Promise.all([
    getProduct(params.id),
    getMovements(params.id),
  ])

  if (!product) {
    notFound()
  }

  const totalStock = product.variants?.reduce((s: number, v: ProductVariant) => s + v.stock_quantity, 0) || 0
  const totalValue = product.variants?.reduce((s: number, v: ProductVariant) => {
    const price = v.price_override || product.base_price
    return s + price * v.stock_quantity
  }, 0) || 0

  return (
    <div>
      <PageHeader
        title={product.name}
        description={`SKU: ${product.sku_prefix} | หมวด: ${product.category?.name || 'ไม่ระบุ'}`}
        backHref="/inventory"
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-sm text-gray-500">ราคาขาย</p>
          <p className="text-2xl font-bold text-brand-600">{formatCurrency(product.base_price)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">ราคาทุน</p>
          <p className="text-2xl font-bold text-gray-700">{formatCurrency(product.cost_price)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">สต็อกรวม</p>
          <p className="text-2xl font-bold text-gray-800">{totalStock} ชิ้น</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">มูลค่าสต็อก</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      <ProductDetailClient product={product} movements={movements} />
    </div>
  )
}
