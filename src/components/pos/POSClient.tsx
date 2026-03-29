'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, generateSaleNumber, playSound } from '@/lib/utils';
import {
  PAYMENT_METHOD_LABELS,
  RECEIPT_SHOW_ADDRESS_KEY,
  RECEIPT_SHOW_PHONE_KEY,
  RECEIPT_FOOTER_MESSAGE_KEY,
  STORE_NAME,
} from '@/lib/constants';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import CameraScanner from '@/components/pos/CameraScanner';
import PromptPayQR from '@/components/pos/PromptPayQR';
import ReceiptPreviewModal from '@/components/pos/ReceiptPreviewModal';
import NumericKeypad from '@/components/pos/NumericKeypad';
import { getStoreSettings } from '@/lib/storeSettings';
import { toast } from 'sonner';
import type { Category, Product, ProductVariant, Promotion } from '@/types/database';
import { getBestPromotion, type AppliedPromotion } from '@/lib/promotions';

type PaymentMethod = 'cash' | 'transfer' | 'promptpay' | 'credit_card';
type ProductWithVariants = Product & { variants: ProductVariant[] };

interface Props {
  categories: Category[];
  products: ProductWithVariants[];
}

// ======== Variant Picker Modal ========
function VariantPickerModal({
  product,
  onSelect,
  onClose,
}: {
  product: ProductWithVariants;
  onSelect: (variant: ProductVariant) => void;
  onClose: () => void;
}) {
  return (
    <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-start justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-gray-800'>
                {product.name}
              </h2>
              <p className='text-gray-500 mt-1'>เลือกสี / ขนาด</p>
            </div>
            <button
              onClick={onClose}
              className='p-2 rounded-xl hover:bg-gray-100 text-gray-500 text-2xl leading-none'
            >
              ✕
            </button>
          </div>
        </div>
        <div className='p-6 overflow-y-auto flex-1'>
          <div className='grid grid-cols-2 gap-3'>
            {product.variants?.map((variant) => {
              const outOfStock = variant.stock_quantity <= 0;
              return (
                <button
                  key={variant.id}
                  onClick={() => !outOfStock && onSelect(variant)}
                  disabled={outOfStock}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    outOfStock
                      ? 'border-gray-200 opacity-40 cursor-not-allowed bg-gray-50'
                      : 'border-gray-200 hover:border-brand-400 hover:bg-brand-50 active:bg-brand-100 cursor-pointer'
                  }`}
                >
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='text-base font-bold text-gray-800'>
                      {variant.color}
                    </span>
                    <span className='px-2 py-0.5 bg-gray-100 rounded-lg text-sm font-semibold text-gray-600'>
                      {variant.size}
                    </span>
                  </div>
                  <p className='text-brand-600 font-bold text-lg'>
                    {formatCurrency(
                      variant.price_override ?? product.base_price,
                    )}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      outOfStock
                        ? 'text-red-500'
                        : variant.stock_quantity <= 5
                          ? 'text-orange-500 font-semibold'
                          : 'text-gray-400'
                    }`}
                  >
                    {outOfStock
                      ? 'หมดแล้ว'
                      : `เหลือ ${variant.stock_quantity} ชิ้น`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
        <div className='p-4 border-t border-gray-200'>
          <button
            onClick={onClose}
            className='w-full pos-btn-secondary py-3 text-lg'
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

// ======== Main POS Client ========
export default function POSClient({ categories, products }: Props) {
  const { profile } = useAuth();
  const cart = useCartStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState(false);
  const [variantPickerProduct, setVariantPickerProduct] =
    useState<ProductWithVariants | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);

  // Payment state
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);

  // Receipt preview state
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [receiptSettings, setReceiptSettings] = useState({
    showAddress: true,
    showPhone: true,
    footerMessage: 'ขอบคุณที่ใช้บริการ',
  });
  // Snapshot of the last completed sale for the preview modal
  const [lastSaleSnapshot, setLastSaleSnapshot] = useState<{
    items: typeof cart.items;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: string;
  } | null>(null);

  // Customer state
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<
    { id: string; full_name: string; phone: string }[]
  >([]);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [customerSearching, setCustomerSearching] = useState(false);

  // Promotions state
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [bestPromotion, setBestPromotion] = useState<AppliedPromotion | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const barcodeBuffer = useRef('');
  const barcodeTimer = useRef<NodeJS.Timeout>();

  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      const trimmed = barcode.trim();
      for (const product of products) {
        const variant = product.variants?.find(
          (v) => v.barcode === trimmed || v.sku === trimmed,
        );
        if (variant) {
          cart.addItem({ ...variant, product });
          playSound('success');
          toast.success(
            `เพิ่ม ${product.name} (${variant.color}/${variant.size})`,
          );
          return;
        }
      }
      playSound('error');
      toast.error(`ไม่พบสินค้า: ${trimmed}`);
    },
    [products, cart],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && target !== searchRef.current) return;
      if (e.key === 'Enter' && barcodeBuffer.current.length >= 3) {
        handleBarcodeScan(barcodeBuffer.current);
        barcodeBuffer.current = '';
        return;
      }
      if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
        clearTimeout(barcodeTimer.current);
        barcodeTimer.current = setTimeout(() => {
          barcodeBuffer.current = '';
        }, 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBarcodeScan]);

  // Load receipt settings once on mount
  useEffect(() => {
    const supabase = createClient();
    getStoreSettings(supabase, [
      RECEIPT_SHOW_ADDRESS_KEY,
      RECEIPT_SHOW_PHONE_KEY,
      RECEIPT_FOOTER_MESSAGE_KEY,
    ]).then((data) => {
      setReceiptSettings({
        showAddress: data[RECEIPT_SHOW_ADDRESS_KEY] !== 'false',
        showPhone: data[RECEIPT_SHOW_PHONE_KEY] !== 'false',
        footerMessage: data[RECEIPT_FOOTER_MESSAGE_KEY] ?? 'ขอบคุณที่ใช้บริการ',
      });
    }).catch(() => {/* keep defaults */});
  }, []);

  // Load active promotions once on mount
  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      try {
        const { data } = await supabase
          .from('promotions')
          .select('*')
          .eq('is_active', true);
        if (data) setPromotions(data);
      } catch {
        // ignore — promotions are optional
      }
    };
    load();
  }, []);

  // Recompute best promotion whenever cart or promotions change
  useEffect(() => {
    const subtotal = cart.getSubtotal();
    setBestPromotion(getBestPromotion(promotions, subtotal));
  }, [cart.items, promotions]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      handleBarcodeScan(search.trim());
      setSearch('');
    }
  };

  const handleProductClick = (product: ProductWithVariants) => {
    const activeVariants = product.variants?.filter((v) => v.is_active) || [];
    if (activeVariants.length === 0) {
      toast.error('สินค้าหมด');
      return;
    }
    if (activeVariants.length === 1) {
      if (activeVariants[0].stock_quantity <= 0) {
        toast.error('สินค้าหมด');
        playSound('error');
        return;
      }
      cart.addItem({ ...activeVariants[0], product });
      playSound('beep');
      return;
    }
    setVariantPickerProduct(product);
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    if (!variantPickerProduct) return;
    cart.addItem({ ...variant, product: variantPickerProduct });
    playSound('beep');
    toast.success(
      `เพิ่ม ${variantPickerProduct.name} (${variant.color}/${variant.size})`,
    );
    setVariantPickerProduct(null);
  };

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleCustomerSearch = useCallback(async (query: string) => {
    setCustomerSearch(query);
    if (!query.trim()) {
      setCustomerResults([]);
      return;
    }
    setCustomerSearching(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('customers')
        .select('id, full_name, phone')
        .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(5);
      setCustomerResults(data || []);
    } finally {
      setCustomerSearching(false);
    }
  }, []);

  const handleProcessSale = async () => {
    if (cart.items.length === 0) return;
    const promoDiscount = bestPromotion?.discountAmount ?? 0;
    const total = Math.max(0, cart.getTotal() - promoDiscount);
    if (paymentMethod === 'cash' && Number(cashReceived) < total) {
      toast.error('จำนวนเงินที่รับไม่พอ');
      return;
    }
    setProcessing(true);
    try {
      const supabase = createClient();
      const saleNumber = generateSaleNumber();
      const subtotal = cart.getSubtotal();
      const discountAmount = cart.getTotalDiscount() + promoDiscount;
      const changeAmount =
        paymentMethod === 'cash' ? Number(cashReceived) - total : 0;

      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          sale_number: saleNumber,
          cashier_id: profile!.id,
          customer_id: selectedCustomer?.id || null,
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
        .single();

      if (saleError) throw saleError;

      const saleItems = cart.items.map((item) => ({
        sale_id: sale.id,
        variant_id: item.variant.id,
        product_name: item.variant.product.name,
        variant_label: `${item.variant.color} / ${item.variant.size}`,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount,
        price_override: item.price_override,
        override_approved_by: item.override_approved_by,
        subtotal: item.unit_price * item.quantity - item.discount_amount,
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);
      if (itemsError) throw itemsError;

      playSound('success');
      if (paymentMethod === 'cash' && changeAmount > 0) {
        toast.success(`ขายสำเร็จ! เงินทอน ${formatCurrency(changeAmount)}`, {
          duration: 5000,
        });
      } else {
        toast.success('ขายสำเร็จ!', { duration: 3000 });
      }

      // Capture snapshot before clearing cart for receipt preview
      setLastSaleSnapshot({
        items: [...cart.items],
        subtotal,
        discount: discountAmount,
        tax: 0,
        total,
        paymentMethod: PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod,
      });
      setShowReceiptPreview(true);

      cart.clearCart();
      setShowPayment(false);
      setCashReceived('');
      setPaymentMethod('cash');
      setSelectedCustomer(null);
      setCustomerSearch('');
      setCustomerResults([]);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      toast.error(`เกิดข้อผิดพลาด: ${msg}`);
      playSound('error');
    } finally {
      setProcessing(false);
    }
  };

  const promoAdjustedTotal = Math.max(0, cart.getTotal() - (bestPromotion?.discountAmount ?? 0));
  const changeAmount =
    paymentMethod === 'cash' && cashReceived
      ? Math.max(0, Number(cashReceived) - promoAdjustedTotal)
      : 0;

  return (
    <>
      {variantPickerProduct && (
        <VariantPickerModal
          product={variantPickerProduct}
          onSelect={handleVariantSelect}
          onClose={() => setVariantPickerProduct(null)}
        />
      )}
      {showCamera && (
        <CameraScanner
          onScan={(barcode) => {
            handleBarcodeScan(barcode);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {showReceiptPreview && lastSaleSnapshot && (
        <ReceiptPreviewModal
          items={lastSaleSnapshot.items}
          subtotal={lastSaleSnapshot.subtotal}
          discount={lastSaleSnapshot.discount}
          tax={lastSaleSnapshot.tax}
          total={lastSaleSnapshot.total}
          paymentMethod={lastSaleSnapshot.paymentMethod}
          storeName={STORE_NAME}
          storeAddress={process.env.NEXT_PUBLIC_STORE_ADDRESS}
          storePhone={process.env.NEXT_PUBLIC_STORE_PHONE}
          footerMessage={receiptSettings.footerMessage}
          showAddress={receiptSettings.showAddress}
          showPhone={receiptSettings.showPhone}
          onPrint={() => {
            window.print();
            setShowReceiptPreview(false);
          }}
          onClose={() => setShowReceiptPreview(false)}
        />
      )}

      {/* Mobile cart overlay */}
      {showMobileCart && (
        <div
          className='fixed inset-0 bg-black/50 z-40 lg:hidden'
          onClick={() => setShowMobileCart(false)}
        />
      )}

      <div className='flex flex-col lg:flex-row gap-4 lg:h-[calc(100vh-5rem)]'>
        {/* LEFT: Product Selection */}
        <div className='flex-1 flex flex-col min-h-0'>
          <form onSubmit={handleSearchSubmit} className='mb-4'>
            <div className='flex gap-2'>
              <div className='relative flex-1'>
                <span className='absolute left-4 top-1/2 -translate-y-1/2 text-2xl'>
                  🔍
                </span>
                <input
                  ref={searchRef}
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='สแกนบาร์โค้ด หรือ พิมพ์ค้นหาสินค้า...'
                  className='w-full pl-14 pr-4 py-4 text-xl border-2 border-gray-300 rounded-xl
                            focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none'
                  autoFocus
                />
              </div>
              <button
                type='button'
                onClick={() => setShowCamera(true)}
                className='px-5 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl border-2 border-gray-300
                         text-2xl transition-all active:scale-95'
                title='สแกนด้วยกล้อง'
              >
                📷
              </button>
            </div>
          </form>

          <div className='flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar'>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`pos-btn whitespace-nowrap px-5 py-3 text-base rounded-xl ${
                selectedCategory === 'all'
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ทั้งหมด
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`pos-btn whitespace-nowrap px-5 py-3 text-base rounded-xl ${
                  selectedCategory === cat.id
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className='flex-1 overflow-y-auto'>
            <div className='grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3'>
              {filteredProducts.map((product) => {
                const totalStock =
                  product.variants?.reduce((s, v) => s + v.stock_quantity, 0) ||
                  0;
                const variantCount = product.variants?.length || 0;
                return (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    disabled={totalStock <= 0}
                    className={`pos-card text-left ${totalStock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className='text-3xl mb-1'>👕</div>
                    <div className='w-full'>
                      <p className='font-bold text-gray-800 text-base leading-tight truncate'>
                        {product.name}
                      </p>
                      <p className='text-brand-600 font-bold text-lg mt-1'>
                        {formatCurrency(product.base_price)}
                      </p>
                      <p
                        className={`text-sm mt-1 ${totalStock <= 5 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}
                      >
                        เหลือ {totalStock} ชิ้น
                      </p>
                      {variantCount > 1 && (
                        <p className='text-xs text-blue-500 mt-0.5'>
                          {variantCount} ขนาด/สี →
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {filteredProducts.length === 0 && (
              <div className='text-center py-12 text-gray-500'>
                <p className='text-4xl mb-3'>🔍</p>
                <p className='text-lg'>ไม่พบสินค้า</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Cart — desktop side panel / mobile bottom sheet */}
        <div
          className={`
          lg:w-96 bg-white rounded-xl border-2 border-gray-200 flex flex-col shadow-lg
          lg:flex
          fixed lg:relative bottom-16 lg:bottom-auto left-0 right-0 z-50 lg:z-auto
          transition-transform duration-300
          ${showMobileCart ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
          max-h-[85vh] lg:max-h-none rounded-t-2xl lg:rounded-xl
        `}
        >
          <div className='p-4 border-b border-gray-200 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              {/* Mobile close button */}
              <button
                onClick={() => setShowMobileCart(false)}
                className='lg:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-400'
              >
                ✕
              </button>
              <h2 className='text-xl font-bold text-gray-800'>
                🛒 ตะกร้า ({cart.getItemCount()})
              </h2>
            </div>
            {cart.items.length > 0 && (
              <button
                onClick={() => setShowVoidConfirm(true)}
                className='text-red-500 hover:text-red-700 font-medium text-base px-3 py-1 rounded-lg hover:bg-red-50'
              >
                ล้างทั้งหมด
              </button>
            )}
          </div>

          <div className='flex-1 overflow-y-auto p-4 space-y-3'>
            {cart.items.length === 0 ? (
              <div className='text-center py-8 text-gray-400'>
                <p className='text-4xl mb-2'>🛒</p>
                <p className='text-lg'>ยังไม่มีสินค้าในตะกร้า</p>
                <p className='text-base mt-1'>สแกนบาร์โค้ดหรือกดเลือกสินค้า</p>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.variant.id}
                  className='bg-gray-50 rounded-xl p-3 border border-gray-200'
                >
                  <div className='flex items-start justify-between mb-2'>
                    <div className='flex-1 min-w-0'>
                      <p className='font-bold text-gray-800 text-base truncate'>
                        {item.variant.product.name}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {item.variant.color} / {item.variant.size}
                      </p>
                      <p className='text-brand-600 font-semibold'>
                        {formatCurrency(item.unit_price)} × {item.quantity}
                      </p>
                    </div>
                    <button
                      onClick={() => cart.removeItem(item.variant.id)}
                      className='p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg ml-2'
                    >
                      ✕
                    </button>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() =>
                        cart.updateQuantity(item.variant.id, item.quantity - 1)
                      }
                      className='w-12 h-12 rounded-xl bg-white border-2 border-gray-300 text-xl font-bold hover:bg-gray-100'
                    >
                      −
                    </button>
                    <span className='w-12 text-center text-xl font-bold text-gray-800'>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        cart.updateQuantity(item.variant.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.variant.stock_quantity}
                      className='w-12 h-12 rounded-xl bg-white border-2 border-gray-300 text-xl font-bold hover:bg-gray-100 disabled:opacity-50'
                    >
                      +
                    </button>
                    <span className='flex-1 text-right font-bold text-lg text-gray-800'>
                      {formatCurrency(
                        item.unit_price * item.quantity - item.discount_amount,
                      )}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.items.length > 0 && !showPayment && (
            <div className='p-4 border-t-2 border-gray-200 bg-gray-50'>
              {cart.getTotalDiscount() > 0 && (
                <div className='flex justify-between text-base text-red-600 mb-1'>
                  <span>ส่วนลดรายการ</span>
                  <span>-{formatCurrency(cart.getTotalDiscount())}</span>
                </div>
              )}
              {bestPromotion && (
                <div className='flex items-center justify-between mb-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl'>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-base'>🏷️</span>
                    <span className='text-sm font-semibold text-green-700'>{bestPromotion.description}</span>
                  </div>
                  <span className='text-sm font-bold text-green-700'>-{formatCurrency(bestPromotion.discountAmount)}</span>
                </div>
              )}
              <div className='flex justify-between text-2xl font-bold text-gray-800 mb-4'>
                <span>รวม</span>
                <span className='text-brand-600'>
                  {formatCurrency(Math.max(0, cart.getTotal() - (bestPromotion?.discountAmount ?? 0)))}
                </span>
              </div>
              <button
                onClick={() => setShowPayment(true)}
                className='w-full pos-btn-success text-xl py-5'
              >
                💳 ชำระเงิน
              </button>
            </div>
          )}

          {showPayment && (
            <div className='p-4 border-t-2 border-gray-200 bg-green-50 space-y-4'>
              {bestPromotion && (
                <div className='flex items-center justify-between px-3 py-2 bg-green-100 border border-green-300 rounded-xl'>
                  <span className='text-sm font-semibold text-green-700'>🏷️ {bestPromotion.description}</span>
                  <span className='text-sm font-bold text-green-700'>-{formatCurrency(bestPromotion.discountAmount)}</span>
                </div>
              )}
              <div className='flex justify-between text-2xl font-bold'>
                <span>ยอดรวม</span>
                <span className='text-brand-600'>
                  {formatCurrency(Math.max(0, cart.getTotal() - (bestPromotion?.discountAmount ?? 0)))}
                </span>
              </div>

              {/* Customer search */}
              <div className='relative'>
                <label className='pos-label'>ลูกค้า (ไม่บังคับ)</label>
                {selectedCustomer ? (
                  <div className='flex items-center gap-2 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl'>
                    <span className='flex-1 font-semibold text-blue-800'>
                      👤 {selectedCustomer.name}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedCustomer(null);
                        setCustomerSearch('');
                      }}
                      className='text-gray-400 hover:text-gray-700 text-lg leading-none'
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type='text'
                      value={customerSearch}
                      onChange={(e) => handleCustomerSearch(e.target.value)}
                      className='pos-input'
                      placeholder='ค้นหาชื่อหรือเบอร์โทร...'
                    />
                    {customerSearch && (
                      <div className='absolute z-10 bg-white border border-gray-200 rounded-xl shadow-lg w-full mt-1 overflow-hidden'>
                        {customerSearching ? (
                          <div className='p-3 text-center text-gray-400 text-sm'>
                            กำลังค้นหา...
                          </div>
                        ) : customerResults.length === 0 ? (
                          <div className='p-3 text-center text-gray-400 text-sm'>
                            ไม่พบลูกค้า
                          </div>
                        ) : (
                          customerResults.map((c) => (
                            <button
                              key={c.id}
                              type='button'
                              onClick={() => {
                                setSelectedCustomer({
                                  id: c.id,
                                  name: c.full_name,
                                });
                                setCustomerSearch('');
                                setCustomerResults([]);
                              }}
                              className='w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0'
                            >
                              <p className='font-semibold'>{c.full_name}</p>
                              <p className='text-sm text-gray-500'>{c.phone}</p>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className='grid grid-cols-2 gap-2'>
                {(
                  [
                    'cash',
                    'transfer',
                    'promptpay',
                    'credit_card',
                  ] as PaymentMethod[]
                ).map((method) => (
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
                    {method === 'credit_card' && '💳'}{' '}
                    {PAYMENT_METHOD_LABELS[method]}
                  </button>
                ))}
              </div>
              {paymentMethod === 'cash' && (
                <div>
                  <label className='pos-label'>จำนวนเงินที่รับ (บาท)</label>
                  <div className='pos-input text-2xl text-center font-bold min-h-[3rem] flex items-center justify-center select-none'>
                    {cashReceived || <span className='text-gray-400'>0</span>}
                  </div>
                  <NumericKeypad
                    value={cashReceived}
                    onChange={setCashReceived}
                    total={promoAdjustedTotal}
                  />
                  <div className='grid grid-cols-3 gap-2 mt-2'>
                    {[20, 50, 100, 500, 1000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setCashReceived((prev) => String((Number(prev) || 0) + amount))}
                        className='py-3 rounded-xl bg-white border-2 border-gray-200 text-lg font-bold hover:bg-gray-50'
                      >
                        +{amount}
                      </button>
                    ))}
                    <button
                      onClick={() => setCashReceived('')}
                      className='py-3 rounded-xl bg-red-50 border-2 border-red-200 text-lg font-bold text-red-600 hover:bg-red-100'
                    >
                      ล้าง
                    </button>
                  </div>
                  {Number(cashReceived) >= promoAdjustedTotal && (
                    <div className='mt-3 p-3 bg-green-100 rounded-xl text-center'>
                      <p className='text-base text-green-700'>เงินทอน</p>
                      <p className='text-3xl font-bold text-green-800'>
                        {formatCurrency(changeAmount)}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {paymentMethod === 'promptpay' && (
                <PromptPayQR
                  phone={process.env.NEXT_PUBLIC_STORE_PHONE || ''}
                  amount={promoAdjustedTotal}
                  storeName={process.env.NEXT_PUBLIC_STORE_NAME}
                />
              )}
              <div className='flex gap-3'>
                <button
                  onClick={() => {
                    setShowPayment(false);
                    setCashReceived('');
                  }}
                  className='flex-1 pos-btn-secondary py-4 text-lg'
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={handleProcessSale}
                  disabled={
                    processing ||
                    (paymentMethod === 'cash' &&
                      Number(cashReceived) < promoAdjustedTotal)
                  }
                  className='flex-1 pos-btn-success py-4 text-lg disabled:opacity-50'
                >
                  {processing ? (
                    <span className='flex items-center gap-2'>
                      <span className='h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent' />
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
      </div>

      {/* Mobile floating cart button */}
      {!showMobileCart && (
        <button
          onClick={() => setShowMobileCart(true)}
          className='lg:hidden fixed bottom-20 right-4 z-30 bg-brand-500 text-white
                     rounded-full shadow-xl flex items-center gap-2 px-5 py-3.5
                     text-base font-bold active:scale-95 transition-all'
        >
          <span>🛒</span>
          <span>
            {cart.getItemCount() > 0 ? cart.getItemCount() : 'ตะกร้า'}
          </span>
          {cart.getItemCount() > 0 && (
            <span className='font-bold'>{formatCurrency(promoAdjustedTotal)}</span>
          )}
        </button>
      )}

      <ConfirmDialog
        open={showVoidConfirm}
        onClose={() => setShowVoidConfirm(false)}
        onConfirm={() => cart.clearCart()}
        title='ล้างตะกร้าทั้งหมด?'
        message='สินค้าทั้งหมดในตะกร้าจะถูกลบ ต้องการดำเนินการต่อหรือไม่?'
        confirmLabel='ล้างตะกร้า'
        cancelLabel='ยกเลิก'
        variant='danger'
      />
    </>
  );
}
