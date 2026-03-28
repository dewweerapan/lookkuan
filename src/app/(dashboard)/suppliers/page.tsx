import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import SuppliersClient from '@/components/suppliers/SuppliersClient'

export default async function SuppliersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return (
    <div>
      <PageHeader title='ซัพพลายเออร์' description='จัดการข้อมูลซัพพลายเออร์' />
      <SuppliersClient suppliers={suppliers ?? []} />
    </div>
  )
}
