import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS, type JobStatus } from '@/lib/constants'
import TrackingForm from '@/components/landing/TrackingForm'
import QRCode from 'qrcode'

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'LookKuan'
const STORE_PHONE = process.env.NEXT_PUBLIC_STORE_PHONE || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''

async function getJobByOrderNumber(orderNumber: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('job_orders')
    .select('order_number, customer_name, status, description, garment_type, quantity, quoted_price, deposit_amount, balance_due, estimated_completion_date, actual_completion_date, created_at, notes')
    .eq('order_number', orderNumber)
    .single()
  return data
}

const statusSteps = ['pending', 'in_progress', 'completed', 'delivered'] as const

const STATUS_STEP_LABELS: Record<string, string> = {
  pending: 'รับงาน',
  in_progress: 'กำลังปัก',
  completed: 'เสร็จแล้ว',
  delivered: 'ส่งมอบ',
}

const STATUS_STEP_ICONS: Record<string, string> = {
  pending: '📋',
  in_progress: '🪡',
  completed: '✅',
  delivered: '🎉',
}

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params
  const decoded = decodeURIComponent(orderNumber)
  const job = await getJobByOrderNumber(decoded)

  // Generate QR code for this tracking URL
  const trackUrl = APP_URL
    ? `${APP_URL}/track/${encodeURIComponent(decoded)}`
    : `/track/${encodeURIComponent(decoded)}`
  const qrDataUrl = APP_URL
    ? await QRCode.toDataURL(trackUrl, { width: 160, margin: 2, color: { dark: '#1f2937', light: '#ffffff' } })
    : null

  if (!job) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4'>
        <div className='max-w-lg mx-auto pt-8'>
          <div className='text-center mb-8'>
            <Link href='/' className='inline-flex items-center gap-2 text-gray-500 hover:text-brand-600 mb-6 text-sm'>
              ← กลับหน้าหลัก
            </Link>
            <div className='text-5xl mb-2'>🧵</div>
            <h1 className='text-2xl font-bold text-gray-900'>{STORE_NAME}</h1>
          </div>
          <div className='bg-white rounded-2xl shadow-xl p-8 text-center mb-6'>
            <div className='text-6xl mb-4'>🔍</div>
            <h2 className='text-xl font-bold text-gray-800 mb-2'>ไม่พบใบงานนี้</h2>
            <p className='text-gray-500 mb-2'>
              ไม่พบเลขที่ใบงาน{' '}
              <span className='font-mono font-bold text-gray-700'>{decoded}</span>
            </p>
            <p className='text-sm text-gray-400'>กรุณาตรวจสอบเลขที่ใบงานให้ถูกต้อง</p>
          </div>
          <TrackingForm />
          {STORE_PHONE && (
            <div className='text-center mt-6 text-gray-500'>
              <p className='text-sm mb-1'>มีปัญหา? ติดต่อร้าน</p>
              <a href={`tel:${STORE_PHONE}`} className='text-brand-600 font-bold text-lg hover:text-brand-700'>
                📞 {STORE_PHONE}
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  const currentIndex = statusSteps.indexOf(job.status as (typeof statusSteps)[number])
  const isDelivered = job.status === 'delivered'
  const isReadyToPickup = job.status === 'completed'

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white'>
      {/* Nav */}
      <header className='bg-white/80 backdrop-blur border-b border-gray-100'>
        <div className='max-w-lg mx-auto px-4 h-14 flex items-center justify-between'>
          <Link href='/' className='flex items-center gap-2 text-gray-700 hover:text-brand-600 transition-colors'>
            <span className='text-xl'>🧵</span>
            <span className='font-bold text-lg'>{STORE_NAME}</span>
          </Link>
          {STORE_PHONE && (
            <a href={`tel:${STORE_PHONE}`} className='text-brand-600 font-semibold text-sm hover:text-brand-700'>
              📞 {STORE_PHONE}
            </a>
          )}
        </div>
      </header>

      <div className='max-w-lg mx-auto px-4 py-6 space-y-4'>

        {/* Delivered celebration */}
        {isDelivered && (
          <div className='bg-green-500 text-white rounded-2xl p-5 text-center shadow-lg'>
            <div className='text-4xl mb-2'>🎉</div>
            <p className='font-bold text-xl'>ส่งมอบเรียบร้อยแล้ว!</p>
            <p className='text-sm opacity-90 mt-1'>ขอบคุณที่ใช้บริการ {STORE_NAME}</p>
          </div>
        )}

        {/* Ready to pickup */}
        {isReadyToPickup && (
          <div className='bg-brand-500 text-white rounded-2xl p-5 text-center shadow-lg'>
            <div className='text-4xl mb-2'>✅</div>
            <p className='font-bold text-xl'>งานเสร็จแล้ว! พร้อมรับได้เลย</p>
            {STORE_PHONE && (
              <a href={`tel:${STORE_PHONE}`} className='block text-sm mt-1 underline opacity-90'>
                โทรนัดรับ: {STORE_PHONE}
              </a>
            )}
          </div>
        )}

        {/* Main card */}
        <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
          {/* Status header */}
          <div className={`px-6 py-4 ${
            isDelivered ? 'bg-gray-50' :
            isReadyToPickup ? 'bg-green-50 border-b-2 border-green-200' :
            job.status === 'in_progress' ? 'bg-blue-50 border-b-2 border-blue-200' :
            'bg-yellow-50 border-b-2 border-yellow-200'
          }`}>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-500 uppercase tracking-wider font-semibold'>เลขที่ใบงาน</p>
                <p className='text-xl font-mono font-bold text-gray-900'>{job.order_number}</p>
              </div>
              <span className={`status-badge text-sm px-4 py-1.5 ${JOB_STATUS_COLORS[job.status as JobStatus]}`}>
                {JOB_STATUS_LABELS[job.status as JobStatus]}
              </span>
            </div>
          </div>

          <div className='p-6 space-y-6'>
            {/* Progress steps */}
            <div className='flex items-start justify-between'>
              {statusSteps.map((step, i) => (
                <div key={step} className='flex items-center flex-1'>
                  <div className='flex flex-col items-center flex-1'>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 ${
                      i <= currentIndex
                        ? 'bg-brand-500 border-brand-500 text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-400'
                    }`}>
                      {i <= currentIndex ? STATUS_STEP_ICONS[step] : (i + 1)}
                    </div>
                    <p className={`text-xs mt-1.5 text-center font-medium leading-tight ${
                      i <= currentIndex ? 'text-brand-600' : 'text-gray-400'
                    }`} style={{ maxWidth: '60px' }}>
                      {STATUS_STEP_LABELS[step]}
                    </p>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 -mt-5 ${
                      i < currentIndex ? 'bg-brand-400' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Details */}
            <div className='space-y-3 pt-2 border-t border-gray-100'>
              <div className='flex justify-between items-start'>
                <span className='text-gray-500 text-sm shrink-0'>ชื่อลูกค้า</span>
                <span className='font-bold text-gray-800 text-right ml-4'>{job.customer_name}</span>
              </div>
              <div className='flex justify-between items-start'>
                <span className='text-gray-500 text-sm shrink-0'>รายละเอียด</span>
                <span className='text-gray-800 text-right ml-4'>{job.description}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500 text-sm'>ประเภท</span>
                <span className='text-gray-800'>{job.garment_type} × {job.quantity} ชิ้น</span>
              </div>
              {job.estimated_completion_date && !isDelivered && (
                <div className='flex justify-between'>
                  <span className='text-gray-500 text-sm'>กำหนดเสร็จ</span>
                  <span className={`font-medium ${
                    new Date(job.estimated_completion_date) < new Date() && !isReadyToPickup
                      ? 'text-red-600'
                      : 'text-gray-800'
                  }`}>
                    {formatDate(job.estimated_completion_date)}
                  </span>
                </div>
              )}
              {job.actual_completion_date && (
                <div className='flex justify-between'>
                  <span className='text-gray-500 text-sm'>เสร็จวันที่</span>
                  <span className='text-green-600 font-medium'>{formatDate(job.actual_completion_date)}</span>
                </div>
              )}
              <div className='flex justify-between'>
                <span className='text-gray-500 text-sm'>สั่งงานวันที่</span>
                <span className='text-gray-600'>{formatDate(job.created_at)}</span>
              </div>
            </div>

            {/* Payment */}
            <div className='bg-gray-50 rounded-xl p-4 border border-gray-100'>
              <p className='font-semibold text-gray-700 mb-3 text-sm'>สรุปการชำระเงิน</p>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>ราคาทั้งหมด</span>
                  <span className='font-semibold text-gray-800'>{formatCurrency(job.quoted_price)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>ชำระมัดจำแล้ว</span>
                  <span className='text-green-600 font-semibold'>{formatCurrency(job.deposit_amount)}</span>
                </div>
                <div className='border-t border-gray-200 pt-2 flex justify-between'>
                  <span className='font-bold text-gray-800'>ค้างชำระ</span>
                  <span className={`font-bold text-lg ${job.balance_due > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {job.balance_due > 0 ? formatCurrency(job.balance_due) : '✓ ชำระครบแล้ว'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {job.notes && (
              <div className='bg-blue-50 rounded-xl p-4 border border-blue-100'>
                <p className='text-sm font-semibold text-blue-700 mb-1'>📝 หมายเหตุ</p>
                <p className='text-blue-800 text-sm'>{job.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* QR Code */}
        {qrDataUrl && (
          <div className='bg-white rounded-2xl border-2 border-gray-100 p-5 text-center'>
            <p className='text-sm font-semibold text-gray-700 mb-3'>📲 บันทึก QR ไว้ติดตามงาน</p>
            <div className='flex justify-center mb-3'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt={`QR Code สำหรับติดตามใบงาน ${job.order_number}`}
                width={160}
                height={160}
                className='rounded-xl border border-gray-100'
              />
            </div>
            <p className='text-xs text-gray-400'>สแกนเพื่อกลับมาดูสถานะงานได้ทุกเมื่อ</p>
          </div>
        )}

        {/* Search another */}
        <div className='bg-white rounded-2xl border-2 border-gray-100 p-5'>
          <p className='text-center text-gray-600 font-medium mb-3 text-sm'>ตรวจสอบงานอื่น</p>
          <TrackingForm />
        </div>

        <p className='text-center text-xs text-gray-400 pb-4'>
          {STORE_NAME} © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
