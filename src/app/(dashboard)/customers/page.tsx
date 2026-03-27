import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import PageHeader from '@/components/shared/PageHeader'
import CustomersClient from '@/components/shared/CustomersClient'

async function getCustomers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }
  return data || []
}

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <div>
      <PageHeader
        title="ลูกค้า"
        description={`ลูกค้าทั้งหมด ${customers.length} ราย`}
      />
      <CustomersClient customers={customers} />
    </div>
  )
}
