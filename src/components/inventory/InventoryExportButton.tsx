'use client'

import { exportToCSV } from '@/lib/export'

interface Product {
  name: string
  category?: { name: string } | null
  base_price: number
  is_active: boolean
  variants?: {
    sku: string
    size: string
    color: string
    barcode: string
    stock_quantity: number
    price_override: number | null
    low_stock_threshold: number
  }[]
}

interface Props {
  products: Product[]
}

export default function InventoryExportButton({ products }: Props) {
  const handleExport = () => {
    const rows: Record<string, unknown>[] = []
    products.forEach(p => {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach(v => {
          rows.push({
            'ชื่อสินค้า': p.name,
            'หมวดหมู่': p.category?.name || '',
            'ราคาขาย': v.price_override ?? p.base_price,
            'SKU': v.sku || '',
            'บาร์โค้ด': v.barcode || '',
            'ขนาด': v.size || '',
            'สี': v.color || '',
            'จำนวนสต็อก': v.stock_quantity,
            'จุดสั่งซื้อใหม่': v.low_stock_threshold,
            'สถานะ': p.is_active ? 'ใช้งาน' : 'ปิด',
          })
        })
      } else {
        rows.push({
          'ชื่อสินค้า': p.name,
          'หมวดหมู่': p.category?.name || '',
          'ราคาขาย': p.base_price,
          'SKU': '',
          'บาร์โค้ด': '',
          'ขนาด': '',
          'สี': '',
          'จำนวนสต็อก': 0,
          'จุดสั่งซื้อใหม่': 0,
          'สถานะ': p.is_active ? 'ใช้งาน' : 'ปิด',
        })
      }
    })
    exportToCSV(`สินค้า-${new Date().toLocaleDateString('th-TH')}.csv`, rows)
  }

  return (
    <button onClick={handleExport} className="pos-btn-secondary">
      ⬇️ Export CSV
    </button>
  )
}
