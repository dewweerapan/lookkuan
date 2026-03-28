'use client';

// ─── อัปเดตสถานะตรงนี้เมื่องานแต่ละชิ้นเสร็จ ───────────────────────────────
// status: 'done' | 'active' | 'pending'

type TaskStatus = 'done' | 'active' | 'pending';

interface ChangelogTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  completedAt?: string; // 'YYYY-MM-DD'
}

interface ChangelogPhase {
  id: string;
  title: string;
  subtitle: string;
  tasks: ChangelogTask[];
}

const PHASES: ChangelogPhase[] = [
  {
    id: 'phase-1',
    title: 'Phase 1 — MVP สมบูรณ์',
    subtitle: 'ระบบหลักครบ 140 ฟีเจอร์',
    tasks: [
      { id: 'p1-auth', title: 'Auth & RBAC', description: 'Login, PIN, Role, Middleware', status: 'done', completedAt: '2026-03-01' },
      { id: 'p1-pos', title: 'POS ขายสินค้า', description: 'ตะกร้า, สแกนบาร์โค้ด, QR พร้อมเพย์, ใบเสร็จ', status: 'done', completedAt: '2026-03-05' },
      { id: 'p1-inventory', title: 'สินค้าคงคลัง', description: 'CRUD, Variants, Barcode, Import/Export', status: 'done', completedAt: '2026-03-08' },
      { id: 'p1-jobs', title: 'งานปักเสื้อ', description: 'Kanban, Drag & Drop, ติดตามสถานะ', status: 'done', completedAt: '2026-03-10' },
      { id: 'p1-install', title: 'ผ่อนชำระ', description: 'แผนผ่อน, ติดตามงวด, แจ้งเตือน LINE', status: 'done', completedAt: '2026-03-12' },
      { id: 'p1-crm', title: 'ลูกค้า (CRM)', description: 'รายชื่อ, ประวัติ, Loyalty Points', status: 'done', completedAt: '2026-03-14' },
      { id: 'p1-reports', title: 'รายงาน', description: 'ยอดขาย, กำไร, สต็อก, Export PDF/Excel', status: 'done', completedAt: '2026-03-16' },
      { id: 'p1-risk', title: 'Risk Dashboard', description: 'Void, Override, Cash Discrepancy', status: 'done', completedAt: '2026-03-18' },
      { id: 'p1-settings', title: 'ตั้งค่าระบบ', description: 'Logo, ใบเสร็จ, LINE Notify, Users', status: 'done', completedAt: '2026-03-20' },
      { id: 'p1-map', title: 'แผนที่ร้าน', description: 'Shelf map, Drag & drop จัดสินค้า', status: 'done', completedAt: '2026-03-22' },
      { id: 'p1-ux', title: 'Mobile & UX', description: 'PWA, Dark Mode, Bottom Nav, Responsive', status: 'done', completedAt: '2026-03-24' },
      { id: 'p1-test', title: 'Tests', description: 'E2E Playwright 11 spec files + Unit Tests', status: 'done', completedAt: '2026-03-26' },
    ],
  },
  {
    id: 'phase-2a',
    title: 'Phase 2A — Code Quality',
    subtitle: 'แก้ bug และ cleanup',
    tasks: [
      { id: '2a-1', title: 'Commit ไฟล์ค้าง', description: 'ReceiptPrintSettings, Sidebar, DEVELOPMENT_PLAN', status: 'done', completedAt: '2026-03-28' },
      { id: '2a-2', title: 'Fix Hydration Warnings', description: 'แก้ SSR mismatch ใน JobOrderPrint, Installments', status: 'done', completedAt: '2026-03-28' },
      { id: '2a-3', title: 'Fix TypeScript Types', description: 'แทนที่ any ด้วย interface ที่ถูกต้อง', status: 'done', completedAt: '2026-03-28' },
    ],
  },
  {
    id: 'phase-2b',
    title: 'Phase 2B — Performance & UX',
    subtitle: 'ปรับปรุงความเร็วและ UX',
    tasks: [
      { id: '2b-1', title: 'Pagination', description: 'หน้า Inventory, Customers, Sales — โหลดทีละ 50', status: 'done', completedAt: '2026-03-28' },
      { id: '2b-2', title: 'Receipt Preview Modal', description: 'แสดง preview ก่อนพิมพ์ใบเสร็จใน POS', status: 'done', completedAt: '2026-03-28' },
      { id: '2b-3', title: 'Optimistic UI Job Orders', description: 'เปลี่ยนสถานะใน Kanban ไม่รอ server', status: 'done', completedAt: '2026-03-28' },
    ],
  },
  {
    id: 'phase-2c',
    title: 'Phase 2C — โปรโมชัน',
    subtitle: 'ส่วนลดและโปรโมชันอัตโนมัติ',
    tasks: [
      { id: '2c-1', title: 'Database Migration', description: 'ตาราง promotions, promotion_targets', status: 'done', completedAt: '2026-03-28' },
      { id: '2c-2', title: 'จัดการโปรโมชัน', description: 'CRUD ส่วนลด %, ส่วนลดบาท, ซื้อ X แถม Y', status: 'done', completedAt: '2026-03-28' },
      { id: '2c-3', title: 'Auto-Apply ใน POS', description: 'คำนวณและใช้โปรโมชันที่ดีสุดอัตโนมัติ', status: 'done', completedAt: '2026-03-28' },
    ],
  },
  {
    id: 'phase-2d',
    title: 'Phase 2D — ซัพพลายเออร์',
    subtitle: 'จัดการซัพพลายเออร์และใบสั่งซื้อ',
    tasks: [
      { id: '2d-1', title: 'Database Migration', description: 'ตาราง suppliers, purchase_orders', status: 'done', completedAt: '2026-03-28' },
      { id: '2d-2', title: 'จัดการซัพพลายเออร์', description: 'รายชื่อ, ข้อมูลติดต่อ, ประวัติ', status: 'done', completedAt: '2026-03-28' },
      { id: '2d-3', title: 'ใบสั่งซื้อ + รับสินค้า', description: 'สร้างใบสั่งซื้อ, รับสินค้า → อัปเดต stock', status: 'done', completedAt: '2026-03-28' },
    ],
  },
  {
    id: 'phase-2e',
    title: 'Phase 2E — Advanced Analytics',
    subtitle: 'วิเคราะห์ธุรกิจเชิงลึก',
    tasks: [
      { id: '2e-1', title: 'ABC Analysis', description: 'แยกสินค้า A/B/C ตาม % รายได้', status: 'done', completedAt: '2026-03-28' },
      { id: '2e-2', title: 'Sales Heatmap', description: 'แผนที่ความร้อนยอดขาย วัน × ชั่วโมง', status: 'done', completedAt: '2026-03-28' },
      { id: '2e-3', title: 'Customer Retention', description: 'Cohort analysis ลูกค้าซื้อซ้ำ', status: 'done', completedAt: '2026-03-28' },
    ],
  },
  {
    id: 'phase-2f',
    title: 'Phase 2F — Infrastructure',
    subtitle: 'CI/CD และ Error Monitoring',
    tasks: [
      { id: '2f-1', title: 'GitHub Actions CI/CD', description: 'Lint + Type check + Build + Test on push', status: 'done', completedAt: '2026-03-28' },
      { id: '2f-2', title: 'Sentry Error Monitoring', description: 'ติดตาม error จาก production', status: 'done', completedAt: '2026-03-28' },
    ],
  },
  {
    id: 'phase-3a',
    title: 'Phase 3A — AI Features',
    subtitle: 'ฟีเจอร์ AI ช่วยตัดสินใจ',
    tasks: [
      { id: '3a-1', title: 'AI แนะนำการสั่งซื้อ', description: 'วิเคราะห์ velocity + trend แนะนำจำนวนและเวลาสั่งซื้อ', status: 'done', completedAt: '2026-03-28' },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function countByStatus(tasks: ChangelogTask[]) {
  return {
    done: tasks.filter((t) => t.status === 'done').length,
    active: tasks.filter((t) => t.status === 'active').length,
    total: tasks.length,
  };
}

function allDone(phase: ChangelogPhase) {
  return phase.tasks.every((t) => t.status === 'done');
}

function hasActive(phase: ChangelogPhase) {
  return phase.tasks.some((t) => t.status === 'active');
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TaskStatus }) {
  if (status === 'done') {
    return (
      <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700'>
        <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block' />
        เสร็จแล้ว
      </span>
    );
  }
  if (status === 'active') {
    return (
      <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700'>
        <span className='w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse' />
        กำลังพัฒนา
      </span>
    );
  }
  return (
    <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500'>
      <span className='w-1.5 h-1.5 rounded-full bg-gray-300 inline-block' />
      รอดำเนินการ
    </span>
  );
}

function PhaseProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className='flex items-center gap-2 mt-1'>
      <div className='flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden'>
        <div
          className='h-full bg-emerald-500 rounded-full transition-all duration-500'
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className='text-xs text-gray-400 tabular-nums w-12 text-right'>
        {done}/{total}
      </span>
    </div>
  );
}

function PhaseIcon({ phase }: { phase: ChangelogPhase }) {
  if (allDone(phase)) return <span className='text-xl'>✅</span>;
  if (hasActive(phase)) return <span className='text-xl animate-pulse'>⚡</span>;
  return <span className='text-xl opacity-40'>⏳</span>;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ChangelogClient() {
  // Overall stats
  const allTasks = PHASES.flatMap((p) => p.tasks);
  const totalDone = allTasks.filter((t) => t.status === 'done').length;
  const totalActive = allTasks.filter((t) => t.status === 'active').length;
  const totalAll = allTasks.length;
  const overallPct = Math.round((totalDone / totalAll) * 100);

  return (
    <div className='space-y-4 pb-8'>
      {/* ─── Overall progress card ─── */}
      <div className='bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-5 text-white shadow-lg'>
        <div className='flex items-start justify-between mb-3'>
          <div>
            <p className='text-brand-100 text-sm font-medium'>ความคืบหน้าโดยรวม</p>
            <p className='text-4xl font-black mt-0.5'>{overallPct}%</p>
          </div>
          <div className='text-right'>
            <p className='text-2xl font-bold'>{totalDone}/{totalAll}</p>
            <p className='text-brand-200 text-xs'>งานทั้งหมด</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className='h-3 bg-white/20 rounded-full overflow-hidden'>
          <div
            className='h-full bg-white rounded-full transition-all duration-700'
            style={{ width: `${overallPct}%` }}
          />
        </div>

        <div className='flex gap-4 mt-3 text-sm'>
          <div className='flex items-center gap-1.5'>
            <span className='w-2 h-2 rounded-full bg-white inline-block' />
            <span className='text-white/80'>เสร็จ {totalDone}</span>
          </div>
          {totalActive > 0 && (
            <div className='flex items-center gap-1.5'>
              <span className='w-2 h-2 rounded-full bg-amber-300 inline-block animate-pulse' />
              <span className='text-white/80'>กำลังทำ {totalActive}</span>
            </div>
          )}
          <div className='flex items-center gap-1.5'>
            <span className='w-2 h-2 rounded-full bg-white/30 inline-block' />
            <span className='text-white/60'>รอ {totalAll - totalDone - totalActive}</span>
          </div>
        </div>
      </div>

      {/* ─── Phase cards ─── */}
      {PHASES.map((phase) => {
        const { done, active, total } = countByStatus(phase.tasks);
        const isDone = allDone(phase);
        const isActive = !isDone && hasActive(phase);

        return (
          <div
            key={phase.id}
            className={`rounded-2xl border overflow-hidden transition-all ${
              isDone
                ? 'border-emerald-200 bg-white'
                : isActive
                  ? 'border-amber-200 bg-white shadow-sm'
                  : 'border-gray-100 bg-gray-50/50'
            }`}
          >
            {/* Phase header */}
            <div className='px-4 pt-4 pb-3'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2.5 min-w-0'>
                  <PhaseIcon phase={phase} />
                  <div className='min-w-0'>
                    <h3
                      className={`font-bold text-sm leading-tight ${
                        isDone ? 'text-gray-800' : isActive ? 'text-gray-800' : 'text-gray-400'
                      }`}
                    >
                      {phase.title}
                    </h3>
                    <p className='text-xs text-gray-400 mt-0.5 truncate'>{phase.subtitle}</p>
                  </div>
                </div>
                {isDone ? (
                  <span className='flex-shrink-0 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full'>
                    ✓ สมบูรณ์
                  </span>
                ) : (
                  <span className='flex-shrink-0 text-xs text-gray-400 tabular-nums'>
                    {done}/{total}
                  </span>
                )}
              </div>
              {!isDone && <PhaseProgressBar done={done} total={total} />}
            </div>

            {/* Task list */}
            <div className='divide-y divide-gray-50 border-t border-gray-100'>
              {phase.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`px-4 py-3 flex items-start gap-3 ${
                    task.status === 'pending' ? 'opacity-50' : ''
                  }`}
                >
                  {/* Status icon */}
                  <div className='flex-shrink-0 mt-0.5'>
                    {task.status === 'done' && (
                      <div className='w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center'>
                        <svg className='w-3 h-3 text-emerald-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={3}>
                          <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                        </svg>
                      </div>
                    )}
                    {task.status === 'active' && (
                      <div className='w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center'>
                        <div className='w-2 h-2 rounded-full bg-amber-500 animate-pulse' />
                      </div>
                    )}
                    {task.status === 'pending' && (
                      <div className='w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center'>
                        <div className='w-2 h-2 rounded-full bg-gray-300' />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className='flex-1 min-w-0'>
                    <p
                      className={`text-sm font-semibold leading-tight ${
                        task.status === 'done'
                          ? 'text-gray-700'
                          : task.status === 'active'
                            ? 'text-gray-800'
                            : 'text-gray-400'
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className='text-xs text-gray-400 mt-0.5 leading-relaxed'>
                      {task.description}
                    </p>
                    {task.completedAt && (
                      <p className='text-xs text-emerald-500 mt-1'>
                        เสร็จวันที่ {new Date(task.completedAt).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>

                  {/* Badge — only show on non-done */}
                  {task.status !== 'done' && (
                    <div className='flex-shrink-0'>
                      <StatusBadge status={task.status} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <p className='text-center text-xs text-gray-300 pt-2'>
        อัปเดตโดย Claude Code · {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
  );
}
