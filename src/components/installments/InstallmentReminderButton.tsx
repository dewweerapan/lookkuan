'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { STORE_NAME } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

interface Props {
  planNumber: string;
  customerName: string;
  customerPhone: string;
  nextDueDate: string | null;
  nextDueAmount: number | null;
  overduePending: number;
}

export default function InstallmentReminderButton({
  planNumber,
  customerName,
  customerPhone,
  nextDueDate,
  nextDueAmount,
  overduePending,
}: Props) {
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);

    const prefix = `[${STORE_NAME}]`;
    const customerInfo =
      `ลูกค้า: ${customerName} (${customerPhone})\n` + `แผนผ่อน: ${planNumber}\n`;

    const message =
      overduePending > 0
        ? `${prefix} แจ้งเตือนค้างชำระ\n` +
          customerInfo +
          `ค้างชำระ: ${overduePending} งวด\n` +
          `กรุณาชำระโดยด่วน`
        : `${prefix} แจ้งเตือนครบกำหนด\n` +
          customerInfo +
          (nextDueDate ? `งวดถัดไป: ${nextDueDate}` : '') +
          (nextDueAmount ? ` จำนวน ${formatCurrency(nextDueAmount)}` : '');

    try {
      const res = await fetch('/api/notifications/line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (res.ok) {
        toast.success('ส่งแจ้งเตือน Line สำเร็จ');
      } else if (res.status === 422) {
        toast.error('ยังไม่ได้ตั้งค่า Line Notify Token (ตั้งค่า → การแจ้งเตือน)');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'ส่งแจ้งเตือนไม่สำเร็จ');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={sending}
      className='w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-green-300 dark:border-green-800 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/50 hover:bg-green-100 dark:hover:bg-green-900/50 font-medium transition-colors disabled:opacity-50'
    >
      <span className='text-lg'>💬</span>
      <span>{sending ? 'กำลังส่ง...' : 'ส่งแจ้งเตือน Line'}</span>
    </button>
  );
}
