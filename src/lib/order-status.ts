import type { Order } from '@/api/shop'

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'muted'

/** Status pill for an order. The backend tracks payment, not shipping, so paid = done. */
export function orderStatus(order: Pick<Order, 'status' | 'paymentStatus'>): { label: string; tone: Tone } {
  switch (order.status) {
    case 'PAID':
      return { label: 'مدفوع', tone: 'success' }
    case 'CANCELLED':
      return { label: 'ملغي', tone: 'muted' }
    case 'REFUNDED':
      return { label: 'مسترد', tone: 'info' }
    default:
      return order.paymentStatus === 'FAILED'
        ? { label: 'الدفع مكملش', tone: 'danger' }
        : { label: 'في انتظار الدفع', tone: 'warning' }
  }
}

export const TONE_CLASS: Record<Tone, string> = {
  success: 'bg-[#E7F6EC] text-success',
  warning: 'bg-gold-soft text-gold-ink',
  danger: 'bg-red-50 text-danger',
  info: 'bg-surface-blue text-blue-600',
  muted: 'bg-[#EEF1F4] text-muted',
}

/** "دورة + كتاب صوتي" style summary of what an order holds. */
export function orderKinds(order: Pick<Order, 'items'>): string {
  const kinds = new Set(
    order.items.map((i) => (i.itemType === 'COURSE' ? 'دورة' : i.itemType === 'BOOK' ? 'كتاب' : 'منتجات')),
  )
  return [...kinds].join(' + ')
}
