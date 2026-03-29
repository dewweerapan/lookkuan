# UX Improvement Checklist

สร้างจากแผน UX_IMPROVEMENTS.md วันที่ 2026-03-28

---

## Sprint 1 — Quick Wins

### Bug: Camera Barcode ไม่เพิ่มสินค้าเข้าตะกร้า
- [x] อ่าน `CameraScanner.tsx` ตรวจ onScan callback interface
- [x] อ่าน `POSClient.tsx` ตรวจ prop ที่ pass ให้ `<CameraScanner>`
- [x] ตรวจว่า barcode string ถูก `.trim()` ก่อน call handleBarcodeScan
- [x] แก้โค้ด: ใช้ refs แทน deps array เพื่อไม่ให้ scanner restart ทุก render

### Feature: กดแบงค์เพื่อ +เพิ่ม (ไม่ใช่ตั้งค่า)
- [x] อ่าน `POSClient.tsx` ส่วน quick amount buttons
- [x] เปลี่ยน `setCashReceived(amount)` → `setCashReceived(prev => prev + amount)`
- [x] เพิ่มปุ่ม "ล้าง" (reset cashReceived เป็น 0) ข้างปุ่ม "พอดี"

---

## Sprint 2 — Mobile UX

### Feature: Swipe เปลี่ยนสถานะงานปักบน Mobile
- [x] อ่าน `JobOrdersClient.tsx` ส่วน mobile list
- [x] เพิ่ม `handleAdvanceStatus` (optimistic update + DB + audit log + rollback)
- [x] Swipe ขวา > 60px = เลื่อนสถานะถัดไป
- [x] แสดง green hint layer ขณะลาก
- [x] แตะปกติ (dx < 10px) → navigate ไปหน้า detail
- [x] hint text "ปัดขวาเพื่อเลื่อนสถานะ • แตะเพื่อดูรายละเอียด"

### Feature: Batch Status Update
- [x] เพิ่ม checkbox multi-select ใน job order list (mobile only)
- [x] เพิ่มปุ่ม "เปลี่ยนสถานะ (N รายการ)" sticky bottom bar
- [x] Bottom sheet เลือกสถานะ
- [x] Batch update `.in('id', ids)` + optimistic update + rollback

---

## Sprint 3 — Power Features

### Feature: On-screen Numeric Keypad ใน POS
- [x] สร้าง `NumericKeypad.tsx` component (grid 4x3, h-14 buttons)
- [x] แทนที่ input field ด้วย display div + NumericKeypad
- [x] ปุ่ม 1-9, 0, ← backspace, พอดี
- [x] ปุ่มแบงค์ (+20/+50/+100/+500/+1000) และ ล้าง ยังทำงานร่วมกัน

### Feature: Quick Re-order งานปัก
- [x] สร้าง `ReorderButton.tsx` — navigate ไป `/job-orders/new` พร้อม query params
- [x] เพิ่มปุ่ม "สั่งซ้ำ" ในหน้า job order detail (ซ่อนถ้าสถานะ cancelled)
- [x] `new/page.tsx` อ่าน searchParams pre-fill form + banner "สร้างจากงาน [order_number]"

---

## Status Log
- 2026-03-28: สร้าง checklist
- 2026-03-28: Sprint 1 + Swipe gesture เสร็จสมบูรณ์ → push to main (cf34624)
- 2026-03-29: Sprint 2 (Batch update) + Sprint 3 (Keypad + Re-order) เสร็จสมบูรณ์ → push to main (62e25ef)
