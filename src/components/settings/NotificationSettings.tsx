'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import {
  LINE_NOTIFY_TOKEN_KEY,
  NOTIFY_LOW_STOCK_KEY,
  NOTIFY_NEW_ORDER_KEY,
  NOTIFY_INSTALLMENT_DUE_KEY,
} from '@/lib/constants';
import { upsertStoreSettings, getStoreSettings } from '@/lib/storeSettings';
import { useMounted } from '@/hooks/useMounted';

const SETTINGS_KEYS = [
  LINE_NOTIFY_TOKEN_KEY,
  NOTIFY_LOW_STOCK_KEY,
  NOTIFY_NEW_ORDER_KEY,
  NOTIFY_INSTALLMENT_DUE_KEY,
];

export default function NotificationSettings() {
  const supabaseRef = useRef(createClient());
  const [token, setToken] = useState('');
  const [notifyLowStock, setNotifyLowStock] = useState(false);
  const [notifyNewOrder, setNotifyNewOrder] = useState(false);
  const [notifyInstallment, setNotifyInstallment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const mounted = useMounted();

  useEffect(() => {
    getStoreSettings(supabaseRef.current, SETTINGS_KEYS)
      .then((map) => {
        if (!mounted.current) return;
        setToken(map[LINE_NOTIFY_TOKEN_KEY] ?? '');
        setNotifyLowStock(map[NOTIFY_LOW_STOCK_KEY] === 'true');
        setNotifyNewOrder(map[NOTIFY_NEW_ORDER_KEY] === 'true');
        setNotifyInstallment(map[NOTIFY_INSTALLMENT_DUE_KEY] === 'true');
        setLoading(false);
      })
      .catch(() => {
        if (!mounted.current) return;
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await upsertStoreSettings(supabaseRef.current, {
      [LINE_NOTIFY_TOKEN_KEY]: token.trim() || null,
      [NOTIFY_LOW_STOCK_KEY]: String(notifyLowStock),
      [NOTIFY_NEW_ORDER_KEY]: String(notifyNewOrder),
      [NOTIFY_INSTALLMENT_DUE_KEY]: String(notifyInstallment),
    });
    setSaving(false);
    if (error) {
      toast.error('บันทึกไม่สำเร็จ');
    } else {
      toast.success('บันทึกการตั้งค่าการแจ้งเตือนแล้ว');
    }
  };

  const handleTest = async () => {
    setTesting(true);
    const res = await fetch('/api/notifications/line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'LookKuan: ทดสอบการแจ้งเตือน Line Notify ✅',
      }),
    });
    setTesting(false);
    if (res.ok) {
      toast.success('ส่ง Line Notify สำเร็จ');
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || 'ส่งไม่สำเร็จ');
    }
  };

  if (loading) return null;

  return (
    <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6'>
      <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100 mb-1'>
        🔔 การแจ้งเตือน
      </h2>
      <p className='text-sm text-gray-500 dark:text-gray-400 mb-6'>
        ตั้งค่าการแจ้งเตือนผ่าน Line Notify
      </p>

      <div className='mb-5'>
        <label className='pos-label'>Line Notify Token</label>
        <div className='flex gap-2'>
          <div className='relative flex-1'>
            <input
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder='เพิ่ม token จาก notify-bot.line.me'
              className='pos-input pr-12'
            />
            <button
              type='button'
              onClick={() => setShowToken((v) => !v)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm'
            >
              {showToken ? '🙈' : '👁️'}
            </button>
          </div>
          <button
            onClick={handleTest}
            disabled={!token.trim() || testing}
            className='pos-btn-secondary text-sm min-h-0 py-3 px-4 whitespace-nowrap'
          >
            {testing ? 'กำลังส่ง...' : 'ทดสอบ'}
          </button>
        </div>
        <p className='text-xs text-gray-400 mt-1.5'>
          สมัครได้ที่{' '}
          <span className='font-mono text-brand-600'>notify-bot.line.me</span> →
          Token สำหรับตัวเอง
        </p>
      </div>

      {/* Event toggles */}
      <div className='space-y-3 mb-6'>
        <p className='text-sm font-semibold text-gray-600 dark:text-gray-400'>
          แจ้งเตือนเมื่อ
        </p>

        {[
          {
            label: 'สต็อกสินค้าใกล้หมด',
            value: notifyLowStock,
            set: setNotifyLowStock,
          },
          {
            label: 'มีออเดอร์งานปักใหม่',
            value: notifyNewOrder,
            set: setNotifyNewOrder,
          },
          {
            label: 'งวดผ่อนชำระครบกำหนด',
            value: notifyInstallment,
            set: setNotifyInstallment,
          },
        ].map(({ label, value, set }) => (
          <label key={label} className='flex items-center gap-3 cursor-pointer'>
            <button
              role='switch'
              aria-checked={value}
              onClick={() => set((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                value ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  value ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className='text-base text-gray-700 dark:text-gray-300'>
              {label}
            </span>
          </label>
        ))}
      </div>

      {!token && (
        <div className='flex items-center gap-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-3 text-sm text-amber-700 dark:text-amber-400 mb-4'>
          <span>⚠️</span>
          <span>กรุณากรอก Line Notify Token ก่อนเปิดใช้งานการแจ้งเตือน</span>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className='pos-btn-primary w-full'
      >
        {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
      </button>
    </div>
  );
}
