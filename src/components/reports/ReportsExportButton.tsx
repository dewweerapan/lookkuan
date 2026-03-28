'use client';

import { exportToCSV } from '@/lib/export';

interface Props {
  topProductsList: [string, { quantity: number; revenue: number }][];
  paymentBreakdown: Record<string, { count: number; total: number }>;
}

export default function ReportsExportButton({
  topProductsList,
  paymentBreakdown,
}: Props) {
  const handleExport = () => {
    const rows = topProductsList.map(([name, stats]) => ({
      สินค้า: name,
      จำนวน: stats.quantity,
      รายได้: stats.revenue,
    }));
    exportToCSV('top-products', rows);
  };

  return (
    <button
      onClick={handleExport}
      className='pos-btn-secondary text-sm px-4 py-2'
    >
      📥 Export สินค้าขายดี
    </button>
  );
}
