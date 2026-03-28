import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import PageHeader from '@/components/shared/PageHeader';
import InstallmentsListClient from '@/components/installments/InstallmentsListClient';

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

      {/* Filtered list with tabs */}
      <InstallmentsListClient plans={plans} />
    </div>
  );
}
