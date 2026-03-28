import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/shared/Sidebar'
import BottomNav from '@/components/shared/BottomNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar — desktop & tablet only */}
      <Sidebar />

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen transition-all duration-300">
        {/* Top safe area spacer on mobile (no sidebar header) */}
        <div className="h-0 lg:hidden" />
        <div className="p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  )
}
