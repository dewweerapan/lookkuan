# แผนพัฒนา UX — LookKuan

วันที่วิเคราะห์: 2026-03-28
สถานะระบบ: Production ที่ lookkuan.vercel.app

---

## ภาพรวมการวิเคราะห์

วิเคราะห์จากโค้ดจริงและมุมมองการใช้งานของพนักงาน/ผู้ปกครอง/นักเรียน พบ 3 ปัญหาหลักที่ส่งผลต่อความเร็วในการทำงานจริงทุกวัน บวกกับการปรับปรุงเพิ่มเติมที่จะลดขั้นตอน

---

## 1. Drag & Drop เปลี่ยนสถานะงานปัก (Mobile)

### ปัญหาที่พบ
Kanban board (drag & drop) **มีอยู่แล้วบน Desktop** แต่บน **Mobile ใช้ไม่ได้** — แสดงเป็น tab filter + list แทน ไม่มี gesture ใดสำหรับเปลี่ยนสถานะ ต้องกดเข้าหน้า detail แล้วกดปุ่มเปลี่ยนสถานะอีกที

ในการใช้งานจริง พนักงานปักอยู่กับโต๊ะงาน มือถือสะดวกกว่าคอมพิวเตอร์ การต้องเข้า 2 หน้าจอเพื่อเปลี่ยนสถานะช้าเกินไป

### Scope ของงาน

#### Option A — Swipe Gesture (แนะนำ)
- ใน `JobOrdersClient.tsx` (mobile list section, lines 198–281)
- ใช้ `@use-gesture/react` หรือ touch events แบบ native
- **Swipe ขวา** = เลื่อนสถานะไปข้างหน้า (pending → in_progress → completed → delivered)
- **Swipe ซ้าย** = เปิด quick actions: ยกเลิก / ดูรายละเอียด
- แสดง color indicator ขณะลาก (เหมือน iOS Mail)
- Optimistic update + rollback เหมือนที่ desktop ทำอยู่แล้ว

```
[รอดำเนินการ] ← swipe right → [กำลังปัก]
[กำลังปัก]   ← swipe right → [เสร็จแล้ว]
```

#### Option B — Long Press Quick Menu (ง่ายกว่า)
- กด card ค้าง → popup menu: เลือกสถานะได้เลย
- ใช้เวลาพัฒนาน้อยกว่า ไม่ต้องจัดการ gesture conflicts

#### ไฟล์ที่ต้องแก้
- `src/components/job-orders/JobOrdersClient.tsx` — เพิ่ม swipe handler ในส่วน mobile list
- ไม่ต้องแตะ API หรือ database — ใช้ `handleStatusChange` ที่มีอยู่แล้ว

#### เหตุผลที่ควรทำก่อน
เป็นงานที่ใช้บ่อยที่สุดทุกวัน พนักงานปักเปลี่ยนสถานะงานตลอดวัน ถ้าทำบน mobile ง่ายขึ้น ลดเวลาต่อ order จาก ~15 วินาที เหลือ ~3 วินาที

---

## 2. กดแบงค์เพื่อเพิ่มจำนวนเงินที่รับ (POS)

### ปัญหาที่พบ
ปุ่ม quick amount ปัจจุบัน (20, 50, 100, 500, 1000) **ตั้งค่าเป็นจำนวนนั้นเลย** ไม่ใช่ "บวกเพิ่ม"
ถ้าลูกค้าจ่าย 2 ใบ 1000 บาท = 2000 บาท ต้องพิมพ์ "2000" เอง

ในร้านจริง พนักงานรับเงินสดทีละใบ — ควรนับตามที่รับจริง ลดการคำนวณในหัว

### Scope ของงาน

**เพิ่ม mode toggle** ใน `POSClient.tsx` (lines 806–846):

```
[ตั้งค่า] vs [+เพิ่ม]  ← toggle button เล็กๆ
```

- **Mode "ตั้งค่า"** (default เดิม): กดแบงค์ = ตั้งเป็นจำนวนนั้น
- **Mode "+เพิ่ม"** (ใหม่): กดแบงค์ = บวกเพิ่มจากที่มีอยู่

หรือออกแบบใหม่ให้ **ปุ่มแบงค์ทำงานเป็น "+เพิ่ม" เสมอ** + มีปุ่ม "ล้าง" เพื่อรีเซ็ต จะเป็น UX ที่สะอาดกว่า

```
กดแบงค์ 1000 → cashReceived += 1000
กดแบงค์ 1000 อีกครั้ง → cashReceived += 1000 (รวม 2000)
กด "ล้าง" → cashReceived = 0
กด "พอดี" → cashReceived = total (ยังคงอยู่)
```

#### ไฟล์ที่ต้องแก้
- `src/components/pos/POSClient.tsx` — แก้ handler ของปุ่ม quick amount (lines ~820–835)
- เปลี่ยน `setCashReceived(amount)` → `setCashReceived(prev => prev + amount)`
- เพิ่มปุ่ม "ล้าง" (reset to 0) ข้างปุ่ม "พอดี"

#### เหตุผลที่ควรทำ
เป็น 1-line code change ที่มี impact สูงมาก ลดข้อผิดพลาดในการรับเงิน เหมาะกับ flow "รับแบงค์ทีละใบ"

---

## 3. Camera Barcode Scan ไม่เพิ่มสินค้าเข้าตะกร้า (Bug)

### ปัญหาที่พบ
`CameraScanner.tsx` ใช้ `html5-qrcode` สแกนบาร์โค้ด แต่ผลลัพธ์ที่ได้ **ไม่ถูกส่งต่อ** ไปยัง `handleBarcodeScan` ใน `POSClient.tsx` ที่ทำหน้าที่ค้นหาสินค้าและเพิ่มเข้าตะกร้า

Hardware scanner (กด Enter) ทำงานได้ปกติ แต่ camera scanner ไม่ได้ผล

### Root Cause ที่น่าจะเป็น
`CameraScanner.tsx` อาจ:
1. ส่ง callback ไม่ถูก prop ชื่อ
2. Format ของ barcode string ต่างจากที่ `handleBarcodeScan` expect (มี whitespace, prefix)
3. Component ถูก mount ในตำแหน่งที่ `handleBarcodeScan` scope ไม่ถึง

### Scope ของงาน

1. **Debug**: เปิด `CameraScanner.tsx` + `POSClient.tsx` และตรวจ prop interface
2. ตรวจว่า `onScan` callback ถูก pass และ called ใน `CameraScanner`
3. ตรวจว่า barcode string ที่ได้จาก camera ถูก `.trim()` ก่อนส่งไป
4. ตรวจ `handleBarcodeScan` ว่า match กับ `barcode` หรือ `sku` ในฐานข้อมูลจริง

#### ไฟล์ที่ต้องแก้
- `src/components/pos/CameraScanner.tsx` — ตรวจ onScan callback
- `src/components/pos/POSClient.tsx` — ตรวจ prop ที่ pass ให้ CameraScanner

#### เหตุผลที่สำคัญ
Camera barcode เป็น feature หลักสำหรับ iPad/tablet ที่ไม่มี hardware scanner — ถ้า broken จะทำให้ POS ใช้บนมือถือไม่ได้จริงๆ

---

## 4. การปรับปรุงเพิ่มเติมจากมุมมองการใช้งานจริง

### 4.1 POS — Numeric Keypad บนหน้าจอ

**ปัญหา:** บน tablet/iPad, keyboard ที่ popup มาบดบังหน้าจอครึ่งนึง
**แก้ไข:** เพิ่ม on-screen numeric keypad (0-9, ลบ, ล้าง) แสดงเมื่อ `inputMode="numeric"`
**ไฟล์:** `POSClient.tsx`

---

### 4.2 งานปัก — Photo Upload จากมือถือง่ายขึ้น

**ปัญหา:** ต้องกดหลายขั้นตอนเพื่ออัปโหลดรูปดีไซน์งานปัก
**แก้ไข:** ปุ่ม "ถ่ายรูปดีไซน์" ใหญ่กว่าใน job order form, รองรับ `capture="environment"` เพื่อเปิดกล้องหลังโดยตรง
**ไฟล์:** `src/components/job-orders/JobOrderForm.tsx`

---

### 4.3 สินค้าหมด — แจ้งเตือนขณะขาย

**ปัญหา:** พนักงาน POS รู้ว่าสินค้าหมดตอนที่ลูกค้าจ่ายเงินแล้ว
**แก้ไข:** แสดง warning badge บน cart item ถ้า stock < ที่เพิ่มเข้าตะกร้า
**ไฟล์:** `src/stores/cartStore.ts` + `POSClient.tsx`

---

### 4.4 งานปัก — Batch Status Update

**ปัญหา:** งานปักชื่อมาเป็น batch (เช่น 30 ชุดพร้อมกัน) แต่ต้องเปลี่ยนสถานะทีละใบ
**แก้ไข:** checkbox multi-select + "เปลี่ยนสถานะทั้งหมด" button
**ไฟล์:** `JobOrdersClient.tsx`

---

### 4.5 ลูกค้าประจำ — Quick Add จาก History

**ปัญหา:** ลูกค้าที่สั่งซ้ำต้องกรอกข้อมูลงานปักใหม่ทุกครั้ง
**แก้ไข:** "สั่งซ้ำ" button ในหน้า job order detail ที่ pre-fill form จาก order เดิม
**ไฟล์:** `src/app/(dashboard)/job-orders/[id]/page.tsx`

---

## ลำดับความสำคัญ

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 🔴 Bug | Camera barcode → cart | ต่ำ (debug) | สูง |
| 🔴 High | กดแบงค์เพิ่มเงิน | ต่ำมาก (1 บรรทัด) | สูง |
| 🟡 Medium | Swipe สถานะงานปัก (mobile) | ปานกลาง | สูง |
| 🟡 Medium | Batch status update | ปานกลาง | ปานกลาง |
| 🟢 Low | Numeric keypad | สูง | ปานกลาง |
| 🟢 Low | Photo capture | ต่ำ | ปานกลาง |
| 🟢 Low | Quick re-order | ปานกลาง | ต่ำ |

---

## แนะนำ Sprint ถัดไป

**Sprint 1 (Quick wins — ~1-2 วัน)**
1. แก้ bug camera barcode
2. เปลี่ยนปุ่มแบงค์ให้เป็น "+เพิ่ม" + ปุ่มล้าง

**Sprint 2 (Mobile UX — ~3-5 วัน)**
3. Swipe gesture เปลี่ยนสถานะงานปักบน mobile
4. Batch status update

**Sprint 3 (Power features — ~1 สัปดาห์)**
5. On-screen numeric keypad
6. Quick re-order จาก history
