import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { useAuth, useCopy } from '@/auth/hooks'
import { Icon, type IconName } from '@/components/ui/Icon'
import { routes } from '@/app/routes'
import './header.css'

const NAV = [
  { to: routes.home, label: 'الرئيسية', end: true },
  { to: routes.courses, label: 'الدورات' },
  { to: routes.library, label: 'المكتبة' },
  { to: routes.store, label: 'المتجر' },
  // The header keeps pointing to the original consultation page (decision with Amr).
  { to: routes.consultation, label: 'الاستشارات' },
  { to: routes.blog, label: 'المقالات' },
  { to: routes.contact, label: 'تواصل معنا' },
]

const ACCOUNT_MENU: { to: string; label: string; icon: IconName }[] = [
  { to: routes.dashboard, label: 'نظرة عامة', icon: 'grid' },
  { to: routes.myCourses, label: 'دوراتي', icon: 'video' },
  { to: routes.myBooks, label: 'كتبي', icon: 'book' },
  { to: routes.certificates, label: 'شهاداتي', icon: 'award' },
  { to: routes.orders, label: 'طلباتي', icon: 'receipt' },
  { to: routes.wishlist, label: 'المفضلة', icon: 'heart' },
  { to: routes.profile, label: 'الملف الشخصي', icon: 'user' },
]

type Panel = 'menu' | 'notif' | 'mobile' | null

export function Header() {
  const { user, logout } = useAuth()
  const t = useCopy()
  const navigate = useNavigate()
  const location = useLocation()
  const [panel, setPanel] = useState<Panel>(null)
  const [scrolled, setScrolled] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const { data: cartSummary } = useQuery({
    queryKey: ['me', 'cart-summary'],
    queryFn: () => api.get<{ itemsCount: number }>('/cart/summary', { params: { currency: 'EGP' } }),
    enabled: Boolean(user),
    staleTime: 60_000,
  })
  const cartCount = cartSummary?.itemsCount ?? 0

  // Close panels on navigation, outside click and Escape.
  const [path, setPath] = useState(location.pathname)
  if (path !== location.pathname) {
    setPath(location.pathname)
    setPanel(null)
  }
  useEffect(() => {
    if (!panel) return
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPanel(null)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanel(null)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [panel])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggle = (p: Panel) => setPanel((cur) => (cur === p ? null : p))
  const initial = user?.firstName?.charAt(0) ?? ''

  async function handleLogout() {
    setPanel(null)
    await logout()
    navigate(routes.home)
  }

  return (
    <div className={`site-header${scrolled ? ' is-scrolled' : ''}`} ref={rootRef}>
      <header className="hdr-pill">
        <Link to={routes.home} aria-label="الرئيسية" className="hdr-logo">
          <img src="/assets/brand/logo-blue.webp" alt="الدكتور صالح عبد الكريم" width={102} height={46} />
        </Link>

        <nav aria-label="القائمة الرئيسية" className="hdr-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className="hdr-link">
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hdr-actions">
          <Link to={routes.search} aria-label="بحث" className="hdr-icon">
            <Icon name="search" />
          </Link>
          <Link
            to={routes.cart}
            aria-label={cartCount ? `السلة، ${cartCount} عنصر` : 'السلة'}
            className="hdr-icon"
          >
            <Icon name="bag" />
            {cartCount > 0 && <span className="hdr-badge">{cartCount}</span>}
          </Link>

          {user ? (
            <>
              <button
                type="button"
                className={`hdr-icon hdr-icon-btn${panel === 'notif' ? ' is-on' : ''}`}
                aria-label="الإشعارات"
                aria-expanded={panel === 'notif'}
                onClick={() => toggle('notif')}
              >
                <Icon name="bell" />
              </button>
              <span className="hdr-sep" aria-hidden="true" />
              <button
                type="button"
                className={`hdr-user${panel === 'menu' ? ' is-on' : ''}`}
                aria-label={`قائمة حسابي: ${user.fullName}`}
                aria-expanded={panel === 'menu'}
                onClick={() => toggle('menu')}
              >
                <span className="hdr-avatar">{initial}</span>
                <b>{user.firstName}</b>
                <Icon name="chevDown" size={16} />
              </button>
            </>
          ) : (
            <>
              <span className="hdr-sep hide-sm" aria-hidden="true" />
              <Link to={routes.login} className="hdr-login hide-sm">
                دخول
              </Link>
              <Link to={routes.register} className="hdr-cta hide-sm">
                {t('cta.startFree')}
              </Link>
            </>
          )}

          <button
            type="button"
            className="hdr-icon hdr-icon-btn hdr-burger"
            aria-label="القائمة"
            aria-expanded={panel === 'mobile'}
            onClick={() => toggle('mobile')}
          >
            <Icon name={panel === 'mobile' ? 'close' : 'menu'} />
          </button>
        </div>

        {panel === 'menu' && user && (
          <div role="menu" className="hdr-dd hdr-dd-menu">
            <div className="hdr-dd-head bg-navy">
              <span className="hdr-avatar lg">{initial}</span>
              <span className="hdr-dd-id">
                <b>{user.fullName}</b>
                <span>{user.email}</span>
              </span>
            </div>
            {ACCOUNT_MENU.map((m) => (
              <Link key={m.to} to={m.to} role="menuitem" className="hdr-mi">
                <Icon name={m.icon} size={18} />
                {m.label}
              </Link>
            ))}
            {user.role === 'Admin' && (
              <Link to={routes.admin} role="menuitem" className="hdr-mi">
                <Icon name="grid" size={18} />
                لوحة التحكم
              </Link>
            )}
            <span className="hdr-dd-sep" />
            <button type="button" role="menuitem" className="hdr-mi danger" onClick={handleLogout}>
              <Icon name="logout" size={18} />
              تسجيل الخروج
            </button>
          </div>
        )}

        {panel === 'notif' && user && (
          <div role="dialog" aria-label="الإشعارات" className="hdr-dd hdr-dd-notif">
            <b className="hdr-dd-title">الإشعارات</b>
            <div className="hdr-empty">
              <span className="hdr-empty-icon">
                <Icon name="bell" size={22} />
              </span>
              مفيش إشعارات جديدة دلوقتي
            </div>
          </div>
        )}
      </header>

      {panel === 'mobile' && (
        <div className="hdr-mobile">
          <nav aria-label="القائمة" className="hdr-mobile-nav">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className="hdr-mobile-link">
                {n.label}
                <Icon name="chevLeft" size={18} />
              </NavLink>
            ))}
          </nav>
          {!user && (
            <div className="hdr-mobile-auth">
              <Link to={routes.login} className="btn btn-outline btn-block">
                دخول
              </Link>
              <Link to={routes.register} className="btn btn-gold btn-block">
                {t('cta.startFree')}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
