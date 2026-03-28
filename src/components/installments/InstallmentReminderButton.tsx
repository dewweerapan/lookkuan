'use client';

import { useState } from 'react';
import { toast } from 'sonner';

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

    let message: string;
    if (overduePending > 0) {
      message =
        `[LookKuan] แจ้งเตือนค้างชำระ\n` +
        `ลูกค้า: ${customerName} (${customerPhone})\n` +
        `แผนผ่อน: ${planNumber}\n` +
        `ค้างชำระ: ${overduePending} งวด\n` +
        `กรุณาชำระโดยด่วน`;
    } else {
      message =
        `[LookKuan] แจ้งเตือนครบกำหนด\n` +
        `ลูกค้า: ${customerName} (${customerPhone})\n` +
        `แผนผ่อน: ${planNumber}\n` +
        (nextDueDate ? `งวดถัดไป: ${nextDueDate}` : '') +
        (nextDueAmount
          ? ` จำนวน ฿${nextDueAmount.toLocaleString('th-TH')}`
          : '');
    }

    const res = await fetch('/api/notifications/line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    setSending(false);

    if (res.ok) {
      toast.success('ส่งแจ้งเตือน Line สำเร็จ');
    } else {
      const data = await res.json().catch(() => ({}));
      if (data.error?.includes('not configured')) {
        toast.error(
          'ยังไม่ได้ตั้งค่า Line Notify Token (ตั้งค่า → การแจ้งเตือน)',
        );
      } else {
        toast.error(data.error || 'ส่งแจ้งเตือนไม่สำเร็จ');
      }
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
