import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบหน้านี้</h2>
        <p className="text-lg text-gray-600 mb-6">
          หน้าที่คุณกำลังมองหาไม่มีอยู่ในระบบ
        </p>
        <Link
          href="/dashboard"
          className="pos-btn-primary text-xl px-8 py-4 inline-flex"
        >
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  )
}
