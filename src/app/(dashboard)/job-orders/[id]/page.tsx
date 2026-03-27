import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS, type JobStatus } from '@/lib/constants'
import PageHeader from '@/components/shared/PageHeader'
import JobOrderActions from '@/components/job-orders/JobOrderActions'

async function getJobOrder(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('job_orders')
    .select(`
      *,
      assigned_staff:profiles!assigned_to(full_name, role),
      received_staff:profiles!received_by(full_name)
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

export default async function JobOrderDetailPage({ params }: { params: { id: string } }) {
  const job = await getJobOrder(params.id)

  if (!job) {
    notFound()
  }

  return (
    <div>
      <PageHeader
        title={`งานปัก ${job.order_number}`}
        backHref="/job-orders"
        actions={<JobOrderActions jobOrder={job} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className={`status-badge text-lg px-4 py-2 ${JOB_STATUS_COLORS[job.status as JobStatus]}`}>
                {JOB_STATUS_LABELS[job.status as JobStatus]}
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">สร้างเมื่อ {formatDateTime(job.created_at)}</span>
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">รายละเอียดงาน</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">รายละเอียดการปัก</span>
                <p className="text-base text-gray-800 font-medium whitespace-pre-wrap">{job.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">ประเภทเสื้อผ้า</span>
                  <p className="text-base font-semibold">{job.garment_type || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">จำนวน</span>
                  <p className="text-base font-semibold">{job.quantity} ตัว</p>
                </div>
              </div>
              {job.estimated_completion_date && (
                <div>
                  <span className="text-sm text-gray-500">กำหนดเสร็จ</span>
                  <p className="text-base font-semibold">{formatDate(job.estimated_completion_date)}</p>
                </div>
              )}
              {job.notes && (
                <div>
                  <span className="text-sm text-gray-500">หมายเหตุ</span>
                  <p className="text-base text-gray-700 whitespace-pre-wrap">{job.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Staff */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">ผู้รับผิดชอบ</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">พนักงานรับงาน</span>
                <p className="text-base font-semibold">{job.received_staff?.full_name || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">ช่างผู้ดำเนินการ</span>
                <p className="text-base font-semibold">{job.assigned_staff?.full_name || 'ยังไม่กำหนด'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Customer + Payment */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">👤 ข้อมูลลูกค้า</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">ชื่อ</span>
                <p className="text-lg font-bold">{job.customer_name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">เบอร์โทร</span>
                <p className="text-lg font-semibold">
                  <a href={`tel:${job.customer_phone}`} className="text-brand-600 hover:underline">
                    {job.customer_phone}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">💰 การเงิน</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">ราคาที่เสนอ</span>
                <span className="font-bold text-lg">{formatCurrency(job.quoted_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">เงินมัดจำ</span>
                <span className="font-semibold text-green-600">{formatCurrency(job.deposit_amount)}</span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="font-bold text-lg">ยอดค้างชำระ</span>
                <span className={`font-bold text-xl ${job.balance_due > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatCurrency(job.balance_due)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
