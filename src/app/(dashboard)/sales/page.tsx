import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import PageHeader from '@/components/shared/PageHeader';
import SalesRefundButton from '@/components/sales/SalesRefundButton';
import SalesPagination from '@/components/sales/SalesPagination';

const PAGE_SIZE = 50;

interface SaleRow {
  id: string;
  sale_number: string;
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
  cashier: { full_name: string } | null;
}

async function getSales(page: number) {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from('sales')
    .select(
      'id, sale_number, total, payment_method, status, created_at, cashier:profiles!cashier_id(full_name)',
      { count: 'exact' },
    )
    .neq('status', 'voided')
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { sales: data || [], totalCount: count ?? 0 };
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: '💵 เงินสด',
  transfer: '🏦 โอนเงิน',
  promptpay: '📱 พร้อมเพย์',
  credit_card: '💳 บัตรเครดิต',
};

export default async function SalesHistoryPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = Math.max(1, Number(searchParams?.page ?? 1));
  const { sales, totalCount } = await getSales(currentPage);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      <PageHeader title='ประวัติการขาย' description='รายการขาย 30 วันล่าสุด' />

      {/* Mobile Cards */}
      <div className='block sm:hidden space-y-3'>
        {(sales as unknown as SaleRow[]).map((sale) => (
          <div
            key={sale.id}
            className='bg-white rounded-xl border border-gray-200 p-4'
          >
            <div className='flex items-start justify-between mb-2'>
              <div>
                <span className='text-xs font-mono text-gray-400'>
                  {sale.sale_number}
                </span>
                <p className='text-sm text-gray-600'>
                  {sale.cashier?.full_name || '-'}
                </p>
              </div>
              <span className='font-bold text-brand-600 text-lg'>
                {formatCurrency(sale.total)}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-500'>
                {PAYMENT_LABELS[sale.payment_method] || sale.payment_method}
              </span>
              <span className='text-xs text-gray-400'>
                {formatDateTime(sale.created_at)}
              </span>
            </div>
            {sale.status === 'completed' && (
              <div className='mt-3 pt-3 border-t border-gray-100'>
                <SalesRefundButton
                  saleId={sale.id}
                  saleNumber={sale.sale_number}
                  total={sale.total}
                />
              </div>
            )}
            {sale.status === 'refunded' && (
              <div className='mt-2'>
                <span className='text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full'>
                  คืนแล้ว
                </span>
              </div>
            )}
          </div>
        ))}
        {sales.length === 0 && (
          <div className='text-center py-12 text-gray-400'>
            <p className='text-4xl mb-2'>🧾</p>
            <p>ไม่มีรายการขาย</p>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className='hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <table className='data-table'>
          <thead>
            <tr>
              <th>เลขที่บิล</th>
              <th>แคชเชียร์</th>
              <th>ช่องทางชำระ</th>
              <th className='text-right'>ยอดรวม</th>
              <th>วันเวลา</th>
              <th>สถานะ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(sales as unknown as SaleRow[]).map((sale) => (
              <tr key={sale.id}>
                <td className='font-mono text-sm'>{sale.sale_number}</td>
                <td>{sale.cashier?.full_name || '-'}</td>
                <td>
                  {PAYMENT_LABELS[sale.payment_method] || sale.payment_method}
                </td>
                <td className='text-right font-semibold'>
                  {formatCurrency(sale.total)}
                </td>
                <td className='text-sm text-gray-500'>
                  {formatDateTime(sale.created_at)}
                </td>
                <td>
                  {sale.status === 'refunded' && (
                    <span className='text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold'>
                      คืนแล้ว
                    </span>
                  )}
                  {sale.status === 'completed' && (
                    <span className='text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold'>
                      สำเร็จ
                    </span>
                  )}
                </td>
                <td>
                  {sale.status === 'completed' && (
                    <SalesRefundButton
                      saleId={sale.id}
                      saleNumber={sale.sale_number}
                      total={sale.total}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sales.length === 0 && (
          <div className='text-center py-12 text-gray-400'>
            <p className='text-4xl mb-2'>🧾</p>
            <p className='text-lg'>ไม่มีรายการขาย</p>
          </div>
        )}
      </div>

      <SalesPagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
