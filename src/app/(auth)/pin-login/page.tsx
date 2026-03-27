'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PinLoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePinInput = useCallback((digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit)
      setError('')
    }
  }, [pin])

  const handleDelete = useCallback(() => {
    setPin(prev => prev.slice(0, -1))
    setError('')
  }, [])

  const handleClear = useCallback(() => {
    setPin('')
    setError('')
  }, [])

  const handleSubmit = useCallback(async () => {
    if (pin.length < 4) {
      setError('กรุณาใส่รหัส PIN อย่างน้อย 4 หลัก')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabaseClient = createClient()
      // Look up user by PIN code
      const { data: profile, error: lookupError } = await supabaseClient
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('pin_code', pin)
        .eq('is_active', true)
        .single()

      if (lookupError || !profile) {
        setError('รหัส PIN ไม่ถูกต้อง')
        setPin('')
        return
      }

      // Sign in with the associated email and PIN as password
      const { error: authError } = await supabaseClient.auth.signInWithPassword({
        email: profile.email,
        password: pin,
      })

      if (authError) {
        setError('ไม่สามารถเข้าสู่ระบบได้ กรุณาติดต่อผู้ดูแล')
        setPin('')
        return
      }

      router.push('/pos')
      router.refresh()
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
      setPin('')
    } finally {
      setLoading(false)
    }
  }, [pin, router])

  // Auto-submit when 6 digits entered
  if (pin.length === 6 && !loading) {
    handleSubmit()
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '']

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-orange-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">LookKuan</h1>
          <p className="text-lg text-gray-500 mt-1">ใส่รหัส PIN เพื่อเข้าใช้งาน</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                i < pin.length
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              {i < pin.length ? '●' : ''}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-red-700 text-base font-medium text-center mb-4">
            {error}
          </div>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3">
          {digits.map((digit, i) => {
            if (digit === '' && i === 9) {
              return (
                <button
                  key="clear"
                  onClick={handleClear}
                  className="h-16 rounded-xl bg-gray-100 text-gray-600 font-semibold text-lg
                           hover:bg-gray-200 active:bg-gray-300 transition-all active:scale-95"
                >
                  ล้าง
                </button>
              )
            }
            if (digit === '' && i === 11) {
              return (
                <button
                  key="delete"
                  onClick={handleDelete}
                  className="h-16 rounded-xl bg-gray-100 text-gray-600 font-semibold text-lg
                           hover:bg-gray-200 active:bg-gray-300 transition-all active:scale-95"
                >
                  ลบ
                </button>
              )
            }
            return (
              <button
                key={digit}
                onClick={() => handlePinInput(digit)}
                disabled={loading}
                className="h-16 rounded-xl bg-white border-2 border-gray-200 text-gray-800
                         font-bold text-2xl hover:bg-gray-50 active:bg-brand-50
                         active:border-brand-300 transition-all active:scale-95
                         disabled:opacity-50"
              >
                {digit}
              </button>
            )
          })}
        </div>

        {loading && (
          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-2 text-brand-600 font-medium">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-r-transparent" />
              กำลังตรวจสอบ...
            </span>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/login" className="text-brand-600 hover:text-brand-700 text-base font-medium">
            เข้าสู่ระบบด้วยอีเมล
          </a>
        </div>
      </div>
    </div>
  )
}
