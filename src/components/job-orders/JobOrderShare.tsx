'use client'

import { useState } from 'react'
import QRCode from 'qrcode'
import { toast } from 'sonner'

interface Props {
  orderNumber: string
}

export default function JobOrderShare({ orderNumber }: Props) {
  const [showQR, setShowQR] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/track/${orderNumber}`
    await navigator.clipboard.writeText(url)
    toast.success('คัดลอก link แล้ว!')
  }

  const handleShowQR = async () => {
    setShowQR(true)
    const url = `${window.location.origin}/track/${orderNumber}`
    const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 })
    setQrDataUrl(dataUrl)
  }

  const handleDownloadQR = () => {
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `QR-${orderNumber}.png`
    link.click()
  }

  const handlePrintQR = () => {
    const win = window.open('', '_blank')
    if (!win) return
    const trackingUrl = `${window.location.origin}/track/${orderNumber}`
    win.document.write(`
      <html><head><title>QR Code - ${orderNumber}</title>
      <style>body{font-family:sans-serif;text-align:center;padding:20px}img{width:250px}</style>
      </head><body>
      <h2>ใบงาน ${orderNumber}</h2>
      <img src="${qrDataUrl}" />
      <p>สแกนเพื่อติดตามสถานะงาน</p>
      <p style="font-size:12px;color:#666">${trackingUrl}</p>
      <script>window.onload=function(){window.print();window.close()}<\/script>
      </body></html>
    `)
    win.document.close()
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={handleCopyLink}
          className="pos-btn-secondary text-sm px-4 py-2"
        >
          🔗 คัดลอก Link
        </button>
        <button
          onClick={handleShowQR}
          className="pos-btn-secondary text-sm px-4 py-2"
        >
          📱 QR Code
        </button>
      </div>

      {showQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">QR Code ติดตามงาน</h3>
            <p className="text-gray-500 text-sm mb-4">{orderNumber}</p>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="mx-auto mb-4 rounded-xl" />
            ) : (
              <div className="w-[300px] h-[300px] mx-auto bg-gray-100 rounded-xl animate-pulse mb-4" />
            )}
            <p className="text-xs text-gray-400 mb-4 break-all">
              {typeof window !== 'undefined' ? `${window.location.origin}/track/${orderNumber}` : ''}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleDownloadQR} className="pos-btn-secondary text-sm">
                💾 ดาวน์โหลด
              </button>
              <button onClick={handlePrintQR} className="pos-btn-secondary text-sm">
                🖨️ พิมพ์
              </button>
              <button onClick={() => setShowQR(false)} className="pos-btn-primary text-sm">
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
