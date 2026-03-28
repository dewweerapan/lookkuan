export type Role = 'admin' | 'manager' | 'cashier' | 'embroidery_staff'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: Role
  pin_code: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  parent_id: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  category_id: string | null
  base_price: number
  cost_price: number
  sku_prefix: string
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Relations
  category?: Category
  variants?: ProductVariant[]
}

export interface ProductVariant {
  id: string
  product_id: string
  color: string
  size: string
  sku: string
  barcode: string
  stock_quantity: number
  low_stock_threshold: number
  price_override: number | null
  shelf_location: string | null
  is_active: boolean
  shelf_location?: string | null
  created_at: string
  updated_at: string
  // Relations
  product?: Product
}

export interface InventoryMovement {
  id: string
  variant_id: string
  type: 'receive' | 'sell' | 'return' | 'adjust' | 'transfer'
  quantity_change: number
  reference_id: string | null
  reference_type: string | null
  note: string | null
  created_by: string
  created_at: string
  // Relations
  variant?: ProductVariant & { product?: Product }
  created_by_profile?: Profile
}

export interface Sale {
  id: string
  sale_number: string
  cashier_id: string
  customer_id: string | null
  subtotal: number
  discount_amount: number
  tax_amount: number
  total: number
  payment_method: 'cash' | 'transfer' | 'promptpay' | 'credit_card'
  cash_received: number | null
  change_amount: number | null
  status: 'completed' | 'voided' | 'refunded'
  voided_by: string | null
  void_reason: string | null
  voided_at: string | null
  note: string | null
  cash_session_id: string | null
  created_at: string
  // Relations
  cashier?: Profile
  voided_by_profile?: Profile
  customer?: Customer
  items?: SaleItem[]
}

export interface SaleItem {
  id: string
  sale_id: string
  variant_id: string
  product_name: string
  variant_label: string
  quantity: number
  unit_price: number
  discount_amount: number
  price_override: number | null
  override_approved_by: string | null
  subtotal: number
  created_at: string
  // Relations
  variant?: ProductVariant & { product?: Product }
  override_approved_by_profile?: Profile
}

export interface JobOrder {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_id: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'delivered' | 'cancelled'
  description: string
  design_image_url: string | null
  garment_type: string
  quantity: number
  quoted_price: number
  deposit_amount: number
  balance_due: number
  estimated_completion_date: string | null
  actual_completion_date: string | null
  assigned_to: string | null
  received_by: string
  delivered_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Relations
  assigned_to_profile?: Profile
  received_by_profile?: Profile
  customer?: Customer
}

export interface CashSession {
  id: string
  cashier_id: string
  opening_amount: number
  closing_amount: number | null
  expected_amount: number | null
  discrepancy: number | null
  status: 'open' | 'closed'
  opened_at: string
  closed_at: string | null
  notes: string | null
  // Relations
  cashier?: Profile
}

export interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  line_id: string | null
  total_spent: number
  visit_count: number
  loyalty_points: number
  tier: 'bronze' | 'silver' | 'gold'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  // Relations
  user?: Profile
}

// ===== Form Types =====

export interface ProductFormData {
  name: string
  description: string
  category_id: string
  base_price: number
  cost_price: number
  sku_prefix: string
  image_url: string
}

export interface VariantFormData {
  color: string
  size: string
  stock_quantity: number
  low_stock_threshold: number
  price_override: number | null
}

export interface JobOrderFormData {
  customer_name: string
  customer_phone: string
  description: string
  garment_type: string
  quantity: number
  quoted_price: number
  deposit_amount: number
  estimated_completion_date: string
  assigned_to: string
  notes: string
}

// ===== Cart Types (POS) =====

export interface CartItem {
  variant: ProductVariant & { product: Product }
  quantity: number
  unit_price: number
  discount_amount: number
  price_override: number | null
  override_approved_by: string | null
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  discount_amount: number
  tax_amount: number
  total: number
}

// ===== Dashboard Types =====

export interface DashboardStats {
  todaySales: number
  todayTransactions: number
  pendingJobOrders: number
  lowStockItems: number
  totalProducts: number
  totalInventoryValue: number
}

export interface SalesChartData {
  date: string
  sales: number
  transactions: number
}

export interface RiskMetric {
  employeeId: string
  employeeName: string
  voidCount: number
  voidRate: number
  overrideCount: number
  discountTotal: number
  cashDiscrepancy: number
}

export interface Supplier {
  id: string
  name: string
  contact_name: string | null
  phone: string | null
  email: string | null
  address: string | null
  payment_terms: string | null
  notes: string | null
  is_active: boolean
  created_at: string
}

export interface PurchaseOrder {
  id: string
  supplier_id: string
  order_number: string
  status: 'pending' | 'ordered' | 'received' | 'cancelled'
  total_amount: number
  ordered_at: string
  expected_date: string | null
  received_at: string | null
  created_by: string | null
  notes: string | null
  supplier?: Supplier
}

export interface PurchaseOrderItem {
  id: string
  purchase_order_id: string
  variant_id: string
  quantity_ordered: number
  quantity_received: number
  unit_cost: number
  variant?: {
    sku: string
    color: string
    size: string
    product: { name: string }[]
  }
}

export interface Promotion {
  id: string
  name: string
  description: string | null
  type: 'percent_off' | 'fixed_off' | 'min_purchase_discount'
  value: number
  min_purchase: number
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
}
