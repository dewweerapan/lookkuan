'use client'

import { useState } from 'react'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  requirePin?: boolean
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  variant = 'danger',
  requirePin = false,
}: ConfirmDialogProps) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800',
    warning: 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800',
    info: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
      setPin('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10">
        <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
        <p className="text-base text-gray-600 mb-6 leading-relaxed">{message}</p>

        {requirePin && (
          <div className="mb-6">
            <label className="pos-label">รหัส PIN ผู้จัดการ</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="pos-input text-center text-2xl tracking-[0.5em]"
              placeholder="● ● ● ●"
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 pos-btn-secondary text-lg py-4"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || (requirePin && pin.length < 4)}
            className={`flex-1 pos-btn text-white text-lg py-4 ${variantStyles[variant]}
                       disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                กำลังดำเนินการ...
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
