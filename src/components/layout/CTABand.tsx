import { Link } from 'react-router-dom'
import { useCopy } from '@/auth/hooks'
import { Icon } from '@/components/ui/Icon'
import { routes } from '@/app/routes'
import './cta-band.css'

// TODO(Amr): WhatsApp number for the "كلّمنا على واتساب" button.
const WHATSAPP_URL = 'https://wa.me/'

export function CTABand({
  title = 'مش لاقي الدورة المناسبة؟',
  body = 'احكيلنا عن ابنك في استشارة قصيرة، والدكتور صالح يرشّحلك المسار اللي يناسبه.',
}: {
  title?: string
  body?: string
}) {
  const t = useCopy()
  return (
    <section className="section">
      <div className="inner cta-band bg-navy">
        <div className="dots cta-dots" aria-hidden="true" />
        <div className="spin-slow cta-ring" aria-hidden="true" />
        <div className="cta-text">
          <h2>{title}</h2>
          <p>{body}</p>
          <div className="cta-actions">
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn btn-gold btn-lg">
              كلّمنا على واتساب <Icon name="arrowLeft" />
            </a>
            <Link to={routes.consultation} className="btn btn-glass glass btn-lg">
              {t('cta.bookPrivate')}
            </Link>
          </div>
        </div>
        <img className="cta-portrait" src="/assets/brand/saleh-cutout.webp" alt="" aria-hidden="true" loading="lazy" />
      </div>
    </section>
  )
}
