'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  onScan: (barcode: string) => void
  onClose: () => void
}

export default function CameraScanner({ onScan, onClose }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef<any>(null)
  const containerId = 'camera-scanner-container'

  useEffect(() => {
    let html5QrCode: any = null

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        html5QrCode = new Html5Qrcode(containerId)
        scannerRef.current = html5QrCode

        const cameras = await Html5Qrcode.getCameras()
        if (!cameras || cameras.length === 0) {
          setError('ไม่พบกล้อง กรุณาตรวจสอบการตั้งค่า')
          return
        }

        const cameraId = cameras[cameras.length - 1].id // prefer back camera

        await html5QrCode.start(
          cameraId,
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText: string) => {
            onScan(decodedText)
            // Auto-close after successful scan
            setTimeout(onClose, 500)
          },
          () => {} // Ignore decode errors (continuous scanning)
        )
        setScanning(true)
      } catch (err: any) {
        setError(err?.message || 'ไม่สามารถเปิดกล้องได้')
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [onScan, onClose])

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">📷 สแกนบาร์โค้ดด้วยกล้อง</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          {error ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">📵</p>
              <p className="text-red-600 font-semibold text-lg">{error}</p>
              <p className="text-gray-500 text-sm mt-2">
                กรุณาอนุญาตการใช้กล้องในเบราว์เซอร์
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-base font-medium"
              >
                ปิด
              </button>
            </div>
          ) : (
            <>
              {!scanning && (
                <div className="flex items-center justify-center py-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-r-transparent mr-3" />
                  <p className="text-gray-600">กำลังเปิดกล้อง...</p>
                </div>
              )}
              <div id={containerId} className="w-full rounded-xl overflow-hidden" />
              <p className="text-center text-sm text-gray-500 mt-3">
                จ่อกล้องไปที่บาร์โค้ดสินค้า
              </p>
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 text-base font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  )
}
