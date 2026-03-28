import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/shared/PageHeader';
import ShelfMapClient, { type Variant } from '@/components/inventory/ShelfMapClient';
import Link from 'next/link';

async function getShelfData() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('product_variants')
    .select(
      'id, sku, size, color, stock_quantity, low_stock_threshold, shelf_location, product:products(id, name, base_price)',
    )
    .not('shelf_location', 'is', null)
    .order('shelf_location');
  return (data || []) as unknown as Variant[];
}

export default async function InventoryMapPage() {
  const variants = await getShelfData();

  return (
    <div>
      <PageHeader
        title='ผังสินค้า'
        description='ตำแหน่งสินค้าบนชั้นวาง'
        actions={
          <Link
            href='/inventory'
            className='pos-btn-secondary text-sm px-4 py-2'
          >
            ← กลับ
          </Link>
        }
      />
      <ShelfMapClient variants={variants} />
    </div>
  );
}
