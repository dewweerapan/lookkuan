import { useState } from "react";

const PRODUCTS = [
  { id: 1, name: "เสื้อยืดคอกลม Cotton 100%", cat: "เสื้อยืด", catEmoji: "👕", price: 199, hasVariant: true, sizes: ["S","M","L","XL"], colors: ["#fff","#111","#2563eb","#ef4444"], img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop" },
  { id: 2, name: "เสื้อโปโลพรีเมียม ปักโลโก้ได้", cat: "เสื้อโปโล", catEmoji: "👔", price: 350, hasVariant: false, sizes: ["M","L","XL"], colors: ["#312e81","#fff","#111"], img: "https://images.unsplash.com/photo-1625910513413-5fc421e0fd6e?w=400&h=400&fit=crop" },
  { id: 3, name: "แจ็กเก็ตซิปหน้า สั่งปักชื่อได้", cat: "แจ็กเก็ต", catEmoji: "🧥", price: 590, hasVariant: false, sizes: ["M","L","XL","2XL"], colors: ["#111","#9ca3af"], img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop" },
  { id: 4, name: "เสื้อยืดคอวี เนื้อผ้านุ่ม", cat: "เสื้อยืด", catEmoji: "👕", price: 249, hasVariant: false, sizes: ["S","M","L"], colors: ["#f472b6","#38bdf8","#fff"], img: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop" },
  { id: 5, name: "เสื้อเชิ้ตแขนยาว ทางการ", cat: "เสื้อโปโล", catEmoji: "👔", price: 450, hasVariant: false, sizes: ["M","L","XL"], colors: ["#fff","#38bdf8"], img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop" },
  { id: 6, name: "กางเกงขายาว ผ้ายืด สวมสบาย", cat: "กางเกง", catEmoji: "👖", price: 399, hasVariant: false, sizes: ["28","30","32","34"], colors: ["#111","#312e81","#92400e"], img: "https://images.unsplash.com/photo-1434389677669-e08b4cda3a56?w=400&h=400&fit=crop" },
  { id: 7, name: "เสื้อยืดพิมพ์ลาย Oversize", cat: "เสื้อยืด", catEmoji: "👕", price: 299, hasVariant: false, sizes: ["M","L","XL"], colors: ["#111","#fff"], img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop" },
  { id: 8, name: "เสื้อกีฬาแห้งเร็ว ปักชื่อทีมได้", cat: "เสื้อกีฬา", catEmoji: "⚽", price: 280, hasVariant: true, sizes: ["S","M","L","XL"], colors: ["#ef4444","#2563eb","#22c55e","#eab308"], img: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&h=400&fit=crop" },
];

const CATEGORIES = [
  { id: "all", name: "ทั้งหมด", emoji: "🏷️", count: 42 },
  { id: "shirt", name: "เสื้อยืด", emoji: "👕", count: 15 },
  { id: "polo", name: "เสื้อโปโล", emoji: "👔", count: 8 },
  { id: "pants", name: "กางเกง", emoji: "👖", count: 7 },
  { id: "jacket", name: "แจ็กเก็ต", emoji: "🧥", count: 6 },
  { id: "dress", name: "ชุดเดรส", emoji: "👗", count: 6 },
];

const SERVICES = [
  { icon: "🏫", title: "ชุดนักเรียน", desc: "ปักชื่อ โลโก้โรงเรียน" },
  { icon: "🏢", title: "ชุดองค์กร", desc: "ยูนิฟอร์มบริษัท ปักโลโก้" },
  { icon: "⚽", title: "เสื้อกีฬา", desc: "ปักชื่อทีม เบอร์นักกีฬา" },
  { icon: "👔", title: "เสื้อโปโล", desc: "ปักชื่อร้าน แบรนด์สินค้า" },
  { icon: "🧥", title: "แจ็กเก็ต", desc: "ปักลวดลายตามสั่ง" },
  { icon: "🎓", title: "ชุดรับปริญญา", desc: "ปักชื่อ สถาบัน รุ่น" },
];

const STEPS = [
  { n: "1", icon: "📞", title: "ติดต่อสั่งงาน", desc: "โทรหรือแวะมาที่ร้าน" },
  { n: "2", icon: "💰", title: "วางมัดจำ", desc: "รับเลขใบงานไว้ติดตาม" },
  { n: "3", icon: "🪡", title: "ดำเนินการ", desc: "ทีมงานปักอย่างพิถีพิถัน" },
  { n: "4", icon: "✅", title: "รับสินค้า", desc: "ชำระส่วนที่เหลือ" },
];

function ProductCard({ p }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col" style={{ transition: "all 0.3s", cursor: "default" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
      <div className="relative" style={{ aspectRatio: "1/1", overflow: "hidden", background: "#f9fafb" }}>
        <img src={p.img} alt={p.name} className="w-full h-full object-cover" style={{ transition: "transform 0.5s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
        <span className="absolute top-2 left-2 bg-white bg-opacity-90 text-gray-700 text-xs font-semibold px-2 py-1 rounded-lg" style={{ backdropFilter: "blur(4px)", fontSize: 11 }}>
          {p.catEmoji} {p.cat}
        </span>
        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-green-400 rounded-full" style={{ border: "2px solid white" }}></span>
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <h3 className="font-bold text-gray-900" style={{ fontSize: 13, lineHeight: 1.4 }}>{p.name}</h3>
        <div className="flex gap-1 flex-wrap">
          {p.sizes.map(s => <span key={s} className="bg-gray-50 text-gray-500 rounded-md font-semibold" style={{ fontSize: 11, padding: "1px 7px" }}>{s}</span>)}
        </div>
        <div className="flex items-center gap-1">
          {p.colors.map((c, i) => <span key={i} className="rounded-full inline-block" style={{ width: 14, height: 14, background: c, border: c === "#fff" || c === "#111" ? "1px solid #d1d5db" : "none" }}></span>)}
        </div>
        <div className="mt-auto pt-1">
          <span className="font-extrabold" style={{ color: "#f97316", fontSize: 15 }}>฿{p.price.toLocaleString()}</span>
          {p.hasVariant && <span className="text-gray-400 ml-1" style={{ fontSize: 11 }}>ขึ้นไป</span>}
        </div>
      </div>
    </div>
  );
}

export default function LookKuanMockup() {
  const [activeCat, setActiveCat] = useState("all");

  return (
    <div style={{ fontFamily: "'Sarabun', 'Mali', sans-serif", minHeight: "100vh", background: "#fff", color: "#111827" }}>

      {/* ═══ NAVBAR ═══ */}
      <header className="flex items-center justify-between px-6 h-16" style={{ background: "rgba(17,24,39,0.97)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid #1f2937" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#fb923c,#ea580c)" }}>
            <span style={{ fontSize: 17 }}>🧵</span>
          </div>
          <span className="text-lg font-bold text-white" style={{ letterSpacing: -0.5 }}>LookKuan</span>
        </div>
        <div className="flex items-center gap-1">
          {["สินค้า", "บริการปัก", "ติดตามงาน"].map(t => (
            <span key={t} className="text-gray-400 font-semibold px-4 py-2 rounded-lg cursor-pointer" style={{ fontSize: 13, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "none"; }}>
              {t}
            </span>
          ))}
        </div>
        <span className="text-white font-bold px-5 py-2 rounded-xl text-sm cursor-pointer" style={{ background: "#f97316", boxShadow: "0 4px 15px rgba(249,115,22,0.25)", transition: "all 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#fb923c"}
          onMouseLeave={e => e.currentTarget.style.background = "#f97316"}>
          เข้าสู่ระบบ
        </span>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden text-center" style={{ background: "linear-gradient(to bottom, #111827, #1f2937 60%, #ffffff)", padding: "100px 24px 120px" }}>
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center top, rgba(251,146,60,0.08), transparent 60%)" }}></div>
        {/* Particles */}
        {[{t:"14%",l:"12%",s:6,d:0},{t:"28%",r:"18%",s:8,d:1},{t:"45%",l:"38%",s:5,d:2},{t:"22%",r:"32%",s:4,d:0.5},{t:"55%",l:"58%",s:6,d:1.5}].map((p,i) => (
          <div key={i} className="absolute rounded-full" style={{
            top: p.t, left: p.l, right: p.r, width: p.s, height: p.s, background: "#fb923c",
            opacity: 0.25 + Math.random() * 0.2,
            animation: `pulse 3s ease-in-out ${p.d}s infinite`
          }}></div>
        ))}
        <div className="relative max-w-3xl mx-auto">
          <h1 className="font-extrabold" style={{ fontSize: "clamp(48px, 8vw, 80px)", lineHeight: 1.05, marginBottom: 20, background: "linear-gradient(135deg, #fdba74, #f97316, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            LookKuan
          </h1>
          <p className="text-gray-400 mx-auto" style={{ fontSize: "clamp(16px, 2vw, 20px)", maxWidth: 480, fontStyle: "italic", marginBottom: 16, lineHeight: 1.6 }}>
            เสื้อผ้าคุณภาพ ราคาเป็นมิตร — รับปักโลโก้สั่งทำทุกแบบ
          </p>
          <div className="mx-auto rounded-full" style={{ width: 64, height: 4, background: "linear-gradient(90deg,#fb923c,#f59e0b)", marginBottom: 40 }}></div>
          <div className="flex gap-4 justify-center flex-wrap">
            <span className="inline-flex items-center justify-center text-white font-bold px-8 py-4 rounded-xl cursor-pointer" style={{ background: "#f97316", boxShadow: "0 4px 20px rgba(249,115,22,0.25)", transition: "all 0.2s", fontSize: 15 }}>
              ดูสินค้าทั้งหมด
            </span>
            <span className="inline-flex items-center justify-center text-gray-300 font-bold px-8 py-4 rounded-xl cursor-pointer" style={{ border: "2px solid #4b5563", transition: "all 0.2s", fontSize: 15 }}>
              ติดตามงานปัก
            </span>
          </div>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section className="py-10 px-6 bg-white" style={{ borderBottom: "1px solid #f3f4f6" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-4 text-center">
          {[
            { icon: "👕", stat: "100+", label: "แบบสินค้า", desc: "เสื้อผ้าหลากสไตล์" },
            { icon: "🪡", stat: "รับปัก", label: "งานปักทุกประเภท", desc: "โลโก้ ชื่อ ลวดลาย" },
            { icon: "📦", stat: "พร้อมส่ง", label: "สินค้าในสต็อก", desc: "จัดส่งได้ทันที" },
            { icon: "⭐", stat: "บริการดี", label: "ทุกออเดอร์", desc: "ใส่ใจทุกรายละเอียด" },
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-2xl cursor-default" style={{ transition: "background 0.3s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</div>
              <p className="font-extrabold text-gray-900" style={{ fontSize: 18 }}>{item.stat}</p>
              <p className="font-bold uppercase" style={{ color: "#f97316", fontSize: 10, letterSpacing: 1.5, marginTop: 4 }}>{item.label}</p>
              <p className="text-gray-400" style={{ fontSize: 11, marginTop: 2 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ PRODUCTS ═══ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-extrabold text-gray-900" style={{ fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: -0.5, marginBottom: 12 }}>
              เลือก<span style={{ color: "#f97316" }}>สินค้า</span>ของคุณ
            </h2>
            <p className="text-gray-400 mx-auto" style={{ maxWidth: 400, fontSize: 13, lineHeight: 1.7 }}>
              เสื้อผ้าหลากสไตล์ หลายไซส์ หลายสี — สอบถามเพิ่มเติมได้ตลอดเวลา
            </p>
            <div className="mx-auto rounded-full mt-5" style={{ width: 48, height: 4, background: "#f97316" }}></div>
          </div>

          {/* Category Cards (HoN-style) */}
          <div className="grid grid-cols-6 gap-3 mb-10">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCat(cat.id)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer"
                style={{
                  borderColor: activeCat === cat.id ? "#f97316" : "#e5e7eb",
                  background: activeCat === cat.id ? "#fff7ed" : "#fff",
                  boxShadow: activeCat === cat.id ? "0 4px 15px rgba(249,115,22,0.12)" : "none",
                  transition: "all 0.3s",
                }}>
                <span style={{ fontSize: 24 }}>{cat.emoji}</span>
                <span className="font-bold" style={{ fontSize: 11, color: activeCat === cat.id ? "#ea580c" : "#4b5563" }}>{cat.name}</span>
                <span style={{ fontSize: 11, color: activeCat === cat.id ? "#fb923c" : "#9ca3af" }}>{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-4 gap-4">
            {PRODUCTS.map(p => <ProductCard key={p.id} p={p} />)}
          </div>

          <div className="mt-10 text-center">
            <span className="inline-flex items-center gap-2 font-bold text-gray-700 px-8 py-3.5 rounded-xl cursor-pointer" style={{ border: "2px solid #e5e7eb", fontSize: 13, transition: "all 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#fb923c"; e.currentTarget.style.color = "#ea580c"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}>
              ดูสินค้าทั้งหมด (42 รายการ) ↓
            </span>
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section className="py-20 px-6" style={{ background: "#f9fafb" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-extrabold text-gray-900" style={{ fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: -0.5, marginBottom: 12 }}>
              บริการ<span style={{ color: "#f97316" }}>งานปัก</span>
            </h2>
            <p className="text-gray-500 mx-auto" style={{ maxWidth: 420, fontSize: 13, lineHeight: 1.7 }}>
              รับงานปักทุกประเภท ทั้งตัวอักษร โลโก้ และลวดลาย — ไม่จำกัดจำนวนชิ้น
            </p>
            <div className="mx-auto rounded-full mt-5" style={{ width: 48, height: 4, background: "#f97316" }}></div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-12">
            {SERVICES.map(s => (
              <div key={s.title} className="bg-white border-2 border-gray-200 rounded-2xl p-5 text-center cursor-default"
                style={{ transition: "all 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#fb923c"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(249,115,22,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>{s.icon}</div>
                <h3 className="font-bold text-gray-900" style={{ fontSize: 15, marginBottom: 4 }}>{s.title}</h3>
                <p className="text-gray-400" style={{ fontSize: 12 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Steps */}
          <div className="bg-white rounded-3xl border border-gray-200 p-10">
            <h3 className="text-center font-extrabold text-gray-900 mb-8" style={{ fontSize: 20 }}>
              ขั้นตอน<span style={{ color: "#f97316" }}>การสั่งงาน</span>
            </h3>
            <div className="grid grid-cols-4 gap-6">
              {STEPS.map(step => (
                <div key={step.n} className="text-center">
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#f9fafb", fontSize: 24 }}>{step.icon}</div>
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#f97316", fontSize: 11 }}>{step.n}</span>
                  </div>
                  <p className="font-bold text-gray-900" style={{ fontSize: 13 }}>{step.title}</p>
                  <p className="text-gray-400 mt-1" style={{ fontSize: 11, lineHeight: 1.4 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRACKING ═══ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="font-extrabold text-gray-900 mb-4" style={{ fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: -0.5 }}>
            ติดตาม<span style={{ color: "#f97316" }}>สถานะงาน</span>
          </h2>
          <p className="text-gray-400 mb-2" style={{ fontSize: 13 }}>กรอกเลขที่ใบงานที่ได้รับจากร้าน เพื่อดูความคืบหน้า</p>
          <div className="mx-auto rounded-full mb-10" style={{ width: 48, height: 4, background: "#f97316" }}></div>
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 text-left">
            <label className="block font-bold text-gray-700 mb-2" style={{ fontSize: 13 }}>เลขที่ใบงาน</label>
            <div className="flex gap-3">
              <input type="text" placeholder="เช่น JOB-2024-0001" className="flex-1 px-4 py-3 rounded-xl border border-gray-300 outline-none" style={{ fontSize: 15 }} />
              <span className="text-white font-bold px-6 py-3 rounded-xl cursor-pointer whitespace-nowrap" style={{ background: "#f97316", boxShadow: "0 4px 15px rgba(249,115,22,0.2)" }}>ค้นหา</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONTACT CTA ═══ */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: "#111827" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(251,146,60,0.05), transparent 70%)" }}></div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-extrabold text-white mb-4" style={{ fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: -0.5 }}>
            ติดต่อ<span style={{ color: "#fb923c" }}>เรา</span>
          </h2>
          <p className="text-gray-500 mb-10" style={{ fontSize: 13 }}>ยินดีให้คำปรึกษาทุกวัน — ไม่มีค่าใช้จ่าย</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <div className="flex items-center gap-4 rounded-2xl px-7 py-5 cursor-pointer" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <span style={{ fontSize: 28 }}>📞</span>
              <div className="text-left">
                <p className="text-gray-500 uppercase" style={{ fontSize: 10, letterSpacing: 1.5 }}>โทรศัพท์</p>
                <p className="text-white font-bold" style={{ fontSize: 20 }}>081-234-5678</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl px-7 py-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span style={{ fontSize: 28 }}>📍</span>
              <div className="text-left">
                <p className="text-gray-500 uppercase" style={{ fontSize: 10, letterSpacing: 1.5 }}>ที่อยู่</p>
                <p className="text-white font-bold" style={{ fontSize: 15, lineHeight: 1.4 }}>123 ถ.รัชดา กรุงเทพฯ 10400</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="flex items-center justify-between px-6 py-10" style={{ background: "#111827", borderTop: "1px solid #1f2937" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#fb923c,#ea580c)" }}>
            <span style={{ fontSize: 13 }}>🧵</span>
          </div>
          <div>
            <p className="text-white font-bold" style={{ fontSize: 13 }}>LookKuan</p>
            <p className="text-gray-600" style={{ fontSize: 11 }}>&copy; 2026 สงวนลิขสิทธิ์</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-gray-500" style={{ fontSize: 12 }}>
          <span className="cursor-pointer hover:text-orange-400" style={{ transition: "color 0.2s" }}>สินค้า</span>
          <span className="cursor-pointer hover:text-orange-400" style={{ transition: "color 0.2s" }}>บริการปัก</span>
          <span className="cursor-pointer hover:text-orange-400" style={{ transition: "color 0.2s" }}>ติดตามงาน</span>
          <span className="text-gray-800">|</span>
          <span className="cursor-pointer hover:text-orange-400" style={{ transition: "color 0.2s" }}>เข้าสู่ระบบพนักงาน</span>
        </div>
      </footer>
    </div>
  );
}
