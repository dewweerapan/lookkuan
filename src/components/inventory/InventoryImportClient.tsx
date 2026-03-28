'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ParsedRow {
  [key: string]: string | number;
}

const REQUIRED_COLUMNS = ['ชื่อสินค้า'];
const ALL_COLUMNS = [
  'ชื่อสินค้า', 'หมวดหมู่', 'ราคาขาย', 'ราคาทุน',
  'SKU', 'บาร์โค้ด', 'ขนาด', 'สี', 'จำนวนสต็อก', 'จุดสั่งซื้อใหม่', 'สถานะ',
];

export default function InventoryImportClient() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; updated: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json<ParsedRow>(ws, { defval: '' });
        if (parsed.length === 0) {
          setError('ไฟล์ไม่มีข้อมูล');
          return;
        }
        const missing = REQUIRED_COLUMNS.filter(
          (c) => !Object.keys(parsed[0]).includes(c),
        );
        if (missing.length > 0) {
          setError(`ไม่พบคอลัมน์ที่จำเป็น: ${missing.join(', ')}`);
          return;
        }
        setRows(parsed);
      } catch {
        setError('ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบว่าเป็นไฟล์ .xlsx หรือ .csv');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const resetFile = () => {
    setRows([]);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleImport = async () => {
    setImporting(true);
    let inserted = 0;
    let updated = 0;

    try {
      const supabase = createClient();

      // Load existing categories
      const { data: cats } = await supabase.from('categories').select('id, name');
      const catMap = new Map((cats || []).map((c: any) => [c.name as string, c.id as string]));

      // Group rows by product name
      const productGroups = new Map<string, ParsedRow[]>();
      for (const row of rows) {
        const name = String(row['ชื่อสินค้า'] || '').trim();
        if (!name) continue;
        const list = productGroups.get(name) || [];
        list.push(row);
        productGroups.set(name, list);
      }

      for (const [name, productRows] of productGroups.entries()) {
        const firstRow = productRows[0];
        const catName = String(firstRow['หมวดหมู่'] || '').trim();
        let catId: string | null = null;

        if (catName) {
          if (!catMap.has(catName)) {
            const { data: newCat } = await supabase
              .from('categories')
              .insert({ name: catName })
              .select('id')
              .single();
            if (newCat) {
              catMap.set(catName, (newCat as any).id);
              catId = (newCat as any).id;
            }
          } else {
            catId = catMap.get(catName) || null;
          }
        }

        const basePrice = Number(firstRow['ราคาขาย']) || 0;
        const costPrice = firstRow['ราคาทุน'] ? Number(firstRow['ราคาทุน']) : null;
        const isActive = String(firstRow['สถานะ'] || 'ใช้งาน') !== 'ปิด';

        // Upsert product by name
        const { data: existing } = await supabase
          .from('products')
          .select('id')
          .ilike('name', name)
          .maybeSingle();

        let productId: string;
        if (existing) {
          await supabase.from('products').update({
            base_price: basePrice,
            cost_price: costPrice,
            is_active: isActive,
            category_id: catId,
          }).eq('id', (existing as any).id);
          productId = (existing as any).id;
          updated++;
        } else {
          const { data: newProduct, error: pErr } = await supabase
            .from('products')
            .insert({ name, base_price: basePrice, cost_price: costPrice, is_active: isActive, category_id: catId })
            .select('id')
            .single();
          if (pErr || !newProduct) throw pErr || new Error('Insert product failed');
          productId = (newProduct as any).id;
          inserted++;
        }

        // Upsert variants
        for (const row of productRows) {
          const sku = String(row['SKU'] || '').trim() || null;
          const variantData = {
            product_id: productId,
            sku,
            barcode: String(row['บาร์โค้ด'] || '').trim() || null,
            size: String(row['ขนาด'] || '').trim() || null,
            color: String(row['สี'] || '').trim() || null,
            stock_quantity: Number(row['จำนวนสต็อก']) || 0,
            low_stock_threshold: Number(row['จุดสั่งซื้อใหม่']) || 5,
          };

          if (sku) {
            const { data: exV } = await supabase
              .from('product_variants')
              .select('id')
              .eq('sku', sku)
              .maybeSingle();
            if (exV) {
              await supabase.from('product_variants').update({
                stock_quantity: variantData.stock_quantity,
                low_stock_threshold: variantData.low_stock_threshold,
                barcode: variantData.barcode,
              }).eq('id', (exV as any).id);
            } else {
              await supabase.from('product_variants').insert(variantData);
            }
          } else {
            await supabase.from('product_variants').insert(variantData);
          }
        }
      }

      setResult({ inserted, updated });
      setRows([]);
      toast.success(`นำเข้าสำเร็จ: เพิ่ม ${inserted} · อัปเดต ${updated} รายการ`);
    } catch (err: any) {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Format guide */}
      <div className='bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm'>
        <p className='font-semibold text-blue-800 mb-1'>📋 รูปแบบไฟล์ที่รองรับ</p>
        <p className='text-blue-700'>
          ต้องมีคอลัมน์ <strong>ชื่อสินค้า</strong> (จำเป็น) · รองรับ .xlsx และ .csv
        </p>
        <p className='text-blue-600 font-mono text-xs mt-2 break-all'>
          {ALL_COLUMNS.join(' | ')}
        </p>
        <p className='text-blue-500 text-xs mt-1'>
          💡 ส่งออกรายการสินค้าจากหน้าสินค้า แก้ไข แล้วนำเข้ากลับได้เลย
        </p>
      </div>

      {/* Upload area */}
      {rows.length === 0 && !result && (
        <div
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onDragOver={(e) => e.preventDefault()}
          className='border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-brand-400 hover:text-brand-500 transition-colors cursor-pointer'
          onClick={() => inputRef.current?.click()}
        >
          <span className='text-5xl'>📂</span>
          <p className='text-base font-medium'>คลิกหรือลากไฟล์มาวางที่นี่</p>
          <p className='text-sm'>รองรับ .xlsx และ .csv</p>
          {error && (
            <p className='text-red-500 font-semibold text-sm mt-2'>{error}</p>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type='file'
        accept='.xlsx,.xls,.csv'
        className='hidden'
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {/* Preview table */}
      {rows.length > 0 && (
        <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
          <div className='p-4 border-b border-gray-100 flex items-center justify-between'>
            <p className='font-semibold text-gray-800'>
              ตัวอย่างข้อมูล ({rows.length} แถว)
            </p>
            <button
              onClick={resetFile}
              className='text-sm text-gray-500 hover:text-red-500'
            >
              ✕ ยกเลิก
            </button>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-xs'>
              <thead className='bg-gray-50'>
                <tr>
                  {Object.keys(rows[0]).map((col) => (
                    <th
                      key={col}
                      className='text-left px-3 py-2 font-semibold text-gray-600 whitespace-nowrap'
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className='border-t border-gray-100'>
                    {Object.values(row).map((val, j) => (
                      <td
                        key={j}
                        className='px-3 py-1.5 text-gray-700 whitespace-nowrap max-w-[180px] truncate'
                      >
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 10 && (
            <p className='text-xs text-gray-400 text-center py-2'>
              ...และอีก {rows.length - 10} แถว
            </p>
          )}
          <div className='p-4 border-t border-gray-100 flex justify-end gap-3'>
            <button onClick={resetFile} className='pos-btn-secondary px-4 py-2 text-sm'>
              ยกเลิก
            </button>
            <button
              onClick={handleImport}
              disabled={importing}
              className='pos-btn-primary px-6 py-2 text-sm disabled:opacity-50'
            >
              {importing ? '⏳ กำลังนำเข้า...' : `📥 นำเข้า ${rows.length} แถว`}
            </button>
          </div>
        </div>
      )}

      {/* Success */}
      {result && (
        <div className='bg-green-50 border border-green-200 rounded-xl p-8 text-center'>
          <p className='text-5xl mb-3'>✅</p>
          <p className='text-xl font-bold text-green-800 mb-1'>นำเข้าสำเร็จ</p>
          <p className='text-green-700'>
            เพิ่มสินค้าใหม่ <strong>{result.inserted}</strong> รายการ ·
            อัปเดต <strong>{result.updated}</strong> รายการ
          </p>
          <div className='flex gap-3 justify-center mt-5'>
            <a href='/inventory' className='pos-btn-primary px-6 py-2 text-sm'>
              ดูรายการสินค้า
            </a>
            <button
              onClick={() => { setResult(null); if (inputRef.current) inputRef.current.value = ''; }}
              className='pos-btn-secondary px-6 py-2 text-sm'
            >
              นำเข้าเพิ่มเติม
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
