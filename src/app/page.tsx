import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TrackingForm from '@/components/landing/TrackingForm'

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'LookKuan'
const STORE_PHONE = process.env.NEXT_PUBLIC_STORE_PHONE || ''
const STORE_ADDRESS = process.env.NEXT_PUBLIC_STORE_ADDRESS || ''

export default async function LandingPage() {
  // Check if user is already logged in — redirect to dashboard
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ===== NAV ===== */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧵</span>
            <span className="text-xl font-bold text-gray-900">{STORE_NAME}</span>
          </div>
          <Link
            href="/login"
            className="pos-btn bg-brand-500 text-white hover:bg-brand-600 px-5 py-2.5 text-base rounded-xl"
          >
            🔑 เข้าสู่ระบบพนักงาน
          </Link>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <span>✨</span> ร้านเสื้อผ้าและงานปักคุณภาพ
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            {STORE_NAME}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            จำหน่ายเสื้อผ้าพร้อมสวม และรับงานปักโลโก้คุณภาพสูง
            ทำด้วยความใส่ใจทุกชิ้น
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#track"
              className="pos-btn bg-brand-500 text-white hover:bg-brand-600 px-8 py-4 text-lg rounded-xl shadow-md"
            >
              🔍 ตรวจสอบสถานะงาน
            </a>
            <a
              href="#services"
              className="pos-btn bg-white text-gray-700 border-2 border-gray-200 hover:border-brand-300 hover:bg-brand-50 px-8 py-4 text-lg rounded-xl"
            >
              📋 บริการของเรา
            </a>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">บริการของเรา</h2>
          <p className="text-center text-gray-500 mb-12">ครบจบในที่เดียว ทั้งขายปลีกและงานสั่งทำ</p>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Service 1 */}
            <div className="rounded-2xl border-2 border-gray-100 p-8 hover:border-brand-200 hover:shadow-lg transition-all">
              <div className="text-5xl mb-4">👕</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">เสื้อผ้าพร้อมสวม</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                คัดสรรเสื้อผ้าคุณภาพ หลากหลายสไตล์และขนาด
                เหมาะกับทุกโอกาส อัปเดตคอลเลกชันใหม่สม่ำเสมอ
              </p>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li className="flex items-center gap-2"><span className="text-brand-500 font-bold">✓</span> หลากหลายสไตล์</li>
                <li className="flex items-center gap-2"><span className="text-brand-500 font-bold">✓</span> ทุกไซส์ S–3XL</li>
                <li className="flex items-center gap-2"><span className="text-brand-500 font-bold">✓</span> ราคาย่อมเยา</li>
              </ul>
            </div>

            {/* Service 2 */}
            <div className="rounded-2xl border-2 border-brand-200 p-8 bg-brand-50 hover:shadow-lg transition-all">
              <div className="text-5xl mb-4">🪡</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">งานปักโลโก้ & ลวดลาย</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                รับปักโลโก้บริษัท ชื่อ ตัวอักษร และลวดลายต่างๆ
                ด้วยเครื่องปักคอมพิวเตอร์คุณภาพสูง งานละเอียดสวยงาม
              </p>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li className="flex items-center gap-2"><span className="text-brand-500 font-bold">✓</span> ปักโลโก้บริษัท/องค์กร</li>
                <li className="flex items-center gap-2"><span className="text-brand-500 font-bold">✓</span> ปักชื่อ-นามสกุล</li>
                <li className="flex items-center gap-2"><span className="text-brand-500 font-bold">✓</span> รับทุกจำนวน</li>
                <li className="flex items-center gap-2"><span className="text-brand-500 font-bold">✓</span> ติดตามสถานะได้ออนไลน์</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS (Embroidery) ===== */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">ขั้นตอนการสั่งงานปัก</h2>
          <p className="text-center text-gray-500 mb-12">ง่าย รวดเร็ว ติดตามได้ทุกขั้นตอน</p>

          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { step: '1', icon: '📞', title: 'ติดต่อสั่งงาน', desc: 'โทรหรือแวะมาที่ร้าน บอกรายละเอียดงานที่ต้องการ' },
              { step: '2', icon: '💰', title: 'ชำระมัดจำ', desc: 'วางมัดจำบางส่วน รับเลขที่ใบงานเพื่อติดตาม' },
              { step: '3', icon: '🪡', title: 'ดำเนินการปัก', desc: 'ทีมงานดำเนินการปักอย่างพิถีพิถัน' },
              { step: '4', icon: '✅', title: 'รับงาน & ชำระส่วนที่เหลือ', desc: 'รับสินค้าและชำระค่าบริการส่วนที่เหลือ' },
            ].map(item => (
              <div key={item.step} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                  {item.step}
                </div>
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ORDER TRACKING ===== */}
      <section id="track" className="py-16 px-4 bg-white">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">ตรวจสอบสถานะงาน</h2>
          <p className="text-center text-gray-500 mb-8">
            กรอกเลขที่ใบงาน (เช่น JOB-2024-0001) ที่ได้รับเมื่อสั่งงาน
          </p>
          <TrackingForm />
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      {(STORE_PHONE || STORE_ADDRESS) && (
        <section className="py-16 px-4 bg-brand-500">
          <div className="max-w-5xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-8">ติดต่อเรา</h2>
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              {STORE_PHONE && (
                <a
                  href={`tel:${STORE_PHONE}`}
                  className="flex items-center gap-3 bg-white/20 hover:bg-white/30 rounded-2xl px-8 py-4 transition-all"
                >
                  <span className="text-3xl">📞</span>
                  <div className="text-left">
                    <p className="text-sm opacity-80">โทรศัพท์</p>
                    <p className="text-xl font-bold">{STORE_PHONE}</p>
                  </div>
                </a>
              )}
              {STORE_ADDRESS && (
                <div className="flex items-center gap-3 bg-white/20 rounded-2xl px-8 py-4">
                  <span className="text-3xl">📍</span>
                  <div className="text-left">
                    <p className="text-sm opacity-80">ที่อยู่</p>
                    <p className="text-lg font-semibold">{STORE_ADDRESS}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center">
        <p className="text-lg font-semibold text-white mb-1">{STORE_NAME}</p>
        <p className="text-sm">© {new Date().getFullYear()} สงวนลิขสิทธิ์</p>
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <Link href="/login" className="hover:text-white transition-colors">
            🔑 เข้าสู่ระบบพนักงาน
          </Link>
          <span>·</span>
          <a href="#track" className="hover:text-white transition-colors">
            🔍 ติดตามงาน
          </a>
        </div>
      </footer>
    </div>
  )
}
