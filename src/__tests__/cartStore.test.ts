import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/stores/cartStore'
import type { ProductVariant, Product } from '@/types/database'

// Minimal product/variant factories for tests
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
    name: 'Test Product',
    description: null,
    category_id: null,
    base_price: 100,
    cost_price: 50,
    sku_prefix: 'TST',
    image_url: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeVariant(
  overrides: Partial<ProductVariant & { product: Product }> = {}
): ProductVariant & { product: Product } {
  const product = overrides.product ?? makeProduct()
  return {
    id: 'var-1',
    product_id: product.id,
    color: 'White',
    size: 'M',
    sku: 'TST-WHI-M-0001',
    barcode: '1234567890',
    stock_quantity: 10,
    low_stock_threshold: 3,
    price_override: null,
    shelf_location: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    product,
    ...overrides,
  }
}

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart()
  })

  describe('addItem', () => {
    it('adds a new item to empty cart', () => {
      const variant = makeVariant()
      useCartStore.getState().addItem(variant)

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].variant.id).toBe('var-1')
      expect(items[0].quantity).toBe(1)
    })

    it('sets unit_price from base_price when no price_override', () => {
      const product = makeProduct({ base_price: 250 })
      const variant = makeVariant({ product, price_override: null })
      useCartStore.getState().addItem(variant)

      expect(useCartStore.getState().items[0].unit_price).toBe(250)
    })

    it('sets unit_price from price_override when set', () => {
      const product = makeProduct({ base_price: 250 })
      const variant = makeVariant({ product, price_override: 199 })
      useCartStore.getState().addItem(variant)

      expect(useCartStore.getState().items[0].unit_price).toBe(199)
    })

    it('increments quantity when same variant added again', () => {
      const variant = makeVariant({ stock_quantity: 5 })
      useCartStore.getState().addItem(variant)
      useCartStore.getState().addItem(variant)

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(2)
    })

    it('does not exceed stock when incrementing', () => {
      const variant = makeVariant({ stock_quantity: 2 })
      useCartStore.getState().addItem(variant)
      useCartStore.getState().addItem(variant)
      useCartStore.getState().addItem(variant) // 3rd add, stock is only 2

      expect(useCartStore.getState().items[0].quantity).toBe(2)
    })

    it('does not add item with zero stock', () => {
      const variant = makeVariant({ stock_quantity: 0 })
      useCartStore.getState().addItem(variant)

      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('initializes discount_amount to 0', () => {
      const variant = makeVariant()
      useCartStore.getState().addItem(variant)

      expect(useCartStore.getState().items[0].discount_amount).toBe(0)
    })
  })

  describe('removeItem', () => {
    it('removes the item from cart', () => {
      const variant = makeVariant()
      useCartStore.getState().addItem(variant)
      useCartStore.getState().removeItem('var-1')

      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('only removes the targeted item', () => {
      const v1 = makeVariant({ id: 'var-1' })
      const v2 = makeVariant({ id: 'var-2', sku: 'TST-BLK-L-0002' })
      useCartStore.getState().addItem(v1)
      useCartStore.getState().addItem(v2)
      useCartStore.getState().removeItem('var-1')

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].variant.id).toBe('var-2')
    })
  })

  describe('updateQuantity', () => {
    it('updates item quantity', () => {
      const variant = makeVariant({ stock_quantity: 10 })
      useCartStore.getState().addItem(variant)
      useCartStore.getState().updateQuantity('var-1', 5)

      expect(useCartStore.getState().items[0].quantity).toBe(5)
    })

    it('removes item when quantity set to 0', () => {
      const variant = makeVariant()
      useCartStore.getState().addItem(variant)
      useCartStore.getState().updateQuantity('var-1', 0)

      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('removes item when quantity set to negative', () => {
      const variant = makeVariant()
      useCartStore.getState().addItem(variant)
      useCartStore.getState().updateQuantity('var-1', -1)

      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('caps quantity at stock_quantity', () => {
      const variant = makeVariant({ stock_quantity: 3 })
      useCartStore.getState().addItem(variant)
      useCartStore.getState().updateQuantity('var-1', 99)

      expect(useCartStore.getState().items[0].quantity).toBe(3)
    })
  })

  describe('applyItemDiscount', () => {
    it('sets discount on item', () => {
      const variant = makeVariant()
      useCartStore.getState().addItem(variant)
      useCartStore.getState().applyItemDiscount('var-1', 20)

      expect(useCartStore.getState().items[0].discount_amount).toBe(20)
    })

    it('clamps negative discount to 0', () => {
      const variant = makeVariant()
      useCartStore.getState().addItem(variant)
      useCartStore.getState().applyItemDiscount('var-1', -50)

      expect(useCartStore.getState().items[0].discount_amount).toBe(0)
    })
  })

  describe('applyPriceOverride', () => {
    it('updates unit_price and price_override', () => {
      const variant = makeVariant()
      useCartStore.getState().addItem(variant)
      useCartStore.getState().applyPriceOverride('var-1', 80, 'admin@test.com')

      const item = useCartStore.getState().items[0]
      expect(item.unit_price).toBe(80)
      expect(item.price_override).toBe(80)
      expect(item.override_approved_by).toBe('admin@test.com')
    })
  })

  describe('clearCart', () => {
    it('empties the cart', () => {
      useCartStore.getState().addItem(makeVariant())
      useCartStore.getState().clearCart()

      expect(useCartStore.getState().items).toHaveLength(0)
    })
  })

  describe('getSubtotal', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().getSubtotal()).toBe(0)
    })

    it('calculates unit_price × quantity for each item', () => {
      const v1 = makeVariant({ id: 'var-1', stock_quantity: 10 })
      const v2 = makeVariant({ id: 'var-2', product: makeProduct({ id: 'prod-2', base_price: 200 }) })
      useCartStore.getState().addItem(v1)       // 100 × 1
      useCartStore.getState().addItem(v1)       // 100 × 2
      useCartStore.getState().addItem(v2)       // 200 × 1

      expect(useCartStore.getState().getSubtotal()).toBe(400)
    })
  })

  describe('getTotal', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().getTotal()).toBe(0)
    })

    it('subtracts discount from subtotal', () => {
      const variant = makeVariant({ stock_quantity: 5 })
      useCartStore.getState().addItem(variant) // 100 × 1
      useCartStore.getState().applyItemDiscount('var-1', 15)

      // 100 - 15 = 85
      expect(useCartStore.getState().getTotal()).toBe(85)
    })
  })

  describe('getTotalDiscount', () => {
    it('returns sum of all discounts', () => {
      const v1 = makeVariant({ id: 'var-1' })
      const v2 = makeVariant({ id: 'var-2' })
      useCartStore.getState().addItem(v1)
      useCartStore.getState().addItem(v2)
      useCartStore.getState().applyItemDiscount('var-1', 10)
      useCartStore.getState().applyItemDiscount('var-2', 5)

      expect(useCartStore.getState().getTotalDiscount()).toBe(15)
    })
  })

  describe('getItemCount', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().getItemCount()).toBe(0)
    })

    it('returns sum of all quantities', () => {
      const v1 = makeVariant({ id: 'var-1', stock_quantity: 5 })
      const v2 = makeVariant({ id: 'var-2', stock_quantity: 5 })
      useCartStore.getState().addItem(v1)
      useCartStore.getState().addItem(v1)
      useCartStore.getState().addItem(v2)

      expect(useCartStore.getState().getItemCount()).toBe(3)
    })
  })
})
