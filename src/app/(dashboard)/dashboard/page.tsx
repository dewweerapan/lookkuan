import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

async function getDashboardStats() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [
    { count: todayTransactions },
    { data: todaySalesData },
    { count: pendingJobs },
    { data: lowStockItems },
    { count: totalProducts },
  ] = await Promise.all([
    supabase.from('sales').select('*', { count: 'exact', head: true })
      .eq('status', 'completed').gte('created_at', today),
    supabase.from('sales').select('total')
      .eq('status', 'completed').gte('created_at', today),
    supabase.from('job_orders').select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'in_progress']),
    supabase.from('product_variants').select('id, sku, stock_quantity, low_stock_threshold, product:products(name)')
      .lt('stock_quantity', 10).eq('is_active', true).limit(10),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  const todaySales = todaySalesData?.reduce((sum, s) => sum + Number(s.total), 0) || 0

  return {
    todaySales,
    todayTransactions: todayTransactions || 0,
    pendingJobs: pendingJobs || 0,
    lowStockItems: lowStockItems || [],
    totalProducts: totalProducts || 0,
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      label: 'ยอดขายวันนี้',
      value: formatCurrency(stats.todaySales),
      icon: '💰',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      href: '/reports',
    },
    {
      label: 'รายการขายวันนี้',
      value: `${stats.todayTransactions} รายการ`,
      icon: '🧾',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      href: '/reports',
    },
    {
      label: 'งานปักที่รอดำเนินการ',
      value: `${stats.pendingJobs} งาน`,
      icon: '🧵',
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      href: '/job-orders',
    },
    {
      label: 'สินค้าทั้งหมด',
      value: `${stats.totalProducts} รายการ`,
      icon: '👕',
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      href: '/inventory',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">หน้าหลัก</h1>
        <p className="text-base text-gray-500">ภาพรวมร้าน LookKuan วันนี้</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/pos" className="pos-card bg-brand-50 border-brand-200 hover:border-brand-400">
          <span className="text-3xl">🛒</span>
          <span className="text-lg font-bold text-brand-700">ขายสินค้า</span>
        </Link>
        <Link href="/job-orders/new" className="pos-card bg-blue-50 border-blue-200 hover:border-blue-400">
          <span className="text-3xl">✂️</span>
          <span className="text-lg font-bold text-blue-700">รับงานปัก</span>
        </Link>
        <Link href="/inventory" className="pos-card bg-green-50 border-green-200 hover:border-green-400">
          <span className="text-3xl">📦</span>
          <span className="text-lg font-bold text-green-700">จัดการสต็อก</span>
        </Link>
        <Link href="/customers" className="pos-card bg-purple-50 border-purple-200 hover:border-purple-400">
          <span className="text-3xl">👥</span>
          <span className="text-lg font-bold text-purple-700">ลูกค้า</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href} className="stat-card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-yellow-800 mb-3 flex items-center gap-2">
            ⚠️ สินค้าใกล้หมด
          </h2>
          <div className="space-y-2">
            {stats.lowStockItems.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-yellow-100">
                <div>
                  <span className="font-semibold text-gray-800">{item.product?.name || 'ไม่ทราบชื่อ'}</span>
                  <span className="text-gray-500 ml-2">({item.sku})</span>
                </div>
                <span className={`font-bold ${item.stock_quantity <= 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                  เหลือ {item.stock_quantity} ชิ้น
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/inventory?filter=low_stock"
            className="inline-block mt-4 text-yellow-700 font-semibold hover:text-yellow-800"
          >
            ดูสินค้าใกล้หมดทั้งหมด →
          </Link>
        </div>
      )}
    </div>
  )
}
