import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import PageHeader from '@/components/shared/PageHeader'

async function getRiskData() {
  const supabase = await createClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: voidedSales },
    { data: allSales },
    { data: overrides },
    { data: cashSessions },
    { data: employeeStats },
  ] = await Promise.all([
    supabase.from('sales').select('id, sale_number, total, cashier_id, voided_by, void_reason, voided_at, cashier:profiles!cashier_id(full_name)')
      .eq('status', 'voided').gte('created_at', thirtyDaysAgo),
    supabase.from('sales').select('id, cashier_id', { count: 'exact' })
      .gte('created_at', thirtyDaysAgo),
    supabase.from('sale_items').select('id, price_override, override_approved_by, sale:sales(created_at, cashier_id, cashier:profiles!cashier_id(full_name))')
      .not('price_override', 'is', null).gte('created_at', thirtyDaysAgo),
    supabase.from('cash_sessions').select('*,cashier:profiles!cashier_id(full_name)')
      .eq('status', 'closed').gte('opened_at', thirtyDaysAgo).order('opened_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name, role').eq('is_active', true),
  ])

  const totalSalesCount = allSales?.length || 0
  const voidCount = voidedSales?.length || 0
  const voidRate = totalSalesCount > 0 ? (voidCount / totalSalesCount * 100).toFixed(1) : '0'
  const voidTotal = voidedSales?.reduce((sum, s) => sum + Number(s.total), 0) || 0

  const overrideCount = overrides?.length || 0

  const cashDiscrepancies = cashSessions?.filter((s: any) => Math.abs(Number(s.discrepancy) || 0) > 0) || []
  const totalDiscrepancy = cashDiscrepancies.reduce((sum: number, s: any) => sum + Math.abs(Number(s.discrepancy) || 0), 0)

  // Per-employee void stats
  const employeeVoids = (employeeStats || []).map((emp: any) => {
    const empVoids = voidedSales?.filter(s => s.cashier_id === emp.id) || []
    const empTotal = allSales?.filter(s => s.cashier_id === emp.id) || []
    return {
      ...emp,
      voidCount: empVoids.length,
      totalSales: empTotal.length,
      voidRate: empTotal.length > 0 ? (empVoids.length / empTotal.length * 100).toFixed(1) : '0',
    }
  }).filter((e: any) => e.totalSales > 0).sort((a: any, b: any) => b.voidCount - a.voidCount)

  return {
    voidCount,
    voidRate,
    voidTotal,
    voidedSales: voidedSales || [],
    overrideCount,
    cashDiscrepancies,
    totalDiscrepancy,
    employeeVoids,
    totalSalesCount,
  }
}

export default async function RiskDashboardPage() {
  const data = await getRiskData()

  return (
    <div>
      <PageHeader
        title="แดชบอร์ดความเสี่ยง"
        description="ตรวจสอบความผิดปกติและป้องกันการทุจริต (30 วันล่าสุด)"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className={`stat-card border-l-4 ${Number(data.voidRate) > 5 ? 'border-l-red-500' : 'border-l-green-500'}`}>
          <p className="text-sm text-gray-500 font-medium">อัตราการยกเลิกบิล</p>
          <p className={`text-3xl font-bold ${Number(data.voidRate) > 5 ? 'text-red-600' : 'text-green-600'}`}>
            {data.voidRate}%
          </p>
          <p className="text-sm text-gray-400 mt-1">{data.voidCount} จาก {data.totalSalesCount} รายการ</p>
        </div>
        <div className="stat-card border-l-4 border-l-orange-500">
          <p className="text-sm text-gray-500 font-medium">มูลค่าบิลที่ยกเลิก</p>
          <p className="text-3xl font-bold text-orange-600">{formatCurrency(data.voidTotal)}</p>
          <p className="text-sm text-gray-400 mt-1">{data.voidCount} รายการ</p>
        </div>
        <div className={`stat-card border-l-4 ${data.overrideCount > 10 ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
          <p className="text-sm text-gray-500 font-medium">การแก้ไขราคา</p>
          <p className="text-3xl font-bold text-yellow-600">{data.overrideCount}</p>
          <p className="text-sm text-gray-400 mt-1">ครั้ง (30 วัน)</p>
        </div>
        <div className={`stat-card border-l-4 ${data.totalDiscrepancy > 500 ? 'border-l-red-500' : 'border-l-green-500'}`}>
          <p className="text-sm text-gray-500 font-medium">เงินขาด/เกินรวม</p>
          <p className={`text-3xl font-bold ${data.totalDiscrepancy > 500 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(data.totalDiscrepancy)}
          </p>
          <p className="text-sm text-gray-400 mt-1">{data.cashDiscrepancies.length} กะ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Void Ranking */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📊 อัตราการยกเลิกบิลต่อพนักงาน</h2>
          {data.employeeVoids.length === 0 ? (
            <p className="text-gray-400 text-center py-4">ไม่มีข้อมูล</p>
          ) : (
            <div className="space-y-3">
              {data.employeeVoids.map((emp: any) => (
                <div key={emp.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{emp.full_name}</p>
                    <p className="text-sm text-gray-500">{emp.totalSales} รายการขาย</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${Number(emp.voidRate) > 5 ? 'text-red-600' : 'text-gray-700'}`}>
                      {emp.voidRate}%
                    </p>
                    <p className="text-sm text-gray-500">{emp.voidCount} ยกเลิก</p>
                  </div>
                  {Number(emp.voidRate) > 5 && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                      ⚠️ สูง
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Cash Discrepancies */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">💰 เงินขาด/เกินจากกะล่าสุด</h2>
          {data.cashDiscrepancies.length === 0 ? (
            <p className="text-gray-400 text-center py-4">ไม่มีความคลาดเคลื่อน</p>
          ) : (
            <div className="space-y-3">
              {data.cashDiscrepancies.slice(0, 10).map((session: any) => (
                <div key={session.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{session.cashier?.full_name || 'ไม่ทราบ'}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.opened_at).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      (session.discrepancy || 0) < 0 ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {(session.discrepancy || 0) < 0 ? 'ขาด ' : 'เกิน '}
                      {formatCurrency(Math.abs(session.discrepancy || 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Voided Sales */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🚫 บิลที่ยกเลิกล่าสุด</h2>
          {data.voidedSales.length === 0 ? (
            <p className="text-gray-400 text-center py-4">ไม่มีบิลที่ถูกยกเลิก</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>เลขที่บิล</th>
                    <th>แคชเชียร์</th>
                    <th className="text-right">มูลค่า</th>
                    <th>เหตุผล</th>
                    <th>เวลายกเลิก</th>
                  </tr>
                </thead>
                <tbody>
                  {data.voidedSales.slice(0, 15).map((sale: any) => (
                    <tr key={sale.id}>
                      <td className="font-mono text-sm">{sale.sale_number}</td>
                      <td>{sale.cashier?.full_name || '-'}</td>
                      <td className="text-right font-semibold text-red-600">{formatCurrency(sale.total)}</td>
                      <td className="text-sm">{sale.void_reason || '-'}</td>
                      <td className="text-sm text-gray-500">
                        {sale.voided_at ? new Date(sale.voided_at).toLocaleString('th-TH') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
