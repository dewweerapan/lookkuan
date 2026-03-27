import { createClient } from '@/lib/supabase/server'
import POSClient from '@/components/pos/POSClient'

// Server Component — fetches data server-side (fast, no timeout)
export default async function POSPage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('is_active', true)
      .order('name'),
  ])

  return (
    <POSClient
      categories={categories || []}
      products={(products || []) as any}
    />
  )
}
