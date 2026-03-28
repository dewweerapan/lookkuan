'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  RECEIPT_SHOW_LOGO_KEY,
  RECEIPT_SHOW_ADDRESS_KEY,
  RECEIPT_SHOW_PHONE_KEY,
  RECEIPT_FOOTER_MESSAGE_KEY,
  RECEIPT_SHOW_PAYMENT_METHOD_KEY,
} from '@/lib/constants';
import { upsertStoreSettings } from '@/lib/storeSettings';

const DEFAULTS = {
  [RECEIPT_SHOW_LOGO_KEY]: 'true',
  [RECEIPT_SHOW_ADDRESS_KEY]: 'true',
  [RECEIPT_SHOW_PHONE_KEY]: 'true',
  [RECEIPT_FOOTER_MESSAGE_KEY]: 'ขอบคุณที่ใช้บริการ',
  [RECEIPT_SHOW_PAYMENT_METHOD_KEY]: 'true',
};

type Settings = typeof DEFAULTS;

export default function ReceiptPrintSettings() {
  const [settings, setSettings] = useState<Settings>({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('store_settings')
        .select('key, value')
        .in('key', Object.keys(DEFAULTS));
      if (data) {
        const map: Partial<Settings> = {};
        data.forEach((row: { key: string; value: string | null }) => {
          (map as Record<string, string>)[row.key] =
            row.value ?? (DEFAULTS as Record<string, string>)[row.key];
        });
        setSettings((prev) => ({ ...prev, ...map }));
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      await upsertStoreSettings(supabase, settings);
      toast.success('บันทึกการตั้งค่าใบเสร็จสำเร็จ');
    } catch {
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: keyof Settings) =>
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === 'true' ? 'false' : 'true',
    }));

  if (loading)
    return <div className='h-40 bg-gray-100 rounded-xl animate-pulse' />;

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6'>
      <h3 className='text-lg font-bold text-gray-800 mb-1'>ตั้งค่าใบเสร็จ</h3>
      <p className='text-sm text-gray-500 mb-5'>
        กำหนดข้อมูลที่แสดงบนใบเสร็จและสลิปการขาย
      </p>

      <div className='flex flex-col sm:flex-row gap-6'>
        {/* Controls */}
        <div className='flex-1 space-y-4'>
          <ToggleRow
            label='แสดงโลโก้ร้าน'
            checked={settings[RECEIPT_SHOW_LOGO_KEY] === 'true'}
            onChange={() => toggle(RECEIPT_SHOW_LOGO_KEY)}
          />
          <ToggleRow
            label='แสดงที่อยู่ร้าน'
            checked={settings[RECEIPT_SHOW_ADDRESS_KEY] === 'true'}
            onChange={() => toggle(RECEIPT_SHOW_ADDRESS_KEY)}
          />
          <ToggleRow
            label='แสดงเบอร์โทรศัพท์'
            checked={settings[RECEIPT_SHOW_PHONE_KEY] === 'true'}
            onChange={() => toggle(RECEIPT_SHOW_PHONE_KEY)}
          />
          <ToggleRow
            label='แสดงช่องทางชำระเงิน'
            checked={settings[RECEIPT_SHOW_PAYMENT_METHOD_KEY] === 'true'}
            onChange={() => toggle(RECEIPT_SHOW_PAYMENT_METHOD_KEY)}
          />

          <div>
            <label className='text-sm font-medium text-gray-700 block mb-1'>
              ข้อความท้ายใบเสร็จ
            </label>
            <input
              type='text'
              value={settings[RECEIPT_FOOTER_MESSAGE_KEY]}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  [RECEIPT_FOOTER_MESSAGE_KEY]: e.target.value,
                }))
              }
              placeholder='เช่น ขอบคุณที่ใช้บริการ'
              className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className='pos-btn-primary px-6 py-2 text-sm disabled:opacity-50'
          >
            {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
          </button>
        </div>

        {/* Receipt preview */}
        <div className='sm:w-56'>
          <p className='text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wide'>
            ตัวอย่างใบเสร็จ
          </p>
          <div className='border border-dashed border-gray-300 rounded-lg p-3 text-center text-xs space-y-1 font-mono bg-gray-50'>
            {settings[RECEIPT_SHOW_LOGO_KEY] === 'true' && (
              <div className='w-8 h-8 bg-gray-200 rounded-full mx-auto mb-1 flex items-center justify-center text-lg'>
                🏪
              </div>
            )}
            <p className='font-bold text-sm'>LookKuan</p>
            {settings[RECEIPT_SHOW_ADDRESS_KEY] === 'true' && (
              <p className='text-gray-500'>123 ถ.สุขุมวิท กรุงเทพฯ</p>
            )}
            {settings[RECEIPT_SHOW_PHONE_KEY] === 'true' && (
              <p className='text-gray-500'>Tel: 02-000-0000</p>
            )}
            <div className='border-t border-dashed border-gray-300 my-1' />
            <div className='flex justify-between text-left'>
              <span>เสื้อปักชื่อ</span>
              <span>฿250</span>
            </div>
            <div className='flex justify-between font-bold'>
              <span>รวม</span>
              <span>฿250</span>
            </div>
            {settings[RECEIPT_SHOW_PAYMENT_METHOD_KEY] === 'true' && (
              <p className='text-gray-500'>ชำระ: เงินสด</p>
            )}
            {settings[RECEIPT_FOOTER_MESSAGE_KEY] && (
              <>
                <div className='border-t border-dashed border-gray-300 my-1' />
                <p className='text-gray-500'>
                  {settings[RECEIPT_FOOTER_MESSAGE_KEY]}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className='flex items-center justify-between cursor-pointer'>
      <span className='text-sm text-gray-700'>{label}</span>
      <button
        type='button'
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-brand-500' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  );
}
