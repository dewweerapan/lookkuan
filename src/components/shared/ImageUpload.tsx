'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  value: string | null
  onChange: (url: string | null) => void
  bucket?: string
  folder?: string
}

export default function ImageUpload({ value, onChange, bucket = 'job-designs', folder = 'designs' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const filename = `${folder}/${Date.now()}.${ext}`

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, file, { upsert: true })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
      setPreview(publicUrl)
      onChange(publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setPreview(value)
      onChange(value)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="ภาพออกแบบ"
            className="w-40 h-40 object-cover rounded-xl border border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-400 hover:text-brand-500 transition-colors"
        >
          {uploading ? (
            <>
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-r-transparent" />
              <span className="text-xs">กำลังอัพโหลด...</span>
            </>
          ) : (
            <>
              <span className="text-3xl">🖼️</span>
              <span className="text-xs text-center">แนบภาพออกแบบ<br/>คลิกเพื่ออัพโหลด</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
