# LookKuan POS & E-commerce Web App — Development Plan

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| UI Components | shadcn/ui (ปรับแต่งให้ปุ่มใหญ่ ฟอนต์ 16px+ สำหรับผู้สูงอายุ) |
| Backend / Database | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| Auth & RBAC | Supabase Auth + Row Level Security (RLS) + Custom Roles |
| State Management | Zustand หรือ React Context (เฉพาะส่วนที่จำเป็น) |
| Barcode | react-barcode (สร้าง), html5-qrcode (สแกน) |
| Receipt Printing | ESC/POS protocol via Web USB API หรือ thermal printer SDK |
| Deployment | Vercel (Frontend) + Supabase Cloud (Backend) |

---

## Database Schema Overview (Supabase / PostgreSQL)

### Core Tables

```
── profiles (ข้อมูลผู้ใช้ + role)
│   ├── id (FK → auth.users)
│   ├── full_name
│   ├── role: 'admin' | 'manager' | 'cashier' | 'embroidery_staff'
│   ├── pin_code (สำหรับล็อกอินเร็วหน้าร้าน)
│   └── is_active
│
── categories (หมวดหมู่สินค้า)
│   ├── id, name, parent_id (รองรับหมวดย่อย)
│   └── image_url
│
── products (สินค้าหลัก)
│   ├── id, name, description
│   ├── category_id (FK)
│   ├── base_price, cost_price
│   ├── sku_prefix
│   └── is_active
│
── product_variants (ตัวแปรสินค้า: สี + ไซส์)
│   ├── id, product_id (FK)
│   ├── color, size
│   ├── sku (unique barcode)
│   ├── stock_quantity
│   ├── low_stock_threshold
│   ├── price_override (ถ้าราคาต่างจาก base)
│   └── barcode_image_url
│
── inventory_movements (ประวัติความเคลื่อนไหวสต็อก)
│   ├── id, variant_id (FK)
│   ├── type: 'receive' | 'sell' | 'return' | 'adjust' | 'transfer'
│   ├── quantity_change (+/-)
│   ├── reference_id (FK → sale / job_order)
│   ├── note
│   └── created_by (FK → profiles)
│
── sales (บิลขาย)
│   ├── id, sale_number (running number)
│   ├── cashier_id (FK → profiles)
│   ├── subtotal, discount_amount, tax_amount, total
│   ├── payment_method: 'cash' | 'transfer' | 'promptpay' | 'credit_card'
│   ├── status: 'completed' | 'voided' | 'refunded'
│   ├── voided_by, void_reason
│   └── created_at
│
── sale_items (รายการสินค้าในบิล)
│   ├── id, sale_id (FK)
│   ├── variant_id (FK)
│   ├── quantity, unit_price
│   ├── discount_amount
│   ├── price_override (ถ้ามี)
│   ├── override_approved_by (FK → profiles, ต้องเป็น manager+)
│   └── subtotal
│
── job_orders (ใบสั่งงานปัก)
│   ├── id, order_number
│   ├── customer_name, customer_phone
│   ├── status: 'pending' | 'in_progress' | 'completed' | 'delivered' | 'cancelled'
│   ├── description (รายละเอียดงานปัก)
│   ├── design_image_url (ภาพแบบ)
│   ├── garment_type (ประเภทเสื้อผ้า)
│   ├── quantity
│   ├── quoted_price, deposit_amount, balance_due
│   ├── estimated_completion_date
│   ├── actual_completion_date
│   ├── assigned_to (FK → profiles, ช่างปัก)
│   ├── received_by (FK → profiles, คนรับงาน)
│   └── notes
│
── cash_sessions (กะเงินสด)
│   ├── id, cashier_id (FK)
│   ├── opening_amount
│   ├── closing_amount
│   ├── expected_amount (คำนวณจากระบบ)
│   ├── discrepancy
│   ├── opened_at, closed_at
│   └── notes
│
── customers (ข้อมูลลูกค้า CRM)
│   ├── id, name, phone, email
│   ├── line_id
│   ├── total_spent, visit_count
│   └── notes
│
── audit_logs (ประวัติการกระทำทั้งหมด)
│   ├── id, user_id (FK)
│   ├── action: 'void_sale' | 'price_override' | 'refund' | 'stock_adjust' | ...
│   ├── entity_type, entity_id
│   ├── old_value, new_value (JSON)
│   └── created_at
```

---

## Phase 1: Foundation + Inventory Management (สัปดาห์ 1-3)

> **เป้าหมาย:** ระบบฐานข้อมูลพร้อมใช้งาน, จัดการสินค้าและสต็อกได้ครบวงจร

### 1.1 Project Setup (สัปดาห์ 1)
- [x] Init Next.js 15 project + TypeScript + Tailwind CSS
- [ ] ติดตั้ง shadcn/ui พร้อมปรับ theme (ฟอนต์ใหญ่, High Contrast)
- [ ] สร้าง Supabase project + schema migration
- [ ] ตั้งค่า Auth (email/password + PIN login สำหรับหน้าร้าน)
- [ ] RBAC: `admin`, `manager`, `cashier`, `embroidery_staff`
- [ ] สร้าง Layout หลัก: Sidebar Navigation + Top Bar

### 1.2 Product & Variant Management (สัปดาห์ 1-2)
- [ ] CRUD สินค้า (products) + หมวดหมู่ (categories)
- [ ] จัดการ Variants (สี + ไซส์) ต่อสินค้า
- [ ] สร้าง/พิมพ์ Barcode Label (SKU → Barcode)
- [ ] อัปโหลดรูปสินค้า (Supabase Storage)
- [ ] ค้นหาสินค้าแบบ Full-text search + ตัวกรอง

### 1.3 Stock Management (สัปดาห์ 2-3)
- [ ] รับสินค้าเข้าคลัง (Stock Receive) พร้อมสแกน Barcode
- [ ] ปรับสต็อก (Stock Adjustment) + บันทึกเหตุผล
- [ ] ประวัติความเคลื่อนไหวสต็อก (Inventory Movement Log)
- [ ] แจ้งเตือนสินค้าใกล้หมด (Low Stock Alerts)
- [ ] Inventory Aging Report (จัดกลุ่ม 0-30, 31-60, 61-90, 90+ วัน)
- [ ] Dashboard สรุปสต็อก: จำนวนรวม, มูลค่า, สินค้าขายดี/ค้างนาน

---

## Phase 2: POS — ระบบขายหน้าร้าน (สัปดาห์ 4-6)

> **เป้าหมาย:** พนักงานผู้สูงอายุใช้ขายของได้จริง, สแกนบาร์โค้ด, พิมพ์ใบเสร็จ

### 2.1 POS Interface (สัปดาห์ 4)
- [ ] หน้าจอ POS หลัก (ออกแบบสำหรับผู้สูงอายุ):
  - ปุ่มใหญ่มาก, ฟอนต์ 18-24px, High Contrast
  - สแกน Barcode → เพิ่มสินค้าอัตโนมัติ
  - เลือกสินค้าจากปุ่มหมวดหมู่ (Grid Layout)
  - ตะกร้าสินค้า: แสดงรายการ + จำนวน + ราคา
  - ปุ่ม +/- สำหรับปรับจำนวน
- [ ] PIN Login (ล็อกอินเร็วด้วยรหัส 4-6 หลัก)
- [ ] Audio feedback เมื่อสแกนสำเร็จ/ล้มเหลว

### 2.2 Payment & Receipt (สัปดาห์ 5)
- [ ] เลือกวิธีชำระ: เงินสด / โอน / PromptPay / บัตรเครดิต
- [ ] คำนวณเงินทอน (สำหรับเงินสด)
- [ ] พิมพ์ใบเสร็จ Thermal Receipt (ESC/POS)
- [ ] ส่วนลด: ลดราคาต่อรายการ / ลดทั้งบิล
- [ ] Price Override (ต้องให้ Manager อนุมัติ)

### 2.3 Cash Drawer & Shift Management (สัปดาห์ 5-6)
- [ ] เปิด/ปิดกะ (Cash Session)
- [ ] ตรวจนับเงินสดเปรียบเทียบยอดระบบ
- [ ] บันทึก Cash Over/Short + เหตุผล
- [ ] ประวัติกะทั้งหมด (ดูย้อนหลังได้)

### 2.4 Void & Refund (สัปดาห์ 6)
- [ ] ยกเลิกบิล (Void) — ต้อง Manager PIN + เหตุผล + Confirmation Dialog
- [ ] คืนสินค้า/เงิน (Refund) — ต้อง Manager PIN
- [ ] Audit trail ทุก void/refund

---

## Phase 3: Embroidery Job Orders — ระบบรับงานปัก (สัปดาห์ 7-9)

> **เป้าหมาย:** รับงานปัก, ติดตามสถานะ, แจ้งลูกค้า

### 3.1 Job Order Management (สัปดาห์ 7-8)
- [ ] สร้างใบสั่งงานปัก:
  - ข้อมูลลูกค้า + เบอร์โทร
  - รายละเอียดงาน + อัปโหลดรูปแบบ
  - จำนวน, ราคา, เงินมัดจำ
  - วันกำหนดเสร็จ
- [ ] กำหนดช่างผู้รับผิดชอบ (Assign)
- [ ] อัปเดตสถานะ: รอดำเนินการ → กำลังปัก → เสร็จ → ส่งมอบแล้ว
- [ ] พิมพ์ใบสั่งงาน (พร้อม Barcode) ส่งห้องปัก
- [ ] Board View (Kanban) แสดงสถานะงานทั้งหมด

### 3.2 Customer Notification (สัปดาห์ 8-9)
- [ ] แจ้งเตือนลูกค้าเมื่องานเสร็จ (LINE / SMS)
- [ ] หน้าตรวจสอบสถานะงาน (สำหรับลูกค้า, ไม่ต้อง login)
- [ ] รับชำระยอดค้างชำระเมื่อส่งมอบ
- [ ] ประวัติงานปักทั้งหมด + ค้นหาด้วย order number / ชื่อลูกค้า

---

## Phase 4: Risk Dashboard — แดชบอร์ดตรวจจับทุจริต (สัปดาห์ 10-11)

> **เป้าหมาย:** ผู้บริหารมองเห็นความผิดปกติได้ทันที

### 4.1 Fraud Detection Metrics
- [ ] Void Rate per Employee (อัตราการยกเลิกบิลต่อพนักงาน)
- [ ] Price Override Frequency (ความถี่การแก้ราคา)
- [ ] Discount Usage Analysis (การใช้ส่วนลดผิดปกติ)
- [ ] Cash Drawer Discrepancy Tracking (เงินขาด/เกิน)
- [ ] Alerts: แจ้งเตือนเมื่อเกินเกณฑ์ (Threshold-based)

### 4.2 Inventory Analytics
- [ ] Inventory Turnover Ratio (อัตราหมุนเวียนสินค้า)
- [ ] Inventory Shrinkage Rate (อัตราสูญหาย)
- [ ] Dead Stock Report (สินค้าค้างสต็อกนาน)
- [ ] Top Sellers / Worst Sellers

### 4.3 Financial Overview
- [ ] Daily/Weekly/Monthly Sales Summary
- [ ] Revenue by Category / Payment Method
- [ ] Cash Flow Overview
- [ ] Embroidery Revenue vs Retail Revenue

---

## Phase 5: CRM & Reports (สัปดาห์ 12-13)

> **เป้าหมาย:** จัดการลูกค้า, รายงานภาพรวมธุรกิจ

- [ ] Customer Database (ชื่อ, เบอร์, LINE, ประวัติซื้อ)
- [ ] Customer Purchase History
- [ ] Export Reports (PDF / Excel)
- [ ] Sales Report by date range
- [ ] Employee Performance Report

---

## Phase 6: Marketplace Integration (อนาคต)

> **เป้าหมาย:** ซิงค์สต็อกกับ Shopee, Lazada, Shopify

- [ ] Shopee Open Platform API Integration
- [ ] Lazada Open Platform API Integration
- [ ] Real-time Stock Sync (Inventory ↔ Marketplace)
- [ ] Order Import → ตัดสต็อกอัตโนมัติ
- [ ] Unified Order Dashboard

---

## Project Structure (Next.js App Router)

```
lookkuan/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          # Login หลัก
│   │   │   └── pin-login/page.tsx      # PIN Login หน้าร้าน
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Sidebar + Topbar
│   │   │   ├── page.tsx                # Dashboard หน้าแรก
│   │   │   ├── inventory/
│   │   │   │   ├── page.tsx            # รายการสินค้าทั้งหมด
│   │   │   │   ├── [id]/page.tsx       # รายละเอียดสินค้า
│   │   │   │   ├── new/page.tsx        # เพิ่มสินค้าใหม่
│   │   │   │   ├── categories/page.tsx # จัดการหมวดหมู่
│   │   │   │   ├── movements/page.tsx  # ประวัติสต็อก
│   │   │   │   └── alerts/page.tsx     # แจ้งเตือนสต็อกต่ำ
│   │   │   ├── pos/
│   │   │   │   └── page.tsx            # หน้าจอ POS (Full Screen)
│   │   │   ├── job-orders/
│   │   │   │   ├── page.tsx            # รายการงานปักทั้งหมด (Kanban)
│   │   │   │   ├── [id]/page.tsx       # รายละเอียดงาน
│   │   │   │   └── new/page.tsx        # สร้างใบสั่งงานใหม่
│   │   │   ├── risk-dashboard/
│   │   │   │   └── page.tsx            # แดชบอร์ดความเสี่ยง
│   │   │   ├── customers/
│   │   │   │   └── page.tsx            # CRM
│   │   │   ├── reports/
│   │   │   │   └── page.tsx            # รายงานต่างๆ
│   │   │   └── settings/
│   │   │       ├── page.tsx            # ตั้งค่าร้าน
│   │   │       └── users/page.tsx      # จัดการผู้ใช้
│   │   └── track/[orderNumber]/page.tsx # ลูกค้าตรวจสอบสถานะ (public)
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components (ปรับแต่งแล้ว)
│   │   ├── pos/                        # POS-specific components
│   │   ├── inventory/                  # Inventory components
│   │   ├── job-orders/                 # Job Order components
│   │   └── shared/                     # Shared components
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # Supabase client
│   │   │   ├── server.ts               # Server-side client
│   │   │   └── middleware.ts           # Auth middleware
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── hooks/                          # Custom React hooks
│   ├── types/                          # TypeScript types
│   └── stores/                         # Zustand stores (ถ้าใช้)
├── supabase/
│   ├── migrations/                     # SQL migrations
│   └── seed.sql                        # ข้อมูลเริ่มต้น
├── public/
│   └── sounds/                         # เสียงแจ้งเตือน (beep, success, error)
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## RBAC Permission Matrix

| Feature | Admin | Manager | Cashier | Embroidery Staff |
|---------|:-----:|:-------:|:-------:|:----------------:|
| จัดการสินค้า/สต็อก | ✅ | ✅ | ❌ | ❌ |
| ขาย (POS) | ✅ | ✅ | ✅ | ❌ |
| Void / Refund | ✅ | ✅ | ❌ | ❌ |
| Price Override | ✅ | ✅ | ❌ | ❌ |
| ส่วนลด (มีเพดาน) | ✅ | ✅ | ✅ (≤10%) | ❌ |
| รับงานปัก | ✅ | ✅ | ✅ | ❌ |
| อัปเดตสถานะงานปัก | ✅ | ✅ | ❌ | ✅ |
| Risk Dashboard | ✅ | ✅ (จำกัด) | ❌ | ❌ |
| จัดการผู้ใช้ | ✅ | ❌ | ❌ | ❌ |
| ตั้งค่าร้าน | ✅ | ❌ | ❌ | ❌ |
| ดูรายงาน | ✅ | ✅ | ❌ | ❌ |

---

## UI/UX Design Principles (สำหรับผู้สูงอายุ)

1. **ฟอนต์:** ขั้นต่ำ 16px, ใช้ Sans-serif (Inter / Sarabun), หัวข้อ 20-24px
2. **ปุ่ม:** ขนาดใหญ่ (min 48x48px, แนะนำ 64px+), มี Buffer Zone รอบปุ่ม
3. **สี:** High Contrast, ไม่พึ่งสีอย่างเดียว — ใช้ไอคอน + ข้อความกำกับเสมอ
4. **Interaction:** แตะ (Tap) เท่านั้น, ไม่มี Swipe/Pinch/Long-press
5. **Error Prevention:** Confirmation Dialog สำหรับทุก Destructive Action
6. **Navigation:** ปุ่ม "หน้าหลัก" และ "ย้อนกลับ" มองเห็นชัดเจนทุกหน้า
7. **Feedback:** เปลี่ยนสีปุ่มเมื่อกด + เสียงเมื่อสแกนสำเร็จ
8. **ภาษา:** ใช้ภาษาไทยง่ายๆ, ไม่ใช้ศัพท์เทคนิค

---

## Getting Started (คำสั่งเริ่มต้น)

```bash
# สร้าง Next.js project
npx create-next-app@latest lookkuan --typescript --tailwind --eslint --app --src-dir

# ติดตั้ง dependencies
npm install @supabase/supabase-js @supabase/ssr
npx shadcn@latest init

# ติดตั้ง libraries เพิ่มเติม
npm install zustand react-barcode html5-qrcode recharts date-fns
npm install -D supabase
```
