'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TrackingForm() {
  const [orderNumber, setOrderNumber] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = orderNumber.trim().toUpperCase()
    if (!trimmed) {
      setError('กรุณากรอกเลขที่ใบงาน')
      return
    }
    setError('')
    router.push(`/track/${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="orderNumber" className="pos-label text-lg">
            เลขที่ใบงาน
          </label>
          <input
            id="orderNumber"
            type="text"
            value={orderNumber}
            onChange={e => { setOrderNumber(e.target.value); setError('') }}
            placeholder="เช่น JOB-2024-0001"
            className="pos-input text-center text-xl font-mono tracking-wider"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {error && (
            <p className="mt-2 text-red-600 text-sm font-medium text-center">{error}</p>
          )}
        </div>

        <button
          type="submit"
          className="pos-btn-primary w-full text-lg py-4"
        >
          🔍 ตรวจสอบสถานะ
        </button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-4">
        เลขที่ใบงานจะได้รับจากร้านเมื่อสั่งงาน
      </p>
    </div>
  )
}
