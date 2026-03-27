'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { formatCurrency } from '@/lib/utils'
import type { Product, ProductVariant } from '@/types/database'

// Lazy load react-barcode (client-only)
const Barcode = dynamic(() => import('react-barcode'), { ssr: false })

type ProductWithVariants = Product & { variants: ProductVariant[] }

interface SelectedVariant {
  variant: ProductVariant
  product: ProductWithVariants
  copies: number
}

interface Props {
  products: ProductWithVariants[]
}

export default function BarcodePrintClient({ products }: Props) {
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([])
  const [labelSize, setLabelSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [showPrice, setShowPrice] = useState(true)
  const [showProductName, setShowProductName] = useState(true)
  const [filterSearch, setFilterSearch] = useState('')

  const filteredProducts = products.filter(p =>
    !filterSearch || p.name.toLowerCase().includes(filterSearch.toLowerCase())
  )

  const toggleVariant = (variant: ProductVariant, product: ProductWithVariants) => {
    const exists = selectedVariants.find(s => s.variant.id === variant.id)
    if (exists) {
      setSelectedVariants(prev => prev.filter(s => s.variant.id !== variant.id))
    } else {
      setSelectedVariants(prev => [...prev, { variant, product, copies: 1 }])
    }
  }

  const updateCopies = (variantId: string, copies: number) => {
    setSelectedVariants(prev =>
      prev.map(s => s.variant.id === variantId ? { ...s, copies: Math.max(1, copies) } : s)
    )
  }

  const selectAll = (product: ProductWithVariants) => {
    const newItems = product.variants
      .filter(v => !selectedVariants.find(s => s.variant.id === v.id))
      .map(v => ({ variant: v, product, copies: 1 }))
    setSelectedVariants(prev => [...prev, ...newItems])
  }

  const labelConfig = {
    small:  { width: 1, height: 30, fontSize: 10, margin: 2 },
    medium: { width: 1.5, height: 40, fontSize: 12, margin: 3 },
    large:  { width: 2, height: 50, fontSize: 14, margin: 4 },
  }[labelSize]

  const printLabels = () => {
    window.print()
  }

  // Flatten selected variants into individual label items (repeating by copies)
  const labelsToPrint = selectedVariants.flatMap(s =>
    Array.from({ length: s.copies }, (_, i) => ({ ...s, key: `${s.variant.id}-${i}` }))
  )

  return (
    <>
      {/* Print styles — hidden in screen, shown when printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: fixed; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          @page { margin: 8mm; size: A4; }
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Product Selector */}
        <div className="lg:col-span-2 no-print">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              placeholder="🔍 ค้นหาสินค้า..."
              className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-brand-500 outline-none"
            />
          </div>

          <div className="space-y-3">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-500">{formatCurrency(product.base_price)}</p>
                  </div>
                  <button
                    onClick={() => selectAll(product)}
                    className="text-sm px-3 py-1.5 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 font-medium"
                  >
                    เลือกทั้งหมด
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(variant => {
                    const isSelected = !!selectedVariants.find(s => s.variant.id === variant.id)
                    return (
                      <button
                        key={variant.id}
                        onClick={() => toggleVariant(variant, product)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                          isSelected
                            ? 'bg-brand-500 text-white border-brand-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300'
                        }`}
                      >
                        {variant.color} {variant.size}
                        <span className={`ml-1 text-xs ${isSelected ? 'text-brand-100' : 'text-gray-400'}`}>
                          ({variant.barcode})
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Settings + Preview */}
        <div className="no-print">
          <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-4 space-y-5">
            <h3 className="font-bold text-gray-800 text-lg">⚙️ ตั้งค่าการพิมพ์</h3>

            {/* Label size */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">ขนาดสติ๊กเกอร์</label>
              <div className="grid grid-cols-3 gap-2">
                {(['small', 'medium', 'large'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => setLabelSize(size)}
                    className={`py-2 rounded-xl text-sm font-medium border-2 ${
                      labelSize === size ? 'bg-brand-500 text-white border-brand-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    {size === 'small' ? 'เล็ก' : size === 'medium' ? 'กลาง' : 'ใหญ่'}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showProductName}
                  onChange={e => setShowProductName(e.target.checked)}
                  className="w-5 h-5 rounded accent-brand-500"
                />
                <span className="text-base font-medium">แสดงชื่อสินค้า</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={e => setShowPrice(e.target.checked)}
                  className="w-5 h-5 rounded accent-brand-500"
                />
                <span className="text-base font-medium">แสดงราคา</span>
              </label>
            </div>

            {/* Copies per variant */}
            {selectedVariants.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  จำนวนต่อ variant
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedVariants.map(s => (
                    <div key={s.variant.id} className="flex items-center justify-between gap-2">
                      <span className="text-sm text-gray-600 truncate flex-1">
                        {s.product.name} {s.variant.color}/{s.variant.size}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateCopies(s.variant.id, s.copies - 1)}
                          className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                        >−</button>
                        <span className="w-8 text-center font-bold text-gray-800">{s.copies}</span>
                        <button
                          onClick={() => updateCopies(s.variant.id, s.copies + 1)}
                          className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected count */}
            <div className="py-3 px-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">สติ๊กเกอร์ที่จะพิมพ์</p>
              <p className="text-3xl font-bold text-brand-600">{labelsToPrint.length} แผ่น</p>
            </div>

            <button
              onClick={printLabels}
              disabled={labelsToPrint.length === 0}
              className="w-full py-4 text-lg font-bold bg-brand-500 text-white rounded-xl
                       hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              🖨️ พิมพ์บาร์โค้ด
            </button>

            {selectedVariants.length > 0 && (
              <button
                onClick={() => setSelectedVariants([])}
                className="w-full py-3 text-base text-red-600 hover:bg-red-50 rounded-xl border-2 border-red-200"
              >
                ล้างที่เลือก
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PRINT AREA — visible when printing */}
      <div id="print-area" className="mt-8">
        {labelsToPrint.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {labelsToPrint.map(({ variant, product, key }) => (
              <div
                key={key}
                className="border border-gray-300 rounded p-2 inline-flex flex-col items-center bg-white"
                style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
              >
                {showProductName && (
                  <p className="font-bold text-center leading-tight mb-1" style={{ fontSize: labelConfig.fontSize }}>
                    {product.name}
                  </p>
                )}
                <p className="text-gray-600 text-center" style={{ fontSize: labelConfig.fontSize - 2 }}>
                  {variant.color} / {variant.size}
                </p>
                <Barcode
                  value={variant.barcode}
                  width={labelConfig.width}
                  height={labelConfig.height}
                  fontSize={labelConfig.fontSize}
                  margin={labelConfig.margin}
                  displayValue={true}
                />
                {showPrice && (
                  <p className="font-bold text-center" style={{ fontSize: labelConfig.fontSize + 2 }}>
                    ฿{formatCurrency(variant.price_override ?? product.base_price)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        {labelsToPrint.length === 0 && (
          <div className="text-center py-12 text-gray-400 no-print">
            <p className="text-4xl mb-2">🏷️</p>
            <p className="text-lg">เลือกสินค้าจากรายการด้านซ้ายเพื่อเริ่มพิมพ์</p>
          </div>
        )}
      </div>
    </>
  )
}
