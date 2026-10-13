import { createBrowserRouter } from 'react-router-dom'
import { SiteLayout } from './Layout'
import { HomePage } from '@/pages/home/HomePage'
import { ComingSoonPage, NotFoundPage } from '@/pages/NotFoundPage'

// Pages from the design that come in the next phases.
const soon: [string, string][] = [
  ['library/*', 'المكتبة'],
  ['store/*', 'المتجر'],
  ['consultation/*', 'الاستشارات'],
  ['blog/*', 'المقالات'],
  ['contact', 'تواصل معنا'],
  ['about', 'عن د. صالح'],
  ['search', 'البحث'],
  ['cart', 'السلة'],
  ['certificates/verify', 'التحقق من شهادة'],
  ['legal/*', 'الشروط والسياسات'],
  ['account/*', 'حسابي'],
  ['admin/*', 'لوحة التحكم'],
]

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
