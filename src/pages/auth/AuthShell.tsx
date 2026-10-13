import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { routes } from '@/app/routes'
import { Icon } from '@/components/ui/Icon'
import './auth.css'

/** Split auth layout: form on the right, brand panel on the left. No site header. */
export function AuthShell({ title, sub, children }: { title: string; sub?: ReactNode; children: ReactNode }) {
  return (
    <div className="auth">
      <div className="auth-form-side">
        <div className="auth-top">
          <Link to={routes.home} className="auth-back">
            <Icon name="arrowRight" size={16} /> رجوع للرئيسية
          </Link>
          <Link to={routes.home} aria-label="الرئيسية">
            <img src="/assets/brand/logo-blue.webp" alt="الدكتور صالح عبد الكريم" className="auth-logo" />
          </Link>
        </div>
        <main id="main" className="auth-main">
          <div className="auth-head">
            <h1>{title}</h1>
            {sub && <p>{sub}</p>}
          </div>
          {children}
        </main>
      </div>

      <aside className="auth-panel bg-navy" aria-hidden="true">
        <div className="dots auth-dots" />
        <img className="auth-panel-logo" src="/assets/brand/logo-white.webp" alt="" />
        <img className="auth-panel-photo" src="/assets/brand/saleh-cutout.webp" alt="" />
        <div className="glass auth-quote">
          <p>«مش مطلوب إن ابنك يكون مثالي… المطلوب إنه يكون سوي، واثق في نفسه.»</p>
          <span>د. صالح عبد الكريم</span>
          <div className="auth-tags">
            <span>دوراتك وكتبك في مكان واحد</span>
            <span>شهادات قابلة للمشاركة</span>
          </div>
        </div>
      </aside>
    </div>
  )
}
