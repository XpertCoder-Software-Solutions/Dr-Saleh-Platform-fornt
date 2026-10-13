import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './page-hero.css'

interface Crumb {
  label: string
  to?: string
}

interface PageHeroProps {
  crumbs: Crumb[]
  eyebrow?: ReactNode
  title: ReactNode
  body?: ReactNode
  /** Show Dr. Saleh's cutout on the left (desktop only). */
  portrait?: boolean
  children?: ReactNode
}

/** Navy hero used at the top of inner pages; leaves room for the floating header. */
export function PageHero({ crumbs, eyebrow, title, body, portrait = true, children }: PageHeroProps) {
  return (
    <section className="phero bg-navy">
      <div className="dots phero-dots" aria-hidden="true" />
      <div className="orb phero-orb" aria-hidden="true" />
      <div className="phero-inner">
        <div className="phero-text">
          <nav aria-label="مسار الصفحة" className="phero-crumbs">
            {crumbs.map((c, i) => (
              <span key={c.label}>
                {i > 0 && <span aria-hidden="true"> / </span>}
                {c.to ? (
                  <Link to={c.to}>{c.label}</Link>
                ) : (
                  <span aria-current="page">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
          {eyebrow && <span className="glass phero-eyebrow">{eyebrow}</span>}
          <h1 className="phero-title rise">{title}</h1>
          {body && <p className="phero-body rise d1">{body}</p>}
        </div>
        {portrait && (
          <div className="phero-portrait" aria-hidden="true">
            <div className="phero-arch" />
            <img src="/assets/brand/saleh-cutout.webp" alt="" />
          </div>
        )}
      </div>
      {children && <div className="phero-slot">{children}</div>}
      <svg className="phero-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path className="wave-path" d="M0 40 C 360 100 1080 -20 1440 40 L1440 80 L0 80 Z" fill="#F6F8FB" />
      </svg>
    </section>
  )
}
