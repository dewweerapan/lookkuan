import { create } from 'zustand'
import type { CartItem, ProductVariant, Product } from '@/types/database'

interface CartStore {
  items: CartItem[]
  addItem: (variant: ProductVariant & { product: Product }) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  applyItemDiscount: (variantId: string, discount: number) => void
  applyPriceOverride: (variantId: string, price: number, approvedBy: string) => void
  clearCart: () => void
  getSubtotal: () => number
  getTotal: () => number
  getTotalDiscount: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (variant) => {
    set((state) => {
      const existing = state.items.find(item => item.variant.id === variant.id)
      if (existing) {
        // Check stock
        if (existing.quantity >= variant.stock_quantity) return state
        return {
          items: state.items.map(item =>
            item.variant.id === variant.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      }
      // Check stock
      if (variant.stock_quantity <= 0) return state
      const unitPrice = variant.price_override || variant.product.base_price
      return {
        items: [...state.items, {
          variant,
          quantity: 1,
          unit_price: unitPrice,
          discount_amount: 0,
          price_override: null,
          override_approved_by: null,
        }],
      }
    })
  },

  removeItem: (variantId) => {
    set((state) => ({
      items: state.items.filter(item => item.variant.id !== variantId),
    }))
  },

  updateQuantity: (variantId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter(item => item.variant.id !== variantId) }
      }
      return {
        items: state.items.map(item => {
          if (item.variant.id !== variantId) return item
          // Don't exceed stock
          const maxQty = Math.min(quantity, item.variant.stock_quantity)
          return { ...item, quantity: maxQty }
        }),
      }
    })
  },

  applyItemDiscount: (variantId, discount) => {
    set((state) => ({
      items: state.items.map(item =>
        item.variant.id === variantId
          ? { ...item, discount_amount: Math.max(0, discount) }
          : item
      ),
    }))
  },

  applyPriceOverride: (variantId, price, approvedBy) => {
    set((state) => ({
      items: state.items.map(item =>
        item.variant.id === variantId
          ? { ...item, price_override: price, unit_price: price, override_approved_by: approvedBy }
          : item
      ),
    }))
  },

  clearCart: () => set({ items: [] }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => {
      return sum + (item.unit_price * item.quantity)
    }, 0)
  },

  getTotal: () => {
    return get().items.reduce((sum, item) => {
      return sum + (item.unit_price * item.quantity) - item.discount_amount
    }, 0)
  },

  getTotalDiscount: () => {
    return get().items.reduce((sum, item) => sum + item.discount_amount, 0)
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },
}))
