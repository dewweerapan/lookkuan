'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/stores/cartStore'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, generateSaleNumber, playSound } from '@/lib/utils'
import { PAYMENT_METHOD_LABELS } from '@/lib/constants'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { toast } from 'sonner'
import type { Category, Product, ProductVariant } from '@/types/database'

type PaymentMethod = 'cash' | 'transfer' | 'promptpay' | 'credit_card'

export default function POSPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const cart = useCartStore()

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<(Product & { variants: ProductVariant[] })[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  // Payment state
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [cashReceived, setCashReceived] = useState('')
  const [showVoidConfirm, setShowVoidConfirm] = useState(false)

  const searchRef = useRef<HTMLInputElement>(null)
  const barcodeBuffer = useRef('')
  const barcodeTimer = useRef<NodeJS.Timeout>()

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const client = createClient()
        const [{ data: cats, error: catErr }, { data: prods, error: prodErr }] = await Promise.all([
          client.from('categories').select('*').eq('is_active', true).order('sort_order'),
          client.from('products').select('*, variants:product_variants(*)').eq('is_active', true).order('name'),
        ])
        if (catErr) console.error('Categories error:', catErr)
        if (prodErr) console.error('Products error:', prodErr)
        setCategories(cats || [])
        setProducts(prods || [])
      } catch (err) {
        console.error('Load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Barcode scanner handler (listens for rapid key input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focused on input fields (except barcode scanning)
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' && target !== searchRef.current) return

      if (e.key === 'Enter' && barcodeBuffer.current.length >= 3) {
        handleBarcodeScan(barcodeBuffer.current)
        barcodeBuffer.current = ''
        return
      }

      if (e.key.length === 1) {
        barcodeBuffer.current += e.key
        clearTimeout(barcodeTimer.current)
        barcodeTimer.current = setTimeout(() => {
          barcodeBuffer.current = ''
        }, 100)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [products])

  const handleBarcodeScan = useCallback((barcode: string) => {
    const trimmed = barcode.trim()
    for (const product of products) {
      const variant = product.variants?.find(v => v.barcode === trimmed || v.sku === trimmed)
      if (variant) {
        cart.addItem({ ...variant, product })
        playSound('success')
        toast.success(`เพิ่ม ${product.name} (${variant.color}/${variant.size})`)
        return
      }
    }
    playSound('error')
    toast.error(`ไม่พบสินค้า: ${trimmed}`)
  }, [products, cart])

  // Search handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      handleBarcodeScan(search.trim())
      setSearch('')
    }
  }

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'all' || p.category_id === selectedCategory
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  // Process sale
  const handleProcessSale = async () => {
    if (cart.items.length === 0) return

    const total = cart.getTotal()
    if (paymentMethod === 'cash' && Number(cashReceived) < total) {
      toast.error('จำนวนเงินที่รับไม่พอ')
      return
    }

    setProcessing(true)
    try {
      const supabase = createClient()
      const saleNumber = generateSaleNumber()
      const subtotal = cart.getSubtotal()
      const discountAmount = cart.getTotalDiscount()
      const changeAmount = paymentMethod === 'cash' ? Number(cashReceived) - total : 0

      // 1. Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          sale_number: saleNumber,
          cashier_id: profile!.id,
          subtotal,
          discount_amount: discountAmount,
          tax_amount: 0,
          total,
          payment_method: paymentMethod,
          cash_received: paymentMethod === 'cash' ? Number(cashReceived) : null,
          change_amount: paymentMethod === 'cash' ? changeAmount : null,
          status: 'completed',
        })
        .select()
        .single()

      if (saleError) throw saleError

      // 2. Create sale items
      const saleItems = cart.items.map(item => ({
        sale_id: sale.id,
        variant_id: item.variant.id,
        product_name: item.variant.product.name,
        variant_label: `${item.variant.color} / ${item.variant.size}`,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount,
        price_override: item.price_override,
        override_approved_by: item.override_approved_by,
        subtotal: (item.unit_price * item.quantity) - item.discount_amount,
      }))

      const { error: itemsError } = await supabase.from('sale_items').insert(saleItems)
      if (itemsError) throw itemsError

      // Success!
      playSound('success')

      if (paymentMethod === 'cash' && changeAmount > 0) {
        toast.success(`ขายสำเร็จ! เงินทอน ${formatCurrency(changeAmount)}`, { duration: 5000 })
      } else {
        toast.success('ขายสำเร็จ!', { duration: 3000 })
      }

      cart.clearCart()
      setShowPayment(false)
      setCashReceived('')
      setPaymentMethod('cash')
    } catch (error: any) {
      console.error('Sale error:', error)
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`)
      playSound('error')
    } finally {
      setProcessing(false)
    }
  }

  const changeAmount = paymentMethod === 'cash' && cashReceived
    ? Math.max(0, Number(cashReceived) - cart.getTotal())
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-r-transparent mx-auto" />
          <p className="mt-4 text-lg text-gray-600">กำลังโหลดข้อมูลสินค้า...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-5rem)]">
      {/* LEFT: Product Selection */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Barcode Search */}
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="สแกนบาร์โค้ด หรือ พิมพ์ค้นหาสินค้า..."
              className="w-full pl-14 pr-4 py-4 text-xl border-2 border-gray-300 rounded-xl
                        focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
              autoFocus
            />
          </div>
        </form>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`pos-btn whitespace-nowrap px-5 py-3 text-base rounded-xl ${
              selectedCategory === 'all' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ทั้งหมด
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`pos-btn whitespace-nowrap px-5 py-3 text-base rounded-xl ${
                selectedCategory === cat.id ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map(product => {
              const totalStock = product.variants?.reduce((s, v) => s + v.stock_quantity, 0) || 0
              const defaultVariant = product.variants?.[0]

              return (
                <button
                  key={product.id}
                  onClick={() => {
                    if (product.variants?.length === 1 && defaultVariant) {
                      cart.addItem({ ...defaultVariant, product })
                      playSound('beep')
                    } else {
                      // Show variant picker (simplified: add first in-stock variant)
                      const inStock = product.variants?.find(v => v.stock_quantity > 0)
                      if (inStock) {
                        cart.addItem({ ...inStock, product })
                        playSound('beep')
                      } else {
                        toast.error('สินค้าหมด')
                        playSound('error')
                      }
                    }
                  }}
                  disabled={totalStock <= 0}
                  className={`pos-card text-left ${totalStock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-3xl mb-1">👕</div>
                  <div className="w-full">
                    <p className="font-bold text-gray-800 text-base leading-tight truncate">{product.name}</p>
                    <p className="text-brand-600 font-bold text-lg mt-1">
                      {formatCurrency(product.base_price)}
                    </p>
                    <p className={`text-sm mt-1 ${totalStock <= 5 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                      เหลือ {totalStock} ชิ้น
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-lg">ไม่พบสินค้า</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div className="w-full lg:w-96 bg-white rounded-xl border-2 border-gray-200 flex flex-col shadow-lg">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            🛒 ตะกร้า ({cart.getItemCount()})
          </h2>
          {cart.items.length > 0 && (
            <button
              onClick={() => setShowVoidConfirm(true)}
              className="text-red-500 hover:text-red-700 font-medium text-base px-3 py-1 rounded-lg hover:bg-red-50"
            >
              ล้างทั้งหมด
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.items.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">🛒</p>
              <p className="text-lg">ยังไม่มีสินค้าในตะกร้า</p>
              <p className="text-base mt-1">สแกนบาร์โค้ดหรือกดเลือกสินค้า</p>
            </div>
          ) : (
            cart.items.map(item => (
              <div key={item.variant.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-base truncate">
                      {item.variant.product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.variant.color} / {item.variant.size}
                    </p>
                    <p className="text-brand-600 font-semibold">
                      {formatCurrency(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => cart.removeItem(item.variant.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg ml-2"
                    aria-label="ลบสินค้า"
                  >
                    ✕
                  </button>
                </div>
                {/* Quantity Controls - Big buttons for elderly */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cart.updateQuantity(item.variant.id, item.quantity - 1)}
                    className="w-12 h-12 rounded-xl bg-white border-2 border-gray-300
                             text-xl font-bold hover:bg-gray-100 active:bg-gray-200 transition-all"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-xl font-bold text-gray-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => cart.updateQuantity(item.variant.id, item.quantity + 1)}
                    disabled={item.quantity >= item.variant.stock_quantity}
                    className="w-12 h-12 rounded-xl bg-white border-2 border-gray-300
                             text-xl font-bold hover:bg-gray-100 active:bg-gray-200 transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                  <span className="flex-1 text-right font-bold text-lg text-gray-800">
                    {formatCurrency((item.unit_price * item.quantity) - item.discount_amount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        {cart.items.length > 0 && !showPayment && (
          <div className="p-4 border-t-2 border-gray-200 bg-gray-50">
            {cart.getTotalDiscount() > 0 && (
              <div className="flex justify-between text-base text-red-600 mb-1">
                <span>ส่วนลด</span>
                <span>-{formatCurrency(cart.getTotalDiscount())}</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-bold text-gray-800 mb-4">
              <span>รวม</span>
              <span className="text-brand-600">{formatCurrency(cart.getTotal())}</span>
            </div>
            <button
              onClick={() => setShowPayment(true)}
              className="w-full pos-btn-success text-xl py-5"
            >
              💳 ชำระเงิน
            </button>
          </div>
        )}

        {/* Payment Panel */}
        {showPayment && (
          <div className="p-4 border-t-2 border-gray-200 bg-green-50 space-y-4">
            <div className="flex justify-between text-2xl font-bold">
              <span>ยอดรวม</span>
              <span className="text-brand-600">{formatCurrency(cart.getTotal())}</span>
            </div>

            {/* Payment Method */}
            <div className="grid grid-cols-2 gap-2">
              {(['cash', 'transfer', 'promptpay', 'credit_card'] as PaymentMethod[]).map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`pos-btn rounded-xl py-3 text-base ${
                    paymentMethod === method
                      ? 'bg-brand-500 text-white border-2 border-brand-600'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-brand-300'
                  }`}
                >
                  {method === 'cash' && '💵'}
                  {method === 'transfer' && '🏦'}
                  {method === 'promptpay' && '📱'}
                  {method === 'credit_card' && '💳'}
                  {' '}{PAYMENT_METHOD_LABELS[method]}
                </button>
              ))}
            </div>

            {/* Cash input */}
            {paymentMethod === 'cash' && (
              <div>
                <label className="pos-label">จำนวนเงินที่รับ (บาท)</label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="pos-input text-2xl text-center font-bold"
                  placeholder="0"
                  autoFocus
                  min="0"
                />
                {/* Quick cash buttons */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[20, 50, 100, 500, 1000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setCashReceived(String(amount))}
                      className="py-3 rounded-xl bg-white border-2 border-gray-200
                               text-lg font-bold hover:bg-gray-50 active:bg-gray-100"
                    >
                      {amount}
                    </button>
                  ))}
                  <button
                    onClick={() => setCashReceived(String(Math.ceil(cart.getTotal())))}
                    className="py-3 rounded-xl bg-brand-100 border-2 border-brand-300
                             text-lg font-bold text-brand-700 hover:bg-brand-200"
                  >
                    พอดี
                  </button>
                </div>
                {Number(cashReceived) >= cart.getTotal() && (
                  <div className="mt-3 p-3 bg-green-100 rounded-xl text-center">
                    <p className="text-base text-green-700">เงินทอน</p>
                    <p className="text-3xl font-bold text-green-800">{formatCurrency(changeAmount)}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowPayment(false); setCashReceived('') }}
                className="flex-1 pos-btn-secondary py-4 text-lg"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handleProcessSale}
                disabled={processing || (paymentMethod === 'cash' && Number(cashReceived) < cart.getTotal())}
                className="flex-1 pos-btn-success py-4 text-lg disabled:opacity-50"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    กำลังบันทึก...
                  </span>
                ) : (
                  '✅ ยืนยันการขาย'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Void Confirm Dialog */}
      <ConfirmDialog
        open={showVoidConfirm}
        onClose={() => setShowVoidConfirm(false)}
        onConfirm={() => cart.clearCart()}
        title="ล้างตะกร้าทั้งหมด?"
        message="สินค้าทั้งหมดในตะกร้าจะถูกลบ ต้องการดำเนินการต่อหรือไม่?"
        confirmLabel="ล้างตะกร้า"
        cancelLabel="ยกเลิก"
        variant="danger"
      />
    </div>
  )
}
