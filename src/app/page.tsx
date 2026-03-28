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
    const vars = (p.variants ?? []).filter((v) => v.is_active)
    return { ...p, category: cat ?? null, variants: vars }
  })

  // Unique active categories that have products
  const categoryMap = new Map<string, { id: string; name: string }>()
  for (const p of normalizedProducts) {
    if (p.category) categoryMap.set(p.category.id, p.category)
  }
  const categories = Array.from(categoryMap.values())

  return (
    <div className='min-h-screen bg-white text-gray-900'>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <header className='sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100'>
        <div className='max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4'>
          <div className='flex items-center gap-2'>
            <span className='text-2xl'>🧵</span>
            <span className='text-lg font-bold text-gray-900'>{STORE_NAME}</span>
          </div>
          <nav className='flex items-center gap-1 sm:gap-3'>
            <a href='#products' className='hidden sm:inline text-sm text-gray-600 hover:text-brand-600 font-medium px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors'>
              สินค้า
            </a>
            <a href='#track' className='text-sm text-gray-600 hover:text-brand-600 font-medium px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors'>
              ติดตามงาน
            </a>
            <Link
              href='/login'
              className='text-sm bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors'
            >
              เข้าสู่ระบบ
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className='bg-gradient-to-b from-orange-50 to-white pt-12 pb-10 px-4'>
        <div className='max-w-2xl mx-auto text-center'>
          <span className='inline-block bg-brand-100 text-brand-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-5'>
            👕 เสื้อผ้า &amp; งานปัก ราคาเป็นมิตร
          </span>
          <h1 className='text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-3'>
            {STORE_NAME}
          </h1>
          <p className='text-gray-500 text-base sm:text-lg mb-8 max-w-md mx-auto'>
            เสื้อผ้าคุณภาพ หลายสไตล์ หลายไซส์ · รับปักโลโก้ ชื่อ ลวดลายสั่งทำ
          </p>
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <a
              href='#products'
              className='bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3.5 rounded-2xl text-base shadow-sm transition-colors'
            >
              ดูสินค้าทั้งหมด
            </a>
            <a
              href='#track'
              className='bg-white border-2 border-gray-200 hover:border-brand-400 text-gray-700 font-bold px-8 py-3.5 rounded-2xl text-base transition-colors'
            >
              🔍 ติดตามงานปัก
            </a>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ───────────────────────────────────── */}
      <section className='py-6 px-4 border-y border-gray-100 bg-gray-50'>
        <div className='max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center'>
          {[
            { icon: '🏷️', label: 'ราคาย่อมเยา' },
            { icon: '📦', label: 'สินค้าพร้อมส่ง' },
            { icon: '🪡', label: 'รับปักสั่งทำ' },
            { icon: '📱', label: 'ติดตามสถานะได้' },
          ].map((b) => (
            <div key={b.label} className='flex flex-col items-center gap-1.5'>
              <span className='text-2xl'>{b.icon}</span>
              <span className='text-sm font-medium text-gray-600'>{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS ────────────────────────────────────────── */}
      <section id='products' className='py-12 px-4'>
        <div className='max-w-5xl mx-auto'>
          <div className='text-center mb-8'>
            <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2'>สินค้าในร้าน</h2>
            <p className='text-gray-500'>เลือกดูตามหมวดหมู่ หรือสอบถามเพิ่มเติมได้เลย</p>
          </div>
          <ProductShowcase products={normalizedProducts} categories={categories} />
        </div>
      </section>

      {/* ── EMBROIDERY ──────────────────────────────────────── */}
      <section id='services' className='py-12 px-4 bg-orange-50'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-8'>
            <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2'>🪡 บริการปักเสื้อสั่งทำ</h2>
            <p className='text-gray-500'>ปักโลโก้ ชื่อ ตัวอักษร และลวดลายต่างๆ รับทุกจำนวน</p>
          </div>

          <div className='grid sm:grid-cols-2 gap-4 mb-8'>
            <div className='bg-white rounded-2xl p-5 border border-orange-100'>
              <div className='text-3xl mb-3'>🏫</div>
              <h3 className='font-bold text-gray-800 text-lg mb-1'>ชุดนักเรียน / นักศึกษา</h3>
              <p className='text-gray-500 text-sm'>ปักชื่อ ตราโรงเรียน ตราวิทยาลัย บนเสื้อ เสื้อกาวน์ ชุดกีฬา</p>
            </div>
            <div className='bg-white rounded-2xl p-5 border border-orange-100'>
              <div className='text-3xl mb-3'>🏢</div>
              <h3 className='font-bold text-gray-800 text-lg mb-1'>ชุดองค์กร / บริษัท</h3>
              <p className='text-gray-500 text-sm'>ปักโลโก้บริษัท ชื่อพนักงาน บนเสื้อโปโล เสื้อแจ็กเก็ต</p>
            </div>
          </div>

          {/* Steps */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {[
              { n: '1', icon: '📞', title: 'ติดต่อสั่งงาน', desc: 'โทรหรือแวะมาที่ร้าน' },
              { n: '2', icon: '💰', title: 'วางมัดจำ', desc: 'รับเลขใบงานไว้ติดตาม' },
              { n: '3', icon: '🪡', title: 'ดำเนินการ', desc: 'ทีมงานปักอย่างพิถีพิถัน' },
              { n: '4', icon: '✅', title: 'รับสินค้า', desc: 'ชำระส่วนที่เหลือ' },
            ].map((s) => (
              <div key={s.n} className='bg-white rounded-2xl p-4 text-center border border-orange-100'>
                <div className='w-7 h-7 bg-brand-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2'>
                  {s.n}
                </div>
                <div className='text-3xl mb-2'>{s.icon}</div>
                <p className='font-semibold text-gray-800 text-sm'>{s.title}</p>
                <p className='text-xs text-gray-500 mt-0.5'>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ORDER TRACKING ───────────────────────────────────── */}
      <section id='track' className='py-12 px-4 bg-white'>
        <div className='max-w-lg mx-auto'>
          <div className='text-center mb-6'>
            <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2'>ติดตามสถานะงาน</h2>
            <p className='text-gray-500 text-sm'>
              กรอกเลขที่ใบงานที่ได้รับจากร้าน เพื่อดูความคืบหน้า
            </p>
          </div>
          <TrackingForm />
        </div>
      </section>

      {/* ── CONTACT ─────────────────────────────────────────── */}
      {(STORE_PHONE || STORE_ADDRESS) && (
        <section className='py-10 px-4 bg-brand-500'>
          <div className='max-w-3xl mx-auto text-center text-white'>
            <h2 className='text-xl font-bold mb-6'>ติดต่อเรา</h2>
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
              {STORE_PHONE && (
                <a
                  href={`tel:${STORE_PHONE}`}
                  className='flex items-center gap-3 bg-white/20 hover:bg-white/30 rounded-2xl px-6 py-3.5 transition-all w-full sm:w-auto justify-center'
                >
                  <span className='text-2xl'>📞</span>
                  <div className='text-left'>
                    <p className='text-xs opacity-80'>โทรศัพท์</p>
                    <p className='text-lg font-bold'>{STORE_PHONE}</p>
                  </div>
                </a>
              )}
              {STORE_ADDRESS && (
                <div className='flex items-center gap-3 bg-white/20 rounded-2xl px-6 py-3.5 w-full sm:w-auto justify-center'>
                  <span className='text-2xl'>📍</span>
                  <div className='text-left'>
                    <p className='text-xs opacity-80'>ที่อยู่</p>
                    <p className='font-semibold'>{STORE_ADDRESS}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className='bg-gray-900 text-gray-400 py-6 px-4 text-center'>
        <p className='font-semibold text-white mb-1'>{STORE_NAME}</p>
        <p className='text-xs mb-3'>© {new Date().getFullYear()} สงวนลิขสิทธิ์</p>
        <div className='flex justify-center gap-4 text-xs'>
          <Link href='/login' className='hover:text-white transition-colors'>
            เข้าสู่ระบบพนักงาน
          </Link>
          <span>·</span>
          <a href='#track' className='hover:text-white transition-colors'>
            ติดตามงาน
          </a>
        </div>
      </footer>
    </div>
  )
}
