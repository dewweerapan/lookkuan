import PageHeader from '@/components/shared/PageHeader';
import InventoryImportClient from '@/components/inventory/InventoryImportClient';
import Link from 'next/link';

export default function InventoryImportPage() {
  return (
    <div>
      <PageHeader
        title='นำเข้าสินค้า'
        description='อัปโหลดไฟล์ Excel (.xlsx) หรือ CSV เพื่อนำเข้าสินค้าจำนวนมาก'
        actions={
          <Link
            href='/inventory'
            className='pos-btn-secondary text-sm px-4 py-2'
          >
            ← กลับ
          </Link>
        }
      />
      <InventoryImportClient />
    </div>
  );
}
