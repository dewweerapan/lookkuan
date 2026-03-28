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

  // Fetch active products with category + variants
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

  // Filter variants to active only + normalize join shape
  const normalizedProducts = (products ?? []).map((p) => {
    const cat = Array.isArray(p.category) ? p.category[0] : p.category
    const vars = (p.variants ?? []).filter((v: { is_active: boolean }) => v.is_active)
    return { ...p, category: cat ?? null, variants: vars }
  })

  // Unique active categories that have products
  const categoryMap = new Map<string, { id: string; name: string }>()
  for (const p of normalizedProducts) {
    if (p.category) categoryMap.set(p.category.id, p.category)
  }
  const categories = Array.from(categoryMap.values())

  return (
    <div className='min-h-screen bg-[#FEFAF6] text-gray-900' style={{ fontFamily: 'Sarabun, sans-serif' }}>

      {/* ── STICKY NAV ──────────────────────────────────────────── */}
      <header className='sticky top-0 z-50 bg-[#FEFAF6]/95 backdrop-blur-md border-b border-orange-100/80'>
        <div className='max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4'>
          {/* Logo */}
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm'>
              <span className='text-lg'>🧵</span>
            </div>
            <span className='text-xl font-extrabold text-gray-900 tracking-tight'>{STORE_NAME}</span>
          </div>

          {/* Nav links */}
          <nav className='flex items-center gap-1 sm:gap-2'>
            <a
              href='#products'
              className='hidden sm:inline-flex items-center gap-1 text-sm text-gray-600 hover:text-brand-600 font-semibold px-3 py-2 rounded-lg hover:bg-orange-50 transition-all duration-200'
            >
              สินค้า
            </a>
            <a
              href='#track'
              className='hidden sm:inline-flex items-center gap-1 text-sm text-gray-600 hover:text-brand-600 font-semibold px-3 py-2 rounded-lg hover:bg-orange-50 transition-all duration-200'
            >
              ติดตามงาน
            </a>
            <Link
              href='/login'
              className='text-sm bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200'
            >
              เข้าสู่ระบบ
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className='relative overflow-hidden'>
        {/* Background: warm radial gradient + decorative shapes */}
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, #FED7AA 0%, #FFF7ED 45%, #FEFAF6 100%)',
          }}
        />
        {/* Decorative large number — textural element */}
        <div
          className='absolute -right-8 top-0 text-[220px] font-extrabold text-orange-100 select-none leading-none pointer-events-none hidden lg:block'
          style={{ lineHeight: 1 }}
          aria-hidden='true'
        >
          ปัก
        </div>

        <div className='relative max-w-2xl mx-auto px-4 pt-16 pb-14 text-center'>
          {/* Badge */}
          <div className='inline-flex items-center gap-2 bg-white border border-orange-200 text-brand-700 text-sm font-semibold px-4 py-2 rounded-full mb-7 shadow-sm'>
            <span className='w-2 h-2 bg-brand-500 rounded-full animate-pulse' />
            เปิดรับออเดอร์ทุกวัน
          </div>

          {/* Headline */}
          <h1 className='text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4' style={{ letterSpacing: '-0.02em' }}>
            เสื้อผ้าคุณภาพ<br />
            <span className='text-brand-500'>ราคาเป็นมิตร</span>
          </h1>

          <p className='text-gray-600 text-lg sm:text-xl mb-10 max-w-md mx-auto leading-relaxed'>
            เสื้อผ้าหลายสไตล์ หลายไซส์ · รับปักโลโก้<br className='hidden sm:block' />
            ชื่อ และลวดลายสั่งทำทุกแบบ
          </p>

          {/* CTAs */}
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <a
              href='#products'
              className='inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-2xl text-base shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5'
            >
              <span>ดูสินค้าทั้งหมด</span>
              <span className='text-lg'>→</span>
            </a>
            <a
              href='#track'
              className='inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-brand-400 hover:bg-orange-50 text-gray-800 font-bold px-8 py-4 rounded-2xl text-base transition-all duration-200 hover:-translate-y-0.5'
            >
              <span>🔍</span>
              ติดตามงานปัก
            </a>
          </div>
        </div>
      </section>

      {/* ── TRUST / STATS BAR ────────────────────────────────────── */}
      <section className='py-5 px-4 bg-white border-y border-gray-100'>
        <div className='max-w-3xl mx-auto'>
          <div className='flex items-center justify-between gap-2 overflow-x-auto scrollbar-none'>
            {[
              { icon: '👕', stat: '100+', label: 'แบบสินค้า' },
              { icon: '🪡', stat: 'รับปัก', label: 'สั่งทำทุกแบบ' },
              { icon: '📦', stat: 'พร้อมส่ง', label: 'ในสต็อก' },
              { icon: '⭐', stat: 'บริการ', label: 'ดีเยี่ยม' },
            ].map((item, i) => (
              <div
                key={i}
                className='flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-100 flex-shrink-0 flex-1 min-w-[130px] sm:min-w-0'
              >
                <span className='text-2xl'>{item.icon}</span>
                <div>
                  <p className='font-extrabold text-gray-900 text-sm leading-none'>{item.stat}</p>
                  <p className='text-gray-500 text-xs mt-0.5'>{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS SECTION ─────────────────────────────────────── */}
      <section id='products' className='py-16 px-4 bg-[#FEFAF6]'>
        <div className='max-w-5xl mx-auto'>
          <div className='text-center mb-10'>
            <p className='text-brand-500 font-bold text-sm uppercase tracking-widest mb-2'>สินค้าในร้าน</p>
            <h2 className='text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3'>
              เลือกซื้อสินค้าได้เลย
            </h2>
            <p className='text-gray-500 max-w-sm mx-auto'>
              หลายหมวดหมู่ หลายไซส์ หลายสี — สอบถามเพิ่มเติมได้ตลอดเวลา
            </p>
          </div>
          <ProductShowcase products={normalizedProducts} categories={categories} />
        </div>
      </section>

      {/* ── EMBROIDERY CTA ────────────────────────────────────────── */}
      <section id='services' className='py-16 px-4 bg-gray-900'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-10'>
            <span className='inline-block text-4xl mb-4'>🪡</span>
            <h2 className='text-2xl sm:text-3xl font-extrabold text-white mb-3'>
              ปักโลโก้ บริษัท / โรงเรียน
            </h2>
            <p className='text-gray-400 max-w-md mx-auto'>
              รับงานปักทุกประเภท ทั้งตัวอักษร โลโก้ และลวดลาย — ไม่จำกัดจำนวนชิ้น
            </p>
          </div>

          {/* Use case chips */}
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
                className='inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors cursor-default'
              >
                {chip.icon} {chip.label}
              </span>
            ))}
          </div>

          {/* Steps grid */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8'>
            {[
              { n: '1', icon: '📞', title: 'ติดต่อสั่งงาน', desc: 'โทรหรือแวะมาที่ร้าน' },
              { n: '2', icon: '💰', title: 'วางมัดจำ', desc: 'รับเลขใบงานไว้ติดตาม' },
              { n: '3', icon: '🪡', title: 'ดำเนินการ', desc: 'ทีมงานปักอย่างพิถีพิถัน' },
              { n: '4', icon: '✅', title: 'รับสินค้า', desc: 'ชำระส่วนที่เหลือ' },
            ].map((s) => (
              <div
                key={s.n}
                className='bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 text-center transition-colors'
              >
                <div className='w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center text-sm font-extrabold mx-auto mb-3'>
                  {s.n}
                </div>
                <div className='text-3xl mb-2'>{s.icon}</div>
                <p className='font-bold text-white text-sm'>{s.title}</p>
                <p className='text-xs text-gray-400 mt-1 leading-snug'>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Track link */}
          <div className='text-center'>
            <a
              href='#track'
              className='inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 font-semibold text-sm transition-colors'
            >
              🔍 สั่งงานแล้ว? ติดตามสถานะที่นี่
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── ORDER TRACKING ───────────────────────────────────────── */}
      <section id='track' className='py-16 px-4 bg-[#FEFAF6]'>
        <div className='max-w-lg mx-auto'>
          <div className='text-center mb-8'>
            <span className='inline-block text-4xl mb-4'>📦</span>
            <h2 className='text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3'>
              ติดตามสถานะงาน
            </h2>
            <p className='text-gray-500'>
              กรอกเลขที่ใบงานที่ได้รับจากร้าน เพื่อดูความคืบหน้า
            </p>
          </div>
          <TrackingForm />
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────── */}
      {(STORE_PHONE || STORE_ADDRESS) && (
        <section className='py-14 px-4 bg-brand-500 relative overflow-hidden'>
          {/* Decorative bg text */}
          <div
            className='absolute inset-0 flex items-center justify-center pointer-events-none select-none'
            aria-hidden='true'
          >
            <span className='text-[180px] font-extrabold text-white/10 leading-none'>📞</span>
          </div>

          <div className='relative max-w-3xl mx-auto text-center text-white'>
            <h2 className='text-2xl font-extrabold mb-2'>ติดต่อเรา</h2>
            <p className='text-orange-100 mb-8 text-sm'>ยินดีให้คำปรึกษาทุกวัน — ไม่มีค่าใช้จ่าย</p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center'>
              {STORE_PHONE && (
                <a
                  href={`tel:${STORE_PHONE}`}
                  className='flex items-center gap-3 bg-white/20 hover:bg-white/30 border border-white/20 rounded-2xl px-6 py-4 transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center'
                >
                  <span className='text-2xl'>📞</span>
                  <div className='text-left'>
                    <p className='text-xs text-orange-100'>โทรศัพท์</p>
                    <p className='text-xl font-extrabold tracking-wide'>{STORE_PHONE}</p>
                  </div>
                </a>
              )}
              {STORE_ADDRESS && (
                <div className='flex items-center gap-3 bg-white/20 border border-white/20 rounded-2xl px-6 py-4 w-full sm:w-auto justify-center'>
                  <span className='text-2xl'>📍</span>
                  <div className='text-left'>
                    <p className='text-xs text-orange-100'>ที่อยู่</p>
                    <p className='font-bold leading-snug'>{STORE_ADDRESS}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className='bg-gray-950 text-gray-500 py-8 px-4'>
        <div className='max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-2'>
            <div className='w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center'>
              <span className='text-sm'>🧵</span>
            </div>
            <div>
              <p className='font-bold text-white text-sm'>{STORE_NAME}</p>
              <p className='text-xs text-gray-600'>© {new Date().getFullYear()} สงวนลิขสิทธิ์</p>
            </div>
          </div>
          <div className='flex items-center gap-5 text-xs'>
            <a href='#products' className='hover:text-white transition-colors'>
              สินค้า
            </a>
            <a href='#track' className='hover:text-white transition-colors'>
              ติดตามงาน
            </a>
            <span className='text-gray-700'>·</span>
            <Link href='/login' className='hover:text-white transition-colors'>
              เข้าสู่ระบบพนักงาน
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
