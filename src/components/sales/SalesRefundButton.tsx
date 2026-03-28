'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  saleId: string;
  saleNumber: string;
  total: number;
}

function generateRefundNumber() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `REF${yy}${mm}${dd}-${rand}`;
}

export default function SalesRefundButton({
  saleId,
  saleNumber,
  total,
}: Props) {
  const router = useRouter();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [refundAmount, setRefundAmount] = useState(String(total));

  const handleRefund = async () => {
    if (!reason.trim()) {
      toast.error('กรุณาระบุเหตุผล');
      return;
    }
    const amount = Number(refundAmount);
    if (!amount || amount <= 0) {
      toast.error('กรุณาระบุยอดคืน');
      return;
    }
    if (amount > total) {
      toast.error('ยอดคืนเกินยอดขาย');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      // Create refund record
      const { error: refundErr } = await supabase.from('refunds').insert({
        refund_number: generateRefundNumber(),
        sale_id: saleId,
        sale_number: saleNumber,
        total_amount: amount,
        reason: reason.trim(),
        payment_method: 'cash',
        created_by: profile!.id,
      });
      if (refundErr) throw refundErr;

      // Mark sale as refunded
      const { error: saleErr } = await supabase
        .from('sales')
        .update({ status: 'refunded' })
        .eq('id', saleId);
      if (saleErr) throw saleErr;

      toast.success(`คืนสินค้าบิล ${saleNumber} สำเร็จ`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(`เกิดข้อผิดพลาด: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className='text-xs text-red-600 hover:text-red-700 font-medium border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50'
      >
        ↩ คืนสินค้า
      </button>

      {open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md p-6'>
            <h2 className='text-lg font-bold text-gray-800 mb-1'>คืนสินค้า</h2>
            <p className='text-sm text-gray-500 mb-4'>
              บิล: <span className='font-mono font-semibold'>{saleNumber}</span>{' '}
              · ยอดขาย: {formatCurrency(total)}
            </p>

            <div className='space-y-4'>
              <div>
                <label className='pos-label'>ยอดคืน (บาท) *</label>
                <input
                  type='number'
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className='pos-input'
                  max={total}
                  min='0'
                />
              </div>
              <div>
                <label className='pos-label'>เหตุผลการคืน *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className='pos-input min-h-[80px]'
                  placeholder='เช่น สินค้าชำรุด, ผิดขนาด, ลูกค้าเปลี่ยนใจ'
                />
              </div>
            </div>

            <div className='flex gap-3 mt-6'>
              <button
                onClick={() => setOpen(false)}
                className='pos-btn-secondary flex-1'
                disabled={loading}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRefund}
                className='flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50'
                disabled={loading}
              >
                {loading
                  ? '...'
                  : `↩ คืน ${formatCurrency(Number(refundAmount))}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
