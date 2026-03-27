# LookKuan — ระบบจัดการร้านเสื้อผ้าครบวงจร

ระบบ POS และจัดการร้านเสื้อผ้า พร้อมระบบรับงานปักเสื้อ ออกแบบสำหรับพนักงานผู้สูงอายุ

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State:** Zustand
- **Deployment:** Vercel + Supabase Cloud

## Quick Start

### 1. Clone & Install

```bash
cd lookkuan
npm install
```

### 2. Setup Supabase

1. สร้าง project ที่ [supabase.com](https://supabase.com)
2. Copy `.env.local.example` → `.env.local` แล้วใส่ค่า Supabase URL และ Anon Key
3. รัน SQL migration:

```bash
# ใช้ Supabase CLI
npx supabase init
npx supabase db push

# หรือ copy SQL จาก supabase/migrations/00001_initial_schema.sql
# ไปรันใน Supabase Dashboard → SQL Editor
```

### 3. Create Admin User

ไปที่ Supabase Dashboard → Authentication → Users → Add User:
- Email: admin@lookkuan.com
- Password: (ตั้งรหัสผ่าน)
- User Metadata: `{"full_name": "Admin", "role": "admin"}`

### 4. Run Development

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push code ไป GitHub
2. Import project ที่ [vercel.com](https://vercel.com)
3. ตั้ง Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Features

- ✅ ระบบสินค้าและสต็อก (Barcode, SKU, Variants)
- ✅ POS ขายหน้าร้าน (ออกแบบสำหรับผู้สูงอายุ)
- ✅ ระบบรับงานปักเสื้อ (Kanban Board)
- ✅ แดชบอร์ดตรวจจับทุจริต
- ✅ CRM ลูกค้า
- ✅ รายงานยอดขาย
- ✅ RBAC (Admin, Manager, Cashier, Embroidery Staff)
- ✅ PIN Login สำหรับพนักงานหน้าร้าน
- ✅ ตรวจสอบสถานะงานปัก (Public URL)
# lookkuan
# lookkuan
# lookkuan
