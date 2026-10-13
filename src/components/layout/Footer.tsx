import { Link } from 'react-router-dom'
import { Icon, type IconName } from '@/components/ui/Icon'
import { routes } from '@/app/routes'
import './footer.css'

const PLATFORM = [
  { to: routes.about, label: 'عن د. صالح' },
  { to: routes.courses, label: 'الدورات' },
  { to: routes.library, label: 'المكتبة' },
  { to: routes.store, label: 'المتجر' },
  { to: routes.blog, label: 'المقالات' },
  { to: routes.consultation, label: 'احجز استشارة' },
]

const ACCOUNT = [
  { to: routes.myCourses, label: 'دوراتي' },
  { to: routes.myBooks, label: 'كتبي وشهاداتي' },
  { to: routes.orders, label: 'طلباتي' },
  { to: routes.referral, label: 'ادعُ صديق واكسب' },
]

// TODO(Amr): real social links and phone numbers.
const SOCIAL: { label: string; icon: IconName; href: string }[] = [
  { label: 'فيسبوك', icon: 'facebook', href: '#' },
  { label: 'إنستجرام', icon: 'instagram', href: '#' },
  { label: 'يوتيوب', icon: 'youtube', href: '#' },
  { label: 'تيك توك', icon: 'tiktok', href: '#' },
]

const CONTACT: { label: string; icon: IconName }[] = [
  { label: 'من داخل مصر: [رقم الهاتف]', icon: 'phone' },
  { label: 'من خارج مصر: [رقم دولي]', icon: 'globe' },
  { label: 'واتساب: [رقم واتساب]', icon: 'whatsapp' },
]

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="dots footer-dots" aria-hidden="true" />
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/assets/brand/logo-white.webp" alt="الدكتور صالح عبد الكريم" width={200} height={90} />
          <p>منصة تعليمية في التربية الإيجابية والبناء النفسي للأطفال والمراهقين: دورات، كتب، واستشارات خاصة.</p>
          <div className="footer-social">
            {SOCIAL.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label} className="glass">
                <Icon name={s.icon} size={18} />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="المنصة" className="footer-col">
          <b>المنصة</b>
          {PLATFORM.map((l) => (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="حسابي" className="footer-col">
          <b>حسابي</b>
          {ACCOUNT.map((l) => (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="footer-col">
          <b>تواصل معنا</b>
          {CONTACT.map((c) => (
            <span key={c.label} className="footer-contact">
              <span className="glass">
                <Icon name={c.icon} size={16} />
              </span>
              {c.label}
            </span>
          ))}
          <Link to={routes.contact} className="footer-more">
            كل طرق التواصل <Icon name="arrowLeft" size={16} />
          </Link>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {year} منصة د. صالح عبد الكريم. جميع الحقوق محفوظة.</span>
        <nav aria-label="روابط قانونية">
          <Link to={routes.verifyCertificate}>التحقق من شهادة</Link>
          <Link to={routes.terms}>الشروط والأحكام</Link>
          <Link to={routes.refunds}>سياسة الاسترداد</Link>
          <Link to={routes.privacy}>سياسة الخصوصية</Link>
        </nav>
      </div>
    </footer>
  )
}
