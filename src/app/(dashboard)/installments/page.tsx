import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import PageHeader from '@/components/shared/PageHeader';

async function getInstallmentPlans() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('installment_plans')
    .select(
      'id, plan_number, customer_name, customer_phone, description, total_amount, down_payment, balance_amount, num_installments, start_date, status, created_at',
    )
    .order('created_at', { ascending: false });
  return data || [];
}

async function getStats(plans: any[]) {
  const active = plans.filter((p) => p.status === 'active').length;
  const overdue = plans.filter((p) => p.status === 'overdue').length;
  const totalBalance = plans
    .filter((p) => ['active', 'overdue'].includes(p.status))
    .reduce((sum, p) => sum + Number(p.balance_amount), 0);
  return { active, overdue, totalBalance };
}

const STATUS_LABELS: Record<string, string> = {
  active: 'กำลังผ่อน',
  completed: 'ชำระครบ',
  overdue: 'เกินกำหนด',
  cancelled: 'ยกเลิก',
};
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default async function InstallmentsPage() {
  const plans = await getInstallmentPlans();
  const stats = await getStats(plans);

  return (
    <div>
      <PageHeader
        title='ผ่อนชำระ'
        description={`แผนผ่อนชำระทั้งหมด ${plans.length} รายการ`}
        actions={
          <Link
            href='/installments/new'
            className='pos-btn-primary text-sm px-4 py-2'
          >
            ➕ สร้างแผนผ่อน
          </Link>
        }
      />

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
        <div className='stat-card'>
          <p className='text-sm text-gray-500'>กำลังผ่อน</p>
          <p className='text-2xl font-bold text-blue-600'>
            {stats.active} รายการ
          </p>
        </div>
        <div className='stat-card'>
          <p className='text-sm text-gray-500'>เกินกำหนด</p>
          <p
            className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-gray-400'}`}
          >
            {stats.overdue} รายการ
          </p>
        </div>
        <div className='stat-card'>
          <p className='text-sm text-gray-500'>ยอดคงค้างรวม</p>
          <p className='text-2xl font-bold text-orange-600'>
            {formatCurrency(stats.totalBalance)}
          </p>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className='block sm:hidden space-y-3'>
        {plans.map((p) => (
          <Link
            key={p.id}
            href={`/installments/${p.id}`}
            className='block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm'
          >
            <div className='flex items-start justify-between mb-2'>
              <div>
                <span className='text-xs font-mono text-gray-400'>
                  {p.plan_number}
                </span>
                <p className='font-bold text-gray-800'>{p.customer_name}</p>
                <p className='text-sm text-gray-500'>{p.customer_phone}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS_COLORS[p.status]}`}
              >
                {STATUS_LABELS[p.status]}
              </span>
            </div>
            <p className='text-sm text-gray-600 mb-2'>{p.description}</p>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-500'>
                ยอดรวม: {formatCurrency(p.total_amount)}
              </span>
              <span className='font-semibold text-orange-600'>
                คงเหลือ: {formatCurrency(p.balance_amount)}
              </span>
            </div>
          </Link>
        ))}
        {plans.length === 0 && (
          <div className='text-center py-12 text-gray-400'>
            <p className='text-4xl mb-2'>💳</p>
            <p>ไม่มีแผนผ่อนชำระ</p>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className='hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <table className='data-table'>
          <thead>
            <tr>
              <th>เลขที่</th>
              <th>ลูกค้า</th>
              <th>รายการ</th>
              <th>สถานะ</th>
              <th className='text-right'>ยอดรวม</th>
              <th className='text-right'>คงเหลือ</th>
              <th>เริ่มต้น</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id}>
                <td className='font-mono text-sm'>{p.plan_number}</td>
                <td>
                  <p className='font-semibold'>{p.customer_name}</p>
                  <p className='text-sm text-gray-500'>{p.customer_phone}</p>
                </td>
                <td className='max-w-[160px]'>
                  <p className='truncate text-sm'>{p.description}</p>
                  <p className='text-xs text-gray-400'>
                    {p.num_installments} งวด
                  </p>
                </td>
                <td>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS_COLORS[p.status]}`}
                  >
                    {STATUS_LABELS[p.status]}
                  </span>
                </td>
                <td className='text-right'>{formatCurrency(p.total_amount)}</td>
                <td
                  className={`text-right font-bold ${Number(p.balance_amount) > 0 ? 'text-orange-600' : 'text-green-600'}`}
                >
                  {formatCurrency(p.balance_amount)}
                </td>
                <td className='text-sm text-gray-500'>
                  {formatDate(p.start_date)}
                </td>
                <td>
                  <Link
                    href={`/installments/${p.id}`}
                    className='text-brand-600 hover:text-brand-700 font-medium text-sm'
                  >
                    ดูรายละเอียด
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {plans.length === 0 && (
          <div className='text-center py-12 text-gray-400'>
            <p className='text-4xl mb-2'>💳</p>
            <p className='text-lg'>ไม่มีแผนผ่อนชำระ</p>
          </div>
        )}
      </div>
    </div>
  );
}
