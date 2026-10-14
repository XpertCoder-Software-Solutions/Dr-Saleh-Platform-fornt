import { useQuery } from '@tanstack/react-query'
import { accountKeys, useMyCertificates, useMyConsultations } from '@/api/account'
import { ordersApi } from '@/api/shop'
import { routes } from '@/app/routes'
import { useAuth } from '@/auth/hooks'
import type { IconName } from '@/components/ui/Icon'
import { dateTile } from './consult-status'

export interface ActivityItem {
  id: string
  icon: IconName
  text: string
  to: string
  /** When it happened, for sorting and the "new" dot. */
  at: string
  tone: 'blue' | 'gold' | 'green' | 'red'
}

const seenKey = (userId: string) => `drs.activity-seen.${userId}`

export function readSeen(userId: string): number {
  try {
    return Number(localStorage.getItem(seenKey(userId))) || 0
  } catch {
    return 0
  }
}

export function markSeen(userId: string) {
  try {
    localStorage.setItem(seenKey(userId), String(Date.now()))
  } catch {
    // ignore
  }
}

/**
 * The header bell: recent things that happened on the account, built from the
 * user's own orders, certificates and consultations (there is no notifications API).
 */
export function useActivity(): ActivityItem[] {
  const { user } = useAuth()
  const enabled = Boolean(user) && user?.role !== 'Admin'
  const orders = useQuery({
    queryKey: [...accountKeys.orders, 'activity'],
    queryFn: () => ordersApi.list({ limit: 10 }),
    enabled,
    staleTime: 5 * 60_000,
  })
  const certs = useMyCertificates()
  const consults = useMyConsultations()
  if (!enabled) return []

  const items: ActivityItem[] = []
  for (const o of orders.data?.items ?? []) {
    const n = `#${o.orderNumber}`
    if (o.status === 'PENDING' && o.paymentStatus !== 'PAID') {
      items.push({
        id: `o-${o.id}`,
        icon: 'card',
        text: o.paymentStatus === 'FAILED' ? `الدفع مكملش لطلب ${n}، جرّب تاني` : `طلب ${n} مستني الدفع`,
        to: routes.checkoutPay(o.id),
        at: o.createdAt,
        tone: o.paymentStatus === 'FAILED' ? 'red' : 'gold',
      })
    } else if (o.status === 'PAID') {
      const shipped = o.shippingStatus === 'SHIPPED'
      const delivered = o.shippingStatus === 'DELIVERED'
      items.push({
        id: `o-${o.id}-${o.shippingStatus ?? 'paid'}`,
        icon: delivered || shipped ? 'truck' : 'check',
        text: delivered
          ? `طلب ${n} اتسلّم`
          : shipped
            ? `طلب ${n} خرج للشحن${o.trackingNumber ? ` · رقم الشحنة ${o.trackingNumber}` : ''}`
            : `تم دفع طلب ${n}`,
        to: routes.orders,
        at: (delivered ? o.deliveredAt : shipped ? o.shippedAt : o.paidAt) ?? o.createdAt,
        tone: 'green',
      })
    }
  }
  for (const c of certs.data ?? []) {
    items.push({
      id: `c-${c.id}`,
      icon: 'award',
      text: `شهادتك في «${c.course.titleAr}» جاهزة`,
      to: routes.certificates,
      at: c.issuedAt,
      tone: 'gold',
    })
  }
  for (const c of consults.data?.items ?? []) {
    if (c.status === 'SCHEDULED' && c.scheduledAt) {
      const d = dateTile(c.scheduledAt)
      items.push({
        id: `s-${c.id}-${c.scheduledAt}`,
        icon: 'calendar',
        text: `ميعاد استشارتك ${d.weekday} ${d.day} ${d.month} الساعة ${d.time}`,
        to: routes.myConsultations,
        at: c.updatedAt ?? c.createdAt,
        tone: 'blue',
      })
    }
  }
  return items.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 8)
}
