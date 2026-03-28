'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { exportToCSV } from '@/lib/export';
import { toast } from 'sonner';

// SupabaseRow: Supabase returns rows with dynamic shapes depending on the select query.
// We use a loose type here because the shape varies per export item.
type SupabaseRow = Record<string, unknown>;

interface ExportItem {
  label: string;
  description: string;
  icon: string;
  table: string;
  select: string;
  filename: string;
  transform?: (rows: SupabaseRow[]) => Record<string, unknown>[];
}

const EXPORTS: ExportItem[] = [
  {
    label: 'สินค้าและ Variant',
    description: 'รายการสินค้าทั้งหมดพร้อม SKU/บาร์โค้ด',
    icon: '👕',
    table: 'product_variants',
    select:
      'sku, barcode, color, size, stock_quantity, low_stock_threshold, price_override, product:products(name, base_price, cost_price, sku_prefix)',
    filename: 'สินค้า.csv',
    transform: (rows) =>
      rows.map((r) => {
        const product = r.product as { name?: unknown; base_price?: unknown; cost_price?: unknown } | null;
        return {
          ชื่อสินค้า: product?.name,
          ราคาขาย: r.price_override ?? product?.base_price,
          ราคาทุน: product?.cost_price,
          SKU: r.sku,
          บาร์โค้ด: r.barcode,
          สี: r.color,
          ขนาด: r.size,
          สต็อก: r.stock_quantity,
          จุดสั่งซื้อใหม่: r.low_stock_threshold,
        };
      }),
  },
  {
    label: 'ลูกค้า',
    description: 'รายชื่อลูกค้าทั้งหมด',
    icon: '👥',
    table: 'customers',
    select:
      'full_name, phone, email, address, total_spent, visit_count, loyalty_points, tier, created_at',
    filename: 'ลูกค้า.csv',
    transform: (rows) =>
      rows.map((r) => ({
        'ชื่อ-นามสกุล': r.full_name,
        เบอร์โทร: r.phone,
        อีเมล: r.email,
        ที่อยู่: r.address,
        ยอดซื้อสะสม: r.total_spent,
        ครั้งที่เข้าร้าน: r.visit_count,
        แต้มสะสม: r.loyalty_points,
        ระดับ: r.tier,
        วันที่ลงทะเบียน: (r.created_at as string | null)?.split('T')[0],
      })),
  },
  {
    label: 'ประวัติการขาย',
    description: 'รายการขายทั้งหมด',
    icon: '🧾',
    table: 'sales',
    select:
      'sale_number, total, subtotal, discount_amount, payment_method, status, created_at, cashier:profiles!cashier_id(full_name)',
    filename: 'การขาย.csv',
    transform: (rows) =>
      rows.map((r) => ({
        เลขที่บิล: r.sale_number,
        ยอดรวม: r.total,
        ก่อนส่วนลด: r.subtotal,
        ส่วนลด: r.discount_amount,
        ช่องทางชำระ: r.payment_method,
        สถานะ: r.status,
        วันที่: (r.created_at as string | null)?.split('T')[0],
        พนักงาน: (r.cashier as Record<string, unknown>)?.full_name,
      })),
  },
  {
    label: 'งานปัก (Job Orders)',
    description: 'รายการงานปักทั้งหมด',
    icon: '🪡',
    table: 'job_orders',
    select:
      'order_number, customer_name, customer_phone, description, status, quoted_price, deposit_amount, due_amount, estimated_completion_date, created_at',
    filename: 'งานปัก.csv',
    transform: (rows) =>
      rows.map((r) => ({
        เลขที่ใบงาน: r.order_number,
        ชื่อลูกค้า: r.customer_name,
        เบอร์โทร: r.customer_phone,
        รายละเอียดงาน: r.description,
        สถานะ: r.status,
        ราคา: r.quoted_price,
        มัดจำ: r.deposit_amount,
        ยอดค้าง: r.due_amount,
        กำหนดเสร็จ: r.estimated_completion_date,
        วันที่รับงาน: (r.created_at as string | null)?.split('T')[0],
      })),
  },
  {
    label: 'แผนผ่อนชำระ',
    description: 'รายการผ่อนชำระทั้งหมด',
    icon: '💳',
    table: 'installment_plans',
    select:
      'plan_number, customer_name, customer_phone, item_description, total_amount, down_payment, balance_amount, total_installments, interval_days, status, created_at',
    filename: 'ผ่อนชำระ.csv',
    transform: (rows) =>
      rows.map((r) => ({
        เลขแผน: r.plan_number,
        ชื่อลูกค้า: r.customer_name,
        เบอร์โทร: r.customer_phone,
        รายการ: r.item_description,
        ยอดรวม: r.total_amount,
        เงินดาวน์: r.down_payment,
        ยอดคงเหลือ: r.balance_amount,
        จำนวนงวด: r.total_installments,
        'ระยะห่างงวด (วัน)': r.interval_days,
        สถานะ: r.status,
        วันที่เปิด: (r.created_at as string | null)?.split('T')[0],
      })),
  },
];

export default function DataExportSettings() {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (item: ExportItem) => {
    setExporting(item.table);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from(item.table)
        .select(item.select)
        .order('created_at', { ascending: false })
        .limit(10000);
      if (error) throw error;
      const rawRows = (data || []) as unknown as SupabaseRow[];
      const rows = item.transform ? item.transform(rawRows) : rawRows;
      exportToCSV(item.filename, rows as Record<string, unknown>[]);
      toast.success(`ส่งออก ${item.label} สำเร็จ (${(data || []).length} แถว)`);
    } catch (err) {
      toast.error(`เกิดข้อผิดพลาด: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6'>
      <h3 className='text-lg font-bold text-gray-800 mb-1'>
        ส่งออกและสำรองข้อมูล
      </h3>
      <p className='text-sm text-gray-500 mb-4'>
        ดาวน์โหลดข้อมูลเป็นไฟล์ CSV สำหรับสำรองหรือนำเข้า Excel
      </p>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {EXPORTS.map((item) => (
          <button
            key={item.table}
            onClick={() => handleExport(item)}
            disabled={exporting !== null}
            className='flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-all text-left disabled:opacity-50'
          >
            <span className='text-3xl flex-shrink-0'>{item.icon}</span>
            <div className='flex-1 min-w-0'>
              <p className='font-semibold text-gray-800'>
                {exporting === item.table ? '⏳ กำลังส่งออก...' : item.label}
              </p>
              <p className='text-sm text-gray-500'>{item.description}</p>
            </div>
            <span className='text-brand-500 text-sm font-medium flex-shrink-0'>
              ⬇️ CSV
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
