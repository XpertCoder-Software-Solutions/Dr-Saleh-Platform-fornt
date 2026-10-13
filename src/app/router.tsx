import { createBrowserRouter } from 'react-router-dom'
import { SiteLayout } from './Layout'
import { HomePage } from '@/pages/home/HomePage'
import { CoursesPage } from '@/pages/courses/CoursesPage'
import { CourseDetailsPage } from '@/pages/courses/CourseDetailsPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
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

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'courses/:id', element: <CourseDetailsPage /> },
      ...soon.map(([path, title]) => ({ path, element: <ComingSoonPage title={title} /> })),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: 'login', element: <LoginPage /> },
  { path: 'register', element: <RegisterPage /> },
  { path: 'verify-email', element: <VerifyEmailPage /> },
  { path: 'forgot-password', element: <ForgotPasswordPage /> },
])
