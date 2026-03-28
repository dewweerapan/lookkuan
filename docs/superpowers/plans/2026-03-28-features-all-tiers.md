# LookKuan — All Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all 45 remaining features across 3 tiers (quick wins → medium → complex) to bring FEATURES.md to 100% completion.

**Architecture:** Next.js 14 App Router — server components fetch data, client components handle interactivity. Supabase for auth/DB. Tailwind + shadcn/ui + Sarabun font. Thai UI language throughout.

**Tech Stack:** Next.js 14, TypeScript, Supabase, Tailwind CSS, shadcn/ui, Zustand, Recharts, html5-qrcode (already installed), qrcode (to install), xlsx (to install), jspdf (to install)

---

## Checklist — สรุปความคืบหน้า

### Tier 1 — Quick Wins
- [ ] A-10: Reset Password ผ่าน Email
- [ ] T-07: แชร์ link ติดตามงาน (copy to clipboard)
- [ ] T-08: QR Code สำหรับพิมพ์ติดบนใบงาน
- [ ] I-10: แจ้งเตือนสินค้าใกล้หมด (complete partial — fix dashboard query + add filter)
- [ ] J-13: พิมพ์ใบงานปัก (Job Order print slip)

### Tier 2 — Medium
- [ ] J-11: อัปโหลดรูปแบบงาน (design image upload)
- [ ] J-12: แจ้งเตือนงานใกล้ถึงกำหนด (badge/alert)
- [ ] J-14: ประวัติการเปลี่ยนสถานะ (audit trail display)
- [ ] UX-06: Card view สำหรับ Inventory (mobile)
- [ ] UX-07: Card view สำหรับ Customers (mobile)
- [ ] UX-08: Card view สำหรับ Reports (mobile)
- [ ] UX-09: Loading skeleton
- [ ] I-11: นำเข้าสินค้าจาก Excel
- [ ] I-12: ส่งออกสินค้าเป็น Excel/CSV
- [ ] I-13: รูปภาพสินค้า (upload)
- [ ] C-06: ระบบสะสมแต้ม (Loyalty Points)
- [ ] C-07: แบ่งกลุ่มลูกค้า (VIP / ทั่วไป)
- [ ] C-08: ส่งออกลูกค้าเป็น Excel
- [ ] R-07: Export รายงานเป็น PDF
- [ ] R-08: Export รายงานเป็น Excel
- [ ] RD-05: แจ้งเตือนอัตรา Void สูงผิดปกติ
- [ ] RD-06: Audit Log display
- [ ] A-10 (already done in Tier 1)

### Tier 3 — Complex
- [ ] IN-01→IN-07: ระบบผ่อนชำระทั้งหมด
- [ ] P-16: POS ผ่อนชำระ (เชื่อมกับ Installments)
- [ ] P-17: คืนสินค้า (Refund)
- [ ] P-18: QR Code พร้อมเพย์ (แสดง QR)
- [ ] P-19: บันทึกลูกค้าในบิล
- [ ] M-01→M-06: Store Map / ผัง shelf
- [ ] C-06 loyalty (ถ้าทำใน Tier 2)
- [ ] R-09: รายงานผ่อนชำระค้าง
- [ ] R-10: รายงานประสิทธิภาพพนักงาน
- [ ] S-05: ตั้งค่า Logo ร้าน
- [ ] S-06: ตั้งค่าการพิมพ์ใบเสร็จ
- [ ] S-07: การแจ้งเตือน (Line/SMS)
- [ ] S-08: Backup/Export ข้อมูล
- [ ] UX-09: PWA / Add to Home Screen
- [ ] UX-10: Offline mode (Service Worker)
- [ ] UX-11: Dark Mode
- [ ] TE-08→TE-12: E2E Tests remaining

---

## TIER 1 TASKS

---

### Task 1: A-10 — Reset Password ผ่าน Email

**Files:**
- Create: `src/app/(auth)/forgot-password/page.tsx`
- Create: `src/app/(auth)/reset-password/page.tsx`
- Modify: `src/app/(auth)/login/page.tsx` (add "ลืมรหัสผ่าน" link)

- [ ] **Step 1: สร้างหน้า forgot-password**

```tsx
// src/app/(auth)/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (err: any) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-orange-100 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ส่งอีเมลแล้ว!</h2>
          <p className="text-gray-600 mb-6">กรุณาตรวจสอบอีเมล <strong>{email}</strong> และคลิก link เพื่อตั้งรหัสผ่านใหม่</p>
          <Link href="/login" className="pos-btn-primary inline-block">กลับหน้าเข้าสู่ระบบ</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-orange-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">ลืมรหัสผ่าน</h1>
          <p className="text-gray-500 mt-2">กรอกอีเมล เราจะส่ง link ตั้งรหัสผ่านใหม่ให้</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="pos-label">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pos-input"
              placeholder="example@email.com"
              required
              disabled={loading}
            />
          </div>
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-base font-medium">
              {error}
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full pos-btn-primary text-xl py-4 disabled:opacity-50">
            {loading ? 'กำลังส่ง...' : 'ส่ง Link รีเซ็ตรหัสผ่าน'}
          </button>
          <div className="text-center">
            <Link href="/login" className="text-brand-600 hover:text-brand-700 text-base font-medium">กลับหน้าเข้าสู่ระบบ</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: สร้างหน้า reset-password**

```tsx
// src/app/(auth)/reset-password/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('รหัสผ่านไม่ตรงกัน')
      return
    }
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: any) {
      setError('เกิดข้อผิดพลาด link อาจหมดอายุแล้ว')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-orange-100 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800">เปลี่ยนรหัสผ่านสำเร็จ!</h2>
          <p className="text-gray-600 mt-2">กำลังพาไปหน้าเข้าสู่ระบบ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-orange-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">ตั้งรหัสผ่านใหม่</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="pos-label">รหัสผ่านใหม่</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="pos-input" placeholder="อย่างน้อย 6 ตัวอักษร" required disabled={loading} />
          </div>
          <div>
            <label className="pos-label">ยืนยันรหัสผ่าน</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="pos-input" placeholder="กรอกรหัสผ่านอีกครั้ง" required disabled={loading} />
          </div>
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-base font-medium">{error}</div>
          )}
          <button type="submit" disabled={loading} className="w-full pos-btn-primary text-xl py-4 disabled:opacity-50">
            {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: เพิ่ม link "ลืมรหัสผ่าน" ในหน้า login**

ใน `src/app/(auth)/login/page.tsx` หลัง `</form>` เพิ่ม:
```tsx
<div className="mt-4 text-center">
  <a href="/forgot-password" className="text-gray-500 hover:text-brand-600 text-sm">
    ลืมรหัสผ่าน?
  </a>
</div>
```

- [ ] **Step 4: ทดสอบ**

```bash
npm run dev
# 1. ไปที่ /login → คลิก "ลืมรหัสผ่าน?" → ควรไป /forgot-password
# 2. กรอก email จริง → ส่งสำเร็จ → เห็น success state
# 3. ไปที่ /reset-password → ลองตั้งรหัสผ่านใหม่
```

- [ ] **Step 5: Commit**

```bash
git add src/app/\(auth\)/forgot-password/page.tsx src/app/\(auth\)/reset-password/page.tsx src/app/\(auth\)/login/page.tsx
git commit -m "feat: add forgot password and reset password pages (A-10)"
```

---

### Task 2: T-07 + T-08 — Share Link + QR Code สำหรับใบงาน

**Files:**
- Create: `src/components/job-orders/JobOrderShare.tsx` (share button + QR dialog)
- Modify: `src/app/(dashboard)/job-orders/[id]/page.tsx` (เพิ่ม JobOrderShare)

- [ ] **Step 1: ติดตั้ง qrcode package**

```bash
npm install qrcode @types/qrcode
```

- [ ] **Step 2: สร้าง JobOrderShare component**

```tsx
// src/components/job-orders/JobOrderShare.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { toast } from 'sonner'

interface Props {
  orderNumber: string
}

export default function JobOrderShare({ orderNumber }: Props) {
  const [showQR, setShowQR] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/track/${orderNumber}`
    : `/track/${orderNumber}`

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/track/${orderNumber}`
    await navigator.clipboard.writeText(url)
    toast.success('คัดลอก link แล้ว!')
  }

  const handleShowQR = async () => {
    setShowQR(true)
    const url = `${window.location.origin}/track/${orderNumber}`
    const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 })
    setQrDataUrl(dataUrl)
  }

  const handleDownloadQR = () => {
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `QR-${orderNumber}.png`
    link.click()
  }

  const handlePrintQR = () => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>QR Code - ${orderNumber}</title>
      <style>body{font-family:sans-serif;text-align:center;padding:20px}img{width:250px}</style>
      </head><body>
      <h2>ใบงาน ${orderNumber}</h2>
      <img src="${qrDataUrl}" />
      <p>สแกนเพื่อติดตามสถานะงาน</p>
      <p style="font-size:12px;color:#666">${window.location.origin}/track/${orderNumber}</p>
      <script>window.onload=()=>{window.print();window.close()}</script>
      </body></html>
    `)
    win.document.close()
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={handleCopyLink}
          className="pos-btn-secondary text-sm px-4 py-2"
        >
          🔗 คัดลอก Link
        </button>
        <button
          onClick={handleShowQR}
          className="pos-btn-secondary text-sm px-4 py-2"
        >
          📱 QR Code
        </button>
      </div>

      {showQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">QR Code ติดตามงาน</h3>
            <p className="text-gray-500 text-sm mb-4">{orderNumber}</p>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="mx-auto mb-4 rounded-xl" />
            ) : (
              <div className="w-[300px] h-[300px] mx-auto bg-gray-100 rounded-xl animate-pulse mb-4" />
            )}
            <p className="text-xs text-gray-400 mb-4 break-all">{typeof window !== 'undefined' ? `${window.location.origin}/track/${orderNumber}` : ''}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleDownloadQR} className="pos-btn-secondary text-sm">
                💾 ดาวน์โหลด
              </button>
              <button onClick={handlePrintQR} className="pos-btn-secondary text-sm">
                🖨️ พิมพ์
              </button>
              <button onClick={() => setShowQR(false)} className="pos-btn-primary text-sm">
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 3: เพิ่ม JobOrderShare ในหน้า Job Order detail**

ใน `src/app/(dashboard)/job-orders/[id]/page.tsx`:
```tsx
import JobOrderShare from '@/components/job-orders/JobOrderShare'

// ใน return, ต่อจาก PageHeader actions หรือใน Customer card เพิ่ม:
// ภายใน Customer card section ต่อจาก phone:
<div className="mt-4 pt-4 border-t border-gray-100">
  <p className="text-sm text-gray-500 mb-2">แชร์ให้ลูกค้าติดตามงาน</p>
  <JobOrderShare orderNumber={job.order_number} />
</div>
```

- [ ] **Step 4: ทดสอบ**

```bash
npm run dev
# ไปที่ /job-orders/[id] → เห็นปุ่ม "🔗 คัดลอก Link" และ "📱 QR Code"
# คลิก Copy → เห็น toast "คัดลอก link แล้ว!"
# คลิก QR → เห็น dialog พร้อม QR image, ปุ่มดาวน์โหลด/พิมพ์
```

- [ ] **Step 5: Commit**

```bash
git add src/components/job-orders/JobOrderShare.tsx src/app/\(dashboard\)/job-orders/\[id\]/page.tsx
git commit -m "feat: add share link and QR code for job orders (T-07, T-08)"
```

---

### Task 3: I-10 — แจ้งเตือนสินค้าใกล้หมด (complete partial)

**ปัญหาที่มีอยู่:**
- Dashboard ใช้ `lt('stock_quantity', 10)` แทนที่จะใช้ `low_stock_threshold`
- InventoryClient ไม่รับ `?filter=low_stock` จาก URL

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx` (fix query)
- Modify: `src/app/(dashboard)/inventory/page.tsx` (pass searchParams)
- Modify: `src/components/inventory/InventoryClient.tsx` (handle filter + show alert banner)

- [ ] **Step 1: แก้ dashboard query ให้ใช้ low_stock_threshold จริง**

ใน `src/app/(dashboard)/dashboard/page.tsx` แก้ query:
```tsx
// เปลี่ยนจาก:
supabase.from('product_variants').select('id, sku, stock_quantity, low_stock_threshold, product:products(name)')
  .lt('stock_quantity', 10).eq('is_active', true).limit(10),

// เป็น (ใช้ filter ที่ถูกต้อง - Supabase ไม่รองรับ column comparison โดยตรง ดังนั้นใช้ rpc หรือ filter หลัง fetch):
supabase.from('product_variants').select('id, sku, stock_quantity, low_stock_threshold, product:products(name)')
  .eq('is_active', true).order('stock_quantity', { ascending: true }).limit(50),
```

แล้ว filter ใน JS:
```tsx
const allVariants = lowStockRaw || []
const lowStockItems = allVariants
  .filter((v: any) => v.stock_quantity <= v.low_stock_threshold)
  .slice(0, 10)
```

- [ ] **Step 2: เพิ่ม searchParams ใน inventory page**

ใน `src/app/(dashboard)/inventory/page.tsx`:
```tsx
export default async function InventoryPage({ searchParams }: { searchParams: { filter?: string } }) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  const showLowStockOnly = searchParams.filter === 'low_stock'
  // ...
  return (
    <div>
      {/* ... */}
      <InventoryClient products={products} categories={categories} defaultFilter={showLowStockOnly ? 'low_stock' : undefined} />
    </div>
  )
}
```

- [ ] **Step 3: เพิ่ม low_stock filter และ alert banner ใน InventoryClient**

ใน `src/components/inventory/InventoryClient.tsx`:
```tsx
interface InventoryClientProps {
  products: (Product & { category: Category | null; variants: any[] })[]
  categories: Category[]
  defaultFilter?: string
}

export default function InventoryClient({ products, categories, defaultFilter }: InventoryClientProps) {
  const [showLowStockOnly, setShowLowStockOnly] = useState(defaultFilter === 'low_stock')
  // ...

  const lowStockProducts = products.filter(p =>
    p.variants?.some((v: any) => v.stock_quantity <= v.low_stock_threshold && v.is_active)
  )

  const filtered = useMemo(() => {
    let base = showLowStockOnly ? lowStockProducts : products
    return base.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || /* ... */
      const matchCategory = categoryFilter === 'all' || p.category_id === categoryFilter
      return matchSearch && matchCategory
    })
  }, [products, search, categoryFilter, showLowStockOnly])

  return (
    <div>
      {lowStockProducts.length > 0 && (
        <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-red-700">สินค้าใกล้หมด {lowStockProducts.length} รายการ</p>
              <p className="text-sm text-red-600">ควรสั่งซื้อเพิ่มเติม</p>
            </div>
          </div>
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`text-sm px-4 py-2 rounded-lg font-semibold ${showLowStockOnly ? 'bg-red-200 text-red-800' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
          >
            {showLowStockOnly ? 'ดูทั้งหมด' : 'ดูสินค้าใกล้หมด'}
          </button>
        </div>
      )}
      {/* rest of existing code */}
    </div>
  )
}
```

- [ ] **Step 4: ทดสอบ**

```bash
npm run dev
# ไปที่ /dashboard → ตรวจสอบ widget สินค้าใกล้หมดใช้ threshold จริง
# ไปที่ /inventory → ถ้ามีสินค้าใกล้หมด เห็น banner แดง + ปุ่มกรอง
# ไปที่ /inventory?filter=low_stock → เห็นเฉพาะสินค้าใกล้หมด
```

- [ ] **Step 5: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/page.tsx src/app/\(dashboard\)/inventory/page.tsx src/components/inventory/InventoryClient.tsx
git commit -m "feat: complete low stock alert with threshold-based filtering (I-10)"
```

---

### Task 4: J-13 — พิมพ์ใบงานปัก (Job Order Print Slip)

**Files:**
- Create: `src/components/job-orders/JobOrderPrint.tsx`
- Modify: `src/app/(dashboard)/job-orders/[id]/page.tsx`

- [ ] **Step 1: สร้าง JobOrderPrint component**

```tsx
// src/components/job-orders/JobOrderPrint.tsx
'use client'

import { formatCurrency, formatDate } from '@/lib/utils'

interface Props {
  job: {
    order_number: string
    customer_name: string
    customer_phone: string
    description: string
    garment_type?: string
    quantity: number
    quoted_price: number
    deposit_amount: number
    balance_due: number
    status: string
    estimated_completion_date?: string
    notes?: string
  }
  storeName?: string
  storePhone?: string
}

export default function JobOrderPrint({ job, storeName = 'LookKuan', storePhone = '' }: Props) {
  const handlePrint = () => window.print()

  return (
    <>
      {/* Print button — ซ่อนตอนพิมพ์จริง */}
      <button onClick={handlePrint} className="pos-btn-secondary text-sm px-4 py-2 print:hidden">
        🖨️ พิมพ์ใบงาน
      </button>

      {/* Print area — ซ่อนบนหน้าจอ แสดงตอนพิมพ์ */}
      <div className="hidden print:block print-slip">
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .print-slip, .print-slip * { visibility: visible; }
            .print-slip { position: fixed; top: 0; left: 0; width: 100%; }
          }
        `}</style>
        <div style={{ fontFamily: 'Sarabun, sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{storeName}</h1>
            {storePhone && <p style={{ margin: '4px 0', color: '#555' }}>โทร: {storePhone}</p>}
            <h2 style={{ fontSize: '18px', margin: '8px 0 0' }}>ใบงานปัก</h2>
          </div>

          {/* Order info */}
          <table style={{ width: '100%', marginBottom: '16px' }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 'bold', paddingRight: '8px' }}>เลขที่ใบงาน:</td>
                <td style={{ fontSize: '20px', fontWeight: 'bold' }}>{job.order_number}</td>
                <td style={{ textAlign: 'right', color: '#555' }}>วันที่: {formatDate(new Date().toISOString())}</td>
              </tr>
            </tbody>
          </table>

          {/* Customer */}
          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '14px', color: '#555' }}>ข้อมูลลูกค้า</h3>
            <p style={{ margin: '4px 0', fontWeight: 'bold', fontSize: '18px' }}>{job.customer_name}</p>
            <p style={{ margin: '4px 0' }}>โทร: {job.customer_phone}</p>
          </div>

          {/* Job details */}
          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '14px', color: '#555' }}>รายละเอียดงาน</h3>
            <p style={{ margin: '4px 0' }}><strong>รายละเอียดการปัก:</strong> {job.description}</p>
            {job.garment_type && <p style={{ margin: '4px 0' }}><strong>ประเภทเสื้อ:</strong> {job.garment_type}</p>}
            <p style={{ margin: '4px 0' }}><strong>จำนวน:</strong> {job.quantity} ตัว</p>
            {job.estimated_completion_date && (
              <p style={{ margin: '4px 0' }}><strong>กำหนดเสร็จ:</strong> {formatDate(job.estimated_completion_date)}</p>
            )}
            {job.notes && <p style={{ margin: '4px 0' }}><strong>หมายเหตุ:</strong> {job.notes}</p>}
          </div>

          {/* Payment */}
          <div style={{ border: '2px solid #000', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '14px', color: '#555' }}>สรุปการเงิน</h3>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td>ราคาที่เสนอ</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(job.quoted_price)}</td>
                </tr>
                <tr>
                  <td>มัดจำ</td>
                  <td style={{ textAlign: 'right', color: 'green' }}>-{formatCurrency(job.deposit_amount)}</td>
                </tr>
                <tr style={{ borderTop: '1px solid #ccc' }}>
                  <td style={{ fontWeight: 'bold', fontSize: '16px', paddingTop: '8px' }}>ยอดค้างชำระ</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '18px', color: job.balance_due > 0 ? 'orange' : 'green', paddingTop: '8px' }}>
                    {formatCurrency(job.balance_due)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', marginBottom: '8px', paddingTop: '40px' }}></div>
              <p style={{ margin: 0, fontSize: '14px' }}>ลายเซ็นลูกค้า</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', marginBottom: '8px', paddingTop: '40px' }}></div>
              <p style={{ margin: 0, fontSize: '14px' }}>ลายเซ็นพนักงาน</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: เพิ่ม JobOrderPrint ใน job order detail page**

ใน `src/app/(dashboard)/job-orders/[id]/page.tsx` เพิ่ม import และใช้ใน actions:

```tsx
import JobOrderPrint from '@/components/job-orders/JobOrderPrint'

// ใน PageHeader actions (เพิ่มเข้าไปใน flex container):
actions={
  <div className="flex gap-3 flex-wrap">
    <JobOrderPrint job={job} storeName={process.env.NEXT_PUBLIC_STORE_NAME} storePhone={process.env.NEXT_PUBLIC_STORE_PHONE} />
    <JobOrderActions jobOrder={job} />
  </div>
}
```

- [ ] **Step 3: ทดสอบ**

```bash
npm run dev
# ไปที่ /job-orders/[id] → เห็นปุ่ม "🖨️ พิมพ์ใบงาน"
# คลิก → เปิด print dialog → เห็น layout ใบงานสวยงาม
# ตรวจสอบว่า header store, ข้อมูลลูกค้า, รายละเอียดงาน, การเงิน ครบถ้วน
```

- [ ] **Step 4: Commit**

```bash
git add src/components/job-orders/JobOrderPrint.tsx src/app/\(dashboard\)/job-orders/\[id\]/page.tsx
git commit -m "feat: add job order print slip (J-13)"
```

---

## TIER 2 TASKS

---

### Task 5: J-11 — อัปโหลดรูปแบบงาน (Design Image)

**Files:**
- Modify: `src/app/(dashboard)/job-orders/new/page.tsx` (เพิ่ม image upload)
- Modify: `src/app/(dashboard)/job-orders/[id]/page.tsx` (แสดงรูป)
- Modify: `src/components/job-orders/JobOrderActions.tsx` (edit form ด้วย)

> **หมายเหตุ:** ต้องสร้าง Supabase Storage bucket `job-designs` ก่อน (public bucket)

- [ ] **Step 1: สร้าง Storage bucket ใน Supabase**

ใน Supabase dashboard → Storage → New bucket: `job-designs` (public: true)

หรือเพิ่ม migration:
```sql
-- supabase/migrations/00002_storage.sql
insert into storage.buckets (id, name, public) values ('job-designs', 'job-designs', true);
create policy "Public read" on storage.objects for select using (bucket_id = 'job-designs');
create policy "Auth upload" on storage.objects for insert with check (bucket_id = 'job-designs' and auth.role() = 'authenticated');
create policy "Auth delete" on storage.objects for delete using (bucket_id = 'job-designs' and auth.role() = 'authenticated');
```

- [ ] **Step 2: สร้าง ImageUpload component**

```tsx
// src/components/shared/ImageUpload.tsx
'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  bucket: string
  value?: string | null
  onChange: (url: string | null) => void
  label?: string
}

export default function ImageUpload({ bucket, value, onChange, label = 'รูปภาพ' }: Props) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ไฟล์ต้องมีขนาดไม่เกิน 5MB')
      return
    }
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { error } = await supabase.storage.from(bucket).upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      onChange(data.publicUrl)
      toast.success('อัปโหลดรูปสำเร็จ')
    } catch (err: any) {
      toast.error('อัปโหลดไม่สำเร็จ')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => onChange(null)

  return (
    <div>
      <label className="pos-label">{label}</label>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="design" className="w-full max-w-xs rounded-xl border border-gray-200 object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600"
          >✕</button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-r-transparent" />
              <p className="text-gray-500">กำลังอัปโหลด...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl">📷</span>
              <p className="text-gray-600 font-medium">คลิกเพื่ออัปโหลดรูป</p>
              <p className="text-gray-400 text-sm">JPG, PNG, WEBP (สูงสุด 5MB)</p>
            </div>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]) }}
        disabled={uploading}
      />
    </div>
  )
}
```

- [ ] **Step 3: เพิ่ม design_image_url ใน new job order form**

ใน `src/app/(dashboard)/job-orders/new/page.tsx` เพิ่ม ImageUpload:
```tsx
import ImageUpload from '@/components/shared/ImageUpload'

// ใน form state:
const [designImageUrl, setDesignImageUrl] = useState<string | null>(null)

// ใน form fields:
<ImageUpload
  bucket="job-designs"
  value={designImageUrl}
  onChange={setDesignImageUrl}
  label="รูปแบบงาน (ไม่บังคับ)"
/>

// ใน handleSubmit เพิ่ม field:
design_image_url: designImageUrl,
```

- [ ] **Step 4: แสดงรูปใน Job Order detail**

ใน `src/app/(dashboard)/job-orders/[id]/page.tsx` ใน Job Details section:
```tsx
{job.design_image_url && (
  <div>
    <span className="text-sm text-gray-500">รูปแบบงาน</span>
    <img
      src={job.design_image_url}
      alt="design"
      className="mt-2 rounded-xl border border-gray-200 max-w-full max-h-64 object-contain"
    />
  </div>
)}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/ImageUpload.tsx src/app/\(dashboard\)/job-orders/new/page.tsx src/app/\(dashboard\)/job-orders/\[id\]/page.tsx
git commit -m "feat: add design image upload for job orders (J-11)"
```

---

### Task 6: J-12 — แจ้งเตือนงานใกล้ถึงกำหนด

**Files:**
- Modify: `src/app/(dashboard)/job-orders/page.tsx` (เพิ่ม due soon banner)
- Modify: `src/app/(dashboard)/dashboard/page.tsx` (เพิ่ม widget)

- [ ] **Step 1: เพิ่ม due-soon query ใน dashboard**

ใน `src/app/(dashboard)/dashboard/page.tsx` เพิ่มใน getDashboardStats:
```tsx
// งานที่กำหนดเสร็จภายใน 3 วัน แต่ยังไม่เสร็จ
const threeDaysFromNow = new Date()
threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
const { data: dueSoonJobs } = await supabase
  .from('job_orders')
  .select('id, order_number, customer_name, estimated_completion_date, status')
  .in('status', ['pending', 'in_progress'])
  .not('estimated_completion_date', 'is', null)
  .lte('estimated_completion_date', threeDaysFromNow.toISOString().split('T')[0])
  .order('estimated_completion_date', { ascending: true })

return { ..., dueSoonJobs: dueSoonJobs || [] }
```

- [ ] **Step 2: แสดง widget ใน dashboard**

```tsx
{dueSoonJobs.length > 0 && (
  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <span className="text-2xl">⏰</span>
      <h3 className="text-lg font-bold text-orange-800">งานใกล้ถึงกำหนด ({dueSoonJobs.length} งาน)</h3>
    </div>
    <div className="space-y-2">
      {dueSoonJobs.map((job: any) => (
        <Link key={job.id} href={`/job-orders/${job.id}`}
          className="flex items-center justify-between bg-white rounded-lg p-3 hover:shadow-sm transition-shadow">
          <div>
            <p className="font-semibold text-gray-800">{job.order_number}</p>
            <p className="text-sm text-gray-500">{job.customer_name}</p>
          </div>
          <span className="text-sm font-semibold text-orange-600">{formatDate(job.estimated_completion_date)}</span>
        </Link>
      ))}
    </div>
    <Link href="/job-orders" className="inline-block mt-3 text-orange-700 font-semibold hover:text-orange-800 text-sm">
      ดูงานทั้งหมด →
    </Link>
  </div>
)}
```

- [ ] **Step 3: เพิ่ม badge ในหน้า Job Orders list**

ใน job order card/row เพิ่ม badge เมื่อ `estimated_completion_date` อยู่ภายใน 3 วัน:
```tsx
const isDueSoon = job.estimated_completion_date &&
  new Date(job.estimated_completion_date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) &&
  !['completed', 'delivered', 'cancelled'].includes(job.status)

{isDueSoon && (
  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">⏰ ใกล้กำหนด</span>
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/page.tsx src/app/\(dashboard\)/job-orders/page.tsx
git commit -m "feat: add due-soon alerts for job orders (J-12)"
```

---

### Task 7: J-14 — ประวัติการเปลี่ยนสถานะ (Audit Trail Display)

**หมายเหตุ:** audit_logs table มีอยู่แล้ว (JobOrderActions เขียนลงแล้ว)

**Files:**
- Modify: `src/app/(dashboard)/job-orders/[id]/page.tsx` (fetch + แสดง audit logs)

- [ ] **Step 1: Fetch audit logs ใน getJobOrder function**

```tsx
// เพิ่มใน getJobOrder function:
const { data: auditLogs } = await supabase
  .from('audit_logs')
  .select('*, user:profiles(full_name)')
  .eq('entity_type', 'job_order')
  .eq('entity_id', id)
  .eq('action', 'update_job_status')
  .order('created_at', { ascending: false })

return { ...job, ..., auditLogs: auditLogs || [] }
```

- [ ] **Step 2: แสดง audit trail ใน UI**

```tsx
{job.auditLogs && job.auditLogs.length > 0 && (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <h2 className="text-lg font-bold text-gray-800 mb-4">📋 ประวัติการเปลี่ยนสถานะ</h2>
    <div className="space-y-3">
      {job.auditLogs.map((log: any, i: number) => (
        <div key={log.id} className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                {JOB_STATUS_LABELS[log.old_value?.status as JobStatus] || log.old_value?.status}
                {' → '}
                {JOB_STATUS_LABELS[log.new_value?.status as JobStatus] || log.new_value?.status}
              </p>
              <span className="text-xs text-gray-400">{formatDateTime(log.created_at)}</span>
            </div>
            <p className="text-xs text-gray-500">โดย {log.user?.full_name || 'ระบบ'}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/job-orders/\[id\]/page.tsx
git commit -m "feat: display job order status change audit trail (J-14)"
```

---

### Task 8: UX-06, 07, 08 — Card View สำหรับ Mobile

**Files:**
- Modify: `src/components/inventory/InventoryClient.tsx`
- Modify: `src/components/customers/CustomersClient.tsx` (ถ้ามี)
- Modify: `src/app/(dashboard)/customers/page.tsx`

- [ ] **Step 1: เพิ่ม mobile card view ใน InventoryClient**

ใน `src/components/inventory/InventoryClient.tsx` เพิ่ม card view ด้านล่าง filter:
```tsx
{/* Mobile Card View */}
<div className="block sm:hidden space-y-3">
  {filtered.map((product) => {
    const totalStock = product.variants?.reduce((sum: number, v: any) => sum + v.stock_quantity, 0) || 0
    const hasLowStock = product.variants?.some((v: any) => v.stock_quantity <= v.low_stock_threshold && v.is_active)
    return (
      <Link key={product.id} href={`/inventory/${product.id}`}
        className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">👕</div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 truncate">{product.name}</p>
              <p className="text-sm text-gray-500">{product.sku_prefix}</p>
              <p className="text-sm text-gray-500">{product.category?.name}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-brand-600">{formatCurrency(product.base_price)}</p>
            <p className={`text-sm font-semibold ${hasLowStock ? 'text-red-600' : 'text-gray-600'}`}>
              สต็อก: {totalStock}
            </p>
            {hasLowStock && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">ใกล้หมด</span>}
          </div>
        </div>
      </Link>
    )
  })}
</div>
{/* Desktop table */}
<div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
  {/* existing table */}
</div>
```

- [ ] **Step 2: ตรวจสอบและเพิ่ม card view ใน Customers page**

```bash
ls src/components/customers/ 2>/dev/null || echo "check structure"
cat src/app/\(dashboard\)/customers/page.tsx | head -50
```

เพิ่ม mobile card view แบบเดียวกันกับ Inventory

- [ ] **Step 3: Commit**

```bash
git add src/components/inventory/InventoryClient.tsx src/app/\(dashboard\)/customers/
git commit -m "feat: add mobile card views for inventory and customers (UX-06, UX-07)"
```

---

### Task 9: UX-09 — Loading Skeleton

**Files:**
- Create: `src/components/shared/Skeleton.tsx`
- Modify: `src/app/(dashboard)/inventory/loading.tsx` (create)
- Modify: `src/app/(dashboard)/customers/loading.tsx` (create)
- Modify: `src/app/(dashboard)/job-orders/loading.tsx` (create)

- [ ] **Step 1: สร้าง Skeleton component**

```tsx
// src/components/shared/Skeleton.tsx
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex gap-3">
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="stat-card space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: สร้าง loading.tsx สำหรับแต่ละ section**

```tsx
// src/app/(dashboard)/inventory/loading.tsx
import { SkeletonStats, SkeletonTable } from '@/components/shared/Skeleton'
export default function Loading() {
  return (
    <div>
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
      <SkeletonStats />
      <SkeletonTable rows={8} />
    </div>
  )
}
```

สร้างแบบเดียวกันสำหรับ `/customers/loading.tsx`, `/job-orders/loading.tsx`, `/reports/loading.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/Skeleton.tsx src/app/\(dashboard\)/inventory/loading.tsx src/app/\(dashboard\)/customers/loading.tsx src/app/\(dashboard\)/job-orders/loading.tsx src/app/\(dashboard\)/reports/loading.tsx
git commit -m "feat: add loading skeleton components (UX-09)"
```

---

### Task 10: I-12 + C-08 — Export ข้อมูลเป็น Excel/CSV

**Files:**
- Create: `src/lib/export.ts` (utility functions)
- Modify: `src/components/inventory/InventoryClient.tsx`
- Modify: `src/app/(dashboard)/customers/page.tsx` (or client component)

- [ ] **Step 1: ติดตั้ง xlsx**

```bash
npm install xlsx
```

- [ ] **Step 2: สร้าง export utility**

```ts
// src/lib/export.ts
import * as XLSX from 'xlsx'

export function exportToExcel(data: Record<string, any>[], filename: string, sheetName = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportToCSV(data: Record<string, any>[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(ws)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 3: เพิ่มปุ่ม Export ใน InventoryClient**

```tsx
import { exportToExcel, exportToCSV } from '@/lib/export'

// ใน InventoryClient เพิ่มปุ่ม:
const handleExportExcel = () => {
  const data = filtered.map(p => ({
    'ชื่อสินค้า': p.name,
    'หมวดหมู่': p.category?.name || '',
    'SKU Prefix': p.sku_prefix,
    'ราคาฐาน': p.base_price,
    'จำนวน Variants': p.variants?.length || 0,
    'สต็อกรวม': p.variants?.reduce((s: number, v: any) => s + v.stock_quantity, 0) || 0,
  }))
  exportToExcel(data, 'inventory-export')
}

// ใน JSX เพิ่มปุ่ม:
<button onClick={handleExportExcel} className="pos-btn-secondary text-sm">
  📊 Export Excel
</button>
```

- [ ] **Step 4: เพิ่มปุ่ม Export ใน Customers**

```tsx
const handleExportCustomers = () => {
  const data = customers.map(c => ({
    'ชื่อ': c.full_name,
    'โทรศัพท์': c.phone || '',
    'อีเมล': c.email || '',
    'ยอดซื้อสะสม': c.total_spent || 0,
    'จำนวนคำสั่งซื้อ': c.order_count || 0,
  }))
  exportToExcel(data, 'customers-export')
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/export.ts src/components/inventory/InventoryClient.tsx
git commit -m "feat: add Excel/CSV export for inventory and customers (I-12, C-08)"
```

---

### Task 11: R-07 + R-08 — Export รายงาน PDF/Excel

**Files:**
- Modify: `src/app/(dashboard)/reports/page.tsx` หรือ reports client component
- Modify: `src/lib/export.ts` (เพิ่ม PDF function)

- [ ] **Step 1: ติดตั้ง jspdf**

```bash
npm install jspdf jspdf-autotable @types/jspdf
```

- [ ] **Step 2: เพิ่ม PDF export ใน export utility**

```ts
// เพิ่มใน src/lib/export.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportToPDF(
  title: string,
  columns: string[],
  rows: (string | number)[][],
  filename: string
) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text(title, 14, 22)
  doc.setFontSize(11)
  doc.text(`วันที่ออก: ${new Date().toLocaleDateString('th-TH')}`, 14, 30)
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 36,
    styles: { font: 'helvetica', fontSize: 10 },
    headStyles: { fillColor: [249, 115, 22] },
  })
  doc.save(`${filename}.pdf`)
}
```

- [ ] **Step 3: เพิ่มปุ่ม Export ในหน้า Reports**

ตรวจสอบ reports page structure ก่อน แล้วเพิ่มปุ่ม:
```tsx
<button onClick={handleExportPDF} className="pos-btn-secondary text-sm">📄 Export PDF</button>
<button onClick={handleExportExcel} className="pos-btn-secondary text-sm">📊 Export Excel</button>
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/export.ts src/app/\(dashboard\)/reports/
git commit -m "feat: add PDF and Excel export for reports (R-07, R-08)"
```

---

### Task 12: C-06 — ระบบสะสมแต้ม (Loyalty Points)

**Files:**
- Create: `supabase/migrations/00003_loyalty_points.sql`
- Modify: `src/types/database.ts`
- Modify: `src/app/(dashboard)/customers/[id]/page.tsx`
- Modify: `src/app/api/` (เพิ่ม endpoint บันทึกแต้ม)

- [ ] **Step 1: สร้าง migration**

```sql
-- supabase/migrations/00003_loyalty_points.sql
ALTER TABLE customers ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'general' CHECK (tier IN ('general', 'vip'));

-- Function to update loyalty points after sale
CREATE OR REPLACE FUNCTION add_loyalty_points(p_customer_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
  UPDATE customers
  SET loyalty_points = loyalty_points + FLOOR(p_amount / 100),
      tier = CASE WHEN loyalty_points + FLOOR(p_amount / 100) >= 1000 THEN 'vip' ELSE tier END
  WHERE id = p_customer_id;
$$ LANGUAGE SQL SECURITY DEFINER;
```

- [ ] **Step 2: Push migration**

```bash
npm run db:migrate
```

- [ ] **Step 3: อัปเดต types**

ใน `src/types/database.ts` เพิ่มใน Customer interface:
```ts
loyalty_points: number
tier: 'general' | 'vip'
```

- [ ] **Step 4: แสดงแต้มในหน้า Customer detail**

```tsx
<div className="bg-white rounded-xl border border-gray-200 p-6">
  <h2 className="text-lg font-bold text-gray-800 mb-4">⭐ ความภักดี</h2>
  <div className="flex items-center gap-4">
    <div className="text-center">
      <p className="text-3xl font-bold text-brand-600">{customer.loyalty_points}</p>
      <p className="text-sm text-gray-500">แต้มสะสม</p>
    </div>
    <div className="text-center">
      <span className={`px-4 py-2 rounded-full font-bold text-sm ${customer.tier === 'vip' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
        {customer.tier === 'vip' ? '⭐ VIP' : 'ทั่วไป'}
      </span>
    </div>
  </div>
  <p className="text-xs text-gray-400 mt-3">สะสม 1 แต้มทุกการซื้อ 100 บาท • VIP เมื่อสะสม 1,000 แต้ม</p>
</div>
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/00003_loyalty_points.sql src/types/database.ts
git commit -m "feat: add loyalty points and customer tier system (C-06, C-07)"
```

---

### Task 13: RD-05 + RD-06 — Risk Dashboard: Void Alert + Audit Log

**Files:**
- Modify: `src/app/(dashboard)/risk-dashboard/page.tsx`

- [ ] **Step 1: ดูโครงสร้าง risk-dashboard ที่มีอยู่**

```bash
cat src/app/\(dashboard\)/risk-dashboard/page.tsx | head -100
```

- [ ] **Step 2: เพิ่ม Void Rate Alert**

ถ้าอัตรา void > 5% ของยอดขายวันนี้ แสดง alert banner:
```tsx
const voidRate = todayTransactions > 0 ? (voidCount / todayTransactions) * 100 : 0

{voidRate > 5 && (
  <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-6">
    <div className="flex items-center gap-3">
      <span className="text-3xl">🚨</span>
      <div>
        <h3 className="text-lg font-bold text-red-800">อัตราการ Void สูงผิดปกติ!</h3>
        <p className="text-red-700">อัตรา Void วันนี้: <strong>{voidRate.toFixed(1)}%</strong> (เกิน 5%)</p>
        <p className="text-sm text-red-600">กรุณาตรวจสอบรายการ Void ด้านล่าง</p>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 3: เพิ่ม Audit Log section**

```tsx
// Fetch audit logs ใน page server component:
const { data: recentAuditLogs } = await supabase
  .from('audit_logs')
  .select('*, user:profiles(full_name)')
  .order('created_at', { ascending: false })
  .limit(20)

// Display:
<div className="bg-white rounded-xl border border-gray-200 p-6">
  <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Audit Log ล่าสุด</h2>
  <div className="space-y-2 divide-y divide-gray-100">
    {recentAuditLogs?.map(log => (
      <div key={log.id} className="flex items-start justify-between py-2">
        <div>
          <p className="text-sm font-semibold text-gray-700">{log.action}</p>
          <p className="text-xs text-gray-500">{log.entity_type} #{log.entity_id?.slice(0, 8)}</p>
          <p className="text-xs text-gray-400">โดย {log.user?.full_name || 'ระบบ'}</p>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">{formatDateTime(log.created_at)}</span>
      </div>
    ))}
  </div>
</div>
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/risk-dashboard/page.tsx
git commit -m "feat: add void rate alert and audit log display (RD-05, RD-06)"
```

---

## TIER 3 TASKS

---

### Task 14: IN-01→IN-07 — ระบบผ่อนชำระ (Installments)

**Files:**
- Create: `supabase/migrations/00004_installments.sql`
- Create: `src/app/(dashboard)/installments/page.tsx`
- Create: `src/app/(dashboard)/installments/[id]/page.tsx`
- Create: `src/components/installments/InstallmentList.tsx`
- Create: `src/components/installments/PayInstallmentDialog.tsx`
- Modify: `src/app/(dashboard)/layout.tsx` (เพิ่มเมนู)

- [ ] **Step 1: สร้าง migration**

```sql
-- supabase/migrations/00004_installments.sql
CREATE TABLE installment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id),
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  installment_count INTEGER NOT NULL,
  amount_per_installment NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  notes TEXT
);

CREATE TABLE installment_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES installment_plans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  paid_at TIMESTAMPTZ,
  paid_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue'))
);

ALTER TABLE installment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users full access" ON installment_plans FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access" ON installment_payments FOR ALL USING (auth.role() = 'authenticated');
```

- [ ] **Step 2: Push migration**

```bash
npm run db:migrate
```

- [ ] **Step 3: สร้างหน้า Installments list**

```tsx
// src/app/(dashboard)/installments/page.tsx
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/shared/PageHeader'
import InstallmentList from '@/components/installments/InstallmentList'

async function getInstallments() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('installment_plans')
    .select('*, payments:installment_payments(*)')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function InstallmentsPage() {
  const plans = await getInstallments()
  const overdueCount = plans.filter(p =>
    p.payments?.some((pay: any) => pay.status === 'pending' && new Date(pay.due_date) < new Date())
  ).length

  return (
    <div>
      <PageHeader title="ผ่อนชำระ" description={`แผนทั้งหมด ${plans.length} รายการ`} />
      {overdueCount > 0 && (
        <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="font-bold text-red-700">⚠️ มีงวดค้างชำระ {overdueCount} แผน</p>
        </div>
      )}
      <InstallmentList plans={plans} />
    </div>
  )
}
```

- [ ] **Step 4: สร้าง InstallmentList component**

```tsx
// src/components/installments/InstallmentList.tsx
'use client'

import { useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

type Plan = any

interface Props { plans: Plan[] }

export default function InstallmentList({ plans }: Props) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all')

  const today = new Date()

  const getStatus = (plan: Plan) => {
    const payments = plan.payments || []
    const allPaid = payments.every((p: any) => p.status === 'paid')
    if (allPaid) return 'paid'
    const hasOverdue = payments.some((p: any) => p.status === 'pending' && new Date(p.due_date) < today)
    if (hasOverdue) return 'overdue'
    return 'pending'
  }

  const filtered = plans.filter(p => filter === 'all' || getStatus(p) === filter)

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: 'all', label: 'ทั้งหมด' },
          { key: 'pending', label: 'รอชำระ' },
          { key: 'overdue', label: 'ค้างชำระ' },
          { key: 'paid', label: 'ชำระแล้ว' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${filter === tab.key ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Plans list */}
      <div className="space-y-3">
        {filtered.map(plan => {
          const paidCount = plan.payments?.filter((p: any) => p.status === 'paid').length || 0
          const status = getStatus(plan)
          return (
            <Link key={plan.id} href={`/installments/${plan.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-800">{plan.customer_name}</p>
                  <p className="text-sm text-gray-500">ยอดรวม {formatCurrency(plan.total_amount)}</p>
                  <p className="text-sm text-gray-500">ชำระแล้ว {paidCount}/{plan.installment_count} งวด</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  status === 'paid' ? 'bg-green-100 text-green-700' :
                  status === 'overdue' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {status === 'paid' ? '✅ ชำระแล้ว' : status === 'overdue' ? '🚨 ค้างชำระ' : '⏳ รอชำระ'}
                </span>
              </div>
            </Link>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">ไม่มีรายการ</div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: สร้างหน้า Installment detail + บันทึกการชำระ**

```tsx
// src/app/(dashboard)/installments/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import PageHeader from '@/components/shared/PageHeader'
import PayInstallmentButton from '@/components/installments/PayInstallmentButton'

export default async function InstallmentDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: plan } = await supabase
    .from('installment_plans')
    .select('*, payments:installment_payments(*)')
    .eq('id', params.id)
    .single()

  if (!plan) notFound()

  const payments = [...(plan.payments || [])].sort((a: any, b: any) => a.installment_number - b.installment_number)

  return (
    <div>
      <PageHeader title={`ผ่อนชำระ — ${plan.customer_name}`} backHref="/installments" />
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div><p className="text-sm text-gray-500">ยอดรวม</p><p className="text-xl font-bold">{formatCurrency(plan.total_amount)}</p></div>
          <div><p className="text-sm text-gray-500">จำนวนงวด</p><p className="text-xl font-bold">{plan.installment_count}</p></div>
          <div><p className="text-sm text-gray-500">งวดละ</p><p className="text-xl font-bold">{formatCurrency(plan.amount_per_installment)}</p></div>
          <div>
            <p className="text-sm text-gray-500">ชำระแล้ว</p>
            <p className="text-xl font-bold text-green-600">
              {payments.filter((p: any) => p.status === 'paid').length}/{plan.installment_count}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="data-table">
          <thead><tr><th>งวดที่</th><th>ครบกำหนด</th><th>ยอด</th><th>สถานะ</th><th></th></tr></thead>
          <tbody>
            {payments.map((pay: any) => (
              <tr key={pay.id}>
                <td className="font-bold">งวด {pay.installment_number}</td>
                <td>{formatDate(pay.due_date)}</td>
                <td className="font-semibold">{formatCurrency(pay.amount)}</td>
                <td>
                  {pay.status === 'paid'
                    ? <span className="status-badge bg-green-100 text-green-700">✅ ชำระแล้ว</span>
                    : new Date(pay.due_date) < new Date()
                    ? <span className="status-badge bg-red-100 text-red-700">🚨 ค้างชำระ</span>
                    : <span className="status-badge bg-yellow-100 text-yellow-700">⏳ รอชำระ</span>
                  }
                </td>
                <td>
                  {pay.status !== 'paid' && <PayInstallmentButton paymentId={pay.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: สร้าง PayInstallmentButton**

```tsx
// src/components/installments/PayInstallmentButton.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

export default function PayInstallmentButton({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { profile } = useAuth()

  const handlePay = async () => {
    if (!confirm('ยืนยันการรับชำระงวดนี้?')) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('installment_payments')
        .update({ status: 'paid', paid_at: new Date().toISOString(), paid_by: profile?.id })
        .eq('id', paymentId)
      if (error) throw error
      toast.success('บันทึกการชำระสำเร็จ')
      router.refresh()
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handlePay} disabled={loading} className="pos-btn-primary text-sm px-3 py-1 disabled:opacity-50">
      {loading ? '...' : 'รับชำระ'}
    </button>
  )
}
```

- [ ] **Step 7: เพิ่มเมนู Installments**

ใน `src/app/(dashboard)/layout.tsx` หรือ sidebar component เพิ่ม:
```tsx
{ href: '/installments', label: 'ผ่อนชำระ', icon: '💳', roles: ['admin', 'manager', 'cashier'] }
```

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/00004_installments.sql src/app/\(dashboard\)/installments/ src/components/installments/
git commit -m "feat: implement installment payment system (IN-01 to IN-07)"
```

---

### Task 15: P-17 — คืนสินค้า (Refund)

**Files:**
- Create: `src/app/(dashboard)/pos/refund/page.tsx`
- Create: `src/components/pos/RefundForm.tsx`
- Create: `src/app/api/refunds/route.ts`

- [ ] **Step 1: สร้าง refunds table migration**

```sql
-- supabase/migrations/00005_refunds.sql
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id),
  reason TEXT NOT NULL,
  refund_amount NUMERIC NOT NULL,
  items JSONB DEFAULT '[]',
  processed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users full access" ON refunds FOR ALL USING (auth.role() = 'authenticated');
```

- [ ] **Step 2: สร้าง API endpoint**

```ts
// src/app/api/refunds/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { saleId, reason, refundAmount, items } = body

  // Validate sale exists
  const { data: sale } = await supabase.from('sales').select('*').eq('id', saleId).single()
  if (!sale) return NextResponse.json({ error: 'Sale not found' }, { status: 404 })

  const { data: refund, error } = await supabase.from('refunds').insert({
    sale_id: saleId,
    reason,
    refund_amount: refundAmount,
    items,
    processed_by: user.id,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update stock back for returned items
  for (const item of items) {
    if (item.variant_id) {
      await supabase.rpc('adjust_stock', {
        p_variant_id: item.variant_id,
        p_delta: item.quantity,
        p_reason: `คืนสินค้า #${refund.id}`,
        p_user_id: user.id,
      })
    }
  }

  return NextResponse.json({ refund })
}
```

- [ ] **Step 3: สร้างหน้า Refund**

```tsx
// src/app/(dashboard)/pos/refund/page.tsx
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/shared/PageHeader'
import RefundForm from '@/components/pos/RefundForm'

export default async function RefundPage() {
  return (
    <div>
      <PageHeader title="คืนสินค้า" backHref="/pos" />
      <RefundForm />
    </div>
  )
}
```

- [ ] **Step 4: สร้าง RefundForm**

```tsx
// src/components/pos/RefundForm.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

export default function RefundForm() {
  const [receiptNumber, setReceiptNumber] = useState('')
  const [sale, setSale] = useState<any>(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    setSearching(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('sales')
      .select('*, items:sale_items(*, variant:product_variants(sku, product:products(name)))')
      .eq('receipt_number', receiptNumber)
      .single()
    setSale(data)
    if (!data) toast.error('ไม่พบใบเสร็จ')
    setSearching(false)
  }

  const handleRefund = async () => {
    if (!sale || !reason) { toast.error('กรุณากรอกเหตุผล'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saleId: sale.id,
          reason,
          refundAmount: sale.total,
          items: sale.items?.map((i: any) => ({ variant_id: i.product_variant_id, quantity: i.quantity })),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('บันทึกการคืนสินค้าสำเร็จ')
      setSale(null)
      setReceiptNumber('')
      setReason('')
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Search receipt */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold mb-4">ค้นหาใบเสร็จ</h2>
        <div className="flex gap-3">
          <input
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value)}
            className="pos-input flex-1"
            placeholder="เลขที่ใบเสร็จ"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={searching} className="pos-btn-primary">
            {searching ? '...' : 'ค้นหา'}
          </button>
        </div>
      </div>

      {/* Sale details */}
      {sale && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-bold">รายการสินค้า</h2>
          {sale.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between py-2 border-b border-gray-100">
              <span>{item.variant?.product?.name} ({item.variant?.sku})</span>
              <span>{item.quantity} × {formatCurrency(item.unit_price)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-lg">
            <span>ยอดคืน</span>
            <span className="text-red-600">{formatCurrency(sale.total)}</span>
          </div>
          <div>
            <label className="pos-label">เหตุผลการคืน</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)}
              className="pos-input" rows={3} placeholder="ระบุเหตุผล..." />
          </div>
          <button onClick={handleRefund} disabled={loading || !reason}
            className="w-full pos-btn-primary bg-red-500 hover:bg-red-600 disabled:opacity-50">
            {loading ? 'กำลังดำเนินการ...' : '✅ ยืนยันการคืนสินค้า'}
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: เพิ่มปุ่ม "คืนสินค้า" ใน POS page**

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/00005_refunds.sql src/app/\(dashboard\)/pos/refund/ src/components/pos/RefundForm.tsx src/app/api/refunds/
git commit -m "feat: implement product refund flow (P-17)"
```

---

### Task 16: P-18 — PromptPay QR Code ในหน้า POS

**Files:**
- Create: `src/components/pos/PromptPayQR.tsx`
- Modify: `src/components/pos/PaymentModal.tsx` หรือ checkout component

- [ ] **Step 1: ติดตั้ง promptpay-qr**

```bash
npm install promptpay-qr
```

- [ ] **Step 2: สร้าง PromptPayQR component**

```tsx
// src/components/pos/PromptPayQR.tsx
'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import generatePayload from 'promptpay-qr'
import { formatCurrency } from '@/lib/utils'

interface Props {
  amount: number
  promptpayId: string // เบอร์โทรหรือเลขบัตร
  onClose: () => void
}

export default function PromptPayQR({ amount, promptpayId, onClose }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    const payload = generatePayload(promptpayId, { amount })
    QRCode.toDataURL(payload, { width: 300 }).then(setQrDataUrl)
  }, [amount, promptpayId])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
        <h3 className="text-xl font-bold mb-2">สแกนจ่ายพร้อมเพย์</h3>
        <p className="text-3xl font-bold text-brand-600 mb-6">{formatCurrency(amount)}</p>
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="PromptPay QR" className="mx-auto rounded-xl mb-4" />
        ) : (
          <div className="w-[300px] h-[300px] mx-auto bg-gray-100 rounded-xl animate-pulse mb-4" />
        )}
        <p className="text-sm text-gray-500 mb-4">พร้อมเพย์: {promptpayId}</p>
        <button onClick={onClose} className="w-full pos-btn-primary">
          รับชำระแล้ว
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: เพิ่มตัวเลือกพร้อมเพย์ในหน้า Checkout**

ดูโครงสร้าง checkout component แล้วเพิ่ม:
```tsx
// ใน payment method selection เพิ่ม:
{ key: 'promptpay_qr', label: 'พร้อมเพย์ (QR)', icon: '📱' }

// เมื่อเลือก promptpay_qr แสดง PromptPayQR:
{paymentMethod === 'promptpay_qr' && showQR && (
  <PromptPayQR
    amount={total}
    promptpayId={process.env.NEXT_PUBLIC_STORE_PHONE || ''}
    onClose={() => setShowQR(false)}
  />
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/pos/PromptPayQR.tsx
git commit -m "feat: add PromptPay QR code display in POS checkout (P-18)"
```

---

### Task 17: M-01→M-06 — Store Map / ผัง Shelf

**Files:**
- Create: `supabase/migrations/00006_shelf_location.sql`
- Create: `src/app/(dashboard)/inventory/map/page.tsx`
- Create: `src/components/inventory/ShelfMap.tsx`
- Modify: `src/app/(dashboard)/inventory/[id]/page.tsx`

- [ ] **Step 1: เพิ่ม shelf_location column**

```sql
-- supabase/migrations/00006_shelf_location.sql
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS shelf_location TEXT;

CREATE TABLE shelf_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  row_label TEXT NOT NULL,
  col_label TEXT NOT NULL,
  display_name TEXT,
  UNIQUE(row_label, col_label)
);

ALTER TABLE shelf_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users full access" ON shelf_definitions FOR ALL USING (auth.role() = 'authenticated');
```

- [ ] **Step 2: Push migration**

```bash
npm run db:migrate
```

- [ ] **Step 3: สร้างหน้า Store Map**

```tsx
// src/app/(dashboard)/inventory/map/page.tsx
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/shared/PageHeader'
import ShelfMap from '@/components/inventory/ShelfMap'

async function getShelfData() {
  const supabase = await createClient()
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, sku, shelf_location, stock_quantity, product:products(name)')
    .eq('is_active', true)
    .not('shelf_location', 'is', null)
  return variants || []
}

export default async function StoreMapPage() {
  const variants = await getShelfData()
  return (
    <div>
      <PageHeader title="ผังร้าน / ตำแหน่ง Shelf" backHref="/inventory" />
      <ShelfMap variants={variants} />
    </div>
  )
}
```

- [ ] **Step 4: สร้าง ShelfMap component**

```tsx
// src/components/inventory/ShelfMap.tsx
'use client'

import { useState, useMemo } from 'react'

interface Variant {
  id: string
  sku: string
  shelf_location: string
  stock_quantity: number
  product: { name: string } | null
}

export default function ShelfMap({ variants }: { variants: Variant[] }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const shelves = useMemo(() => {
    const map: Record<string, Variant[]> = {}
    variants.forEach(v => {
      if (!map[v.shelf_location]) map[v.shelf_location] = []
      map[v.shelf_location].push(v)
    })
    return map
  }, [variants])

  const rows = useMemo(() => [...new Set(Object.keys(shelves).map(k => k.split('-')[0]))].sort(), [shelves])
  const cols = useMemo(() => [...new Set(Object.keys(shelves).map(k => k.split('-')[1]))].sort(), [shelves])

  const matchedShelves = search
    ? Object.entries(shelves)
        .filter(([, vs]) => vs.some(v => v.product?.name.toLowerCase().includes(search.toLowerCase()) || v.sku.toLowerCase().includes(search.toLowerCase())))
        .map(([loc]) => loc)
    : []

  return (
    <div>
      <div className="mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pos-input max-w-md"
          placeholder="ค้นหาสินค้า → แสดงตำแหน่ง shelf..."
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 overflow-x-auto">
        <div className="inline-grid gap-2" style={{ gridTemplateColumns: `60px repeat(${cols.length}, 120px)` }}>
          {/* Header row */}
          <div />
          {cols.map(col => (
            <div key={col} className="text-center font-bold text-gray-500 text-sm py-2">{col}</div>
          ))}
          {/* Shelf grid */}
          {rows.map(row => (
            <>
              <div key={`row-${row}`} className="font-bold text-gray-500 text-sm flex items-center">{row}</div>
              {cols.map(col => {
                const loc = `${row}-${col}`
                const items = shelves[loc] || []
                const isHighlighted = matchedShelves.includes(loc)
                const isSelected = selected === loc
                return (
                  <button
                    key={loc}
                    onClick={() => setSelected(isSelected ? null : loc)}
                    className={`rounded-xl border-2 p-2 text-left transition-all min-h-[80px] ${
                      items.length === 0 ? 'border-dashed border-gray-200 bg-gray-50 cursor-default' :
                      isHighlighted ? 'border-brand-400 bg-brand-50 shadow-md' :
                      isSelected ? 'border-brand-500 bg-brand-50' :
                      'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-400 mb-1">{loc}</p>
                    {items.slice(0, 3).map(v => (
                      <p key={v.id} className="text-xs text-gray-700 truncate">{v.product?.name}</p>
                    ))}
                    {items.length > 3 && <p className="text-xs text-gray-400">+{items.length - 3} อื่นๆ</p>}
                    {items.length === 0 && <p className="text-xs text-gray-300">ว่าง</p>}
                  </button>
                )
              })}
            </>
          ))}
        </div>
      </div>

      {/* Selected shelf detail */}
      {selected && shelves[selected] && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-lg mb-4">Shelf {selected}</h3>
          <div className="space-y-2">
            {shelves[selected].map(v => (
              <div key={v.id} className="flex justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-semibold">{v.product?.name}</p>
                  <p className="text-sm text-gray-500">{v.sku}</p>
                </div>
                <span className={`font-bold ${v.stock_quantity === 0 ? 'text-red-600' : 'text-gray-700'}`}>
                  {v.stock_quantity} ชิ้น
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: เพิ่ม shelf_location field ใน product variant form**

ใน product edit form เพิ่ม:
```tsx
<input
  value={variant.shelf_location || ''}
  onChange={(e) => updateVariant(i, 'shelf_location', e.target.value)}
  className="pos-input"
  placeholder="เช่น A-1, B-3"
/>
```

- [ ] **Step 6: เพิ่มลิงก์ไปหน้า Map ใน Inventory**

```tsx
<Link href="/inventory/map" className="pos-btn-secondary">🗺️ ผังร้าน</Link>
```

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/00006_shelf_location.sql src/app/\(dashboard\)/inventory/map/ src/components/inventory/ShelfMap.tsx
git commit -m "feat: implement store shelf map (M-01 to M-06)"
```

---

### Task 18: S-05 — ตั้งค่า Logo ร้าน

**Files:**
- Create: `supabase/migrations/00007_store_settings.sql`
- Modify: `src/app/(dashboard)/settings/page.tsx`

- [ ] **Step 1: สร้าง store_settings table**

```sql
-- supabase/migrations/00007_store_settings.sql
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read" ON store_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write" ON store_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create logo-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('store-assets', 'store-assets', true) ON CONFLICT DO NOTHING;
```

- [ ] **Step 2: เพิ่ม Logo upload ใน settings page**

ใน settings page เพิ่ม section:
```tsx
<div className="bg-white rounded-xl border border-gray-200 p-6">
  <h2 className="text-lg font-bold mb-4">Logo ร้าน</h2>
  <ImageUpload
    bucket="store-assets"
    value={logoUrl}
    onChange={handleLogoChange}
    label="อัปโหลด Logo (แนะนำ PNG, 200×200px)"
  />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/00007_store_settings.sql
git commit -m "feat: add store logo upload setting (S-05)"
```

---

### Task 19: UX-10 — PWA / Add to Home Screen

**Files:**
- Create: `public/manifest.json`
- Create: `public/sw.js`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: สร้าง manifest.json**

```json
// public/manifest.json
{
  "name": "LookKuan POS",
  "short_name": "LookKuan",
  "description": "ระบบจัดการร้านเสื้อผ้า",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f97316",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: เพิ่ม manifest link ใน layout.tsx**

```tsx
// ใน <head> ของ src/app/layout.tsx:
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#f97316" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="LookKuan" />
```

- [ ] **Step 3: สร้าง Service Worker พื้นฐาน**

```js
// public/sw.js
const CACHE_NAME = 'lookkuan-v1'
const STATIC_ASSETS = ['/', '/dashboard', '/offline.html']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})
```

- [ ] **Step 4: Register Service Worker**

```tsx
// src/components/shared/PWARegister.tsx
'use client'
import { useEffect } from 'react'

export default function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }
  }, [])
  return null
}
```

เพิ่ม `<PWARegister />` ใน `src/app/layout.tsx`

- [ ] **Step 5: Commit**

```bash
git add public/manifest.json public/sw.js src/components/shared/PWARegister.tsx src/app/layout.tsx
git commit -m "feat: add PWA support with manifest and service worker (UX-10)"
```

---

### Task 20: R-09 + R-10 — รายงานผ่อนชำระ + ประสิทธิภาพพนักงาน

**Files:**
- Modify: `src/app/(dashboard)/reports/page.tsx`

- [ ] **Step 1: เพิ่ม tab "ผ่อนชำระ" ในหน้า Reports**

```tsx
// Fetch installment summary:
const { data: installmentSummary } = await supabase
  .from('installment_plans')
  .select('*, payments:installment_payments(*)')

const overdueAmount = installmentSummary?.reduce((sum, plan) => {
  const overdue = plan.payments?.filter((p: any) =>
    p.status === 'pending' && new Date(p.due_date) < new Date()
  ).reduce((s: number, p: any) => s + p.amount, 0) || 0
  return sum + overdue
}, 0) || 0

// Display:
<div className="stat-card">
  <p className="text-sm text-gray-500">ยอดผ่อนค้างชำระ</p>
  <p className="text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</p>
</div>
```

- [ ] **Step 2: เพิ่ม tab "ประสิทธิภาพพนักงาน"**

```tsx
// Fetch per-staff sales:
const { data: staffSales } = await supabase
  .from('sales')
  .select('total, cashier_id, cashier:profiles!cashier_id(full_name)')
  .gte('created_at', startOfMonth)
  .not('status', 'eq', 'voided')

const staffPerformance = staffSales?.reduce((acc: Record<string, any>, sale: any) => {
  const id = sale.cashier_id
  if (!acc[id]) acc[id] = { name: sale.cashier?.full_name, total: 0, count: 0 }
  acc[id].total += Number(sale.total)
  acc[id].count++
  return acc
}, {}) || {}

// Display table:
<table className="data-table">
  <thead><tr><th>พนักงาน</th><th className="text-right">จำนวนบิล</th><th className="text-right">ยอดขายรวม</th></tr></thead>
  <tbody>
    {Object.values(staffPerformance).sort((a: any, b: any) => b.total - a.total).map((s: any, i) => (
      <tr key={i}>
        <td>{s.name}</td>
        <td className="text-right">{s.count}</td>
        <td className="text-right font-bold">{formatCurrency(s.total)}</td>
      </tr>
    ))}
  </tbody>
</table>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/reports/
git commit -m "feat: add installment report and staff performance report (R-09, R-10)"
```

---

## อัปเดต FEATURES.md เมื่อทำครบ

เมื่อแต่ละ feature เสร็จ ให้อัปเดต status ใน FEATURES.md:
- 🔴 → ✅ สำหรับ feature ที่เสร็จ
- 🔨 → ✅ สำหรับ feature ที่ complete แล้ว

```bash
# หลังทุก task อัปเดต summary:
# ✅ Done: 67 + N
# 🔨 Partial: 5 - M
# 🔴 Not Started: 40 - N
```
