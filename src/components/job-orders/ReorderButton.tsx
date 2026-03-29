'use client';

import { useRouter } from 'next/navigation';
import type { JobOrder } from '@/types/database';

export default function ReorderButton({ job }: { job: JobOrder }) {
  const router = useRouter();

  if (job.status === 'cancelled') return null;

  const handleReorder = () => {
    const params = new URLSearchParams({
      from: job.order_number,
      customer_name: job.customer_name ?? '',
      customer_phone: job.customer_phone ?? '',
      garment_type: job.garment_type ?? '',
      description: job.description ?? '',
      quantity: String(job.quantity ?? 1),
      quoted_price: String(job.quoted_price ?? ''),
      deposit_amount: String(job.deposit_amount ?? ''),
    });
    router.push(`/job-orders/new?${params.toString()}`);
  };

  return (
    <button
      onClick={handleReorder}
      className='pos-btn text-base px-5 py-3 rounded-xl bg-white text-brand-600 border border-brand-400 hover:bg-brand-50 transition-colors'
    >
      ↺ สั่งซ้ำ
    </button>
  );
}
