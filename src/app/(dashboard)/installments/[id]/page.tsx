import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import PageHeader from '@/components/shared/PageHeader'
import InstallmentPaymentActions from '@/components/installments/InstallmentPaymentActions'

const STATUS_LABELS: Record<string, string> = {
  active: 'กำลังผ่อน',
  completed: 'ชำระครบ',
  overdue: 'เกินกำหนด',
  cancelled: 'ยกเลิก',
}
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

async function getInstallmentPlan(id: string) {
  const supabase = await createClient()

  const { data: plan, error } = await supabase
    .from('installment_plans')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !plan) return null

  const { data: payments } = await supabase
    .from('installment_payments')
    .select('*')
    .eq('plan_id', id)
    .order('installment_number', { ascending: true })

  return { ...plan, payments: payments || [] }
}

export default async function InstallmentDetailPage({ params }: { params: { id: string } }) {
  const plan = await getInstallmentPlan(params.id)
  if (!plan) notFound()

  const paidCount = plan.payments.filter((p: any) => p.status === 'paid').length
  const totalPaid = plan.payments.filter((p: any) => p.status === 'paid')
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <PageHeader
        title={`แผนผ่อน ${plan.plan_number}`}
        backHref="/installments"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Schedule */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">ตารางผ่อนชำระ</h2>
              <span className="text-sm text-gray-500">{paidCount}/{plan.num_installments} งวด</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${plan.num_installments > 0 ? (paidCount / plan.num_installments) * 100 : 0}%` }}
              />
            </div>
            <div className="space-y-2">
              {plan.payments.map((payment: any) => {
                const isOverdue = payment.status === 'pending' && payment.due_date < today
                return (
                  <div
                    key={payment.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      payment.status === 'paid' ? 'bg-green-50 border-green-200' :
                      isOverdue ? 'bg-red-50 border-red-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      payment.status === 'paid' ? 'bg-green-500 text-white' :
                      isOverdue ? 'bg-red-500 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {payment.status === 'paid' ? '✓' : payment.installment_number}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">งวดที่ {payment.installment_number}</p>
                      <p className={`text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                        {isOverdue ? '⏰ เกินกำหนด: ' : 'ครบกำหนด: '}{formatDate(payment.due_date)}
                      </p>
                      {payment.paid_at && (
                        <p className="text-xs text-green-600">ชำระเมื่อ: {formatDateTime(payment.paid_at)}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(payment.amount)}</p>
                      {payment.status === 'pending' && plan.status !== 'completed' && plan.status !== 'cancelled' && (
                        <InstallmentPaymentActions paymentId={payment.id} planId={plan.id} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Plan Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">👤 ข้อมูลลูกค้า</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">ชื่อ</span>
                <p className="font-bold text-lg">{plan.customer_name}</p>
              </div>
              {plan.customer_phone && (
                <div>
                  <span className="text-sm text-gray-500">เบอร์โทร</span>
                  <p className="font-semibold">
                    <a href={`tel:${plan.customer_phone}`} className="text-brand-600 hover:underline">
                      {plan.customer_phone}
                    </a>
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-500">รายการ</span>
                <p className="text-gray-700">{plan.description}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">สถานะ</span>
                <div className="mt-1">
                  <span className={`text-sm px-3 py-1 rounded-full font-semibold ${STATUS_COLORS[plan.status]}`}>
                    {STATUS_LABELS[plan.status]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">💰 สรุปการเงิน</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">ยอดรวม</span>
                <span className="font-bold">{formatCurrency(plan.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">เงินดาวน์</span>
                <span className="font-semibold text-green-600">{formatCurrency(plan.down_payment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ชำระงวดแล้ว</span>
                <span className="font-semibold text-green-600">{formatCurrency(totalPaid)}</span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="font-bold">คงเหลือ</span>
                <span className={`font-bold text-xl ${Number(plan.balance_amount) - totalPaid > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatCurrency(Math.max(0, Number(plan.balance_amount) - totalPaid))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
