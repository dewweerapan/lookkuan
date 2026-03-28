'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MonthlyData {
  month: string
  newCustomers: number
  returningCustomers: number
}

interface Props {
  data: MonthlyData[]
}

export default function CustomerRetentionChart({ data }: Props) {
  if (data.length === 0) return (
    <div className="text-center py-8 text-gray-400">ยังไม่มีข้อมูลลูกค้า</div>
  )

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip labelStyle={{ fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="newCustomers" name="ลูกค้าใหม่" fill="#f97316" radius={[4, 4, 0, 0]} />
          <Bar dataKey="returningCustomers" name="ลูกค้าเดิม" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
