# LookKuan Phase 2 — Roadmap & Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ยกระดับระบบ LookKuan จาก MVP ที่สมบูรณ์ (Phase 1: 140/140 ✅) ไปสู่ระบบ production-grade ที่รองรับการขยายธุรกิจ

**Architecture:** Next.js 14 App Router · Server Components fetch → Client Components interact · Supabase RLS · Tailwind + shadcn/ui · Zustand

**Tech Stack:** Next.js 14, TypeScript, Supabase, Tailwind CSS, shadcn/ui, Zustand, Recharts, xlsx, sonner, Playwright, Vitest

---

## ภาพรวม Phase ทั้งหมด

| Phase | ชื่อ | เป้าหมาย | ระยะเวลาประมาณ |
|---|---|---|---|
| **2A** | Code Quality & Stability | แก้ bug ที่ค้าง, hydration, TypeScript | 1 สัปดาห์ |
| **2B** | Performance & UX Polish | Pagination, Optimistic UI, Receipt Preview | 1-2 สัปดาห์ |
| **2C** | Promotions System | ส่วนลดมีเงื่อนไข, auto-apply ใน POS | 1-2 สัปดาห์ |
| **2D** | Suppliers & Purchase Orders | ซัพพลายเออร์, ใบสั่งซื้อ, รับสินค้า | 2 สัปดาห์ |
| **2E** | Advanced Analytics | ABC Analysis, Cohort, Heatmap | 2 สัปดาห์ |
| **2F** | Infrastructure & DevOps | CI/CD, Error Monitoring, Staging | 1 สัปดาห์ |

---

## Phase 2A — Code Quality & Stability

> **เป้าหมาย:** แก้ของที่ค้างอยู่ก่อนพัฒนาต่อ

### Task 2A-1: Commit ไฟล์ที่ค้างอยู่

**Files:**
- Modify: `src/components/settings/ReceiptPrintSettings.tsx` (unstaged)
- Modify: `src/components/shared/Sidebar.tsx` (staged, ยังไม่ commit)

- [ ] **Step 1: ตรวจสอบ diff ของทั้งสองไฟล์**

```bash
git diff src/components/settings/ReceiptPrintSettings.tsx
git diff --cached src/components/shared/Sidebar.tsx
```

- [ ] **Step 2: Stage และ commit**

```bash
git add src/components/settings/ReceiptPrintSettings.tsx
git commit -m "fix: finalize ReceiptPrintSettings and Sidebar with useMounted pattern"
```

---

### Task 2A-2: ตรวจและแก้ Hydration Warnings

**Files:**
- Scan: `src/app/**/*.tsx`, `src/components/**/*.tsx`

- [ ] **Step 1: ค้นหา `<p>` ซ้อนกัน**

```bash
# หา <p> ที่มี block element ข้างใน
grep -rn "<p>" src/app src/components | grep -v ".test." | head -50
```

- [ ] **Step 2: ค้นหา code ที่ใช้ window/document นอก useEffect**

```bash
grep -rn "window\." src/components --include="*.tsx" | grep -v "useEffect" | grep -v "//.*window"
grep -rn "document\." src/components --include="*.tsx" | grep -v "useEffect" | grep -v "//.*document"
```

- [ ] **Step 3: แก้ทีละจุดที่พบ**

Pattern ที่ถูกต้อง — code ที่ใช้ browser API:
```tsx
const [value, setValue] = useState<string>('')

useEffect(() => {
  // window/document ต้องอยู่ใน useEffect เท่านั้น
  setValue(window.localStorage.getItem('key') ?? '')
}, [])
```

Pattern ที่ถูกต้อง — nested block element:
```tsx
// ❌ ผิด: <p> ห้ามมี <div> ข้างใน
<p><div>text</div></p>

// ✅ ถูก: ใช้ <div> หรือ <span> แทน
<div><div>text</div></div>
<p><span>text</span></p>
```

- [ ] **Step 4: Build และตรวจ console**

```bash
npm run build
# ดู output — ไม่ควรมี hydration warning
```

- [ ] **Step 5: Commit**

```bash
git add -p
git commit -m "fix: resolve hydration mismatches in server/client components"
```

---

### Task 2A-3: แก้ TypeScript `any` Types

**Files:**
- Scan: `src/components/**/*.tsx`, `src/app/**/*.tsx`

- [ ] **Step 1: หา any types ทั้งหมด**

```bash
grep -rn ": any" src/app src/components src/lib src/hooks --include="*.ts" --include="*.tsx"
```

- [ ] **Step 2: แก้ทีละไฟล์ — ใช้ type จาก `src/types/database.ts`**

ตัวอย่าง pattern การแก้:
```ts
// ❌ ก่อน
const handleData = (data: any) => { ... }

// ✅ หลัง (ใช้ type จาก database.ts)
import type { Product } from '@/types/database'
const handleData = (data: Product) => { ... }
```

- [ ] **Step 3: ตรวจ TypeScript**

```bash
npx tsc --noEmit
# ต้องไม่มี error
```

- [ ] **Step 4: Commit**

```bash
git add -p
git commit -m "fix: replace any types with proper TypeScript interfaces"
```

---

## Phase 2B — Performance & UX Polish

> **เป้าหมาย:** ปรับ UX ที่สำคัญ — Pagination ป้องกัน load ข้อมูลทั้งหมด, Optimistic UI ให้ POS ตอบสนองเร็ว

### Task 2B-1: Pagination สำหรับ Inventory

**Problem:** ปัจจุบัน `/inventory` ดึงสินค้าทั้งหมดในครั้งเดียว — ถ้ามีสินค้าพัน SKU จะช้ามาก

**Files:**
- Modify: `src/app/(dashboard)/inventory/page.tsx`
- Modify: `src/components/inventory/InventoryClient.tsx`

- [ ] **Step 1: แก้ page.tsx ให้รับ searchParams**

```tsx
// src/app/(dashboard)/inventory/page.tsx
import { createClient } from '@/lib/supabase/server'
import InventoryClient from '@/components/inventory/InventoryClient'

const PAGE_SIZE = 50

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; category?: string }
}) {
  const supabase = await createClient()
  const page = Number(searchParams.page ?? 1)
  const search = searchParams.search ?? ''
  const categoryId = searchParams.category ?? ''
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('products')
    .select('*, product_variants(*), categories(name)', { count: 'exact' })
    .eq('is_active', true)
    .order('name')
    .range(from, to)

  if (search) query = query.ilike('name', `%${search}%`)
  if (categoryId) query = query.eq('category_id', categoryId)

  const [{ data: products, count }, { data: categories }] = await Promise.all([
    query,
    supabase.from('categories').select('id, name').eq('is_active', true).order('name'),
  ])

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <InventoryClient
      products={products ?? []}
      categories={categories ?? []}
      totalPages={totalPages}
      currentPage={page}
      totalCount={count ?? 0}
    />
  )
}
```

- [ ] **Step 2: เพิ่ม Pagination UI ใน InventoryClient**

เพิ่ม props และ pagination controls:
```tsx
// เพิ่มที่ด้านล่างของ component
function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`/inventory?${params.toString()}`)
  }

  if (totalPages <= 1) return null

  return (
    <div className='flex items-center justify-center gap-2 mt-4'>
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1}
        className='px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50'
      >
        ← ก่อนหน้า
      </button>
      <span className='text-sm text-gray-600'>
        หน้า {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className='px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50'
      >
        ถัดไป →
      </button>
    </div>
  )
}
```

- [ ] **Step 3: ทำ Pagination เดียวกันสำหรับ Customers**

Modify: `src/app/(dashboard)/customers/page.tsx` — pattern เดียวกัน, PAGE_SIZE = 50

- [ ] **Step 4: ทำ Pagination สำหรับ Sales history**

Modify: `src/app/(dashboard)/sales/page.tsx` — PAGE_SIZE = 30

- [ ] **Step 5: Test ด้วย Playwright**

```bash
npx playwright test e2e/03-inventory.spec.ts -g "inventory list"
```

- [ ] **Step 6: Commit**

```bash
git add src/app/(dashboard)/inventory/ src/components/inventory/InventoryClient.tsx
git commit -m "feat: add server-side pagination to inventory, customers, sales"
```

---

### Task 2B-2: Receipt Preview ใน POS ก่อนพิมพ์

**Problem:** ปัจจุบันกด "พิมพ์ใบเสร็จ" แล้วพิมพ์ทันที — ควรแสดง preview modal ก่อน

**Files:**
- Modify: `src/components/pos/POSClient.tsx`
- Create: `src/components/pos/ReceiptPreviewModal.tsx`

- [ ] **Step 1: สร้าง ReceiptPreviewModal**

```tsx
// src/components/pos/ReceiptPreviewModal.tsx
'use client'

import { CartItem } from '@/types/database'
import { formatCurrency } from '@/lib/utils'

interface Props {
  items: CartItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: string
  storeName: string
  onPrint: () => void
  onClose: () => void
}

export default function ReceiptPreviewModal({
  items, subtotal, discount, tax, total, paymentMethod, storeName, onPrint, onClose,
}: Props) {
  return (
    <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl w-full max-w-sm shadow-xl'>
        <div className='p-4 border-b flex items-center justify-between'>
          <h2 className='font-bold text-lg'>ตัวอย่างใบเสร็จ</h2>
          <button onClick={onClose} className='p-2 rounded-lg hover:bg-gray-100'>✕</button>
        </div>

        {/* Receipt preview — font-mono เหมือน thermal */}
        <div className='p-4 font-mono text-sm space-y-1 max-h-80 overflow-y-auto'>
          <p className='text-center font-bold text-base'>{storeName}</p>
          <div className='border-t border-dashed my-2' />
          {items.map((item) => (
            <div key={item.variant_id} className='flex justify-between'>
              <span className='truncate flex-1 pr-2'>{item.name}</span>
              <span>{formatCurrency(item.unit_price * item.quantity)}</span>
            </div>
          ))}
          <div className='border-t border-dashed my-2' />
          <div className='flex justify-between'>
            <span>ราคารวม</span><span>{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className='flex justify-between text-red-600'>
              <span>ส่วนลด</span><span>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className='flex justify-between'>
            <span>ภาษี (7%)</span><span>{formatCurrency(tax)}</span>
          </div>
          <div className='flex justify-between font-bold border-t border-dashed pt-1'>
            <span>ยอดสุทธิ</span><span>{formatCurrency(total)}</span>
          </div>
          <p className='text-center text-gray-500 text-xs mt-2'>ชำระ: {paymentMethod}</p>
        </div>

        <div className='p-4 border-t flex gap-3'>
          <button onClick={onClose} className='flex-1 py-2 border rounded-xl text-sm'>
            ยกเลิก
          </button>
          <button onClick={onPrint} className='flex-1 py-2 bg-brand-500 text-white rounded-xl text-sm font-semibold'>
            🖨️ พิมพ์
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: เชื่อม modal กับ POSClient**

ใน `POSClient.tsx` เพิ่ม state และ modal:
```tsx
const [showReceiptPreview, setShowReceiptPreview] = useState(false)

// แทนที่การพิมพ์ตรงๆ ด้วยการเปิด preview
const handlePrintClick = () => setShowReceiptPreview(true)
const handleConfirmPrint = () => {
  setShowReceiptPreview(false)
  window.print()
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/pos/
git commit -m "feat: add receipt preview modal before printing in POS"
```

---

### Task 2B-3: Optimistic UI สำหรับ Job Order Status

**Problem:** เมื่อ drag & drop เปลี่ยนสถานะ Kanban — มี delay รอ server ก่อนแสดงผล

**Files:**
- Modify: `src/components/job-orders/JobOrdersClient.tsx`

- [ ] **Step 1: ตรวจสอบ drag handler ปัจจุบัน**

```bash
grep -n "onDrop\|handleDrop\|optimistic" src/components/job-orders/JobOrdersClient.tsx
```

- [ ] **Step 2: เพิ่ม optimistic state update**

```tsx
const handleDrop = async (orderId: string, newStatus: JobOrder['status']) => {
  // Optimistic update — อัปเดต UI ทันที
  setOrders((prev) =>
    prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
  )

  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('job_orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) throw error
  } catch {
    // Rollback on error — คืนค่าเดิม
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: originalStatus } : o
      )
    )
    toast.error('เกิดข้อผิดพลาด ไม่สามารถเปลี่ยนสถานะได้')
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/job-orders/JobOrdersClient.tsx
git commit -m "feat: add optimistic UI for job order status drag & drop"
```

---

## Phase 2C — Promotions System

> **เป้าหมาย:** ให้ร้านสร้างโปรโมชันได้ เช่น "ลด 10%", "ซื้อครบ 500 ลด 50 บาท", "ซื้อ 2 แถม 1"

### Task 2C-1: Database Migration — Promotions

**Files:**
- Create: `supabase/migrations/00008_promotions.sql`

- [ ] **Step 1: สร้าง migration file**

```sql
-- supabase/migrations/00008_promotions.sql

CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('percent_off', 'fixed_off', 'buy_x_get_y', 'min_purchase_discount')),
  value NUMERIC NOT NULL DEFAULT 0,      -- % หรือ บาท
  min_purchase NUMERIC DEFAULT 0,         -- ยอดขั้นต่ำ
  buy_quantity INT DEFAULT 1,             -- สำหรับ buy_x_get_y: ซื้อ x
  get_quantity INT DEFAULT 1,             -- สำหรับ buy_x_get_y: ได้ y
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'category', 'product')),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE promotion_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('category', 'product')),
  target_id UUID NOT NULL
);

-- RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff read promotions" ON promotions FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage promotions" ON promotions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager')));

CREATE POLICY "staff read promotion_targets" ON promotion_targets FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage promotion_targets" ON promotion_targets FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager')));
```

- [ ] **Step 2: Push migration**

```bash
npm run db:migrate
```

- [ ] **Step 3: เพิ่ม types ใน `src/types/database.ts`**

```ts
export interface Promotion {
  id: string
  name: string
  description: string | null
  type: 'percent_off' | 'fixed_off' | 'buy_x_get_y' | 'min_purchase_discount'
  value: number
  min_purchase: number
  buy_quantity: number
  get_quantity: number
  applies_to: 'all' | 'category' | 'product'
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
}
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/ src/types/database.ts
git commit -m "feat: add promotions schema and types"
```

---

### Task 2C-2: หน้าจัดการโปรโมชัน

**Files:**
- Create: `src/app/(dashboard)/settings/promotions/page.tsx`
- Create: `src/components/settings/PromotionsClient.tsx`

- [ ] **Step 1: สร้าง page.tsx (Server Component)**

```tsx
// src/app/(dashboard)/settings/promotions/page.tsx
import { createClient } from '@/lib/supabase/server'
import PromotionsClient from '@/components/settings/PromotionsClient'
import { redirect } from 'next/navigation'

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

  return <PromotionsClient promotions={promotions ?? []} />
}
```

- [ ] **Step 2: สร้าง PromotionsClient พร้อม CRUD**

`src/components/settings/PromotionsClient.tsx` — ประกอบด้วย:
- รายการโปรโมชัน (ตาราง)
- ปุ่ม "เพิ่มโปรโมชัน" → เปิด modal
- Modal form: ชื่อ, ประเภท (dropdown), ค่า, วันที่
- Toggle เปิด/ปิดโปรโมชัน
- ปุ่มลบ (confirm dialog)

```tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Promotion } from '@/types/database'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

const PROMOTION_TYPE_LABELS: Record<Promotion['type'], string> = {
  percent_off: 'ลดเป็น %',
  fixed_off: 'ลดเป็นบาท',
  buy_x_get_y: 'ซื้อ X แถม Y',
  min_purchase_discount: 'ซื้อครบลด',
}

export default function PromotionsClient({ promotions: initial }: { promotions: Promotion[] }) {
  const [promotions, setPromotions] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  const toggleActive = async (id: string, current: boolean) => {
    setPromotions((p) => p.map((x) => (x.id === id ? { ...x, is_active: !current } : x)))
    await supabase.from('promotions').update({ is_active: !current }).eq('id', id)
  }

  const deletePromotion = async (id: string) => {
    if (!confirm('ลบโปรโมชันนี้?')) return
    setPromotions((p) => p.filter((x) => x.id !== id))
    await supabase.from('promotions').delete().eq('id', id)
    toast.success('ลบโปรโมชันแล้ว')
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-bold'>โปรโมชัน</h2>
        <button onClick={() => setShowForm(true)} className='pos-btn-primary px-4 py-2 text-sm'>
          + เพิ่มโปรโมชัน
        </button>
      </div>

      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <table className='w-full text-sm'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='text-left p-3'>ชื่อโปรโมชัน</th>
              <th className='text-left p-3'>ประเภท</th>
              <th className='text-left p-3'>ส่วนลด</th>
              <th className='text-left p-3'>วันที่</th>
              <th className='text-center p-3'>สถานะ</th>
              <th className='p-3'></th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {promotions.map((p) => (
              <tr key={p.id} className='hover:bg-gray-50'>
                <td className='p-3 font-medium'>{p.name}</td>
                <td className='p-3 text-gray-600'>{PROMOTION_TYPE_LABELS[p.type]}</td>
                <td className='p-3'>
                  {p.type === 'percent_off' ? `${p.value}%` : `฿${p.value}`}
                </td>
                <td className='p-3 text-gray-500 text-xs'>
                  {p.start_date ? formatDate(p.start_date) : '—'} →{' '}
                  {p.end_date ? formatDate(p.end_date) : 'ไม่กำหนด'}
                </td>
                <td className='p-3 text-center'>
                  <button
                    onClick={() => toggleActive(p.id, p.is_active)}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {p.is_active ? 'เปิดใช้' : 'ปิดใช้'}
                  </button>
                </td>
                <td className='p-3'>
                  <button onClick={() => deletePromotion(p.id)} className='text-red-500 hover:text-red-700 text-xs'>
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
            {promotions.length === 0 && (
              <tr>
                <td colSpan={6} className='p-8 text-center text-gray-400'>
                  ยังไม่มีโปรโมชัน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && <PromotionFormModal onClose={() => setShowForm(false)} onSaved={(p) => {
        setPromotions((prev) => [p, ...prev])
        setShowForm(false)
        toast.success('เพิ่มโปรโมชันแล้ว')
      }} />}
    </div>
  )
}

function PromotionFormModal({ onClose, onSaved }: { onClose: () => void; onSaved: (p: Promotion) => void }) {
  const [form, setForm] = useState({
    name: '',
    type: 'percent_off' as Promotion['type'],
    value: '',
    min_purchase: '',
    start_date: '',
    end_date: '',
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    if (!form.name || !form.value) return toast.error('กรุณากรอกชื่อและค่าส่วนลด')
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('promotions')
        .insert({
          name: form.name,
          type: form.type,
          value: Number(form.value),
          min_purchase: Number(form.min_purchase) || 0,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          is_active: true,
        })
        .select()
        .single()
      if (error) throw error
      onSaved(data)
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4'>
      <div className='bg-white rounded-2xl w-full max-w-md p-6 space-y-4'>
        <h3 className='font-bold text-lg'>เพิ่มโปรโมชัน</h3>
        <input
          placeholder='ชื่อโปรโมชัน เช่น ลดต้อนรับปีใหม่'
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className='w-full border rounded-lg px-3 py-2 text-sm'
        />
        <select
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Promotion['type'] }))}
          className='w-full border rounded-lg px-3 py-2 text-sm'
        >
          {Object.entries(PROMOTION_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className='text-xs text-gray-500 mb-1 block'>
              {form.type === 'percent_off' ? 'ลด (%)' : 'ลด (บาท)'}
            </label>
            <input
              type='number'
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              className='w-full border rounded-lg px-3 py-2 text-sm'
            />
          </div>
          <div>
            <label className='text-xs text-gray-500 mb-1 block'>ยอดขั้นต่ำ (บาท)</label>
            <input
              type='number'
              value={form.min_purchase}
              onChange={(e) => setForm((f) => ({ ...f, min_purchase: e.target.value }))}
              className='w-full border rounded-lg px-3 py-2 text-sm'
            />
          </div>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className='text-xs text-gray-500 mb-1 block'>วันเริ่ม</label>
            <input type='date' value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              className='w-full border rounded-lg px-3 py-2 text-sm' />
          </div>
          <div>
            <label className='text-xs text-gray-500 mb-1 block'>วันสิ้นสุด</label>
            <input type='date' value={form.end_date}
              onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
              className='w-full border rounded-lg px-3 py-2 text-sm' />
          </div>
        </div>
        <div className='flex gap-3 pt-2'>
          <button onClick={onClose} className='flex-1 py-2 border rounded-xl text-sm'>ยกเลิก</button>
          <button onClick={handleSave} disabled={saving} className='flex-1 py-2 bg-brand-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50'>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: เพิ่มลิงก์ใน Settings page**

Modify `src/app/(dashboard)/settings/page.tsx`:
```tsx
<Link href='/settings/promotions' className='settings-card'>
  <TagIcon className='w-6 h-6 text-brand-500' />
  <div>
    <h3 className='font-semibold'>โปรโมชัน</h3>
    <p className='text-sm text-gray-500'>จัดการส่วนลดและโปรโมชัน</p>
  </div>
</Link>
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/settings/promotions/ src/components/settings/PromotionsClient.tsx
git commit -m "feat: add promotions management system with CRUD"
```

---

### Task 2C-3: Auto-Apply Promotions ใน POS

**Files:**
- Modify: `src/components/pos/POSClient.tsx`
- Create: `src/lib/promotions.ts`

- [ ] **Step 1: สร้าง promotion calculation utility**

```ts
// src/lib/promotions.ts
import type { Promotion } from '@/types/database'
import type { CartItem } from '@/types/database'

export interface AppliedPromotion {
  promotion: Promotion
  discountAmount: number
  description: string
}

export function calculatePromotion(
  promotion: Promotion,
  cartItems: CartItem[],
  subtotal: number
): AppliedPromotion | null {
  // ตรวจว่าโปรโมชันยังอยู่ในช่วงวันที่
  const today = new Date().toISOString().split('T')[0]
  if (promotion.start_date && today < promotion.start_date) return null
  if (promotion.end_date && today > promotion.end_date) return null
  if (!promotion.is_active) return null

  // ตรวจยอดขั้นต่ำ
  if (subtotal < promotion.min_purchase) return null

  let discountAmount = 0
  let description = ''

  switch (promotion.type) {
    case 'percent_off':
      discountAmount = subtotal * (promotion.value / 100)
      description = `ลด ${promotion.value}% (${promotion.name})`
      break
    case 'fixed_off':
      discountAmount = Math.min(promotion.value, subtotal)
      description = `ลด ฿${promotion.value} (${promotion.name})`
      break
    case 'min_purchase_discount':
      if (subtotal >= promotion.min_purchase) {
        discountAmount = promotion.type === 'percent_off'
          ? subtotal * (promotion.value / 100)
          : promotion.value
        description = `ซื้อครบ ฿${promotion.min_purchase} ลด ฿${discountAmount}`
      }
      break
  }

  if (discountAmount <= 0) return null

  return { promotion, discountAmount, description }
}
```

- [ ] **Step 2: Load promotions ใน POS และ auto-apply**

ใน `POSClient.tsx`:
```tsx
// เพิ่ม state สำหรับ promotions
const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>([])
const [appliedPromotion, setAppliedPromotion] = useState<AppliedPromotion | null>(null)

// load promotions เมื่อ cart เปลี่ยน
useEffect(() => {
  const best = availablePromotions
    .map((p) => calculatePromotion(p, items, subtotal))
    .filter((x): x is AppliedPromotion => x !== null)
    .sort((a, b) => b.discountAmount - a.discountAmount)[0] ?? null
  setAppliedPromotion(best)
}, [items, subtotal, availablePromotions])
```

- [ ] **Step 3: แสดง applied promotion badge ใน cart**

```tsx
{appliedPromotion && (
  <div className='bg-green-50 border border-green-200 rounded-lg p-2 text-sm text-green-700'>
    🎉 {appliedPromotion.description}
  </div>
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/promotions.ts src/components/pos/POSClient.tsx
git commit -m "feat: auto-apply promotions in POS cart"
```

---

## Phase 2D — Suppliers & Purchase Orders

> **เป้าหมาย:** ติดตามการสั่งซื้อสินค้าจากซัพพลายเออร์ และอัปเดต stock อัตโนมัติเมื่อรับสินค้า

### Task 2D-1: Database Migration — Suppliers

**Files:**
- Create: `supabase/migrations/00009_suppliers.sql`

- [ ] **Step 1: สร้าง migration**

```sql
-- supabase/migrations/00009_suppliers.sql

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  payment_terms TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'ordered', 'partial', 'received', 'cancelled')),
  total_amount NUMERIC DEFAULT 0,
  ordered_at TIMESTAMPTZ DEFAULT now(),
  expected_date DATE,
  received_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  notes TEXT
);

CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  quantity_ordered INT NOT NULL,
  quantity_received INT DEFAULT 0,
  unit_cost NUMERIC NOT NULL
);

-- RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff read suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage suppliers" ON suppliers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager')));

CREATE POLICY "staff read purchase_orders" ON purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage purchase_orders" ON purchase_orders FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager')));

CREATE POLICY "staff read po_items" ON purchase_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage po_items" ON purchase_order_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager')));
```

- [ ] **Step 2: Push migration**

```bash
npm run db:migrate
```

- [ ] **Step 3: เพิ่ม types**

```ts
// เพิ่มใน src/types/database.ts
export interface Supplier {
  id: string
  name: string
  contact_name: string | null
  phone: string | null
  email: string | null
  address: string | null
  payment_terms: string | null
  notes: string | null
  is_active: boolean
  created_at: string
}

export interface PurchaseOrder {
  id: string
  supplier_id: string
  order_number: string
  status: 'pending' | 'ordered' | 'partial' | 'received' | 'cancelled'
  total_amount: number
  ordered_at: string
  expected_date: string | null
  received_at: string | null
  created_by: string | null
  notes: string | null
  supplier?: Supplier
}

export interface PurchaseOrderItem {
  id: string
  purchase_order_id: string
  variant_id: string
  quantity_ordered: number
  quantity_received: number
  unit_cost: number
  variant?: ProductVariant & { product?: Product }
}
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/ src/types/database.ts
git commit -m "feat: add suppliers and purchase orders schema"
```

---

### Task 2D-2: หน้า Suppliers

**Files:**
- Create: `src/app/(dashboard)/suppliers/page.tsx`
- Create: `src/components/suppliers/SuppliersClient.tsx`
- Modify: `src/components/shared/Sidebar.tsx` (เพิ่มเมนู)

- [ ] **Step 1: สร้าง page.tsx**

```tsx
// src/app/(dashboard)/suppliers/page.tsx
import { createClient } from '@/lib/supabase/server'
import SuppliersClient from '@/components/suppliers/SuppliersClient'

export default async function SuppliersPage() {
  const supabase = await createClient()
  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .order('name')

  return <SuppliersClient suppliers={suppliers ?? []} />
}
```

- [ ] **Step 2: สร้าง SuppliersClient (CRUD)**

`src/components/suppliers/SuppliersClient.tsx` — รายการซัพพลายเออร์, modal เพิ่ม/แก้ไข, ปุ่มปิดใช้งาน

- [ ] **Step 3: เพิ่มใน Sidebar**

```tsx
// ใน navItems array ใน src/components/shared/Sidebar.tsx
{
  href: '/suppliers',
  label: 'ซัพพลายเออร์',
  icon: <Truck size={22} />,
  roles: ['admin', 'manager'],
},
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/suppliers/ src/components/suppliers/ src/components/shared/Sidebar.tsx
git commit -m "feat: add supplier management page"
```

---

### Task 2D-3: ใบสั่งซื้อ (Purchase Orders) + รับสินค้า

**Files:**
- Create: `src/app/(dashboard)/purchase-orders/page.tsx`
- Create: `src/app/(dashboard)/purchase-orders/new/page.tsx`
- Create: `src/app/(dashboard)/purchase-orders/[id]/page.tsx`
- Create: `src/components/purchase-orders/PurchaseOrdersClient.tsx`
- Create: `src/components/purchase-orders/ReceiveStockModal.tsx`

- [ ] **Step 1: สร้าง purchase orders list page**

Pattern เดียวกับ `job-orders/page.tsx` — Server Component ดึงข้อมูล

- [ ] **Step 2: สร้างหน้า new purchase order**

Form: เลือกซัพพลายเออร์, เพิ่มรายการสินค้า (variant + จำนวน + ราคาต้นทุน)

- [ ] **Step 3: ReceiveStockModal — รับสินค้าและอัปเดต stock**

```tsx
// เมื่อกด "รับสินค้า" ต้อง:
// 1. อัปเดต quantity_received ใน purchase_order_items
// 2. เพิ่ม stock_qty ใน product_variants
// 3. บันทึก inventory_movements (type = 'receive')
// 4. อัปเดตสถานะ purchase_order

const receiveItems = async (items: { itemId: string; qtyReceived: number }[]) => {
  const supabase = createClient()
  for (const { itemId, qtyReceived } of items) {
    // อัปเดต purchase_order_item
    await supabase
      .from('purchase_order_items')
      .update({ quantity_received: qtyReceived })
      .eq('id', itemId)

    // อัปเดต stock
    const { data: item } = await supabase
      .from('purchase_order_items')
      .select('variant_id, unit_cost')
      .eq('id', itemId)
      .single()

    if (item) {
      await supabase.rpc('increment_stock', {
        p_variant_id: item.variant_id,
        p_qty: qtyReceived,
      })
      // บันทึก movement
      await supabase.from('inventory_movements').insert({
        variant_id: item.variant_id,
        movement_type: 'receive',
        quantity: qtyReceived,
        reason: `รับสินค้าจากใบสั่งซื้อ`,
      })
    }
  }
  toast.success('บันทึกการรับสินค้าแล้ว')
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/purchase-orders/ src/components/purchase-orders/
git commit -m "feat: add purchase orders with stock receive workflow"
```

---

## Phase 2E — Advanced Analytics

> **เป้าหมาย:** เพิ่มมุมมองเชิงวิเคราะห์ธุรกิจ — ABC Analysis, Sales Heatmap, Customer Retention

### Task 2E-1: ABC Analysis (วิเคราะห์สินค้า)

**วิธีคิด ABC:**
- **A** (20% สินค้า → 80% รายได้) — สินค้าขายดีสุด
- **B** (30% สินค้า → 15% รายได้) — ขายปานกลาง
- **C** (50% สินค้า → 5% รายได้) — ขายช้า

**Files:**
- Modify: `src/app/(dashboard)/reports/page.tsx`
- Create: `src/components/reports/ABCAnalysisChart.tsx`

- [ ] **Step 1: Query ยอดขายต่อสินค้า**

```tsx
// เพิ่มใน reports/page.tsx
const { data: productSales } = await supabase
  .from('sale_items')
  .select('variant_id, quantity, unit_price, product_variants(product_id, products(name))')
  .eq('sales.status', 'completed')
```

- [ ] **Step 2: คำนวณ ABC tier**

```ts
function classifyABC(products: { name: string; revenue: number }[]) {
  const total = products.reduce((s, p) => s + p.revenue, 0)
  const sorted = [...products].sort((a, b) => b.revenue - a.revenue)
  let cumulative = 0
  return sorted.map((p) => {
    cumulative += p.revenue
    const pct = cumulative / total
    return { ...p, tier: pct <= 0.8 ? 'A' : pct <= 0.95 ? 'B' : 'C' }
  })
}
```

- [ ] **Step 3: แสดงผลด้วย Recharts BarChart + color-coded tiers**

- [ ] **Step 4: Commit**

```bash
git add src/components/reports/ABCAnalysisChart.tsx
git commit -m "feat: add ABC product analysis to reports"
```

---

### Task 2E-2: Sales Heatmap (แผนที่ความร้อนยอดขาย)

**วัตถุประสงค์:** แสดงยอดขายแยกตามวันในสัปดาห์ × ชั่วโมง เพื่อดู peak hours

**Files:**
- Create: `src/components/reports/SalesHeatmap.tsx`

- [ ] **Step 1: Query ยอดขายตาม hour และ day_of_week**

```sql
-- Supabase query
SELECT
  EXTRACT(DOW FROM created_at) as day_of_week,
  EXTRACT(HOUR FROM created_at) as hour,
  COUNT(*) as transaction_count,
  SUM(total_amount) as total_revenue
FROM sales
WHERE status = 'completed'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY 1, 2
ORDER BY 1, 2
```

- [ ] **Step 2: สร้าง Heatmap component**

Grid 7×24 (วัน × ชั่วโมง) ใช้ opacity ของสีแดงตามความเข้มของยอดขาย:

```tsx
const DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const maxValue = Math.max(...data.map(d => d.transaction_count))

return (
  <div className='grid grid-cols-[auto_repeat(24,1fr)] gap-0.5 text-xs'>
    {DAYS.map((day, d) => (
      <>
        <span className='pr-2 text-right text-gray-500'>{day}</span>
        {Array.from({ length: 24 }, (_, h) => {
          const cell = data.find(x => x.day_of_week === d && x.hour === h)
          const intensity = cell ? cell.transaction_count / maxValue : 0
          return (
            <div
              key={h}
              title={`${day} ${h}:00 — ${cell?.transaction_count ?? 0} บิล`}
              className='h-5 rounded-sm'
              style={{ backgroundColor: `rgba(249, 115, 22, ${intensity})` }}
            />
          )
        })}
      </>
    ))}
  </div>
)
```

- [ ] **Step 3: Commit**

```bash
git add src/components/reports/SalesHeatmap.tsx
git commit -m "feat: add sales heatmap by day/hour to reports"
```

---

### Task 2E-3: Customer Retention Report

**วัตถุประสงค์:** ดูว่าลูกค้าใหม่กลับมาซื้อซ้ำกี่ %

**Files:**
- Create: `src/components/reports/CustomerRetentionChart.tsx`

- [ ] **Step 1: Query cohort data**

```sql
SELECT
  DATE_TRUNC('month', first_purchase.purchased_at) as cohort_month,
  DATE_TRUNC('month', s.created_at) as purchase_month,
  COUNT(DISTINCT s.customer_id) as customers
FROM sales s
JOIN (
  SELECT customer_id, MIN(created_at) as purchased_at
  FROM sales WHERE status = 'completed' AND customer_id IS NOT NULL
  GROUP BY customer_id
) first_purchase ON s.customer_id = first_purchase.customer_id
WHERE s.status = 'completed' AND s.customer_id IS NOT NULL
GROUP BY 1, 2
```

- [ ] **Step 2: แสดงผลเป็น table + color gradient**

- [ ] **Step 3: Commit**

```bash
git add src/components/reports/CustomerRetentionChart.tsx
git commit -m "feat: add customer retention cohort report"
```

---

## Phase 2F — Infrastructure & DevOps

> **เป้าหมาย:** ทำให้ระบบ production-ready มี CI/CD, monitoring, และ error tracking

### Task 2F-1: GitHub Actions CI/CD

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: สร้าง CI workflow**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_STORE_NAME: LookKuan

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Run unit tests
        run: npm run test:unit
```

- [ ] **Step 2: เพิ่ม Secrets ใน GitHub repository settings**

ต้องตั้งค่า:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- [ ] **Step 3: Commit**

```bash
git add .github/
git commit -m "ci: add GitHub Actions workflow for lint, type-check, build, unit tests"
```

---

### Task 2F-2: Error Monitoring (Sentry)

**Files:**
- Create: `sentry.client.config.ts`
- Create: `sentry.server.config.ts`
- Modify: `next.config.mjs`
- Modify: `src/app/error.tsx`

- [ ] **Step 1: Install Sentry**

```bash
npm install @sentry/nextjs
```

- [ ] **Step 2: Configure Sentry**

```ts
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01,
})
```

- [ ] **Step 3: เพิ่ม DSN ใน `.env.local`**

```
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

- [ ] **Step 4: Commit**

```bash
git add sentry.*.config.ts next.config.mjs
git commit -m "feat: add Sentry error monitoring"
```

---

## สรุปลำดับการพัฒนา

```
Phase 2A (ทำก่อน — cleanup):
  2A-1: Commit ไฟล์ค้าง
  2A-2: แก้ Hydration Warnings
  2A-3: แก้ TypeScript any types

Phase 2B (UX):
  2B-1: Pagination (Inventory + Customers + Sales)
  2B-2: Receipt Preview Modal
  2B-3: Optimistic UI Job Orders

Phase 2C (โปรโมชัน):
  2C-1: Database migration
  2C-2: Promotions management UI
  2C-3: Auto-apply ใน POS

Phase 2D (ซัพพลายเออร์):
  2D-1: Database migration
  2D-2: Supplier management UI
  2D-3: Purchase Orders + Receive Stock

Phase 2E (Analytics):
  2E-1: ABC Analysis
  2E-2: Sales Heatmap
  2E-3: Customer Retention

Phase 2F (Infrastructure):
  2F-1: GitHub Actions CI/CD
  2F-2: Sentry Error Monitoring
```

---

*อัปเดตโดย Claude Code — มีนาคม 2026*
