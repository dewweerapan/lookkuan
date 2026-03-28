'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { generatePromptPayPayload } from '@/lib/promptpay';
import { formatCurrency } from '@/lib/utils';

interface Props {
  phone: string;
  amount: number;
  storeName?: string;
}

export default function PromptPayQR({ phone, amount, storeName }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!phone) return;
    const payload = generatePromptPayPayload(phone, amount);
    QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch(console.error);
  }, [phone, amount]);

  if (!phone) {
    return (
      <div className='text-center py-4 text-gray-400 text-sm'>
        ยังไม่ได้ตั้งค่าเบอร์พร้อมเพย์ (NEXT_PUBLIC_STORE_PHONE)
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center gap-3 py-2'>
      {qrDataUrl ? (
        <img
          src={qrDataUrl}
          alt='PromptPay QR'
          className='w-52 h-52 rounded-xl border border-gray-200'
        />
      ) : (
        <div className='w-52 h-52 bg-gray-100 rounded-xl flex items-center justify-center animate-pulse'>
          <span className='text-gray-400 text-sm'>กำลังสร้าง QR...</span>
        </div>
      )}
      <div className='text-center'>
        <p className='text-sm text-gray-500'>พร้อมเพย์: {phone}</p>
        {storeName && (
          <p className='text-sm text-gray-600 font-semibold'>{storeName}</p>
        )}
        <p className='text-2xl font-bold text-brand-600 mt-1'>
          {formatCurrency(amount)}
        </p>
      </div>
    </div>
  );
}
