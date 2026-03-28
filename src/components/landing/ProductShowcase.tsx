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

const CATEGORY_EMOJIS: Record<string, string> = {
  เสื้อ: '👕',
  กางเกง: '👖',
  กระโปรง: '👗',
  เดรส: '👗',
  ชุด: '👘',
  หมวก: '🧢',
  ถุงเท้า: '🧦',
  เข็มขัด: '👜',
  default: '🏷️',
}

function getCategoryEmoji(name: string) {
  for (const key of Object.keys(CATEGORY_EMOJIS)) {
    if (name.includes(key)) return CATEGORY_EMOJIS[key]
  }
  return CATEGORY_EMOJIS.default
}

function ProductPlaceholder({ name }: { name: string }) {
  const colors = [
    'bg-orange-100 text-orange-400',
    'bg-blue-100 text-blue-400',
    'bg-green-100 text-green-400',
    'bg-pink-100 text-pink-400',
    'bg-purple-100 text-purple-400',
    'bg-amber-100 text-amber-400',
  ]
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`w-full h-full flex items-center justify-center ${color}`}>
      <span className='text-5xl'>👕</span>
    </div>
  )
}

function ProductCard({ product }: { product: ProductItem }) {
  const totalStock = product.variants.reduce((s, v) => s + v.stock_quantity, 0)
  const inStock = totalStock > 0
  const sizes = Array.from(new Set(product.variants.map((v) => v.size))).slice(0, 4)
  const colors = Array.from(new Set(product.variants.map((v) => v.color))).slice(0, 4)

  return (
    <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group'>
      {/* Image */}
      <div className='relative aspect-square overflow-hidden bg-gray-50'>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-300'
            sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
          />
        ) : (
          <ProductPlaceholder name={product.name} />
        )}
        {/* Stock badge */}
        {!inStock && (
          <div className='absolute inset-0 bg-black/30 flex items-center justify-center'>
            <span className='bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full'>
              สินค้าหมด
            </span>
          </div>
        )}
        {product.category && (
          <span className='absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-600 text-xs font-medium px-2 py-1 rounded-full border border-gray-100'>
            {getCategoryEmoji(product.category.name)} {product.category.name}
          </span>
        )}
      </div>

      {/* Info */}
      <div className='p-3'>
        <h3 className='font-semibold text-gray-800 text-sm leading-snug line-clamp-2 mb-1'>
          {product.name}
        </h3>

        {/* Sizes */}
        {sizes.length > 0 && (
          <div className='flex gap-1 flex-wrap mb-2'>
            {sizes.map((s) => (
              <span key={s} className='text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-medium'>
                {s}
              </span>
            ))}
            {product.variants.length > 4 && (
              <span className='text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded'>+{product.variants.length - 4}</span>
            )}
          </div>
        )}

        {/* Colors */}
        {colors.length > 0 && (
          <p className='text-xs text-gray-400 mb-2 truncate'>{colors.join(' · ')}</p>
        )}

        {/* Price */}
        <p className='text-brand-600 font-bold text-base'>
          ฿{product.base_price.toLocaleString('th-TH')}
          {product.variants.some((v) => v.price_override && v.price_override !== product.base_price) && (
            <span className='text-gray-400 text-xs font-normal ml-1'>ขึ้นไป</span>
          )}
        </p>
      </div>
    </div>
  )
}

export default function ProductShowcase({ products, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = activeCategory
    ? products.filter((p) => p.category?.id === activeCategory)
    : products

  if (products.length === 0) {
    return (
      <div className='text-center py-12 text-gray-400'>
        <p className='text-4xl mb-3'>🏷️</p>
        <p>ยังไม่มีสินค้าในระบบ</p>
      </div>
    )
  }

  return (
    <div>
      {/* Category filter */}
      {categories.length > 0 && (
        <div className='flex gap-2 flex-wrap justify-center mb-6'>
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === null
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'
            }`}
          >
            ทั้งหมด ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category?.id === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'
                }`}
              >
                {getCategoryEmoji(cat.name)} {cat.name} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'>
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className='text-center text-gray-400 py-8'>ไม่มีสินค้าในหมวดนี้</p>
      )}
    </div>
  )
}
