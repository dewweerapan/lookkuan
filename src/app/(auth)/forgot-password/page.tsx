'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setSent(true)
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-orange-100 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ส่งอีเมลแล้ว!</h2>
          <p className="text-gray-600 mb-6">
            กรุณาตรวจสอบอีเมล <strong>{email}</strong> และคลิก link เพื่อตั้งรหัสผ่านใหม่
          </p>
          <Link href="/login" className="pos-btn-primary inline-block">
            กลับหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-orange-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">ลืมรหัสผ่าน</h1>
          <p className="text-gray-500 mt-2">กรอกอีเมล เราจะส่ง link ตั้งรหัสผ่านใหม่ให้</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="pos-label">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pos-input"
              placeholder="example@email.com"
              required
              disabled={loading}
            />
          </div>
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-base font-medium">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full pos-btn-primary text-xl py-4 disabled:opacity-50"
          >
            {loading ? 'กำลังส่ง...' : 'ส่ง Link รีเซ็ตรหัสผ่าน'}
          </button>
          <div className="text-center">
            <Link href="/login" className="text-brand-600 hover:text-brand-700 text-base font-medium">
              กลับหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
