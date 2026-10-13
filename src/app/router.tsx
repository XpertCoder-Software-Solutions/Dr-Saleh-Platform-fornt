import type React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { SiteLayout } from './Layout'
import { HomePage } from '@/pages/home/HomePage'
import { ComingSoonPage, NotFoundPage } from '@/pages/NotFoundPage'

// Pages from the design that come in the next phases.
const soon: [string, string][] = [
  ['cart', 'السلة'],
  ['account/*', 'حسابي'],
  ['admin/*', 'لوحة التحكم'],
]

/** Lazy route: the page's module is fetched on first visit. */
function page(load: () => Promise<Record<string, unknown>>, name: string) {
  return async () => ({ Component: (await load())[name] as React.ComponentType })
}

// Home loads with the app; every other page is its own chunk, fetched on first visit.
export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'courses',
        lazy: async () => ({ Component: (await import('@/pages/courses/CoursesPage')).CoursesPage }),
      },
      {
        path: 'courses/:id',
        lazy: async () => ({
          Component: (await import('@/pages/courses/CourseDetailsPage')).CourseDetailsPage,
        }),
      },
      { path: 'library', lazy: page(() => import('@/pages/library/LibraryPage'), 'LibraryPage') },
      {
        path: 'library/:slug',
        lazy: page(() => import('@/pages/library/BookDetailsPage'), 'BookDetailsPage'),
      },
      { path: 'store', lazy: page(() => import('@/pages/store/StorePage'), 'StorePage') },
      {
        path: 'store/:slug',
        lazy: page(() => import('@/pages/store/ProductDetailsPage'), 'ProductDetailsPage'),
      },
      { path: 'blog', lazy: page(() => import('@/pages/blog/BlogPage'), 'BlogPage') },
      { path: 'blog/:slug', lazy: page(() => import('@/pages/blog/ArticlePage'), 'ArticlePage') },
      {
        path: 'consultation',
        lazy: page(() => import('@/pages/consultation/ConsultationPage'), 'ConsultationPage'),
      },
      {
        path: 'consultation/request',
        lazy: page(() => import('@/pages/consultation/ConsultRequestPage'), 'ConsultRequestPage'),
      },
      { path: 'contact', lazy: page(() => import('@/pages/contact/ContactPage'), 'ContactPage') },
      { path: 'about', lazy: page(() => import('@/pages/about/AboutPage'), 'AboutPage') },
      { path: 'search', lazy: page(() => import('@/pages/search/SearchPage'), 'SearchPage') },
      {
        path: 'certificates/verify',
        lazy: page(() => import('@/pages/certificates/VerifyCertificatePage'), 'VerifyCertificatePage'),
      },
      { path: 'legal/:doc', lazy: page(() => import('@/pages/legal/LegalPage'), 'LegalPage') },
      ...soon.map(([path, title]) => ({ path, element: <ComingSoonPage title={title} /> })),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: 'login', lazy: async () => ({ Component: (await import('@/pages/auth/LoginPage')).LoginPage }) },
  {
    path: 'register',
    lazy: async () => ({ Component: (await import('@/pages/auth/RegisterPage')).RegisterPage }),
  },
  {
    path: 'verify-email',
    lazy: async () => ({ Component: (await import('@/pages/auth/VerifyEmailPage')).VerifyEmailPage }),
  },
  {
    path: 'forgot-password',
    lazy: async () => ({ Component: (await import('@/pages/auth/ForgotPasswordPage')).ForgotPasswordPage }),
  },
])
