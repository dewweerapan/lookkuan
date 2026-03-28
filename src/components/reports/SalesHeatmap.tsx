'use client'

interface HeatCell {
  day: number   // 0=Sunday ... 6=Saturday
  hour: number  // 0-23
  count: number
}

interface Props {
  data: HeatCell[]
}

const DAYS_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function SalesHeatmap({ data }: Props) {
  const maxCount = Math.max(...data.map(d => d.count), 1)

  const getCell = (day: number, hour: number) =>
    data.find(d => d.day === day && d.hour === hour)

  if (data.length === 0) return (
    <div className="text-center py-8 text-gray-400">ยังไม่มีข้อมูลยอดขาย</div>
  )

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Hour labels */}
        <div className="flex mb-1 ml-8">
          {HOURS.map(h => (
            <div key={h} className="flex-1 text-center text-xs text-gray-400">
              {h % 4 === 0 ? h : ''}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {DAYS_TH.map((day, d) => (
          <div key={d} className="flex items-center gap-1 mb-1">
            <span className="w-8 text-xs text-gray-500 text-right flex-shrink-0">{day}</span>
            {HOURS.map(h => {
              const cell = getCell(d, h)
              const intensity = cell ? cell.count / maxCount : 0
              return (
                <div
                  key={h}
                  title={`${day} ${h}:00 — ${cell?.count ?? 0} บิล`}
                  className="flex-1 h-6 rounded-sm cursor-default"
                  style={{
                    backgroundColor: intensity > 0
                      ? `rgba(249, 115, 22, ${Math.max(0.1, intensity)})`
                      : '#f3f4f6'
                  }}
                />
              )
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 ml-8">
          <span className="text-xs text-gray-400">น้อย</span>
          {[0.1, 0.3, 0.5, 0.7, 1.0].map(v => (
            <div key={v} className="w-5 h-4 rounded-sm" style={{ backgroundColor: `rgba(249, 115, 22, ${v})` }} />
          ))}
          <span className="text-xs text-gray-400">มาก</span>
        </div>
      </div>
    </div>
  )
}
