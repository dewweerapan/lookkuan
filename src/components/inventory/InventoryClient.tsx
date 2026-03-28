'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import SearchInput from '@/components/shared/SearchInput';
import EmptyState from '@/components/shared/EmptyState';
import type { Product, Category } from '@/types/database';

interface InventoryClientProps {
  products: (Product & { category: Category | null; variants: any[] })[];
  categories: Category[];
  defaultFilter?: string;
}

export default function InventoryClient({
  products,
  categories,
  defaultFilter,
}: InventoryClientProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(
    defaultFilter === 'low_stock',
  );

  const lowStockProducts = useMemo(
    () =>
      products.filter((p) =>
        p.variants?.some(
          (v: any) => v.stock_quantity <= v.low_stock_threshold && v.is_active,
        ),
      ),
    [products],
  );

  const filtered = useMemo(() => {
    const base = showLowStockOnly ? lowStockProducts : products;
    return base.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku_prefix.toLowerCase().includes(search.toLowerCase()) ||
        p.variants?.some((v: any) =>
          v.sku.toLowerCase().includes(search.toLowerCase()),
        );

      const matchCategory =
        categoryFilter === 'all' || p.category_id === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [products, lowStockProducts, search, categoryFilter, showLowStockOnly]);

  return (
    <div>
      {/* Low Stock Alert Banner */}
      {lowStockProducts.length > 0 && (
        <div className='mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <span className='text-2xl'>⚠️</span>
            <div>
              <p className='font-bold text-red-700'>
                สินค้าใกล้หมด {lowStockProducts.length} รายการ
              </p>
              <p className='text-sm text-red-600'>ควรสั่งซื้อเพิ่มเติม</p>
            </div>
          </div>
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`text-sm px-4 py-2 rounded-lg font-semibold flex-shrink-0 ${
              showLowStockOnly
                ? 'bg-red-200 text-red-800'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {showLowStockOnly ? 'ดูทั้งหมด' : 'ดูสินค้าใกล้หมด'}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-3 mb-6'>
        <div className='flex-1'>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder='ค้นหาสินค้า, SKU, บาร์โค้ด...'
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className='pos-input sm:w-48'
        >
          <option value='all'>ทุกหมวดหมู่</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon='📦'
          title='ไม่พบสินค้า'
          description={
            search
              ? 'ลองเปลี่ยนคำค้นหาดูนะ'
              : 'ยังไม่มีสินค้าในระบบ เพิ่มสินค้าใหม่ได้เลย'
          }
          action={
            !search && (
              <Link href='/inventory/new' className='pos-btn-primary'>
                ➕ เพิ่มสินค้าใหม่
              </Link>
            )
          }
        />
      ) : (
        <>
          {/* Mobile Card View */}
          <div className='block sm:hidden space-y-3'>
            {filtered.map((product) => {
              const totalStock =
                product.variants?.reduce(
                  (sum: number, v: any) => sum + v.stock_quantity,
                  0,
                ) || 0;
              const hasLowStock = product.variants?.some(
                (v: any) =>
                  v.stock_quantity <= v.low_stock_threshold && v.is_active,
              );
              return (
                <Link
                  key={product.id}
                  href={`/inventory/${product.id}`}
                  className='block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                      <div className='w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden'>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          '👕'
                        )}
                      </div>
                      <div className='min-w-0'>
                        <p className='font-semibold text-gray-800 truncate'>
                          {product.name}
                        </p>
                        <p className='text-sm text-gray-500'>
                          {product.sku_prefix}
                        </p>
                        <p className='text-sm text-gray-500'>
                          {product.category?.name || '-'}
                        </p>
                      </div>
                    </div>
                    <div className='text-right flex-shrink-0'>
                      <p className='font-bold text-brand-600'>
                        {formatCurrency(product.base_price)}
                      </p>
                      <p
                        className={`text-sm font-semibold ${hasLowStock ? 'text-red-600' : 'text-gray-600'}`}
                      >
                        สต็อก: {totalStock}
                      </p>
                      {hasLowStock && (
                        <span className='text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full'>
                          ใกล้หมด
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className='hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden'>
            <table className='data-table'>
              <thead>
                <tr>
                  <th>สินค้า</th>
                  <th>หมวดหมู่</th>
                  <th className='text-right'>ราคา</th>
                  <th className='text-right'>สต็อกรวม</th>
                  <th className='text-right'>ตัวเลือก (สี/ไซส์)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const totalStock =
                    product.variants?.reduce(
                      (sum: number, v: any) => sum + v.stock_quantity,
                      0,
                    ) || 0;
                  const hasLowStock = product.variants?.some(
                    (v: any) =>
                      v.stock_quantity <= v.low_stock_threshold && v.is_active,
                  );

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className='flex items-center gap-3'>
                          <div className='w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl overflow-hidden'>
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              '👕'
                            )}
                          </div>
                          <div>
                            <p className='font-semibold text-gray-800'>
                              {product.name}
                            </p>
                            <p className='text-sm text-gray-500'>
                              {product.sku_prefix}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className='text-gray-600'>
                          {product.category?.name || '-'}
                        </span>
                      </td>
                      <td className='text-right font-semibold'>
                        {formatCurrency(product.base_price)}
                      </td>
                      <td className='text-right'>
                        <span
                          className={`font-bold ${hasLowStock ? 'text-red-600' : 'text-gray-800'}`}
                        >
                          {totalStock}
                        </span>
                        {hasLowStock && (
                          <span className='ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold'>
                            ใกล้หมด
                          </span>
                        )}
                      </td>
                      <td className='text-right text-gray-600'>
                        {product.variants?.length || 0} ตัวเลือก
                      </td>
                      <td className='text-right'>
                        <Link
                          href={`/inventory/${product.id}`}
                          className='inline-flex items-center gap-1 px-4 py-2 rounded-lg
                                   bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors'
                        >
                          ดูรายละเอียด
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
