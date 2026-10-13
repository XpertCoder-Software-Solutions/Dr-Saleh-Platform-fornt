import type {
  Book,
  Category,
  Course,
  CourseListData,
  CourseReviewListData,
  CourseSummary,
  Gender,
  LoginData,
  Pagination,
  Product,
  RegisterData,
  User,
} from '@/types/api'
import { api } from './client'

// ---------- auth ----------

export interface RegisterInput {
  fullName: string
  email: string
  phoneNumber: string
  password: string
  gender?: Gender
  referralCode?: string
}

export const authApi = {
  login: (input: { email: string; password: string }) => api.post<LoginData>('/auth/login', input),
  register: (input: RegisterInput) => api.post<RegisterData>('/auth/register', input),
  verifyEmail: (input: { email: string; otp: string }) =>
    api.post<Record<string, never>>('/auth/verify-email', input),
  resendVerification: (email: string) =>
    api.post<Record<string, never>>('/auth/resend-email-verification', { email }),
  forgotPassword: (email: string) => api.post<Record<string, never>>('/auth/forgot-password', { email }),
  logout: () => api.post<Record<string, never>>('/auth/logout'),
}

export const usersApi = {
  profile: () => api.get<User & { gender?: Gender | null }>('/users/profile'),
}

// ---------- courses ----------

export interface CourseQuery {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  isFeatured?: boolean
}

export const coursesApi = {
  list: (query: CourseQuery) => api.get<CourseListData>('/courses', { params: query }),
  home: () => api.get<CourseSummary[]>('/courses/home'),
  featured: () => api.get<CourseSummary[]>('/courses/featured'),
  categories: () => api.get<Category[]>('/courses/categories'),
  byId: (id: string) => api.get<Course>(`/courses/${id}`),
  reviews: (courseId: string, page = 1, limit = 10) =>
    api.get<CourseReviewListData>(`/courses/${courseId}/reviews`, { params: { page, limit } }),
}

// ---------- library & store (home page teasers) ----------

export const booksApi = {
  list: () => api.get<Book[]>('/books'),
}

export const productsApi = {
  list: (query: { page?: number; limit?: number; isHomeDisplay?: boolean; isFeatured?: boolean }) =>
    api.get<{ products: Product[]; pagination: Pagination }>('/products', { params: query }),
}

export interface ArticleSummary {
  id: string
  slug: string
  title: string
  shortContent?: string | null
  content?: string | null
  coverImage?: string | null
  viewsCount?: number
  isFeatured?: boolean
  createdAt: string
  category?: { id: string; name: string } | null
}

export const articlesApi = {
  list: (query: { page?: number; limit?: number }) =>
    api.get<{ articles: ArticleSummary[]; pagination: Pagination }>('/articles', {
      params: { lang: 'ar', ...query },
    }),
}
