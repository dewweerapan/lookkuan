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
- [ ] เพิ่ม checkbox multi-select ใน job order list
- [ ] เพิ่มปุ่ม "เปลี่ยนสถานะทั้งหมด (N รายการ)" เมื่อ select > 0
- [ ] Dialog เลือกสถานะที่ต้องการ
- [ ] Call API batch update
- [ ] ทดสอบ select หลาย order และเปลี่ยนสถานะพร้อมกัน

---

## Sprint 3 — Power Features

### Feature: On-screen Numeric Keypad ใน POS
- [ ] สร้าง `NumericKeypad` component
- [ ] แสดงเมื่อ cash input focused บน touch device
- [ ] ปุ่ม 0-9, backspace, clear, พอดี
- [ ] ซ่อน native keyboard บน mobile

### Feature: Quick Re-order งานปัก
- [ ] เพิ่มปุ่ม "สั่งซ้ำ" ในหน้า job order detail
- [ ] Pre-fill form จาก order เดิม (ลูกค้า, ดีไซน์, ราคา)
- [ ] เปิด new job order modal พร้อมข้อมูล

---

## Status Log
- 2026-03-28: สร้าง checklist
- 2026-03-28: Sprint 1 + Swipe gesture เสร็จสมบูรณ์ → push to main (cf34624)
