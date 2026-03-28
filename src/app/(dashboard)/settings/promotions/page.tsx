import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import PromotionsClient from '@/components/settings/PromotionsClient'

export default async function PromotionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'manager'].includes(profile.role)) redirect('/dashboard')

  const { data: promotions } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader title='โปรโมชัน' description='จัดการส่วนลดและโปรโมชัน' />
      <PromotionsClient promotions={promotions ?? []} />
    </div>
  )
}
