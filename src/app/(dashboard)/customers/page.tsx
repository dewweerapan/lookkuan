import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/shared/PageHeader'
import CustomersClient from '@/components/shared/CustomersClient'

const PAGE_SIZE = 50

async function getCustomers(page: number) {
  const supabase = await createClient()
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, error, count } = await supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching customers:', error)
    return { customers: [], totalCount: 0 }
  }
  return { customers: data || [], totalCount: count ?? 0 }
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const currentPage = Math.max(1, Number(searchParams?.page ?? 1))
  const { customers, totalCount } = await getCustomers(currentPage)
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div>
      <PageHeader
        title="ลูกค้า"
        description={`ลูกค้าทั้งหมด ${totalCount} ราย`}
      />
      <CustomersClient customers={customers} totalPages={totalPages} currentPage={currentPage} />
    </div>
  )
}
