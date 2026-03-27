'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-lg text-gray-600 mb-6">
          ระบบเกิดปัญหา กรุณาลองใหม่อีกครั้ง
        </p>
        <button
          onClick={reset}
          className="pos-btn-primary text-xl px-8 py-4"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    </div>
  )
}
