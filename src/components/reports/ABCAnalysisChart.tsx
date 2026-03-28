'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface ProductRevenue {
  name: string
  revenue: number
  tier: 'A' | 'B' | 'C'
}

interface Props {
  data: ProductRevenue[]
}

const TIER_COLORS = { A: '#22c55e', B: '#f59e0b', C: '#94a3b8' }

export default function ABCAnalysisChart({ data }: Props) {
  if (data.length === 0) return (
    <div className="text-center py-8 text-gray-400">ยังไม่มีข้อมูลยอดขาย</div>
  )

  const counts = {
    A: data.filter(d => d.tier === 'A').length,
    B: data.filter(d => d.tier === 'B').length,
    C: data.filter(d => d.tier === 'C').length,
  }

  const top20 = data.slice(0, 20)

  return (
    <div className="space-y-4">
      {/* Tier summary badges */}
      <div className="flex gap-3 flex-wrap">
        {(['A', 'B', 'C'] as const).map(tier => (
          <div key={tier} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
            tier === 'A' ? 'bg-green-100 text-green-700' :
            tier === 'B' ? 'bg-amber-100 text-amber-700' :
            'bg-gray-100 text-gray-500'
          }`}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: TIER_COLORS[tier] }} />
            ระดับ {tier}: {counts[tier]} สินค้า
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top20} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis tickFormatter={(v: number) => `฿${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'รายได้']}
              labelStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
              {top20.map((entry, i) => (
                <Cell key={i} fill={TIER_COLORS[entry.tier]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mobile list view */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {data.slice(0, 30).map((item, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 text-sm border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className={`flex-shrink-0 w-5 h-5 rounded text-xs font-bold flex items-center justify-center ${
                item.tier === 'A' ? 'bg-green-100 text-green-700' :
                item.tier === 'B' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-500'
              }`}>{item.tier}</span>
              <span className="truncate text-gray-700">{item.name}</span>
            </div>
            <span className="flex-shrink-0 font-semibold text-gray-800 ml-2">{formatCurrency(item.revenue)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
