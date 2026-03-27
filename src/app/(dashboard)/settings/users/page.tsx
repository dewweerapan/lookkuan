import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/shared/PageHeader'

const roleLabels: Record<string, string> = {
  admin: '🔑 ผู้ดูแลระบบ',
  manager: '👔 ผู้จัดการ',
  cashier: '🧾 แคชเชียร์',
  embroidery_staff: '🧵 ช่างปัก',
}

const roleBadgeColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  cashier: 'bg-green-100 text-green-800',
  embroidery_staff: 'bg-orange-100 text-orange-800',
}

async function getUsers() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div>
      <PageHeader title="จัดการผู้ใช้งาน" backHref="/settings" description={`ทั้งหมด ${users.length} คน`} />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>อีเมล</th>
              <th>บทบาท</th>
              <th>PIN</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="font-semibold text-gray-800">{user.full_name}</td>
                <td className="text-gray-600">{user.email}</td>
                <td>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${roleBadgeColors[user.role] || 'bg-gray-100'}`}>
                    {roleLabels[user.role] || user.role}
                  </span>
                </td>
                <td>{user.pin_code ? '••••' : '-'}</td>
                <td>
                  <span className={`status-badge ${user.is_active ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
                    {user.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-blue-800 text-base">
          💡 <strong>วิธีเพิ่มผู้ใช้ใหม่:</strong> ไปที่ Supabase Dashboard → Authentication → Users → Invite User
          จากนั้นระบุ role ใน metadata เช่น {`{"role": "cashier", "full_name": "ชื่อพนักงาน"}`}
        </p>
      </div>
    </div>
  )
}
