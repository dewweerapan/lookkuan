'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { generateSKU } from '@/lib/utils';
import PageHeader from '@/components/shared/PageHeader';
import ImageUpload from '@/components/shared/ImageUpload';
import { toast } from 'sonner';

interface VariantInput {
  color: string;
  size: string;
  stock_quantity: number;
  low_stock_threshold: number;
  price_override: string;
  shelf_location: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category_id: '',
    base_price: '',
    cost_price: '',
    sku_prefix: '',
  });

  const [variants, setVariants] = useState<VariantInput[]>([
    {
      color: '',
      size: '',
      stock_quantity: 0,
      low_stock_threshold: 5,
      price_override: '',
      shelf_location: '',
    },
  ]);

  // Load categories on first render
  useEffect(() => {
    if (!categoriesLoaded) {
      const supabase = createClient();
      supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .then(({ data }) => {
          setCategories(data || []);
          setCategoriesLoaded(true);
        });
    }
  }, [categoriesLoaded]);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Auto-generate SKU prefix from name
    if (field === 'name' && !form.sku_prefix) {
      const prefix = value.substring(0, 3).toUpperCase().replace(/\s/g, '');
      setForm((prev) => ({ ...prev, sku_prefix: prefix }));
    }
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        color: '',
        size: '',
        stock_quantity: 0,
        low_stock_threshold: 5,
        price_override: '',
        shelf_location: '',
      },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('กรุณาใส่ชื่อสินค้า');
      return;
    }
    if (!form.base_price || Number(form.base_price) <= 0) {
      toast.error('กรุณาใส่ราคาขาย');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      // 1. Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: form.name.trim(),
          description: form.description.trim() || null,
          category_id: form.category_id || null,
          base_price: Number(form.base_price),
          cost_price: Number(form.cost_price) || 0,
          sku_prefix:
            form.sku_prefix.toUpperCase() ||
            form.name.substring(0, 3).toUpperCase(),
          image_url: imageUrl,
        })
        .select()
        .single();

      if (productError) throw productError;

      // 2. Create variants
      const variantInserts = variants
        .filter((v) => v.color || v.size)
        .map((v) => {
          const sku = generateSKU(
            product.sku_prefix,
            v.color || 'DEF',
            v.size || 'FREE',
          );
          return {
            product_id: product.id,
            color: v.color || '-',
            size: v.size || 'Free Size',
            sku,
            barcode: sku,
            stock_quantity: v.stock_quantity || 0,
            low_stock_threshold: v.low_stock_threshold || 5,
            price_override: v.price_override ? Number(v.price_override) : null,
            shelf_location: v.shelf_location || null,
          };
        });

      // If no variants specified, create a default one
      if (variantInserts.length === 0) {
        const sku = generateSKU(product.sku_prefix, 'DEF', 'FREE');
        variantInserts.push({
          product_id: product.id,
          color: '-',
          size: 'Free Size',
          sku,
          barcode: sku,
          stock_quantity: 0,
          low_stock_threshold: 5,
          price_override: null,
          shelf_location: null,
        });
      }

      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantInserts);

      if (variantsError) throw variantsError;

      toast.success('เพิ่มสินค้าสำเร็จ');
      router.push('/inventory');
      router.refresh();
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(`เกิดข้อผิดพลาด: ${error.message || 'กรุณาลองใหม่'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title='เพิ่มสินค้าใหม่' backHref='/inventory' />

      <form onSubmit={handleSubmit} className='max-w-3xl space-y-6'>
        {/* Basic Info */}
        <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-4'>
          <h2 className='text-lg font-bold text-gray-800 mb-4'>ข้อมูลสินค้า</h2>

          <div>
            <label className='pos-label'>รูปภาพสินค้า</label>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              bucket='product-images'
              folder='products'
            />
          </div>

          <div>
            <label className='pos-label'>ชื่อสินค้า *</label>
            <input
              type='text'
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              className='pos-input'
              placeholder='เช่น เสื้อโปโล'
              required
            />
          </div>

          <div>
            <label className='pos-label'>รายละเอียด</label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              className='pos-input min-h-[80px]'
              placeholder='รายละเอียดเพิ่มเติม (ไม่บังคับ)'
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='pos-label'>หมวดหมู่</label>
              <select
                value={form.category_id}
                onChange={(e) => updateForm('category_id', e.target.value)}
                className='pos-input'
              >
                <option value=''>ไม่ระบุ</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='pos-label'>รหัสนำหน้า SKU</label>
              <input
                type='text'
                value={form.sku_prefix}
                onChange={(e) =>
                  updateForm('sku_prefix', e.target.value.toUpperCase())
                }
                className='pos-input'
                placeholder='เช่น POLO'
                maxLength={10}
              />
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='pos-label'>ราคาขาย (บาท) *</label>
              <input
                type='number'
                value={form.base_price}
                onChange={(e) => updateForm('base_price', e.target.value)}
                className='pos-input'
                placeholder='0.00'
                min='0'
                step='0.01'
                required
              />
            </div>
            <div>
              <label className='pos-label'>ราคาทุน (บาท)</label>
              <input
                type='number'
                value={form.cost_price}
                onChange={(e) => updateForm('cost_price', e.target.value)}
                className='pos-input'
                placeholder='0.00'
                min='0'
                step='0.01'
              />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-bold text-gray-800'>
              ตัวเลือกสินค้า (สี / ไซส์)
            </h2>
            <button
              type='button'
              onClick={addVariant}
              className='pos-btn-secondary text-base px-4 py-2'
            >
              ➕ เพิ่มตัวเลือก
            </button>
          </div>

          <div className='space-y-4'>
            {variants.map((variant, index) => (
              <div
                key={index}
                className='p-4 bg-gray-50 rounded-xl border border-gray-200'
              >
                <div className='flex items-center justify-between mb-3'>
                  <span className='font-semibold text-gray-600'>
                    ตัวเลือกที่ {index + 1}
                  </span>
                  {variants.length > 1 && (
                    <button
                      type='button'
                      onClick={() => removeVariant(index)}
                      className='text-red-500 hover:text-red-700 font-medium text-sm'
                    >
                      ลบ
                    </button>
                  )}
                </div>
                <div className='grid grid-cols-2 sm:grid-cols-5 gap-3'>
                  <div>
                    <label className='text-sm font-medium text-gray-600 mb-1 block'>
                      สี
                    </label>
                    <input
                      type='text'
                      value={variant.color}
                      onChange={(e) =>
                        updateVariant(index, 'color', e.target.value)
                      }
                      className='pos-input text-base py-2'
                      placeholder='เช่น ขาว'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-600 mb-1 block'>
                      ไซส์
                    </label>
                    <input
                      type='text'
                      value={variant.size}
                      onChange={(e) =>
                        updateVariant(index, 'size', e.target.value)
                      }
                      className='pos-input text-base py-2'
                      placeholder='เช่น L'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-600 mb-1 block'>
                      จำนวนสต็อก
                    </label>
                    <input
                      type='number'
                      value={variant.stock_quantity}
                      onChange={(e) =>
                        updateVariant(
                          index,
                          'stock_quantity',
                          Number(e.target.value),
                        )
                      }
                      className='pos-input text-base py-2'
                      min='0'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-600 mb-1 block'>
                      ราคาพิเศษ
                    </label>
                    <input
                      type='number'
                      value={variant.price_override}
                      onChange={(e) =>
                        updateVariant(index, 'price_override', e.target.value)
                      }
                      className='pos-input text-base py-2'
                      placeholder='ใช้ราคาหลัก'
                      min='0'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-600 mb-1 block'>
                      ชั้นวาง
                    </label>
                    <input
                      type='text'
                      value={variant.shelf_location}
                      onChange={(e) =>
                        updateVariant(
                          index,
                          'shelf_location',
                          e.target.value.toUpperCase(),
                        )
                      }
                      className='pos-input text-base py-2'
                      placeholder='เช่น A1'
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className='flex gap-4'>
          <button
            type='button'
            onClick={() => router.back()}
            className='pos-btn-secondary flex-1 py-4 text-lg'
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            type='submit'
            className='pos-btn-primary flex-1 py-4 text-lg'
            disabled={loading}
          >
            {loading ? (
              <span className='flex items-center gap-2'>
                <span className='h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent' />
                กำลังบันทึก...
              </span>
            ) : (
              '💾 บันทึกสินค้า'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
