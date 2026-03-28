export const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'LookKuan'
export const STORE_PHONE = process.env.NEXT_PUBLIC_STORE_PHONE || ''
export const STORE_ADDRESS = process.env.NEXT_PUBLIC_STORE_ADDRESS || ''
export const TAX_RATE = Number(process.env.NEXT_PUBLIC_TAX_RATE) || 0.07

export const LINE_NOTIFY_TOKEN_KEY = 'line_notify_token'
export const NOTIFY_LOW_STOCK_KEY = 'notify_low_stock'
export const NOTIFY_NEW_ORDER_KEY = 'notify_new_order'
export const NOTIFY_INSTALLMENT_DUE_KEY = 'notify_installment_due'

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  EMBROIDERY_STAFF: 'embroidery_staff',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const JOB_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS]

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: 'รอดำเนินการ',
  in_progress: 'กำลังปัก',
  completed: 'เสร็จแล้ว',
  delivered: 'ส่งมอบแล้ว',
  cancelled: 'ยกเลิก',
}

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
  completed: 'bg-green-100 text-green-800 border-green-300',
  delivered: 'bg-gray-100 text-gray-800 border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
}

export const SALE_STATUS = {
  COMPLETED: 'completed',
  VOIDED: 'voided',
  REFUNDED: 'refunded',
} as const

export const PAYMENT_METHODS = {
  CASH: 'cash',
  TRANSFER: 'transfer',
  PROMPTPAY: 'promptpay',
  CREDIT_CARD: 'credit_card',
} as const

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'เงินสด',
  transfer: 'โอนเงิน',
  promptpay: 'พร้อมเพย์',
  credit_card: 'บัตรเครดิต',
}

export const MOVEMENT_TYPES = {
  RECEIVE: 'receive',
  SELL: 'sell',
  RETURN: 'return',
  ADJUST: 'adjust',
  TRANSFER: 'transfer',
} as const

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  receive: 'รับเข้า',
  sell: 'ขายออก',
  return: 'คืนสินค้า',
  adjust: 'ปรับสต็อก',
  transfer: 'โอนย้าย',
}
