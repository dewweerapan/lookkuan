'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Variant {
  color: string
  size: string
  stock_quantity: number
  price_override: number | null
}

interface ProductItem {
  id: string
  name: string
  description: string | null
  base_price: number
  image_url: string | null
  category: { id: string; name: string } | null
  variants: Variant[]
}

interface Props {
  products: ProductItem[]
  categories: { id: string; name: string }[]
}

// Emoji lookup by category keyword
const CATEGORY_EMOJIS: Record<string, string> = {
  เสื้อ: '👕',
  กางเกง: '👖',
  กระโปรง: '👗',
  เดรส: '👗',
  ชุด: '👘',
  หมวก: '🧢',
  ถุงเท้า: '🧦',
  เข็มขัด: '👜',
  แจ็กเก็ต: '🧥',
  โปโล: '👔',
  default: '🏷️',
}

function getCategoryEmoji(name: string) {
  for (const key of Object.keys(CATEGORY_EMOJIS)) {
    if (name.includes(key)) return CATEGORY_EMOJIS[key]
  }
  return CATEGORY_EMOJIS.default
}

// Deterministic color gradient for placeholder based on product name
const PLACEHOLDER_GRADIENTS = [
  { from: 'from-orange-50', to: 'to-amber-50', text: 'text-orange-300' },
  { from: 'from-sky-50', to: 'to-blue-50', text: 'text-sky-300' },
  { from: 'from-emerald-50', to: 'to-green-50', text: 'text-emerald-300' },
  { from: 'from-pink-50', to: 'to-rose-50', text: 'text-pink-300' },
  { from: 'from-violet-50', to: 'to-purple-50', text: 'text-violet-300' },
  { from: 'from-amber-50', to: 'to-yellow-50', text: 'text-amber-400' },
  { from: 'from-teal-50', to: 'to-cyan-50', text: 'text-teal-300' },
]

const PLACEHOLDER_EMOJIS = ['👕', '🧥', '👗', '👘', '👔', '🧣', '🧤']

function ProductPlaceholder({ name }: { name: string }) {
  const idx = name.charCodeAt(0) % PLACEHOLDER_GRADIENTS.length
  const { from, to, text } = PLACEHOLDER_GRADIENTS[idx]
  const emoji = PLACEHOLDER_EMOJIS[name.charCodeAt(0) % PLACEHOLDER_EMOJIS.length]
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${from} ${to} gap-2`}>
      <span className={`text-5xl ${text} opacity-80`}>{emoji}</span>
    </div>
  )
}

// Color name → approximate dot color (best-effort)
const COLOR_DOTS: Record<string, string> = {
  ขาว: 'bg-gray-100 border border-gray-300',
  ดำ: 'bg-gray-900',
  แดง: 'bg-red-500',
  น้ำเงิน: 'bg-blue-600',
  ฟ้า: 'bg-sky-400',
  เขียว: 'bg-green-500',
  เหลือง: 'bg-yellow-400',
  ส้ม: 'bg-orange-500',
  ชมพู: 'bg-pink-400',
  ม่วง: 'bg-purple-500',
  เทา: 'bg-gray-400',
  น้ำตาล: 'bg-amber-700',
  ครีม: 'bg-amber-100 border border-amber-200',
  กรม: 'bg-indigo-800',
}

function ColorDot({ colorName }: { colorName: string }) {
  const matched = Object.keys(COLOR_DOTS).find((k) => colorName.includes(k))
  const cls = matched ? COLOR_DOTS[matched] : 'bg-gray-300'
  return (
    <span
      title={colorName}
      className={`inline-block w-3.5 h-3.5 rounded-full flex-shrink-0 ${cls}`}
    />
  )
}

function ProductCard({ product }: { product: ProductItem }) {
  const totalStock = product.variants.reduce((s, v) => s + v.stock_quantity, 0)
  const inStock = totalStock > 0
  const sizes = Array.from(new Set(product.variants.map((v) => v.size))).filter(Boolean).slice(0, 5)
  const colors = Array.from(new Set(product.variants.map((v) => v.color))).filter(Boolean).slice(0, 5)
  const hasVariantPrice = product.variants.some(
    (v) => v.price_override && v.price_override !== product.base_price
  )

  return (
    <div className='group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col'>
      {/* Image */}
      <div className='relative aspect-square overflow-hidden bg-gray-50 flex-shrink-0'>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-500'
            sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
          />
        ) : (
          <ProductPlaceholder name={product.name} />
        )}

        {/* Out-of-stock overlay */}
        {!inStock && (
          <div className='absolute inset-0 bg-gray-900/50 backdrop-blur-[2px] flex items-center justify-center'>
            <span className='bg-white/95 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm'>
              สินค้าหมด
            </span>
          </div>
        )}

        {/* Category chip — top left */}
        {product.category && (
          <span className='absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/60 shadow-sm leading-none'>
            {getCategoryEmoji(product.category.name)} {product.category.name}
          </span>
        )}

        {/* In-stock dot — top right */}
        {inStock && (
          <span className='absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full shadow-sm' />
        )}
      </div>

      {/* Card body */}
      <div className='p-3.5 flex flex-col gap-2 flex-1'>
        {/* Product name */}
        <h3 className='font-bold text-gray-900 text-sm leading-snug line-clamp-2'>
          {product.name}
        </h3>

        {/* Size chips */}
        {sizes.length > 0 && (
          <div className='flex gap-1 flex-wrap'>
            {sizes.map((s) => (
              <span
                key={s}
                className='text-xs text-gray-500 bg-gray-50 hover:bg-brand-50 hover:text-brand-600 px-2 py-0.5 rounded-md font-semibold transition-colors cursor-default'
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Color dots */}
        {colors.length > 0 && (
          <div className='flex items-center gap-1.5'>
            {colors.map((c) => (
              <ColorDot key={c} colorName={c} />
            ))}
            {product.variants.length > 5 && (
              <span className='text-xs text-gray-400 font-medium'>+{product.variants.length - 5}</span>
            )}
          </div>
        )}

        {/* Price — pinned to bottom */}
        <div className='mt-auto pt-2'>
          <span className='text-brand-500 font-extrabold text-base'>
            ฿{product.base_price.toLocaleString('th-TH')}
          </span>
          {hasVariantPrice && (
            <span className='text-gray-400 text-xs font-normal ml-1'>ขึ้นไป</span>
          )}
        </div>
      </div>
    </div>
  )
}

const PAGE_SIZE = 8

export default function ProductShowcase({ products, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const filtered = activeCategory
    ? products.filter((p) => p.category?.id === activeCategory)
    : products

  const displayed = showAll ? filtered : filtered.slice(0, PAGE_SIZE)
  const hasMore = filtered.length > PAGE_SIZE

  if (products.length === 0) {
    return (
      <div className='text-center py-16 text-gray-400'>
        <p className='text-5xl mb-4'>🏷️</p>
        <p className='text-lg font-semibold text-gray-500'>ยังไม่มีสินค้าในระบบ</p>
        <p className='text-sm mt-1'>ติดต่อร้านเพื่อสอบถามข้อมูลเพิ่มเติม</p>
      </div>
    )
  }

  return (
    <div>
      {/* ── HoN-style interactive category cards ── */}
      {categories.length > 0 && (
        <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-10'>
          {/* "All" card */}
          <button
            onClick={() => { setActiveCategory(null); setShowAll(false) }}
            className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
              activeCategory === null
                ? 'border-brand-500 bg-brand-50 shadow-md shadow-brand-100'
                : 'border-gray-200 bg-white hover:border-brand-300 hover:bg-gray-50'
            }`}
          >
            <span className='text-2xl group-hover:scale-110 transition-transform duration-300'>🏷️</span>
            <span className={`text-xs font-bold ${activeCategory === null ? 'text-brand-600' : 'text-gray-600'}`}>
              ทั้งหมด
            </span>
            <span className={`text-xs font-sans ${activeCategory === null ? 'text-brand-400' : 'text-gray-400'}`}>
              {products.length}
            </span>
          </button>

          {/* Category cards */}
          {categories.map((cat) => {
            const count = products.filter((p) => p.category?.id === cat.id).length
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setShowAll(false) }}
                className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                  isActive
                    ? 'border-brand-500 bg-brand-50 shadow-md shadow-brand-100'
                    : 'border-gray-200 bg-white hover:border-brand-300 hover:bg-gray-50'
                }`}
              >
                <span className='text-2xl group-hover:scale-110 transition-transform duration-300'>
                  {getCategoryEmoji(cat.name)}
                </span>
                <span className={`text-xs font-bold leading-tight text-center ${isActive ? 'text-brand-600' : 'text-gray-600'}`}>
                  {cat.name}
                </span>
                <span className={`text-xs font-sans ${isActive ? 'text-brand-400' : 'text-gray-400'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Active category indicator ── */}
      {activeCategory && (
        <div className='flex items-center justify-between mb-6'>
          <p className='text-sm text-gray-500 font-sans'>
            แสดง <span className='font-bold text-gray-900'>{filtered.length}</span> รายการ
          </p>
          <button
            onClick={() => { setActiveCategory(null); setShowAll(false) }}
            className='text-xs text-brand-500 hover:text-brand-600 font-semibold font-sans transition-colors'
          >
            ดูทั้งหมด &rarr;
          </button>
        </div>
      )}

      {/* ── Product grid ── */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
        {displayed.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* ── Empty filtered state ── */}
      {filtered.length === 0 && (
        <div className='text-center py-12 text-gray-400'>
          <p className='text-4xl mb-3'>🔍</p>
          <p className='font-semibold text-gray-500'>ไม่มีสินค้าในหมวดนี้</p>
        </div>
      )}

      {/* ── Show more / less toggle ── */}
      {hasMore && (
        <div className='mt-10 text-center'>
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className='inline-flex items-center gap-2 border-2 border-gray-200 hover:border-brand-400 hover:text-brand-600 text-gray-700 font-bold px-8 py-3.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 text-sm hover:shadow-lg hover:shadow-brand-100'
          >
            {showAll ? (
              <>แสดงน้อยลง <span className='text-base'>&uarr;</span></>
            ) : (
              <>ดูสินค้าทั้งหมด ({filtered.length} รายการ) <span className='text-base'>&darr;</span></>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
