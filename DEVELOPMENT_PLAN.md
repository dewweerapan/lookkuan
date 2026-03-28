# LookKuan — แผนการพัฒนาระบบ Phase 2

> อัปเดตล่าสุด: มีนาคม 2026
> Stack: Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase

---

## สถานะโปรเจค — Phase 1 เสร็จสมบูรณ์ ✅

**140/140 ฟีเจอร์เสร็จแล้ว** — รายละเอียดใน FEATURES.md

| โมดูล | สถานะ |
|---|---|
| Auth / RBAC | ✅ |
| Dashboard | ✅ |
| POS (ขายสินค้า) | ✅ |
| สินค้าคงคลัง + Barcode | ✅ |
| แผนที่ร้าน (Store Map) | ✅ |
| งานปัก (Job Orders) | ✅ |
| ผ่อนชำระ (Installments) | ✅ |
| ลูกค้า (CRM) | ✅ |
| รายงาน + Export PDF/Excel | ✅ |
| Risk Dashboard | ✅ |
| ตั้งค่า / Users | ✅ |
| Landing Page + Order Tracking | ✅ |
| Mobile Responsive + PWA | ✅ |
| Dark Mode | ✅ |
| Line Notify | ✅ |
| E2E Tests (11 spec files) | ✅ |
| Unit Tests (Vitest) | ✅ |

---

## Phase 2 — แผนการพัฒนาต่อไป

### 🔴 P1 — Bug Fixes & Code Quality

| # | งาน | รายละเอียด |
|---|---|---|
| B-01 | Commit ไฟล์ที่ค้างอยู่ | `ReceiptPrintSettings.tsx`, `Sidebar.tsx` ยังไม่ได้ commit |
| B-02 | ตรวจสอบ Hydration Warnings | ค้นหา `<p>` ซ้อนกัน, code ที่ใช้ `window`/`document` นอก useEffect |
| B-03 | TypeScript strict checks | แก้ `any` types ที่เหลืออยู่ |

---

### 🟡 P2 — UX/Performance Improvements

| # | งาน | รายละเอียด |
|---|---|---|
| UX-A | Optimistic UI ใน POS | Cart update ไม่รอ server round-trip |
| UX-B | Infinite scroll / Pagination | รายการสินค้า + ลูกค้า (ปัจจุบัน load ทั้งหมด) |
| UX-C | Image lazy loading | เพิ่ม `loading="lazy"` + blur placeholder |
| UX-D | Receipt preview ใน POS | แสดง preview ก่อนพิมพ์จริง |
| UX-E | Keyboard shortcuts | `F2` เปิด POS, `ESC` ปิด modal |

---

### 🟢 P3 — New Features

#### 3.1 ระบบโปรโมชัน (Promotions)

**วัตถุประสงค์:** รองรับส่วนลดแบบมีเงื่อนไข เช่น "ซื้อ 3 แถม 1", "ลด 20% เฉพาะสินค้า X"

**Migration:**
```sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'percent_off', 'fixed_off', 'buy_x_get_y'
  value NUMERIC,
  min_purchase NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE promotion_products (
  promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, product_id)
);
```

**หน้าที่ต้องสร้าง:**
- `/settings/promotions` — จัดการโปรโมชัน
- ใน POS: auto-apply โปรโมชันที่ตรงเงื่อนไข

---

#### 3.2 ระบบจัดการซัพพลายเออร์ (Suppliers)

**วัตถุประสงค์:** ติดตามการสั่งซื้อสินค้าจากซัพพลายเออร์

**Migration:**
```sql
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id),
  order_number TEXT UNIQUE,
  status TEXT DEFAULT 'pending', -- pending, received, cancelled
  total_amount NUMERIC DEFAULT 0,
  ordered_at TIMESTAMPTZ DEFAULT now(),
  received_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  quantity INT NOT NULL,
  unit_cost NUMERIC NOT NULL
);
```

**หน้าที่ต้องสร้าง:**
- `/suppliers` — รายชื่อซัพพลายเออร์
- `/purchase-orders` — ใบสั่งซื้อ
- เมื่อรับสินค้า: อัปเดต stock_qty อัตโนมัติ

---

#### 3.3 Cash Session Management (เพิ่มเติม)

**วัตถุประสงค์:** จัดการเงินสดแต่ละกะ (shift) ของแคชเชียร์ให้ครบถ้วน

**ปรับปรุง:**
- หน้าเปิด/ปิดกะ (Cash In / Cash Out)
- รายงานยอดเงินสดรายกะ
- แจ้งเตือนเมื่อเงินสดเกินหรือขาด threshold

---

#### 3.4 Multi-language Support (Thai/English)

**วัตถุประสงค์:** รองรับการแสดงผลทั้งภาษาไทยและอังกฤษ

**แผน:**
- ใช้ `next-intl` library
- ไฟล์ translation: `messages/th.json`, `messages/en.json`
- Toggle ภาษาใน Settings

---

#### 3.5 Advanced Analytics

**วัตถุประสงค์:** วิเคราะห์ข้อมูลเชิงลึกเพิ่มเติม

**Dashboard ใหม่:**
- Cohort analysis (ลูกค้าใหม่ vs กลับมาซื้อซ้ำ)
- ABC Analysis (สินค้า A=ขายดี, B=ปานกลาง, C=ขายช้า)
- Forecasting ยอดขาย (ง่ายๆ ด้วย moving average)
- Heat map ยอดขายรายชั่วโมง/วัน

---

### 🔵 P4 — Infrastructure & DevOps

| # | งาน | รายละเอียด |
|---|---|---|
| D-01 | CI/CD Pipeline | GitHub Actions: build + test on PR |
| D-02 | Staging Environment | Supabase preview branch + Vercel preview |
| D-03 | Database backups | Supabase scheduled backups |
| D-04 | Error monitoring | Sentry integration |
| D-05 | Performance monitoring | Vercel Analytics + Web Vitals |

---

## ลำดับการพัฒนาที่แนะนำ

```
Week 1: B-01, B-02, B-03 (cleanup + bug fixes)
Week 2: UX-A, UX-B (Pagination + Optimistic UI)
Week 3-4: 3.1 Promotions system
Week 5-6: 3.2 Suppliers + Purchase Orders
Week 7: 3.3 Cash Session improvements
Week 8+: Advanced Analytics, Multi-language
```

---

## Tech Debt ที่เหลือ

| ปัญหา | ความสำคัญ | วิธีแก้ |
|---|---|---|
| DEVELOPMENT_PLAN.md ล้าสมัย | ✅ แก้แล้ว | อัปเดตแล้ว |
| Hydration warnings | 🟡 Medium | ตรวจ `<p>` ซ้อน, window ใน useEffect |
| No pagination (load all) | 🟡 Medium | เพิ่ม cursor-based pagination |
| `any` types | 🟢 Low | แก้ทีละไฟล์ |
| Bundle size analysis | 🟢 Low | `npm run build` → analyze |

---

*อัปเดตโดย Claude Code — มีนาคม 2026*
