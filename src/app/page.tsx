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

      {/* ── STICKY NAV ──────────────────────────────────────── */}
      <header className='sticky top-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-gray-800'>
        <div className='max-w-6xl mx-auto px-6 h-16 flex items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='flex items-center gap-3 group'>
            <div className='w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow'>
              <span className='text-lg'>🧵</span>
            </div>
            <span className='text-lg font-bold text-white tracking-tight'>{STORE_NAME}</span>
          </Link>

          {/* Nav links */}
          <nav className='hidden md:flex items-center gap-1'>
            {[
              { href: '#products', label: 'สินค้า' },
              { href: '#services', label: 'บริการปัก' },
              { href: '#track', label: 'ติดตามงาน' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className='text-sm text-gray-400 hover:text-white font-semibold px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-200'
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <Link
            href='/login'
            className='text-sm bg-brand-500 hover:bg-brand-400 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-400/30 transition-all duration-200 hover:-translate-y-0.5'
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </header>

      {/* ── HERO SECTION (LoL-style: centered, clean, elegant) ─── */}
      <section className='relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-white'>
        {/* Subtle radial glow */}
        <div
          className='absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none'
          style={{ background: 'radial-gradient(ellipse at center, rgba(251,146,60,0.08) 0%, transparent 70%)' }}
          aria-hidden='true'
        />
        {/* Floating particles */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none' aria-hidden='true'>
          <div className='absolute top-20 left-[15%] w-1 h-1 bg-brand-400/40 rounded-full animate-pulse' />
          <div className='absolute top-40 right-[20%] w-1.5 h-1.5 bg-brand-300/30 rounded-full animate-pulse [animation-delay:1s]' />
          <div className='absolute top-60 left-[40%] w-1 h-1 bg-orange-300/20 rounded-full animate-pulse [animation-delay:2s]' />
          <div className='absolute top-32 right-[35%] w-0.5 h-0.5 bg-brand-400/50 rounded-full animate-pulse [animation-delay:0.5s]' />
          <div className='absolute top-80 left-[60%] w-1 h-1 bg-amber-300/25 rounded-full animate-pulse [animation-delay:1.5s]' />
        </div>

        <div className='relative max-w-3xl mx-auto px-6 pt-24 pb-32 text-center'>
          {/* Brand name - large, styled like LoL logo */}
          <h1 className='text-5xl sm:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]'>
            <span className='bg-gradient-to-r from-brand-300 via-brand-400 to-amber-400 bg-clip-text text-transparent'>
              {STORE_NAME}
            </span>
          </h1>

          {/* Tagline */}
          <p className='text-gray-400 text-lg sm:text-xl mb-4 max-w-lg mx-auto leading-relaxed font-sans italic'>
            เสื้อผ้าคุณภาพ ราคาเป็นมิตร — รับปักโลโก้สั่งทำทุกแบบ
          </p>

          {/* Accent line */}
          <div className='w-16 h-1 bg-gradient-to-r from-brand-400 to-amber-400 mx-auto rounded-full mb-10' />

          {/* CTA buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <a
              href='#products'
              className='inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-bold px-8 py-4 rounded-xl text-base shadow-lg shadow-brand-500/25 hover:shadow-brand-400/30 transition-all duration-200 hover:-translate-y-0.5'
            >
              ดูสินค้าทั้งหมด
            </a>
            <a
              href='#track'
              className='inline-flex items-center justify-center gap-2 border-2 border-gray-600 hover:border-brand-400 text-gray-300 hover:text-white font-bold px-8 py-4 rounded-xl text-base transition-all duration-200 hover:-translate-y-0.5'
            >
              ติดตามงานปัก
            </a>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR (LoL-style: clean white section) ──────── */}
      <section className='py-10 px-6 bg-white border-b border-gray-100'>
        <div className='max-w-4xl mx-auto'>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
            {[
              { icon: '👕', stat: '100+', label: 'แบบสินค้า', desc: 'เสื้อผ้าหลากสไตล์' },
              { icon: '🪡', stat: 'รับปัก', label: 'งานปักทุกประเภท', desc: 'โลโก้ ชื่อ ลวดลาย' },
              { icon: '📦', stat: 'พร้อมส่ง', label: 'สินค้าในสต็อก', desc: 'จัดส่งได้ทันที' },
              { icon: '⭐', stat: 'บริการดี', label: 'ทุกออเดอร์', desc: 'ใส่ใจทุกรายละเอียด' },
            ].map((item, i) => (
              <div
                key={i}
                className='group text-center p-5 rounded-2xl hover:bg-gray-50 transition-colors duration-300'
              >
                <div className='text-3xl mb-2 group-hover:scale-110 transition-transform duration-300'>
                  {item.icon}
                </div>
                <p className='font-extrabold text-gray-900 text-lg leading-tight'>{item.stat}</p>
                <p className='text-brand-500 text-xs font-bold uppercase tracking-wider mt-1 font-sans'>{item.label}</p>
                <p className='text-gray-400 text-xs mt-1 font-sans'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS SECTION (HoN-style heading + LoL clean grid) ── */}
      <section id='products' className='py-20 px-6 bg-white'>
        <div className='max-w-6xl mx-auto'>
          {/* Section heading — HoN style: bold with colored accent word */}
          <div className='text-center mb-12'>
            <h2 className='text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight'>
              เลือก<span className='text-brand-500'>สินค้า</span>ของคุณ
            </h2>
            <p className='text-gray-400 max-w-md mx-auto font-sans text-sm leading-relaxed'>
              เสื้อผ้าหลากสไตล์ หลายไซส์ หลายสี — สอบถามเพิ่มเติมได้ตลอดเวลา
            </p>
            {/* Accent line */}
            <div className='w-12 h-1 bg-brand-500 mx-auto rounded-full mt-5' />
          </div>

          <ProductShowcase products={normalizedProducts} categories={categories} />
        </div>
      </section>

      {/* ── EMBROIDERY SERVICES (HoN "Choose Your Role" style interactive cards) ── */}
      <section id='services' className='py-20 px-6 bg-gray-50'>
        <div className='max-w-5xl mx-auto'>
          {/* HoN-style heading */}
          <div className='text-center mb-12'>
            <h2 className='text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight'>
              บริการ<span className='text-brand-500'>งานปัก</span>
            </h2>
            <p className='text-gray-500 max-w-lg mx-auto font-sans text-sm leading-relaxed'>
              รับงานปักทุกประเภท ทั้งตัวอักษร โลโก้ และลวดลาย — ไม่จำกัดจำนวนชิ้น
            </p>
            <div className='w-12 h-1 bg-brand-500 mx-auto rounded-full mt-5' />
          </div>

          {/* Service type cards — HoN "Choose Your Role" style */}
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12'>
            {[
              { icon: '🏫', title: 'ชุดนักเรียน', desc: 'ปักชื่อ โลโก้โรงเรียน' },
              { icon: '🏢', title: 'ชุดองค์กร', desc: 'ยูนิฟอร์มบริษัท ปักโลโก้' },
              { icon: '⚽', title: 'เสื้อกีฬา', desc: 'ปักชื่อทีม เบอร์นักกีฬา' },
              { icon: '👔', title: 'เสื้อโปโล', desc: 'ปักชื่อร้าน แบรนด์สินค้า' },
              { icon: '🧥', title: 'แจ็กเก็ต', desc: 'ปักลวดลายตามสั่ง' },
              { icon: '🎓', title: 'ชุดรับปริญญา', desc: 'ปักชื่อ สถาบัน รุ่น' },
            ].map((service) => (
              <div
                key={service.title}
                className='group relative bg-white border-2 border-gray-200 hover:border-brand-400 rounded-2xl p-5 text-center cursor-default transition-all duration-300 hover:shadow-lg hover:shadow-brand-100 hover:-translate-y-1'
              >
                {/* Glow on hover */}
                <div className='absolute inset-0 rounded-2xl bg-gradient-to-b from-brand-50/0 to-brand-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />
                <div className='relative'>
                  <div className='text-4xl mb-3 group-hover:scale-110 transition-transform duration-300'>
                    {service.icon}
                  </div>
                  <h3 className='font-bold text-gray-900 text-base mb-1'>{service.title}</h3>
                  <p className='text-gray-400 text-xs font-sans'>{service.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Process steps — clean horizontal flow */}
          <div className='bg-white rounded-3xl border border-gray-200 p-8 sm:p-10'>
            <h3 className='text-center text-xl font-extrabold text-gray-900 mb-8'>
              ขั้นตอน<span className='text-brand-500'>การสั่งงาน</span>
            </h3>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-6'>
              {[
                { n: '1', icon: '📞', title: 'ติดต่อสั่งงาน', desc: 'โทรหรือแวะมาที่ร้าน' },
                { n: '2', icon: '💰', title: 'วางมัดจำ', desc: 'รับเลขใบงานไว้ติดตาม' },
                { n: '3', icon: '🪡', title: 'ดำเนินการ', desc: 'ทีมงานปักอย่างพิถีพิถัน' },
                { n: '4', icon: '✅', title: 'รับสินค้า', desc: 'ชำระส่วนที่เหลือ' },
              ].map((step) => (
                <div key={step.n} className='text-center group'>
                  <div className='relative inline-flex items-center justify-center mb-4'>
                    <div className='w-14 h-14 bg-gray-50 group-hover:bg-brand-50 rounded-2xl flex items-center justify-center text-2xl transition-colors duration-300'>
                      {step.icon}
                    </div>
                    <span className='absolute -top-1.5 -right-1.5 w-6 h-6 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm'>
                      {step.n}
                    </span>
                  </div>
                  <p className='font-bold text-gray-900 text-sm'>{step.title}</p>
                  <p className='text-gray-400 text-xs mt-1 font-sans leading-snug'>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ORDER TRACKING (Clean white section) ───────────── */}
      <section id='track' className='py-20 px-6 bg-white'>
        <div className='max-w-lg mx-auto'>
          <div className='text-center mb-10'>
            <h2 className='text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight'>
              ติดตาม<span className='text-brand-500'>สถานะงาน</span>
            </h2>
            <p className='text-gray-400 font-sans text-sm leading-relaxed'>
              กรอกเลขที่ใบงานที่ได้รับจากร้าน เพื่อดูความคืบหน้า
            </p>
            <div className='w-12 h-1 bg-brand-500 mx-auto rounded-full mt-5' />
          </div>
          <div className='bg-gray-50 rounded-3xl p-6 sm:p-8 border border-gray-200'>
            <TrackingForm />
          </div>
        </div>
      </section>

      {/* ── CONTACT CTA (Full-width dark section like HoN final CTA) ── */}
      {(STORE_PHONE || STORE_ADDRESS) && (
        <section className='relative py-20 px-6 bg-gray-950 overflow-hidden'>
          {/* Background glow */}
          <div
            className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none'
            style={{ background: 'radial-gradient(ellipse, rgba(251,146,60,0.06) 0%, transparent 70%)' }}
            aria-hidden='true'
          />

          <div className='relative max-w-3xl mx-auto text-center'>
            <h2 className='text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight'>
              ติดต่อ<span className='text-brand-400'>เรา</span>
            </h2>
            <p className='text-gray-500 mb-10 font-sans text-sm'>ยินดีให้คำปรึกษาทุกวัน — ไม่มีค่าใช้จ่าย</p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center'>
              {STORE_PHONE && (
                <a
                  href={`tel:${STORE_PHONE}`}
                  className='group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-500/50 rounded-2xl px-7 py-5 transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto justify-center'
                >
                  <span className='text-3xl group-hover:scale-110 transition-transform duration-300'>📞</span>
                  <div className='text-left'>
                    <p className='text-xs text-gray-500 font-sans uppercase tracking-wider'>โทรศัพท์</p>
                    <p className='text-xl font-bold text-white tracking-wide'>{STORE_PHONE}</p>
                  </div>
                </a>
              )}
              {STORE_ADDRESS && (
                <div className='flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-7 py-5 w-full sm:w-auto justify-center'>
                  <span className='text-3xl'>📍</span>
                  <div className='text-left'>
                    <p className='text-xs text-gray-500 font-sans uppercase tracking-wider'>ที่อยู่</p>
                    <p className='font-bold text-white leading-snug'>{STORE_ADDRESS}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER (HoN-style clean footer) ──────────────── */}
      <footer className='bg-gray-950 border-t border-gray-800 text-gray-500 py-10 px-6'>
        <div className='max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center'>
              <span className='text-sm'>🧵</span>
            </div>
            <div>
              <p className='font-bold text-white text-sm'>{STORE_NAME}</p>
              <p className='text-xs text-gray-600 font-sans'>&copy; {new Date().getFullYear()} สงวนลิขสิทธิ์</p>
            </div>
          </div>

          <div className='flex items-center gap-6 text-xs font-sans'>
            <a href='#products' className='hover:text-brand-400 transition-colors duration-200'>สินค้า</a>
            <a href='#services' className='hover:text-brand-400 transition-colors duration-200'>บริการปัก</a>
            <a href='#track' className='hover:text-brand-400 transition-colors duration-200'>ติดตามงาน</a>
            <span className='text-gray-800'>|</span>
            <Link href='/login' className='hover:text-brand-400 transition-colors duration-200'>เข้าสู่ระบบพนักงาน</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
