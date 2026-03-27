import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS, type JobStatus } from '@/lib/constants'
import { notFound } from 'next/navigation'

async function getJobByOrderNumber(orderNumber: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('job_orders')
    .select('order_number, customer_name, status, description, garment_type, quantity, quoted_price, deposit_amount, balance_due, estimated_completion_date, actual_completion_date, created_at')
    .eq('order_number', orderNumber)
    .single()
  return data
}

export default async function TrackOrderPage({ params }: { params: { orderNumber: string } }) {
  const job = await getJobByOrderNumber(params.orderNumber)

  if (!job) {
    notFound()
  }

  const statusSteps = ['pending', 'in_progress', 'completed', 'delivered']
  const currentIndex = statusSteps.indexOf(job.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-orange-100 p-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6 pt-8">
          <h1 className="text-2xl font-bold text-gray-800">LookKuan</h1>
          <p className="text-gray-500">ตรวจสอบสถานะงานปัก</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          {/* Order Number */}
          <div className="text-center">
            <p className="text-sm text-gray-500">เลขที่งาน</p>
            <p className="text-xl font-mono font-bold text-gray-800">{job.order_number}</p>
          </div>

          {/* Status Badge */}
          <div className="text-center">
            <span className={`status-badge text-lg px-6 py-2 ${JOB_STATUS_COLORS[job.status as JobStatus]}`}>
              {JOB_STATUS_LABELS[job.status as JobStatus]}
            </span>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between px-4">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  i <= currentIndex
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {i <= currentIndex ? '✓' : i + 1}
                </div>
                {i < statusSteps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-1 mx-1 ${
                    i < currentIndex ? 'bg-brand-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2 text-xs text-gray-500">
            <span>รอดำเนินการ</span>
            <span>กำลังปัก</span>
            <span>เสร็จแล้ว</span>
            <span>ส่งมอบ</span>
          </div>

          {/* Details */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div>
              <span className="text-sm text-gray-500">ชื่อลูกค้า</span>
              <p className="font-semibold text-lg">{job.customer_name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">รายละเอียดงาน</span>
              <p className="text-base">{job.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">ประเภท</span>
                <p className="font-medium">{job.garment_type} × {job.quantity}</p>
              </div>
              {job.estimated_completion_date && (
                <div>
                  <span className="text-sm text-gray-500">กำหนดเสร็จ</span>
                  <p className="font-medium">{formatDate(job.estimated_completion_date)}</p>
                </div>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">ราคา</span>
                <span className="font-semibold">{formatCurrency(job.quoted_price)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">มัดจำ</span>
                <span className="text-green-600 font-semibold">{formatCurrency(job.deposit_amount)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between">
                <span className="font-bold">ค้างชำระ</span>
                <span className={`font-bold text-lg ${job.balance_due > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatCurrency(job.balance_due)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          LookKuan © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
