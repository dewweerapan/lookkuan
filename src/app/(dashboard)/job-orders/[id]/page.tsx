import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
  type JobStatus,
} from '@/lib/constants';

interface AuditLogEntry {
  id: string;
  action: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
  user_id: string;
  user_name: string;
}
import PageHeader from '@/components/shared/PageHeader';
import JobOrderActions from '@/components/job-orders/JobOrderActions';
import JobOrderShare from '@/components/job-orders/JobOrderShare';
import JobOrderPrint from '@/components/job-orders/JobOrderPrint';

async function getJobOrder(id: string) {
  const supabase = await createClient();

  // Step 1: Fetch job order (no join to avoid double-FK ambiguity)
  const { data: job, error } = await supabase
    .from('job_orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !job) return null;

  // Step 2: Fetch staff names separately
  const staffIds = [job.received_by, job.assigned_to].filter(
    Boolean,
  ) as string[];
  let staffMap: Record<string, { full_name: string; role: string }> = {};

  if (staffIds.length > 0) {
    const { data: staffList } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .in('id', staffIds);

    if (staffList) {
      staffMap = Object.fromEntries(staffList.map((s) => [s.id, s]));
    }
  }

  // Step 3: Fetch audit logs for this job order
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('id, action, old_value, new_value, created_at, user_id')
    .eq('entity_type', 'job_order')
    .eq('entity_id', id)
    .eq('action', 'job_status_changed')
    .order('created_at', { ascending: true });

  // Step 4: Fetch audit log user names
  const auditUserIds = (auditLogs || [])
    .map((l) => l.user_id)
    .filter(Boolean)
    .filter((id: string, i: number, arr: string[]) => arr.indexOf(id) === i);
  let auditUserMap: Record<string, string> = {};
  if (auditUserIds.length > 0) {
    const { data: auditUsers } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', auditUserIds);
    if (auditUsers) {
      auditUserMap = Object.fromEntries(
        auditUsers.map((u) => [u.id, u.full_name]),
      );
    }
  }

  return {
    ...job,
    received_staff: job.received_by
      ? (staffMap[job.received_by] ?? null)
      : null,
    assigned_staff: job.assigned_to
      ? (staffMap[job.assigned_to] ?? null)
      : null,
    auditLogs: (auditLogs || []).map((l): AuditLogEntry => ({
      ...l,
      user_name: auditUserMap[l.user_id] || 'ระบบ',
    })),
  };
}

export default async function JobOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const job = await getJobOrder(params.id);

  if (!job) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={`งานปัก ${job.order_number}`}
        backHref='/job-orders'
        actions={
          <div className='flex gap-3 flex-wrap'>
            <JobOrderPrint
              job={job}
              storeName={process.env.NEXT_PUBLIC_STORE_NAME}
              storePhone={process.env.NEXT_PUBLIC_STORE_PHONE}
            />
            <JobOrderActions jobOrder={job} />
          </div>
        }
      />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Info */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Status */}
          <div className='bg-white rounded-xl border border-gray-200 p-6'>
            <div className='flex items-center gap-4 mb-4'>
              <span
                className={`status-badge text-lg px-4 py-2 ${JOB_STATUS_COLORS[job.status as JobStatus]}`}
              >
                {JOB_STATUS_LABELS[job.status as JobStatus]}
              </span>
              <span className='text-gray-400'>|</span>
              <span className='text-gray-500'>
                สร้างเมื่อ {formatDateTime(job.created_at)}
              </span>
            </div>
          </div>

          {/* Job Details */}
          <div className='bg-white rounded-xl border border-gray-200 p-6'>
            <h2 className='text-lg font-bold text-gray-800 mb-4'>
              รายละเอียดงาน
            </h2>
            <div className='space-y-3'>
              <div>
                <span className='text-sm text-gray-500'>รายละเอียดการปัก</span>
                <p className='text-base text-gray-800 font-medium whitespace-pre-wrap'>
                  {job.description}
                </p>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-gray-500'>ประเภทเสื้อผ้า</span>
                  <p className='text-base font-semibold'>
                    {job.garment_type || '-'}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-gray-500'>จำนวน</span>
                  <p className='text-base font-semibold'>{job.quantity} ตัว</p>
                </div>
              </div>
              {job.estimated_completion_date && (
                <div>
                  <span className='text-sm text-gray-500'>กำหนดเสร็จ</span>
                  <p className='text-base font-semibold'>
                    {formatDate(job.estimated_completion_date)}
                  </p>
                </div>
              )}
              {job.notes && (
                <div>
                  <span className='text-sm text-gray-500'>หมายเหตุ</span>
                  <p className='text-base text-gray-700 whitespace-pre-wrap'>
                    {job.notes}
                  </p>
                </div>
              )}
              {job.design_image_url && (
                <div>
                  <span className='text-sm text-gray-500'>ภาพออกแบบ</span>
                  <div className='mt-2'>
                    <a
                      href={job.design_image_url}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <img
                        src={job.design_image_url}
                        alt='ภาพออกแบบ'
                        className='max-w-xs max-h-64 rounded-xl border border-gray-200 hover:opacity-90 transition-opacity'
                      />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Staff */}
          <div className='bg-white rounded-xl border border-gray-200 p-6'>
            <h2 className='text-lg font-bold text-gray-800 mb-4'>
              ผู้รับผิดชอบ
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <span className='text-sm text-gray-500'>พนักงานรับงาน</span>
                <p className='text-base font-semibold'>
                  {job.received_staff?.full_name || '-'}
                </p>
              </div>
              <div>
                <span className='text-sm text-gray-500'>ช่างผู้ดำเนินการ</span>
                <p className='text-base font-semibold'>
                  {job.assigned_staff?.full_name || 'ยังไม่กำหนด'}
                </p>
              </div>
            </div>
          </div>

          {/* Audit Trail */}
          {job.auditLogs && job.auditLogs.length > 0 && (
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <h2 className='text-lg font-bold text-gray-800 mb-4'>
                📋 ประวัติการเปลี่ยนสถานะ
              </h2>
              <div className='space-y-3'>
                {job.auditLogs.map((log: AuditLogEntry) => (
                  <div key={log.id} className='flex items-start gap-3'>
                    <div className='w-2 h-2 rounded-full bg-brand-400 mt-2 flex-shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between gap-2 flex-wrap'>
                        <p className='text-sm font-semibold text-gray-700'>
                          {JOB_STATUS_LABELS[
                            log.old_value?.status as JobStatus
                          ] ||
                            (log.old_value?.status as string) ||
                            '?'}
                          {' → '}
                          {JOB_STATUS_LABELS[
                            log.new_value?.status as JobStatus
                          ] ||
                            (log.new_value?.status as string) ||
                            '?'}
                        </p>
                        <span className='text-xs text-gray-400 flex-shrink-0'>
                          {formatDateTime(log.created_at)}
                        </span>
                      </div>
                      <p className='text-xs text-gray-500'>
                        โดย {log.user_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Customer + Payment */}
        <div className='space-y-6'>
          {/* Customer */}
          <div className='bg-white rounded-xl border border-gray-200 p-6'>
            <h2 className='text-lg font-bold text-gray-800 mb-4'>
              👤 ข้อมูลลูกค้า
            </h2>
            <div className='space-y-3'>
              <div>
                <span className='text-sm text-gray-500'>ชื่อ</span>
                <p className='text-lg font-bold'>{job.customer_name}</p>
              </div>
              <div>
                <span className='text-sm text-gray-500'>เบอร์โทร</span>
                <p className='text-lg font-semibold'>
                  <a
                    href={`tel:${job.customer_phone}`}
                    className='text-brand-600 hover:underline'
                  >
                    {job.customer_phone}
                  </a>
                </p>
              </div>
              <div className='pt-4 border-t border-gray-100'>
                <p className='text-sm text-gray-500 mb-2'>
                  แชร์ให้ลูกค้าติดตามงาน
                </p>
                <JobOrderShare orderNumber={job.order_number} />
              </div>
            </div>
          </div>

          {/* Status History (J-14) */}
          {job.auditLogs.length > 0 && (
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <h2 className='text-lg font-bold text-gray-800 mb-4'>
                📋 ประวัติการเปลี่ยนสถานะ
              </h2>
              <div className='space-y-3'>
                {job.auditLogs.map((log: AuditLogEntry, i: number) => (
                  <div key={log.id} className='flex items-center gap-3 text-sm'>
                    <div className='w-2 h-2 rounded-full bg-brand-400 flex-shrink-0 mt-0.5' />
                    <div className='flex-1'>
                      <span
                        className={`status-badge text-xs mr-1 ${JOB_STATUS_COLORS[log.old_value?.status as JobStatus]}`}
                      >
                        {JOB_STATUS_LABELS[
                          log.old_value?.status as JobStatus
                        ] || (log.old_value?.status as string)}
                      </span>
                      <span className='text-gray-400 mx-1'>→</span>
                      <span
                        className={`status-badge text-xs ${JOB_STATUS_COLORS[log.new_value?.status as JobStatus]}`}
                      >
                        {JOB_STATUS_LABELS[
                          log.new_value?.status as JobStatus
                        ] || (log.new_value?.status as string)}
                      </span>
                    </div>
                    <div className='text-right text-gray-400 text-xs flex-shrink-0'>
                      <p>{log.user_name}</p>
                      <p>{formatDateTime(log.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment */}
          <div className='bg-white rounded-xl border border-gray-200 p-6'>
            <h2 className='text-lg font-bold text-gray-800 mb-4'>💰 การเงิน</h2>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-gray-500'>ราคาที่เสนอ</span>
                <span className='font-bold text-lg'>
                  {formatCurrency(job.quoted_price)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>เงินมัดจำ</span>
                <span className='font-semibold text-green-600'>
                  {formatCurrency(job.deposit_amount)}
                </span>
              </div>
              <hr />
              <div className='flex justify-between'>
                <span className='font-bold text-lg'>ยอดค้างชำระ</span>
                <span
                  className={`font-bold text-xl ${job.balance_due > 0 ? 'text-orange-600' : 'text-green-600'}`}
                >
                  {formatCurrency(job.balance_due)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
