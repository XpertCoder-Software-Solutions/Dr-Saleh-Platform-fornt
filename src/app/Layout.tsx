import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

/** Public site shell: floating header, page, footer. */
export function SiteLayout() {
  return (
    <>
      <a href="#main" className="skip-link">
        انتقل للمحتوى
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  )
}
