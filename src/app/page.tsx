import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TrackingForm from '@/components/landing/TrackingForm'
import ProductShowcase from '@/components/landing/ProductShowcase'

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'LookKuan'
const STORE_PHONE = process.env.NEXT_PUBLIC_STORE_PHONE || ''
const STORE_ADDRESS = process.env.NEXT_PUBLIC_STORE_ADDRESS || ''

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  const { data: products } = await supabase
    .from('products')
    .select(`
      id, name, description, base_price, image_url, category_id,
      category:categories(id, name),
      variants:product_variants(color, size, stock_quantity, price_override, is_active)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(40)

  const normalizedProducts = (products ?? []).map((p) => {
    const cat = Array.isArray(p.category) ? p.category[0] : p.category
    const vars = (p.variants ?? []).filter((v: { is_active: boolean }) => v.is_active)
    return { ...p, category: cat ?? null, variants: vars }
  })

  const categoryMap = new Map<string, { id: string; name: string }>()
  for (const p of normalizedProducts) {
    if (p.category) categoryMap.set(p.category.id, p.category)
  }
  const categories = Array.from(categoryMap.values())

  return (
    <div className='min-h-screen bg-white text-gray-900 font-mali'>

      {/* ── STICKY NAV ──────────────────────────────────────────── */}
      <header className='sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100'>
        <div className='max-w-5xl mx-auto px-5 h-16 flex items-center justify-between gap-4'>
          <div className='flex items-center gap-2.5'>
            <div className='w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center shadow-sm rotate-3'>
              <span className='text-xl'>🧵</span>
            </div>
            <span className='text-xl font-bold text-gray-900 tracking-tight'>{STORE_NAME}</span>
          </div>

          <nav className='flex items-center gap-1 sm:gap-2'>
            <a
              href='#products'
              className='hidden sm:inline-flex items-center text-sm text-gray-500 hover:text-brand-600 font-semibold px-3 py-2 rounded-xl hover:bg-brand-50 transition-all'
            >
              สินค้า
            </a>
            <a
              href='#track'
              className='hidden sm:inline-flex items-center text-sm text-gray-500 hover:text-brand-600 font-semibold px-3 py-2 rounded-xl hover:bg-brand-50 transition-all'
            >
              ติดตามงาน
            </a>
            <Link
              href='/login'
              className='text-sm bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all'
            >
              เข้าสู่ระบบ
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className='relative overflow-hidden bg-white'>
        {/* Decorative blobs */}
        <div
          className='absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none'
          style={{ background: 'radial-gradient(circle, #BAE6FD 0%, transparent 70%)', transform: 'translate(35%, -35%)' }}
          aria-hidden='true'
        />
        <div
          className='absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none'
          style={{ background: 'radial-gradient(circle, #E0F2FE 0%, transparent 70%)', transform: 'translate(-35%, 35%)' }}
          aria-hidden='true'
        />
        {/* Deco dots */}
        <div className='absolute top-12 left-6 hidden lg:grid grid-cols-4 gap-2.5 pointer-events-none opacity-25' aria-hidden='true'>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className='w-1.5 h-1.5 rounded-full bg-brand-400' />
          ))}
        </div>

        <div className='relative max-w-2xl mx-auto px-5 pt-16 pb-16 text-center'>
          {/* Badge */}
          <div className='inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 text-sm font-semibold px-4 py-2 rounded-full mb-7'>
            <span className='w-2 h-2 bg-brand-500 rounded-full animate-pulse' />
            เปิดรับออเดอร์ทุกวัน
          </div>

          {/* Headline */}
          <h1 className='text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-5'>
            เสื้อผ้าคุณภาพ
            <br />
            <span className='relative inline-block text-brand-500'>
              ราคาเป็นมิตร
              <svg
                className='absolute -bottom-2 left-0 w-full'
                viewBox='0 0 200 12'
                preserveAspectRatio='none'
                aria-hidden='true'
              >
                <path
                  d='M0,6 C25,2 50,10 75,6 C100,2 125,10 150,6 C175,2 195,8 200,6'
                  stroke='#38BDF8'
                  strokeWidth='3'
                  fill='none'
                  strokeLinecap='round'
                />
              </svg>
            </span>
          </h1>

          <p className='text-gray-500 text-lg sm:text-xl mb-10 max-w-md mx-auto leading-relaxed font-sans'>
            เสื้อผ้าหลายสไตล์ หลายไซส์ · รับปักโลโก้
            <br className='hidden sm:block' />
            ชื่อ และลวดลายสั่งทำทุกแบบ
          </p>

          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <a
              href='#products'
              className='inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-2xl text-base shadow-lg shadow-brand-200 hover:shadow-brand-300 transition-all hover:-translate-y-0.5 active:translate-y-0'
            >
              ดูสินค้าทั้งหมด →
            </a>
            <a
              href='#track'
              className='inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-brand-400 hover:bg-brand-50 text-gray-700 font-bold px-8 py-4 rounded-2xl text-base transition-all hover:-translate-y-0.5 active:translate-y-0'
            >
              🔍 ติดตามงานปัก
            </a>
          </div>
        </div>

        {/* Wave divider */}
        <div className='relative h-12 overflow-hidden' aria-hidden='true'>
          <svg viewBox='0 0 1200 48' className='absolute bottom-0 w-full' preserveAspectRatio='none'>
            <path d='M0,24 C200,48 400,0 600,24 C800,48 1000,0 1200,24 L1200,48 L0,48 Z' fill='#F0F9FF' />
          </svg>
        </div>
      </section>

      {/* ── TRUST / STATS BAR ────────────────────────────────────── */}
      <section className='py-8 px-5 bg-brand-50'>
        <div className='max-w-3xl mx-auto'>
          <div className='flex items-center justify-between gap-3 overflow-x-auto scrollbar-none'>
            {[
              { icon: '👕', stat: '100+', label: 'แบบสินค้า', color: 'bg-brand-100 text-brand-600' },
              { icon: '🪡', stat: 'รับปัก', label: 'สั่งทำทุกแบบ', color: 'bg-indigo-100 text-indigo-600' },
              { icon: '📦', stat: 'พร้อมส่ง', label: 'ในสต็อก', color: 'bg-teal-100 text-teal-600' },
              { icon: '⭐', stat: 'บริการดี', label: 'ทุกออเดอร์', color: 'bg-cyan-100 text-cyan-600' },
            ].map((item, i) => (
              <div
                key={i}
                className='flex items-center gap-3 px-5 py-3.5 bg-white rounded-2xl border border-brand-100 shadow-sm flex-shrink-0 flex-1 min-w-[140px] sm:min-w-0'
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <p className='font-bold text-gray-900 text-sm leading-tight'>{item.stat}</p>
                  <p className='text-gray-400 text-xs mt-0.5 font-sans'>{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS SECTION ─────────────────────────────────────── */}
      <section id='products' className='py-16 px-5 bg-white'>
        <div className='max-w-5xl mx-auto'>
          <div className='text-center mb-10'>
            <span className='inline-block bg-brand-100 text-brand-700 text-xs font-bold px-3 py-1.5 rounded-full tracking-widest uppercase mb-3 font-sans'>
              สินค้าในร้าน
            </span>
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-3'>
              เลือกซื้อสินค้าได้เลย ✨
            </h2>
            <p className='text-gray-400 max-w-sm mx-auto font-sans text-sm leading-relaxed'>
              หลายหมวดหมู่ หลายไซส์ หลายสี — สอบถามเพิ่มเติมได้ตลอดเวลา
            </p>
          </div>
          <ProductShowcase products={normalizedProducts} categories={categories} />
        </div>
      </section>

      {/* ── EMBROIDERY CTA ────────────────────────────────────────── */}
      <section id='services' className='py-16 px-5 relative overflow-hidden bg-brand-50'>
        {/* Deco dots */}
        <div className='absolute top-8 right-8 hidden lg:grid grid-cols-5 gap-3 pointer-events-none opacity-20' aria-hidden='true'>
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className='w-2 h-2 rounded-full bg-brand-500' />
          ))}
        </div>
        <div className='absolute bottom-8 left-8 hidden lg:grid grid-cols-3 gap-3 pointer-events-none opacity-20' aria-hidden='true'>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className='w-2 h-2 rounded-full bg-indigo-400' />
          ))}
        </div>

        <div className='max-w-4xl mx-auto relative'>
          <div className='text-center mb-10'>
            <div className='w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-md rotate-3'>
              🪡
            </div>
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-3'>
              ปักโลโก้ บริษัท / โรงเรียน
            </h2>
            <p className='text-gray-500 max-w-md mx-auto font-sans text-sm leading-relaxed'>
              รับงานปักทุกประเภท ทั้งตัวอักษร โลโก้ และลวดลาย — ไม่จำกัดจำนวนชิ้น
            </p>
          </div>

          <div className='flex flex-wrap gap-2.5 justify-center mb-10'>
            {[
              { icon: '🏫', label: 'ชุดนักเรียน' },
              { icon: '🎓', label: 'ชุดนักศึกษา' },
              { icon: '🏢', label: 'ชุดองค์กร' },
              { icon: '⚽', label: 'เสื้อกีฬา' },
              { icon: '👔', label: 'เสื้อโปโล' },
              { icon: '🧥', label: 'แจ็กเก็ต' },
            ].map((chip) => (
              <span
                key={chip.label}
                className='inline-flex items-center gap-1.5 bg-white border border-brand-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-full shadow-sm'
              >
                {chip.icon} {chip.label}
              </span>
            ))}
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
            {[
              { n: '1', icon: '📞', title: 'ติดต่อสั่งงาน', desc: 'โทรหรือแวะมาที่ร้าน' },
              { n: '2', icon: '💰', title: 'วางมัดจำ', desc: 'รับเลขใบงานไว้ติดตาม' },
              { n: '3', icon: '🪡', title: 'ดำเนินการ', desc: 'ทีมงานปักอย่างพิถีพิถัน' },
              { n: '4', icon: '✅', title: 'รับสินค้า', desc: 'ชำระส่วนที่เหลือ' },
            ].map((s) => (
              <div
                key={s.n}
                className='bg-white rounded-3xl p-5 text-center shadow-sm border border-brand-100 hover:shadow-md transition-shadow'
              >
                <div className='w-8 h-8 bg-brand-500 text-white rounded-2xl flex items-center justify-center text-sm font-bold mx-auto mb-3 -rotate-3'>
                  {s.n}
                </div>
                <div className='text-3xl mb-2'>{s.icon}</div>
                <p className='font-bold text-gray-800 text-sm'>{s.title}</p>
                <p className='text-xs text-gray-400 mt-1 leading-snug font-sans'>{s.desc}</p>
              </div>
            ))}
          </div>

          <div className='text-center'>
            <a
              href='#track'
              className='inline-flex items-center gap-2 bg-white border border-brand-200 text-brand-600 hover:bg-brand-50 font-semibold text-sm px-5 py-2.5 rounded-full shadow-sm transition-colors'
            >
              🔍 สั่งงานแล้ว? ติดตามสถานะที่นี่ →
            </a>
          </div>
        </div>
      </section>

      {/* ── ORDER TRACKING ───────────────────────────────────────── */}
      <section id='track' className='py-16 px-5 bg-white'>
        <div className='max-w-lg mx-auto'>
          <div className='text-center mb-8'>
            <div className='w-16 h-16 bg-brand-50 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 rotate-6'>
              📦
            </div>
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-3'>
              ติดตามสถานะงาน
            </h2>
            <p className='text-gray-400 font-sans text-sm leading-relaxed'>
              กรอกเลขที่ใบงานที่ได้รับจากร้าน เพื่อดูความคืบหน้า
            </p>
          </div>
          <div className='bg-brand-50 rounded-3xl p-6 border border-brand-100'>
            <TrackingForm />
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────── */}
      {(STORE_PHONE || STORE_ADDRESS) && (
        <section className='py-14 px-5 bg-brand-500 relative overflow-hidden'>
          <div className='absolute top-0 left-1/4 w-40 h-40 rounded-full bg-white/10 pointer-events-none' style={{ transform: 'translate(-50%, -50%)' }} aria-hidden='true' />
          <div className='absolute bottom-0 right-1/4 w-32 h-32 rounded-full bg-white/10 pointer-events-none' style={{ transform: 'translate(50%, 50%)' }} aria-hidden='true' />

          <div className='relative max-w-3xl mx-auto text-center text-white'>
            <h2 className='text-3xl font-bold mb-2'>ติดต่อเรา 👋</h2>
            <p className='text-brand-100 mb-8 font-sans text-sm'>ยินดีให้คำปรึกษาทุกวัน — ไม่มีค่าใช้จ่าย</p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center'>
              {STORE_PHONE && (
                <a
                  href={`tel:${STORE_PHONE}`}
                  className='flex items-center gap-3 bg-white/20 hover:bg-white/30 border border-white/20 rounded-2xl px-6 py-4 transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center'
                >
                  <span className='text-2xl'>📞</span>
                  <div className='text-left'>
                    <p className='text-xs text-brand-100 font-sans'>โทรศัพท์</p>
                    <p className='text-xl font-bold tracking-wide'>{STORE_PHONE}</p>
                  </div>
                </a>
              )}
              {STORE_ADDRESS && (
                <div className='flex items-center gap-3 bg-white/20 border border-white/20 rounded-2xl px-6 py-4 w-full sm:w-auto justify-center'>
                  <span className='text-2xl'>📍</span>
                  <div className='text-left'>
                    <p className='text-xs text-brand-100 font-sans'>ที่อยู่</p>
                    <p className='font-bold leading-snug'>{STORE_ADDRESS}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className='bg-gray-950 text-gray-500 py-8 px-5'>
        <div className='max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center rotate-3'>
              <span className='text-sm'>🧵</span>
            </div>
            <div>
              <p className='font-bold text-white text-sm'>{STORE_NAME}</p>
              <p className='text-xs text-gray-600 font-sans'>© {new Date().getFullYear()} สงวนลิขสิทธิ์</p>
            </div>
          </div>
          <div className='flex items-center gap-5 text-xs font-sans'>
            <a href='#products' className='hover:text-white transition-colors'>สินค้า</a>
            <a href='#track' className='hover:text-white transition-colors'>ติดตามงาน</a>
            <span className='text-gray-700'>·</span>
            <Link href='/login' className='hover:text-white transition-colors'>เข้าสู่ระบบพนักงาน</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
