import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import PageHeader from '@/components/shared/PageHeader'
import InventoryClient from '@/components/inventory/InventoryClient'
import InventoryExportButton from '@/components/inventory/InventoryExportButton'

async function getProducts() {
  const supabase = await createClient()
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      variants:product_variants(*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return products || []
}

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return data || []
}

export default async function InventoryPage({ searchParams }: { searchParams: { filter?: string } }) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  const showLowStockOnly = searchParams.filter === 'low_stock'

  const totalItems = products.reduce((sum: number, p: any) => {
    return sum + (p.variants?.reduce((vSum: number, v: any) => vSum + v.stock_quantity, 0) || 0)
  }, 0)

  const totalValue = products.reduce((sum: number, p: any) => {
    return sum + (p.variants?.reduce((vSum: number, v: any) => {
      const price = v.price_override || p.base_price
      return vSum + (price * v.stock_quantity)
    }, 0) || 0)
  }, 0)

  const lowStockCount = products.reduce((sum: number, p: any) => {
    return sum + (p.variants?.filter((v: any) => v.stock_quantity <= v.low_stock_threshold && v.is_active).length || 0)
  }, 0)

  return (
    <div>
      <PageHeader
        title="สินค้าและสต็อก"
        description={`สินค้าทั้งหมด ${products.length} รายการ`}
        actions={
          <div className="flex gap-3 flex-wrap">
            <InventoryExportButton products={products} />
            <Link href="/inventory/categories" className="pos-btn-secondary">
              📁 หมวดหมู่
            </Link>
            <Link href="/inventory/movements" className="pos-btn-secondary">
              📋 ประวัติสต็อก
            </Link>
            <Link href="/inventory/barcodes" className="pos-btn-secondary">
              🏷️ พิมพ์บาร์โค้ด
            </Link>
            <Link href="/inventory/new" className="pos-btn-primary">
              ➕ เพิ่มสินค้าใหม่
            </Link>
          </div>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-sm text-gray-500 font-medium">สินค้าในคลังทั้งหมด</p>
          <p className="text-2xl font-bold text-gray-800">{totalItems.toLocaleString()} ชิ้น</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 font-medium">มูลค่าสต็อกรวม</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totalValue)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 font-medium">สินค้าใกล้หมด</p>
          <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-gray-800'}`}>
            {lowStockCount} รายการ
          </p>
        </div>
      </div>

      <InventoryClient products={products} categories={categories} defaultFilter={showLowStockOnly ? 'low_stock' : undefined} />
    </div>
  )
}
