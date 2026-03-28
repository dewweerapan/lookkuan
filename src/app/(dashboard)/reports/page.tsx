import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import PageHeader from '@/components/shared/PageHeader';
import ReportsExportButton from '@/components/reports/ReportsExportButton';

async function getReportData() {
  const supabase = await createClient();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const startOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  ).toISOString();
  const startOfWeek = new Date(
    today.setDate(today.getDate() - today.getDay()),
  ).toISOString();

  const [
    { data: monthlySales },
    { data: weeklySales },
    { data: topProducts },
    { data: jobStats },
    { data: overduePayments },
    { data: staffSales },
  ] = await Promise.all([
    supabase
      .from('sales')
      .select('total, payment_method, created_at')
      .eq('status', 'completed')
      .gte('created_at', startOfMonth),
    supabase
      .from('sales')
      .select('total, created_at')
      .eq('status', 'completed')
      .gte('created_at', startOfWeek),
    supabase
      .from('sale_items')
      .select('product_name, quantity, subtotal')
      .gte('created_at', startOfMonth)
      .order('quantity', { ascending: false })
      .limit(10),
    supabase
      .from('job_orders')
      .select('status, quoted_price')
      .gte('created_at', startOfMonth),
    supabase
      .from('installment_payments')
      .select('id, installment_number, due_date, amount, plan_id, plan:installment_plans(plan_number, customer_name)')
      .eq('status', 'pending')
      .lt('due_date', todayStr)
      .order('due_date', { ascending: true })
      .limit(20),
    supabase
      .from('sales')
      .select('total, cashier_id, cashier:profiles!cashier_id(full_name, role)')
      .eq('status', 'completed')
      .gte('created_at', startOfMonth),
  ]);

  const monthlyTotal =
    monthlySales?.reduce((s, sale) => s + Number(sale.total), 0) || 0;
  const weeklyTotal =
    weeklySales?.reduce((s, sale) => s + Number(sale.total), 0) || 0;
  const monthlyCount = monthlySales?.length || 0;

  // Payment method breakdown
  const paymentBreakdown: Record<string, { count: number; total: number }> = {};
  monthlySales?.forEach((sale) => {
    if (!paymentBreakdown[sale.payment_method]) {
      paymentBreakdown[sale.payment_method] = { count: 0, total: 0 };
    }
    paymentBreakdown[sale.payment_method].count++;
    paymentBreakdown[sale.payment_method].total += Number(sale.total);
  });

  const paymentLabels: Record<string, string> = {
    cash: '💵 เงินสด',
    transfer: '🏦 โอนเงิน',
    promptpay: '📱 พร้อมเพย์',
    credit_card: '💳 บัตรเครดิต',
  };

  // Job order stats
  const jobCompleted =
    jobStats?.filter((j) => j.status === 'delivered').length || 0;
  const jobRevenue =
    jobStats
      ?.filter((j) => j.status === 'delivered')
      .reduce((s, j) => s + Number(j.quoted_price), 0) || 0;
  const jobPending =
    jobStats?.filter((j) => ['pending', 'in_progress'].includes(j.status))
      .length || 0;

  // Aggregate top products
  const productMap = new Map<string, { quantity: number; revenue: number }>();
  topProducts?.forEach((item) => {
    const existing = productMap.get(item.product_name) || {
      quantity: 0,
      revenue: 0,
    };
    productMap.set(item.product_name, {
      quantity: existing.quantity + item.quantity,
      revenue: existing.revenue + Number(item.subtotal),
    });
  });
  const topProductsList = Array.from(productMap.entries())
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 10);

  // Staff performance: aggregate by cashier
  const staffMap = new Map<string, { name: string; count: number; total: number }>();
  staffSales?.forEach((sale: any) => {
    const id = sale.cashier_id as string;
    const name = (sale.cashier as any)?.full_name || 'ไม่ทราบ';
    const existing = staffMap.get(id) || { name, count: 0, total: 0 };
    staffMap.set(id, {
      name,
      count: existing.count + 1,
      total: existing.total + Number(sale.total),
    });
  });
  const staffPerformance = Array.from(staffMap.values())
    .sort((a, b) => b.total - a.total);

  return {
    monthlyTotal,
    weeklyTotal,
    monthlyCount,
    paymentBreakdown,
    paymentLabels,
    jobCompleted,
    jobRevenue,
    jobPending,
    topProductsList,
    overduePayments: overduePayments || [],
    staffPerformance,
  };
}

export default async function ReportsPage() {
  const data = await getReportData();

  return (
    <div>
      <PageHeader
        title='รายงาน'
        description='สรุปข้อมูลเดือนนี้'
        actions={
          <ReportsExportButton
            topProductsList={data.topProductsList}
            paymentBreakdown={data.paymentBreakdown}
          />
        }
      />

      {/* Monthly Summary */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <div className='stat-card'>
          <p className='text-sm text-gray-500'>ยอดขายเดือนนี้</p>
          <p className='text-2xl font-bold text-green-700'>
            {formatCurrency(data.monthlyTotal)}
          </p>
          <p className='text-sm text-gray-400'>{data.monthlyCount} รายการ</p>
        </div>
        <div className='stat-card'>
          <p className='text-sm text-gray-500'>ยอดขายสัปดาห์นี้</p>
          <p className='text-2xl font-bold text-blue-700'>
            {formatCurrency(data.weeklyTotal)}
          </p>
        </div>
        <div className='stat-card'>
          <p className='text-sm text-gray-500'>งานปักที่ส่งมอบ</p>
          <p className='text-2xl font-bold text-purple-700'>
            {data.jobCompleted} งาน
          </p>
          <p className='text-sm text-gray-400'>
            รายได้ {formatCurrency(data.jobRevenue)}
          </p>
        </div>
        <div className='stat-card'>
          <p className='text-sm text-gray-500'>งานปักค้างอยู่</p>
          <p className='text-2xl font-bold text-orange-700'>
            {data.jobPending} งาน
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Payment Breakdown */}
        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <h2 className='text-lg font-bold text-gray-800 mb-4'>
            ช่องทางชำระเงิน
          </h2>
          <div className='space-y-3'>
            {Object.entries(data.paymentBreakdown).map(([method, stats]) => (
              <div
                key={method}
                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
              >
                <span className='text-base font-medium'>
                  {data.paymentLabels[method] || method}
                </span>
                <div className='text-right'>
                  <p className='font-bold text-gray-800'>
                    {formatCurrency(stats.total)}
                  </p>
                  <p className='text-sm text-gray-500'>{stats.count} รายการ</p>
                </div>
              </div>
            ))}
            {Object.keys(data.paymentBreakdown).length === 0 && (
              <p className='text-gray-400 text-center py-4'>ไม่มีข้อมูล</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <h2 className='text-lg font-bold text-gray-800 mb-4'>
            🏆 สินค้าขายดี
          </h2>
          <div className='space-y-3'>
            {data.topProductsList.map(([name, stats], i) => (
              <div
                key={name}
                className='flex items-center gap-4 p-3 bg-gray-50 rounded-lg'
              >
                <span className='text-lg font-bold text-gray-400 w-8'>
                  #{i + 1}
                </span>
                <div className='flex-1'>
                  <p className='font-semibold text-gray-800'>{name}</p>
                  <p className='text-sm text-gray-500'>{stats.quantity} ชิ้น</p>
                </div>
                <span className='font-bold text-brand-600'>
                  {formatCurrency(stats.revenue)}
                </span>
              </div>
            ))}
            {data.topProductsList.length === 0 && (
              <p className='text-gray-400 text-center py-4'>ไม่มีข้อมูล</p>
            )}
          </div>
        </div>
      </div>

      {/* Staff Performance */}
      <div className='mt-6 bg-white rounded-xl border border-gray-200 p-6'>
        <h2 className='text-lg font-bold text-gray-800 mb-4'>👩‍💼 ประสิทธิภาพพนักงานเดือนนี้</h2>
        {data.staffPerformance.length === 0 ? (
          <p className='text-gray-400 text-center py-4'>ไม่มีข้อมูล</p>
        ) : (
          <>
            {/* Mobile cards */}
            <div className='block sm:hidden space-y-3'>
              {data.staffPerformance.map((staff, i) => (
                <div key={i} className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                  <span className='text-lg font-bold text-gray-300 w-8'>#{i + 1}</span>
                  <div className='flex-1'>
                    <p className='font-semibold text-gray-800'>{staff.name}</p>
                    <p className='text-sm text-gray-500'>{staff.count} บิล · เฉลี่ย {formatCurrency(staff.count > 0 ? staff.total / staff.count : 0)}/บิล</p>
                  </div>
                  <p className='font-bold text-green-700'>{formatCurrency(staff.total)}</p>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className='hidden sm:block overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-gray-200'>
                    <th className='text-left py-2 px-3 font-semibold text-gray-600'>พนักงาน</th>
                    <th className='text-right py-2 px-3 font-semibold text-gray-600'>จำนวนบิล</th>
                    <th className='text-right py-2 px-3 font-semibold text-gray-600'>ยอดรวม</th>
                    <th className='text-right py-2 px-3 font-semibold text-gray-600'>เฉลี่ย/บิล</th>
                  </tr>
                </thead>
                <tbody>
                  {data.staffPerformance.map((staff, i) => (
                    <tr key={i} className='border-b border-gray-100 hover:bg-gray-50'>
                      <td className='py-2 px-3 font-medium text-gray-800'>{staff.name}</td>
                      <td className='py-2 px-3 text-right text-gray-600'>{staff.count} บิล</td>
                      <td className='py-2 px-3 text-right font-bold text-green-700'>{formatCurrency(staff.total)}</td>
                      <td className='py-2 px-3 text-right text-gray-500'>{formatCurrency(staff.count > 0 ? staff.total / staff.count : 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Overdue Installments */}
      <div className='mt-6 bg-white rounded-xl border border-red-200 p-6'>
        <h2 className='text-lg font-bold text-red-700 mb-1'>⚠️ งวดผ่อนชำระค้างชำระ</h2>
        <p className='text-sm text-gray-500 mb-4'>งวดที่ครบกำหนดแล้วแต่ยังไม่ได้รับชำระ</p>
        {data.overduePayments.length === 0 ? (
          <p className='text-green-600 text-center py-4 font-medium'>✓ ไม่มีงวดค้างชำระ</p>
        ) : (
          <>
            {/* Mobile cards */}
            <div className='block sm:hidden space-y-3'>
              {data.overduePayments.map((p: any) => (
                <div key={p.id} className='p-3 bg-red-50 border border-red-100 rounded-lg'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='font-mono text-xs text-gray-500'>{(p.plan as any)?.plan_number} · งวด {p.installment_number}</span>
                    <span className='font-bold text-red-700'>{formatCurrency(p.amount)}</span>
                  </div>
                  <p className='font-semibold text-gray-800'>{(p.plan as any)?.customer_name}</p>
                  <p className='text-sm text-red-600'>ครบกำหนด: {formatDate(p.due_date)}</p>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className='hidden sm:block overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-gray-200'>
                    <th className='text-left py-2 px-3 font-semibold text-gray-600'>เลขแผนผ่อน</th>
                    <th className='text-left py-2 px-3 font-semibold text-gray-600'>ลูกค้า</th>
                    <th className='text-center py-2 px-3 font-semibold text-gray-600'>งวดที่</th>
                    <th className='text-center py-2 px-3 font-semibold text-gray-600'>ครบกำหนด</th>
                    <th className='text-right py-2 px-3 font-semibold text-gray-600'>ยอด</th>
                  </tr>
                </thead>
                <tbody>
                  {data.overduePayments.map((p: any) => (
                    <tr key={p.id} className='border-b border-gray-100 hover:bg-red-50'>
                      <td className='py-2 px-3 font-mono text-xs text-gray-600'>{(p.plan as any)?.plan_number}</td>
                      <td className='py-2 px-3 font-medium text-gray-800'>{(p.plan as any)?.customer_name}</td>
                      <td className='py-2 px-3 text-center text-gray-600'>{p.installment_number}</td>
                      <td className='py-2 px-3 text-center text-red-600 font-semibold'>{formatDate(p.due_date)}</td>
                      <td className='py-2 px-3 text-right font-bold text-red-700'>{formatCurrency(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
