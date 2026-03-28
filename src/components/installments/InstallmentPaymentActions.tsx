'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Props {
  paymentId: string;
  planId: string;
}

export default function InstallmentPaymentActions({
  paymentId,
  planId,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleMarkPaid = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('installment_payments')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', paymentId);

      if (error) throw error;

      // Check if all payments done → mark plan completed
      const { data: remaining } = await supabase
        .from('installment_payments')
        .select('id')
        .eq('plan_id', planId)
        .eq('status', 'pending');

      if (!remaining || remaining.length === 0) {
        await supabase
          .from('installment_plans')
          .update({ status: 'completed' })
          .eq('id', planId);
      }

      toast.success('บันทึกการชำระสำเร็จ');
      router.refresh();
    } catch (err: any) {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleMarkPaid}
      disabled={loading}
      className='mt-1 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full font-semibold disabled:opacity-50'
    >
      {loading ? '...' : '✓ รับชำระ'}
    </button>
  );
}
