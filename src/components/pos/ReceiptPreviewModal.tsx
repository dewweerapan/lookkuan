'use client'

import { CartItem } from '@/types/database'
import { formatCurrency } from '@/lib/utils'

interface ReceiptPreviewModalProps {
  items: CartItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: string
  storeName: string
  storeAddress?: string
  storePhone?: string
  footerMessage?: string
  showAddress?: boolean
  showPhone?: boolean
  onPrint: () => void
  onClose: () => void
}

export default function ReceiptPreviewModal({
  items,
  subtotal,
  discount,
  tax,
  total,
  paymentMethod,
  storeName,
  storeAddress,
  storePhone,
  footerMessage,
  showAddress = true,
  showPhone = true,
  onPrint,
  onClose,
}: ReceiptPreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-lg text-gray-800">ตัวอย่างใบเสร็จ</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <div className="border border-dashed border-gray-300 rounded-lg p-4 font-mono text-sm bg-gray-50 space-y-1">
            {/* Store info */}
            <p className="text-center font-bold text-base">{storeName}</p>
            {showAddress && storeAddress && (
              <p className="text-center text-gray-500 text-xs">{storeAddress}</p>
            )}
            {showPhone && storePhone && (
              <p className="text-center text-gray-500 text-xs">โทร: {storePhone}</p>
            )}

            <div className="border-t border-dashed border-gray-300 my-2" />

            {/* Items */}
            {items.map((item) => (
              <div key={item.variant.id} className="space-y-0.5">
                <div className="flex justify-between">
                  <span className="flex-1 pr-2 truncate text-xs">{item.variant.product.name}</span>
                  <span className="text-xs">{formatCurrency(item.unit_price * item.quantity)}</span>
                </div>
                <div className="text-gray-400 text-xs pl-2">
                  {item.quantity} × {formatCurrency(item.unit_price)}
                  {item.discount_amount > 0 && ` (ลด ${formatCurrency(item.discount_amount)})`}
                </div>
              </div>
            ))}

            <div className="border-t border-dashed border-gray-300 my-2" />

            {/* Totals */}
            <div className="flex justify-between text-xs">
              <span>ราคารวม</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs text-red-600">
                <span>ส่วนลด</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span>ภาษี (7%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-300 pt-1 mt-1">
              <span>ยอดสุทธิ</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <p className="text-center text-gray-500 text-xs mt-1">ชำระ: {paymentMethod}</p>

            {footerMessage && (
              <>
                <div className="border-t border-dashed border-gray-300 my-1" />
                <p className="text-center text-gray-500 text-xs">{footerMessage}</p>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={onPrint}
            className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            🖨️ พิมพ์ใบเสร็จ
          </button>
        </div>
      </div>
    </div>
  )
}
