# FEATURES.md — รายการฟีเจอร์ทั้งหมด

> Legend: ✅ Done · 🔨 Partial · 🔴 Not Started

---

## 🔐 Authentication & Access Control

| # | Feature | Status |
|---|---|---|
| A-01 | Login ด้วย Email + Password | ✅ |
| A-02 | PIN Login (สำหรับเปิดหน้าจอเร็ว) | ✅ |
| A-03 | Role-based access: admin / manager / cashier / embroidery_staff | ✅ |
| A-04 | เมนูแสดง/ซ่อนตาม Role | ✅ |
| A-05 | Cache role ใน localStorage (ป้องกันเมนูหายหลัง refresh) | ✅ |
| A-06 | Server-side Sign Out (ล้าง cookie ฝั่ง server) | ✅ |
| A-07 | Middleware ป้องกัน route ที่ต้อง login | ✅ |
| A-08 | Supabase RLS (Row Level Security) ทุก table | ✅ |
| A-09 | Admin จัดการ User: เพิ่ม / แก้ไข / ปิดใช้งาน | ✅ |
| A-10 | Reset Password ผ่าน Email | 🔴 |

---

## 🏪 Landing Page & Public Pages

| # | Feature | Status |
|---|---|---|
| L-01 | หน้าแรกสาธารณะ (ไม่ต้อง login) | ✅ |
| L-02 | Hero section + CTA | ✅ |
| L-03 | แสดงบริการของร้าน (เสื้อผ้า + งานปัก) | ✅ |
| L-04 | ขั้นตอนการสั่งงานปัก | ✅ |
| L-05 | ฟอร์มตรวจสอบสถานะงานในหน้าแรก | ✅ |
| L-06 | Contact section (โทร / ที่อยู่) | ✅ |
| L-07 | ลูกค้า login แล้ว redirect ไป dashboard | ✅ |

---

## 🔍 Order Tracking (Public)

| # | Feature | Status |
|---|---|---|
| T-01 | หน้า `/track/[orderNumber]` สาธารณะ (ไม่ต้อง login) | ✅ |
| T-02 | Progress step bar (รับงาน → กำลังปัก → เสร็จ → ส่งมอบ) | ✅ |
| T-03 | Banner แจ้งเตือน "งานพร้อมรับ" | ✅ |
| T-04 | Banner "ส่งมอบแล้ว" พร้อมขอบคุณ | ✅ |
| T-05 | แสดงรายละเอียดงาน + สรุปการชำระเงิน | ✅ |
| T-06 | หน้า "ไม่พบใบงาน" พร้อมค้นหาใหม่ | ✅ |
| T-07 | แชร์ link ติดตามงานให้ลูกค้าทาง Line/SMS | 🔴 |
| T-08 | QR Code สำหรับพิมพ์ติดบนใบงาน | 🔴 |

---

## 🛒 POS (Point of Sale)

| # | Feature | Status |
|---|---|---|
| P-01 | เลือกสินค้าจาก Grid | ✅ |
| P-02 | กรองสินค้าตามหมวดหมู่ | ✅ |
| P-03 | ค้นหาสินค้าด้วยชื่อ | ✅ |
| P-04 | สแกนบาร์โค้ดด้วยกล้องมือถือ | ✅ |
| P-05 | สแกนบาร์โค้ดด้วยเครื่องสแกน (USB/Bluetooth) | ✅ |
| P-06 | Variant Picker (เลือก size/สี เมื่อมีหลายตัวเลือก) | ✅ |
| P-07 | ตะกร้าสินค้า: เพิ่ม / ลด / ลบ / ล้างทั้งหมด | ✅ |
| P-08 | ส่วนลดต่อรายการ (Price Override) | ✅ |
| P-09 | ส่วนลดรวมทั้งบิล | ✅ |
| P-10 | คำนวณภาษีอัตโนมัติ | ✅ |
| P-11 | รับชำระ: เงินสด / โอน / พร้อมเพย์ / บัตรเครดิต | ✅ |
| P-12 | คำนวณเงินทอน | ✅ |
| P-13 | พิมพ์ใบเสร็จ thermal | ✅ |
| P-14 | Mobile cart เป็น bottom sheet | ✅ |
| P-15 | ยกเลิกบิล (Void) พร้อม confirm dialog | ✅ |
| P-16 | ระบบผ่อนชำระ (เลือกจำนวนงวดตอนชำระ) | 🔴 |
| P-17 | คืนสินค้า (Refund) | 🔴 |
| P-18 | รับชำระด้วย QR Code พร้อมเพย์ (แสดง QR) | 🔴 |
| P-19 | บันทึกลูกค้าในบิล (ดึงประวัติ) | 🔴 |

---

## 📦 สินค้าคงคลัง (Inventory)

| # | Feature | Status |
|---|---|---|
| I-01 | รายการสินค้าทั้งหมด | ✅ |
| I-02 | เพิ่มสินค้าใหม่ | ✅ |
| I-03 | แก้ไข / ลบสินค้า | ✅ |
| I-04 | Product Variants (ขนาด, สี, SKU, บาร์โค้ด) | ✅ |
| I-05 | ติดตามสต็อกแต่ละ variant | ✅ |
| I-06 | ประวัติการเคลื่อนไหวสต็อก | ✅ |
| I-07 | ปรับสต็อกด้วยตนเอง (Manual Adjust) | ✅ |
| I-08 | จัดการหมวดหมู่สินค้า | ✅ |
| I-09 | พิมพ์ label บาร์โค้ด (S/M/L, กำหนดจำนวน) | ✅ |
| I-10 | แจ้งเตือนสินค้าใกล้หมด (reorder_point) | 🔨 |
| I-11 | นำเข้าสินค้าจาก Excel (bulk import) | 🔴 |
| I-12 | ส่งออกรายการสินค้าเป็น Excel/CSV | 🔴 |
| I-13 | รูปภาพสินค้า (upload) | 🔴 |

---

## 🗺️ แผนที่ร้าน / ตำแหน่งชั้นวาง (Store Map)

| # | Feature | Status |
|---|---|---|
| M-01 | กำหนดตำแหน่ง shelf ให้แต่ละ variant (`shelf_location`) | 🔴 |
| M-02 | ผัง shelf แบบ grid (แถว × คอลัมน์) | 🔴 |
| M-03 | หน้า `/inventory/map` แสดงสินค้าตาม shelf | 🔴 |
| M-04 | Badge ตำแหน่ง shelf ในหน้ารายละเอียดสินค้า | 🔴 |
| M-05 | ค้นหาสินค้า → แสดงตำแหน่ง shelf ทันที | 🔴 |
| M-06 | Drag & drop จัดสินค้าระหว่าง shelf (admin) | 🔴 |

---

## 🪡 งานปัก (Job Orders)

| # | Feature | Status |
|---|---|---|
| J-01 | สร้างใบงานปักใหม่ | ✅ |
| J-02 | แก้ไขใบงาน | ✅ |
| J-03 | Kanban board 4 คอลัมน์ (desktop) | ✅ |
| J-04 | Drag & drop เปลี่ยนสถานะ | ✅ |
| J-05 | Tab view เลือกดูทีละสถานะ (mobile) | ✅ |
| J-06 | เลขที่ใบงานอัตโนมัติ (JOB-YYYY-XXXX) | ✅ |
| J-07 | บันทึกมัดจำ + คำนวณยอดค้างชำระ | ✅ |
| J-08 | กำหนดช่างผู้รับผิดชอบ | ✅ |
| J-09 | วันที่กำหนดเสร็จ | ✅ |
| J-10 | Link ติดตามสถานะสำหรับลูกค้า | ✅ |
| J-11 | อัปโหลดรูปแบบงาน (design image) | 🔴 |
| J-12 | แจ้งเตือนเมื่องานใกล้ถึงกำหนด | 🔴 |
| J-13 | พิมพ์ใบงาน (Job Order slip) | 🔴 |
| J-14 | ประวัติการเปลี่ยนสถานะ (audit trail) | 🔴 |

---

## 💳 ผ่อนชำระ (Installments)

| # | Feature | Status |
|---|---|---|
| IN-01 | สร้างแผนผ่อนชำระตอนชำระเงิน POS | 🔴 |
| IN-02 | กำหนดจำนวนงวด + วันครบกำหนดแต่ละงวด | 🔴 |
| IN-03 | หน้า `/installments` รายการผ่อนทั้งหมด | 🔴 |
| IN-04 | กรอง: ค้างชำระ / ใกล้ครบกำหนด / ชำระแล้ว | 🔴 |
| IN-05 | บันทึกการรับชำระแต่ละงวด | 🔴 |
| IN-06 | Dashboard widget "งวดที่ครบกำหนดวันนี้" | 🔴 |
| IN-07 | แจ้งเตือนลูกค้าผ่าน Line/SMS | 🔴 |

---

## 👥 ลูกค้า (CRM)

| # | Feature | Status |
|---|---|---|
| C-01 | รายชื่อลูกค้าทั้งหมด | ✅ |
| C-02 | เพิ่ม / แก้ไขข้อมูลลูกค้า | ✅ |
| C-03 | ประวัติการซื้อสินค้า | ✅ |
| C-04 | ค้นหาลูกค้าด้วยชื่อ / โทรศัพท์ | ✅ |
| C-05 | ยอดซื้อสะสม | ✅ |
| C-06 | ระบบสะสมแต้ม / Loyalty Points | 🔴 |
| C-07 | แบ่งกลุ่มลูกค้า (VIP / ทั่วไป) | 🔴 |
| C-08 | ส่งออกรายชื่อลูกค้าเป็น Excel | 🔴 |

---

## 📊 รายงาน (Reports)

| # | Feature | Status |
|---|---|---|
| R-01 | รายงานยอดขายรายวัน / สัปดาห์ / เดือน | ✅ |
| R-02 | กราฟยอดขาย (recharts) | ✅ |
| R-03 | รายงานกำไรขั้นต้น | ✅ |
| R-04 | รายงานสินค้าขายดี | ✅ |
| R-05 | รายงานสต็อกคงเหลือ | ✅ |
| R-06 | รายงานงานปัก (จำนวน / รายรับ) | ✅ |
| R-07 | Export รายงานเป็น PDF | 🔴 |
| R-08 | Export รายงานเป็น Excel | 🔴 |
| R-09 | รายงานผ่อนชำระค้าง | 🔴 |
| R-10 | รายงานประสิทธิภาพพนักงานแต่ละคน | 🔴 |

---

## 🔍 Risk Dashboard (ตรวจสอบความเสี่ยง)

| # | Feature | Status |
|---|---|---|
| RD-01 | อัตราการ Void บิล | ✅ |
| RD-02 | รายการ Price Override | ✅ |
| RD-03 | ความคลาดเคลื่อนเงินสด (Cash Discrepancy) | ✅ |
| RD-04 | สถิติ Void แยกตามพนักงาน | ✅ |
| RD-05 | แจ้งเตือนเมื่ออัตรา Void สูงผิดปกติ | 🔴 |
| RD-06 | Audit Log ทุกการเปลี่ยนแปลงสำคัญ | 🔴 |

---

## ⚙️ ตั้งค่า (Settings)

| # | Feature | Status |
|---|---|---|
| S-01 | จัดการผู้ใช้งาน (เพิ่ม / แก้ไข / ปิดใช้) | ✅ |
| S-02 | กำหนด Role ผู้ใช้ | ✅ |
| S-03 | ตั้งค่าข้อมูลร้าน (ชื่อ / เบอร์ / ที่อยู่) | ✅ |
| S-04 | กำหนดอัตราภาษี | ✅ |
| S-05 | ตั้งค่า Logo ร้าน | 🔴 |
| S-06 | ตั้งค่าการพิมพ์ใบเสร็จ | 🔴 |
| S-07 | ตั้งค่าการแจ้งเตือน (Line / SMS) | 🔴 |
| S-08 | Backup / Export ข้อมูลทั้งหมด | 🔴 |

---

## 📱 Mobile & UX

| # | Feature | Status |
|---|---|---|
| UX-01 | Bottom Navigation bar (mobile) | ✅ |
| UX-02 | Sidebar (desktop) | ✅ |
| UX-03 | Mobile cart เป็น bottom sheet (POS) | ✅ |
| UX-04 | Safe area / iPhone notch support | ✅ |
| UX-05 | ตาราง scroll แนวนอนบน mobile | ✅ |
| UX-06 | Card view แทนตารางบน mobile (Inventory) | 🔨 |
| UX-07 | Card view แทนตารางบน mobile (Customers) | 🔨 |
| UX-08 | Card view แทนตารางบน mobile (Reports) | 🔨 |
| UX-09 | Loading skeleton (แทน spinner) | 🔴 |
| UX-10 | PWA / Add to Home Screen | 🔴 |
| UX-11 | Offline mode (Service Worker) | 🔴 |
| UX-12 | Dark Mode | 🔴 |

---

## 🧪 Testing

| # | Feature | Status |
|---|---|---|
| TE-01 | E2E: Auth (login / logout) | ✅ |
| TE-02 | E2E: Dashboard | ✅ |
| TE-03 | E2E: Inventory CRUD | ✅ |
| TE-04 | E2E: POS flow | ✅ |
| TE-05 | E2E: Job Orders | ✅ |
| TE-06 | E2E: Reports | ✅ |
| TE-07 | E2E: Settings / Users | ✅ |
| TE-08 | E2E: Landing page + Order tracking | 🔴 |
| TE-09 | E2E: Barcode printing | 🔴 |
| TE-10 | E2E: Mobile viewport / Bottom nav | 🔴 |
| TE-11 | E2E: Installments flow | 🔴 |
| TE-12 | Unit tests (utils, stores) | 🔴 |

---

## สรุปสถานะ

| สถานะ | จำนวน |
|---|---|
| ✅ Done | 67 |
| 🔨 Partial | 5 |
| 🔴 Not Started | 40 |
| **รวมทั้งหมด** | **112** |

