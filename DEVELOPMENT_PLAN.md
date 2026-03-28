# LookKuan — แผนการพัฒนาระบบ (Development Plan)

> อัปเดตล่าสุด: มีนาคม 2026  
> Stack: Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase

---

## สถานะโปรเจค (Project Status)

| โมดูล | สถานะ | หมายเหตุ |
|---|---|---|
| Auth / RBAC | ✅ เสร็จแล้ว | Login, Role cache, Server-side sign out |
| Dashboard | ✅ เสร็จแล้ว | KPI cards, charts (recharts) |
| POS (ขายสินค้า) | ✅ เสร็จแล้ว | Cart (Zustand), variant picker, camera scan, receipt |
| สินค้าคงคลัง | ✅ เสร็จแล้ว | CRUD, ประวัติ stock, พิมพ์บาร์โค้ด |
| งานปัก (Job Orders) | ✅ เสร็จแล้ว | Kanban drag & drop, status tracking, tracking link |
| ลูกค้า (CRM) | ✅ เสร็จแล้ว | รายชื่อลูกค้า, ประวัติการซื้อ |
| รายงาน | ✅ เสร็จแล้ว | ยอดขาย, กำไร, สต็อก |
| Risk Dashboard | ✅ เสร็จแล้ว | Void, override, cash flow monitoring |
| ตั้งค่า / Users | ✅ เสร็จแล้ว | จัดการผู้ใช้, RBAC |
| Landing Page | ✅ เสร็จแล้ว | Public homepage, services showcase |
| Order Tracking | ✅ เสร็จแล้ว | `/track/[orderNumber]` สาธารณะ |
| Responsive (Mobile) | ✅ เสร็จแล้ว | Bottom nav, mobile cart sheet, kanban tabs |
| **แผนที่ร้าน (Store Map)** | 🔴 ยังไม่เริ่ม | Shelf location per product variant |
| **ผ่อนชำระ (Installments)** | 🔴 ยังไม่เริ่ม | Installment plans + debt reminders |
| **Mobile Card View (Tables)** | 🟡 บางส่วน | CSS utilities มีแล้ว ยังไม่ apply component |
| **E2E Tests** | 🟡 บางส่วน | 7 spec files มีแล้ว ครอบคลุมไม่ครบ |

---

## สิ่งที่ทำเสร็จแล้ว (Completed Features)

### 1. Auth & RBAC
- Login ด้วย Email/Password (Supabase Auth)
- Role: `admin`, `manager`, `cashier`, `embroidery_staff`
- Middleware ป้องกัน route ที่ต้อง login
- **แก้ไขแล้ว:** เมนูหายหลัง refresh → cache role ใน localStorage (`lk_user_role`)
- **แก้ไขแล้ว:** Sign out ไม่ทำงาน → สร้าง `/api/auth/signout` server route ล้าง cookie ฝั่ง server

### 2. POS (Point of Sale)
- **แก้ไขแล้ว:** โหลดนาน (timeout) → แปลงเป็น Server Component ดึงข้อมูลฝั่ง server ส่งเป็น props
- เลือกสินค้า, เพิ่ม/ลด/ลบออกจากตะกร้า (Zustand store)
- Variant Picker Modal เมื่อสินค้ามีหลาย size/สี
- สแกนบาร์โค้ดด้วยกล้อง (`html5-qrcode`)
- รับชำระเงิน: เงินสด, โอน, พร้อมเพย์, บัตรเครดิต
- พิมพ์ใบเสร็จ thermal

### 3. สินค้าคงคลัง (Inventory)
- CRUD สินค้าและตัวแปร (variant: ขนาด, สี, SKU, บาร์โค้ด)
- ติดตามประวัติการเคลื่อนไหวสต็อก
- พิมพ์ label บาร์โค้ด (`react-barcode`) — เลือก variant, กำหนดจำนวน, ขนาด label S/M/L
- จัดการหมวดหมู่สินค้า

### 4. งานปัก (Job Orders)
- **แก้ไขแล้ว:** แสดง 0 รายการ → แก้ double-FK join กับ `profiles` ใน PostgREST
- Kanban board 4 คอลัมน์: รอดำเนินการ → กำลังปัก → เสร็จแล้ว → ส่งมอบ
- Drag & drop เปลี่ยนสถานะ (HTML5 DnD) + Optimistic update + rollback on error
- Mobile: Tab bar เลือกดูทีละสถานะ
- ลูกค้าติดตามสถานะเองได้ที่ `/track/[orderNumber]` (ไม่ต้อง login)
- รับมัดจำ, คำนวณยอดค้างชำระอัตโนมัติ

### 5. Landing Page & Order Tracking
- `/` — หน้าแรกสาธารณะ:
  - Hero section + CTA
  - บริการของเรา (เสื้อผ้าพร้อมสวม / งานปักโลโก้)
  - ขั้นตอนการสั่งงานปัก 4 ขั้นตอน
  - ฟอร์มตรวจสอบสถานะงาน (inline)
  - Contact section ดึงเบอร์/ที่อยู่จาก env
  - Footer + ปุ่มเข้าสู่ระบบพนักงาน
- ผู้ใช้ที่ login แล้ว → redirect ไป `/dashboard` อัตโนมัติ
- `/track/[orderNumber]` — ติดตามงานปักแบบ public:
  - Progress step bar พร้อม icon (📋→🪡→✅→🎉)
  - Banner เมื่องานพร้อมรับ / ส่งมอบแล้ว
  - สรุปการชำระเงิน (ราคา / มัดจำ / ค้างชำระ)
  - หน้า "ไม่พบใบงาน" ที่สวยงามพร้อมค้นหาใหม่

### 6. Responsive Design (Mobile / Tablet)
- **Bottom Navigation Bar** — mobile only, 4 tabs หลัก + slide-up drawer "เพิ่มเติม"
- Sidebar ซ่อนบน mobile, แสดงบน desktop (`hidden lg:flex`)
- POS: Floating cart button → bottom sheet cart บน mobile
- Job Orders: Status tabs บน mobile แทน kanban columns
- Safe area CSS สำหรับ iPhone notch (`viewportFit: 'cover'`)
- Table wrapper `overflow-x-auto` + `min-w-[600px]` กันตาราง overflow

---

## สิ่งที่ยังไม่ได้ทำ (Pending Features)

### 🔴 Priority 1 — แผนที่ร้าน / ตำแหน่งชั้นวาง (Store Map)

**วัตถุประสงค์:** ช่วยพนักงานหาสินค้าในร้านได้เร็วขึ้น

**แผนการทำ:**
1. เพิ่มคอลัมน์ `shelf_location` (varchar) ใน `product_variants` table
2. สร้าง `shelf_map` table เก็บผัง shelf ของร้าน
3. สร้างหน้า `/inventory/map` — grid แสดงผัง shelf
4. แต่ละ cell ใน grid แสดงรายการสินค้าที่อยู่ใน shelf นั้น
5. ในหน้า product detail แสดง shelf location badge ชัดเจน
6. (Optional) Drag & drop จัดสินค้าใส่ shelf

**Migration ที่ต้องเพิ่ม:**
```sql
ALTER TABLE product_variants ADD COLUMN shelf_location TEXT;

CREATE TABLE shelf_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,  -- 'A1', 'B3'
  label TEXT,                 -- 'ชั้น A แถว 1'
  row_index INT NOT NULL,
  col_index INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 🔴 Priority 2 — ระบบผ่อนชำระ & แจ้งหนี้ (Installments)

**วัตถุประสงค์:** รองรับการขายแบบผ่อนชำระ ติดตามยอดค้าง และแจ้งเตือนลูกค้า

**แผนการทำ:**
1. เพิ่ม migration: `installment_plans` + `installment_payments` tables
2. ในหน้า POS เพิ่มตัวเลือก "ผ่อนชำระ" (เลือกจำนวนงวด, วันครบกำหนดแต่ละงวด)
3. สร้างหน้า `/installments` แสดงแผนผ่อนชำระทั้งหมด
4. ตัวกรอง: ค้างชำระ / ใกล้ครบกำหนด / ชำระแล้ว
5. Dashboard widget "ยอดผ่อนที่ใกล้ครบกำหนดวันนี้"
6. ระบบแจ้งเตือน (Supabase Edge Functions + SMS/Line Notify)

**Migration ที่ต้องเพิ่ม:**
```sql
CREATE TABLE installment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id),
  customer_id UUID REFERENCES customers(id),
  total_amount NUMERIC NOT NULL,
  down_payment NUMERIC DEFAULT 0,
  installments_count INT NOT NULL,
  installment_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'active', -- active, completed, overdue
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE installment_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES installment_plans(id),
  installment_number INT NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  amount NUMERIC NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  received_by UUID REFERENCES profiles(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 🟡 Priority 3 — Mobile Card View (แทนตารางบน Mobile)

**สถานะ:** CSS utilities มีแล้วใน `globals.css` แต่ยังไม่ได้ apply กับ component จริง

**Components ที่ต้องปรับ:**
- `src/components/inventory/InventoryClient.tsx`
- `src/components/customers/CustomersClient.tsx`
- `src/app/(dashboard)/reports/page.tsx`
- `src/app/(dashboard)/risk-dashboard/page.tsx`

**Pattern ที่ต้องใช้:**
```tsx
{/* Desktop: table */}
<div className="hidden md:block table-wrapper">
  <table className="data-table">...</table>
</div>

{/* Mobile: cards */}
<div className="md:hidden mobile-card-list">
  {items.map(item => (
    <div key={item.id} className="mobile-card">
      <div className="flex justify-between">
        <span className="font-bold">{item.name}</span>
        <span className="text-brand-600">{item.price}</span>
      </div>
      ...
    </div>
  ))}
</div>
```

---

### 🟡 Priority 4 — แก้ Hydration Errors

**สถานะ:** ยังไม่ได้ investigate

**อาการ:** Console warning "text outside component" หรือ hydration mismatch บางหน้า

**วิธีแก้ทั่วไป:**
- ตรวจสอบ `<p>` ซ้อนกัน เช่น `<p>` ใน `<p>` (HTML ไม่อนุญาต)
- Code ที่ใช้ `window` / `document` ต้องอยู่ใน `useEffect` หรือ dynamic import
- ใช้ `suppressHydrationWarning` เฉพาะที่จำเป็น (เช่น `<body>`)
- ตรวจสอบ date formatting ที่อาจต่างกันระหว่าง server/client timezone

---

### 🟢 Priority 5 — เพิ่ม E2E Test Coverage

**สถานะ:** มี 7 spec files แต่บางส่วนยังไม่ครบ

**Test ที่ควรเพิ่ม:**
```
e2e/
├── 08-landing.spec.ts        Landing page + order tracking
├── 09-barcode.spec.ts        พิมพ์ label บาร์โค้ด
├── 10-mobile.spec.ts         Viewport mobile, bottom nav, cart sheet
├── 11-installments.spec.ts   ระบบผ่อนชำระ (เมื่อทำเสร็จ)
└── 12-store-map.spec.ts      แผนที่ร้าน (เมื่อทำเสร็จ)
```

---

## Architecture Overview

```
src/
├── app/
│   ├── page.tsx                    ✅ Landing page (public)
│   ├── (auth)/
│   │   └── login/                  ✅ Login page
│   ├── (dashboard)/                🔒 Protected (middleware auth)
│   │   ├── layout.tsx              Sidebar + BottomNav wrapper
│   │   ├── dashboard/              KPI + recharts
│   │   ├── pos/                    ✅ Server component → POSClient
│   │   ├── inventory/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/               Product detail + edit
│   │   │   ├── new/
│   │   │   ├── barcodes/           ✅ BarcodePrintClient
│   │   │   ├── categories/
│   │   │   └── movements/
│   │   ├── job-orders/             ✅ JobOrdersClient (Kanban)
│   │   ├── customers/
│   │   ├── reports/
│   │   ├── risk-dashboard/
│   │   └── settings/
│   ├── track/[orderNumber]/        ✅ Public tracking (no auth)
│   └── api/auth/signout/           ✅ Server-side sign out route
│
├── components/
│   ├── shared/
│   │   ├── Sidebar.tsx             Desktop only (hidden lg:flex)
│   │   └── BottomNav.tsx           ✅ Mobile only (lg:hidden)
│   ├── pos/
│   │   ├── POSClient.tsx           ✅ Cart + mobile sheet + variant picker
│   │   └── CameraScanner.tsx       ✅ Camera barcode scan
│   ├── job-orders/
│   │   └── JobOrdersClient.tsx     ✅ Kanban + drag & drop + mobile tabs
│   ├── inventory/
│   │   └── BarcodePrintClient.tsx  ✅ Label printing
│   └── landing/
│       └── TrackingForm.tsx        ✅ Order number lookup form
│
├── hooks/
│   └── useAuth.ts                  Auth + localStorage role cache
├── stores/
│   └── cartStore.ts                Zustand cart (POS)
└── lib/
    ├── supabase/server.ts          Server-side Supabase client
    ├── supabase/client.ts          Browser Supabase client
    ├── constants.ts                Roles, status labels, payment methods
    └── utils.ts                    formatCurrency, formatDate, cn()
```

---

## Database Schema (Key Tables)

```
auth.users ──────────────────────────────── (Supabase managed)
    └── profiles (id, role, full_name, email, pin_hash)

categories (id, name, parent_id, sort_order, is_active)

products (id, name, description, category_id, cost_price, selling_price, is_active)
    └── product_variants (id, product_id, sku, barcode, size, color,
                          stock_qty, reorder_point, shelf_location*)

sales (id, cashier_id, total_amount, discount, tax, payment_method, status)
    └── sale_items (id, sale_id, variant_id, quantity, unit_price, discount)

job_orders (id, order_number, customer_name, customer_phone, status,
            description, garment_type, quantity, quoted_price,
            deposit_amount, balance_due, assigned_to, received_by,
            estimated_completion_date, actual_completion_date, notes)

customers (id, name, phone, email, address, total_purchases, notes)

stock_movements (id, variant_id, movement_type, quantity, reason,
                 reference_id, performed_by)

installment_plans*   (id, sale_id, customer_id, total_amount,
                      installments_count, installment_amount, status)
    └── installment_payments*  (id, plan_id, installment_number,
                                due_date, paid_date, amount, is_paid)

shelf_map*  (id, code, label, row_index, col_index)
```
> `*` = ยังไม่ได้สร้าง migration

---

## Commits ที่ยังไม่ได้ Push

รันจาก Terminal:
```bash
cd /Users/weerapanthairak/lookkuan/lookkuan
git push
```

| Commit | Description |
|---|---|
| `32c05b6` | feat: add public landing page and improved order tracking |
| `43cd597` | feat: responsive design for mobile/tablet + fix sign out |
| `3a7037a` | feat: major UX improvements and new features |
| `3efb3f9` | fix: separate profiles join in job-orders queries |
| `1fafb93` | fix: cache user role in localStorage |

---

## Tech Debt & Known Issues

| ปัญหา | สถานะ | วิธีแก้ |
|---|---|---|
| Hydration warnings | 🟡 ยังไม่แก้ | ตรวจ `<p>` ซ้อน, code ที่ใช้ window ต้องอยู่ใน useEffect |
| Mobile table views | 🟡 บางส่วน | Apply card pattern ใน InventoryClient, CustomersClient |
| ไม่มี loading skeleton | 🟡 ใช้แค่ spinner | เพิ่ม shadcn/ui Skeleton component |
| ไม่มี offline support | 🟢 future | PWA + service worker |

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

NEXT_PUBLIC_STORE_NAME=LookKuan
NEXT_PUBLIC_STORE_PHONE=02-xxx-xxxx
NEXT_PUBLIC_STORE_ADDRESS=ที่อยู่ร้าน
NEXT_PUBLIC_TAX_RATE=0.07

# E2E Tests
TEST_EMAIL=test@example.com
TEST_PASSWORD=password123
```

---

## คำสั่งที่ใช้บ่อย

```bash
npm run dev              # Start dev server → localhost:3000
npm run build            # Production build (ข้าม ESLint)
npm run lint             # Lint check

npm run db:migrate       # Push schema migrations
npm run db:seed          # Seed ข้อมูลตัวอย่าง
npm run db:reset         # Reset DB

npm run test:e2e         # E2E tests (headless)
npm run test:e2e:ui      # E2E tests (with UI)
npx playwright test e2e/04-pos.spec.ts   # รัน test เดียว
npx playwright test -g "test name"       # รันโดย test name
```

---

*เอกสารนี้สร้างและอัปเดตโดย Claude — ควรอัปเดตทุกครั้งที่มีการเพิ่มฟีเจอร์หรือเปลี่ยนแปลงโครงสร้างสำคัญ*
