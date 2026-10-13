import { Link } from 'react-router-dom'
import { routes } from '@/app/routes'
import { Icon } from '@/components/ui/Icon'
import { usePageTitle } from '@/lib/usePageTitle'
import './simple-pages.css'

export function NotFoundPage() {
  usePageTitle('الصفحة مش موجودة')
  return (
    <section className="simple-page bg-navy">
      <div className="dots simple-dots" aria-hidden="true" />
      <div className="simple-box">
        <span className="simple-code">404</span>
        <h1>الصفحة دي مش موجودة</h1>
        <p>يمكن الرابط اتغيّر أو الصفحة اتشالت. جرّب ترجع للرئيسية أو تتصفح الدورات.</p>
        <div className="simple-actions">
          <Link to={routes.home} className="btn btn-gold btn-lg">
            الرئيسية <Icon name="arrowLeft" />
          </Link>
          <Link to={routes.courses} className="btn btn-glass glass btn-lg">
            تصفّح الدورات
          </Link>
        </div>
      </div>
    </section>
  )
}

/** Placeholder for pages that are designed but not built yet in this phase. */
export function ComingSoonPage({ title }: { title: string }) {
  usePageTitle(title)
  return (
    <section className="simple-page bg-navy">
      <div className="dots simple-dots" aria-hidden="true" />
      <div className="simple-box">
        <span className="glass simple-chip">قريبًا</span>
        <h1>{title}</h1>
        <p>الصفحة دي بنشتغل عليها دلوقتي وهتكون جاهزة قريب.</p>
        <div className="simple-actions">
          <Link to={routes.home} className="btn btn-gold btn-lg">
            الرئيسية <Icon name="arrowLeft" />
          </Link>
        </div>
      </div>
    </section>
  )
}
