import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/shared/PageHeader'
import Link from 'next/link'
import JobOrdersClient from '@/components/job-orders/JobOrdersClient'

async function getJobOrders() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('job_orders')
    .select(`
      *,
      assigned_staff:profiles!assigned_to(full_name),
      received_staff:profiles!received_by(full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching job orders:', error)
    return []
  }
  return data || []
}

export default async function JobOrdersPage() {
  const jobOrders = await getJobOrders()

  return (
    <div>
      <PageHeader
        title="งานปักเสื้อ"
        description={`ทั้งหมด ${jobOrders.length} รายการ`}
        actions={
          <Link href="/job-orders/new" className="pos-btn-primary">
            ➕ รับงานปักใหม่
          </Link>
        }
      />
      <JobOrdersClient jobOrders={jobOrders} />
    </div>
  )
}
