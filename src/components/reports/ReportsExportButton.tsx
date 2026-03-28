'use client';

import { exportToCSV, exportToXLSX } from '@/lib/export';

interface Props {
  topProductsList: [string, { quantity: number; revenue: number }][];
  paymentBreakdown: Record<string, { count: number; total: number }>;
  staffPerformance: { name: string; count: number; total: number }[];
  overduePayments: {
    installment_number: number;
    due_date: string;
    amount: number;
    plan: { plan_number: string; customer_name: string } | null;
  }[];
  monthlyTotal: number;
  weeklyTotal: number;
  monthlyCount: number;
  jobCompleted: number;
  jobRevenue: number;
  jobPending: number;
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'เงินสด',
  transfer: 'โอนเงิน',
  promptpay: 'พร้อมเพย์',
  credit_card: 'บัตรเครดิต',
};

function fmt(n: number) {
  return n.toLocaleString('th-TH', { style: 'currency', currency: 'THB' });
}

export default function ReportsExportButton({
  topProductsList,
  paymentBreakdown,
  staffPerformance,
  overduePayments,
  monthlyTotal,
  weeklyTotal,
  monthlyCount,
  jobCompleted,
  jobRevenue,
  jobPending,
}: Props) {
  const handleExportCSV = () => {
    exportToCSV(
      'top-products',
      topProductsList.map(([name, stats]) => ({
        สินค้า: name,
        จำนวน: stats.quantity,
        รายได้: stats.revenue,
      })),
    );
  };

  const handleExportXLSX = () => {
    const today = new Date().toISOString().split('T')[0];
    exportToXLSX(`รายงาน-${today}`, [
      {
        name: 'สินค้าขายดี',
        rows: topProductsList.map(([name, stats], i) => ({
          อันดับ: i + 1,
          ชื่อสินค้า: name,
          จำนวนที่ขาย: stats.quantity,
          รายได้: stats.revenue,
        })),
      },
      {
        name: 'ช่องทางชำระเงิน',
        rows: Object.entries(paymentBreakdown).map(([method, stats]) => ({
          ช่องทาง: PAYMENT_LABELS[method] || method,
          จำนวนบิล: stats.count,
          ยอดรวม: stats.total,
        })),
      },
      {
        name: 'ประสิทธิภาพพนักงาน',
        rows: staffPerformance.map((s, i) => ({
          อันดับ: i + 1,
          ชื่อพนักงาน: s.name,
          จำนวนบิล: s.count,
          ยอดรวม: s.total,
          เฉลี่ยต่อบิล: s.count > 0 ? Math.round(s.total / s.count) : 0,
        })),
      },
      {
        name: 'งวดผ่อนค้างชำระ',
        rows: overduePayments.map((p) => ({
          เลขแผนผ่อน: p.plan?.plan_number ?? '',
          ลูกค้า: p.plan?.customer_name ?? '',
          งวดที่: p.installment_number,
          ครบกำหนด: p.due_date,
          ยอด: p.amount,
        })),
      },
    ]);
  };

  const handleExportPDF = () => {
    const today = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const topProductsRows = topProductsList
      .map(
        ([name, stats], i) =>
          `<tr><td>${i + 1}</td><td>${name}</td><td class="num">${stats.quantity}</td><td class="num">${fmt(stats.revenue)}</td></tr>`,
      )
      .join('');

    const paymentRows = Object.entries(paymentBreakdown)
      .map(
        ([method, stats]) =>
          `<tr><td>${PAYMENT_LABELS[method] || method}</td><td class="num">${stats.count}</td><td class="num">${fmt(stats.total)}</td></tr>`,
      )
      .join('');

    const staffRows = staffPerformance
      .map(
        (s, i) =>
          `<tr><td>${i + 1}</td><td>${s.name}</td><td class="num">${s.count}</td><td class="num">${fmt(s.total)}</td><td class="num">${fmt(s.count > 0 ? s.total / s.count : 0)}</td></tr>`,
      )
      .join('');

    const overdueRows = overduePayments
      .map(
        (p) =>
          `<tr><td>${p.plan?.plan_number ?? ''}</td><td>${p.plan?.customer_name ?? ''}</td><td class="num">${p.installment_number}</td><td>${p.due_date}</td><td class="num">${fmt(p.amount)}</td></tr>`,
      )
      .join('');

    const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<title>รายงานประจำเดือน</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Sarabun', sans-serif; font-size: 12px; color: #111; padding: 20px; }
  h1 { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
  .subtitle { color: #555; margin-bottom: 16px; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
  .stat { border: 1px solid #ddd; border-radius: 6px; padding: 8px 12px; }
  .stat .label { font-size: 10px; color: #666; }
  .stat .value { font-size: 16px; font-weight: bold; }
  h2 { font-size: 13px; font-weight: bold; margin: 16px 0 6px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  th { background: #f3f4f6; text-align: left; padding: 5px 8px; font-size: 11px; }
  td { padding: 4px 8px; border-bottom: 1px solid #eee; font-size: 11px; }
  .num { text-align: right; }
  .overdue td { color: #c00; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<h1>รายงานประจำเดือน</h1>
<p class="subtitle">วันที่พิมพ์: ${today}</p>

<div class="stats">
  <div class="stat"><div class="label">ยอดขายเดือนนี้</div><div class="value">${fmt(monthlyTotal)}</div><div class="label">${monthlyCount} รายการ</div></div>
  <div class="stat"><div class="label">ยอดขายสัปดาห์นี้</div><div class="value">${fmt(weeklyTotal)}</div></div>
  <div class="stat"><div class="label">งานปักที่ส่งมอบ</div><div class="value">${jobCompleted} งาน</div><div class="label">รายได้ ${fmt(jobRevenue)} · ค้างอยู่ ${jobPending} งาน</div></div>
</div>

<h2>ช่องทางชำระเงิน</h2>
<table><thead><tr><th>ช่องทาง</th><th class="num">จำนวนบิล</th><th class="num">ยอดรวม</th></tr></thead><tbody>${paymentRows || '<tr><td colspan="3" style="text-align:center;color:#999">ไม่มีข้อมูล</td></tr>'}</tbody></table>

<h2>สินค้าขายดี</h2>
<table><thead><tr><th>#</th><th>สินค้า</th><th class="num">จำนวน</th><th class="num">รายได้</th></tr></thead><tbody>${topProductsRows || '<tr><td colspan="4" style="text-align:center;color:#999">ไม่มีข้อมูล</td></tr>'}</tbody></table>

<h2>ประสิทธิภาพพนักงาน</h2>
<table><thead><tr><th>#</th><th>พนักงาน</th><th class="num">บิล</th><th class="num">ยอดรวม</th><th class="num">เฉลี่ย/บิล</th></tr></thead><tbody>${staffRows || '<tr><td colspan="5" style="text-align:center;color:#999">ไม่มีข้อมูล</td></tr>'}</tbody></table>

${overdueRows ? `<h2>งวดผ่อนค้างชำระ</h2><table><thead><tr><th>เลขแผนผ่อน</th><th>ลูกค้า</th><th class="num">งวดที่</th><th>ครบกำหนด</th><th class="num">ยอด</th></tr></thead><tbody class="overdue">${overdueRows}</tbody></table>` : ''}
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 300);
    }
  };

  return (
    <div className='flex gap-2 flex-wrap'>
      <button
        onClick={handleExportCSV}
        className='pos-btn-secondary text-sm px-4 py-2'
      >
        📥 CSV
      </button>
      <button
        onClick={handleExportXLSX}
        className='pos-btn-secondary text-sm px-4 py-2'
      >
        📊 Excel
      </button>
      <button
        onClick={handleExportPDF}
        className='pos-btn-secondary text-sm px-4 py-2'
      >
        🖨️ PDF
      </button>
    </div>
  );
}
