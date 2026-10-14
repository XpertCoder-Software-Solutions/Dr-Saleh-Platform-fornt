import type { Gender, Pagination } from '@/types/api'
import { api } from './client'
import type { ConsultStatus } from './account'
import type { Order, OrderStatus, PaymentStatus } from './shop'

// Every admin query key starts with 'admin'.
export const adminKeys = {
  overview: ['admin', 'overview'] as const,
  revenue: (period: RevenuePeriod) => ['admin', 'revenue', period] as const,
  dashOrders: ['admin', 'dash-orders'] as const,
  dashUsers: ['admin', 'dash-users'] as const,
  orders: ['admin', 'orders'] as const,
  consultations: ['admin', 'consultations'] as const,
  students: ['admin', 'students'] as const,
  student: (id: string) => ['admin', 'students', id] as const,
  courses: ['admin', 'courses'] as const,
  course: (id: string) => ['admin', 'courses', id] as const,
}

// ---------- dashboard ----------

export interface Overview {
  totalUsers: number
  totalCourses: number
  totalBooks: number
  totalProducts: number
  totalOrders: number
  totalRevenueEGP: number
  totalRevenueUSD: number
  pendingOrders: number
  paidOrders: number
  failedPayments: number
  consultationRequestsCount: number
  contactMessagesCount: number
}

export type RevenuePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecentOrder {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  currency: string
  totalAmount: number
  createdAt: string
  customerName: string
}

export const dashboardApi = {
  overview: () => api.get<{ overview: Overview }>('/admin/dashboard/overview'),
  revenue: (period: RevenuePeriod) =>
    api.get<{ revenue: { items: { date: string; revenue: number }[] } }>('/admin/dashboard/revenue', {
      params: { period, currency: 'EGP' },
    }),
  orders: () =>
    api.get<{
      orders: {
        ordersByStatus: Record<OrderStatus, number>
        paymentsByStatus: Record<PaymentStatus, number>
        recentOrders: RecentOrder[]
      }
    }>('/admin/dashboard/orders'),
  users: () =>
    api.get<{ users: { totalUsers: number; activeUsers: number; newUsersThisMonth: number } }>(
      '/admin/dashboard/users',
    ),
}

// ---------- orders ----------

export interface AdminOrder extends Order {
  user: { id: string; fullName: string; email: string; phoneNumber: string } | null
  payments?: { provider: string; status: PaymentStatus; amount: number }[]
}

export const adminOrdersApi = {
  list: (q: { page?: number; limit?: number; status?: OrderStatus; paymentStatus?: PaymentStatus }) =>
    api.get<{ items: AdminOrder[]; pagination: Pagination }>('/admin/orders', { params: q }),
  get: (id: string) => api.get<{ order: AdminOrder }>(`/admin/orders/${id}`),
  setStatus: (id: string, body: { status?: OrderStatus; paymentStatus?: PaymentStatus }) =>
    api.patch<{ order: AdminOrder }>(`/admin/orders/${id}/status`, body),
}

// ---------- consultation requests ----------

export interface ConsultRequest {
  id: string
  fullName: string
  age: number | null
  gender: string | null
  country: string
  phone: string
  whatsApp: string
  email: string
  consultationTopic: string
  notes: string | null
  childAge: string | null
  relation: string | null
  sessionType: string | null
  preferredTime: string | null
  status: ConsultStatus
  scheduledAt: string | null
  adminNotes: string | null
  createdAt: string
  category: { id: string; nameAr: string } | null
}

export const adminConsultApi = {
  list: (q: { page?: number; limit?: number; status?: ConsultStatus; search?: string }) =>
    api.get<{ requests: ConsultRequest[]; pagination: Pagination }>('/admin/consultations', { params: q }),
  update: (
    id: string,
    body: { status?: ConsultStatus; scheduledAt?: string | null; adminNotes?: string | null },
  ) => api.patch<{ request: ConsultRequest }>(`/admin/consultations/${id}`, body),
}

// ---------- students ----------

export interface Student {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  gender: Gender | null
  profileImage: string | null
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  coursesCount: number
  ordersCount: number
  totalPaidEGP: number
}

export interface StudentDetails extends Student {
  courses: { courseId: string; titleAr: string; purchasedAt: string; completionPercentage: number }[]
  recentOrders: {
    id: string
    orderNumber: string
    status: OrderStatus
    paymentStatus: PaymentStatus
    totalAmount: number
    createdAt: string
  }[]
}

export interface NewStudent {
  fullName: string
  email: string
  phoneNumber: string
  password?: string
  gender?: Gender
  courseIds?: string[]
}

export const studentsApi = {
  list: (q: { page?: number; limit?: number; search?: string; isActive?: boolean }) =>
    api.get<{ items: Student[]; newThisMonth: number; pagination: Pagination }>('/admin/students', {
      params: q,
    }),
  get: (id: string) => api.get<{ student: StudentDetails }>(`/admin/students/${id}`),
  create: (body: NewStudent) =>
    api.post<{ student: Student; temporaryPassword: string }>('/admin/students', body),
  setActive: (id: string, isActive: boolean) => api.patch(`/admin/students/${id}`, { isActive }),
  grantCourses: (id: string, courseIds: string[]) =>
    api.post<{ granted: number; alreadyOwned: number }>(`/admin/students/${id}/courses`, { courseIds }),
}

// ---------- courses ----------

export const adminCoursesApi = {
  list: (q: { page?: number; limit?: number; search?: string } = {}) =>
    api.get<{ courses: import('@/types/api').CourseSummary[]; pagination: Pagination }>('/admin/courses', {
      params: { limit: 100, ...q },
    }),
}
