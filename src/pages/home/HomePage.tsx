import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { articlesApi, booksApi, coursesApi } from '@/api/endpoints'
import { resolveAssetUrl } from '@/api/client'
import { useAudience, useCopy } from '@/auth/hooks'
import { routes } from '@/app/routes'
import { Icon, type IconName } from '@/components/ui/Icon'
import { CourseCard, CourseCardSkeleton } from '@/components/course/CourseCard'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { formatDate, formatEGP, minutesLabel, readingMinutes } from '@/lib/format'
import { Highlight } from '@/components/ui/Highlight'
import { usePageTitle } from '@/lib/usePageTitle'
import type { Book, CourseSummary } from '@/types/api'
import { CHANNELS } from './channels'
import './home.css'

const HERO_WORDS = {
  guest: ['فهم أولادكم', 'قلب ابنكم', 'هدوءكم إنتم'],
  male: ['فهم طفلك', 'قلب ابنك', 'هدوءك إنت'],
  female: ['فهم طفلك', 'قلب ابنك', 'هدوءك إنتي'],
}

const PILLARS: { to: string; title: string; body: string; icon: IconName; grad: string; glow: string }[] = [
  {
    to: routes.courses,
    title: 'الدورات المسجلة',
    body: 'فيديوهات وملفات PDF وشهادة بعد الإتمام، وتقدر تكمل من أي جهاز.',
    icon: 'video',
    grad: 'var(--grad-navy)',
    glow: '#1E5F96',
  },
  {
    to: routes.library,
    title: 'المكتبة',
    body: 'كتب ورقية بتوصل لحد باب البيت، ونسخ رقمية وصوتية فورية.',
    icon: 'book',
    grad: 'linear-gradient(135deg, #1E5F96 0%, #3D9BD8 50%, #7CD3FF 100%)',
    glow: '#3D9BD8',
  },
  {
    to: routes.consultation,
    title: 'استشارات خاصة',
    body: 'جلسة فردية تناقش فيها مشكلة ابنك بالتفصيل، بسرية تامة.',
    icon: 'chat',
    grad: 'linear-gradient(135deg, #E8A33D 0%, #F2B856 50%, #F7CF7E 100%)',
    glow: '#E8A33D',
  },
  {
    to: routes.blog,
    title: 'مقالات مجانية',
    body: 'نصائح عملية قصيرة في التربية وعلم النفس، تتجدد كل أسبوع.',
    icon: 'pen',
    grad: 'linear-gradient(135deg, #3B3A8F 0%, #5B5BD6 50%, #4BA9DE 100%)',
    glow: '#5B5BD6',
  },
]

const BOOK_THEMES = [
  { shelf: '#EAF3FA', grad: 'linear-gradient(135deg, #0B2E52 0%, #1E5F96 55%, #3D9BD8 100%)' },
  { shelf: '#FDF3E1', grad: 'linear-gradient(135deg, #E8A33D 0%, #F2B856 50%, #F7CF7E 100%)' },
  { shelf: '#E6F4FC', grad: 'linear-gradient(135deg, #1E5F96 0%, #3D9BD8 50%, #7CD3FF 100%)' },
  { shelf: '#EEEBFB', grad: 'linear-gradient(135deg, #3B3A8F 0%, #5B5BD6 50%, #F2A7C3 100%)' },
]

const FORMAT_LABEL = { Physical: 'ورقي', Digital: 'رقمي', Audio: 'صوتي' } as const

// TODO(Amr): real testimonials. The section stays hidden until there are some,
// so the site never shows made-up reviews.
const TESTIMONIALS: { head: string; body: string; name: string; course: string }[] = []

export function HomePage() {
  usePageTitle()
  return (
    <>
      <Hero />
      <MediaStrip />
      <Pillars />
      <CoursesSection />
      <StatsBand />
      <AboutDoctor />
      <BooksSection />
      <ConsultBand />
      {TESTIMONIALS.length > 0 && <Testimonials />}
      <ArticlesSection />
    </>
  )
}

/* ---------------- hero ---------------- */

function Hero() {
  const t = useCopy()
  const audience = useAudience()
  const words = HERO_WORDS[audience]
  const [w, setW] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setW((x) => (x + 1) % words.length), 2600)
    return () => clearInterval(id)
  }, [words.length])

  const { data: home } = useQuery({ queryKey: ['courses', 'home'], queryFn: coursesApi.home })
  const proof = useMemo(() => ratingSummary(home ?? []), [home])
  const lastCourse = home?.[0]

  return (
    <section className="hero bg-navy">
      <div className="dots hero-dots" aria-hidden="true" />
      <div className="orb" style={{ width: 420, height: 420, background: '#4BA9DE', top: -120, left: -80 }} />
      <div
        className="orb"
        style={{ width: 360, height: 360, background: '#F7CF7E', bottom: -160, left: '30%', opacity: 0.35, animationDelay: '-5s' }}
      />
      <div
        className="orb"
        style={{ width: 300, height: 300, background: '#7E5BD9', top: '20%', right: -120, opacity: 0.3, animationDelay: '-8s' }}
      />

      <div className="hero-inner">
        <div className="hero-text">
          <div className="glass rise hero-chip">
            <span className="pulse hero-dot" />
            المستشار النفسي والتربوي · دورات · كتب · استشارات
          </div>
          <h1 className="rise d1 hero-title">
            تربية واعية
            <br />
            تبدأ من{' '}
            <span className="g-text" aria-live="polite">
              {words[w]}
            </span>
            <span className="caret" aria-hidden="true" />
          </h1>
          <p className="rise d2 hero-body">{t('home.hero.body')}</p>
          <div className="rise d3 hero-ctas">
            <Link to={routes.courses} className="btn btn-gold btn-lg">
              {t('cta.start')}
              <Icon name="arrowLeft" />
            </Link>
            <Link to={routes.consultation} className="btn btn-glass glass btn-lg">
              {t('cta.bookPrivate')}
            </Link>
          </div>
          <div className="rise d4 hero-proof">
            {proof && (
              <>
                <div className="hero-proof-item">
                  <div className="hero-avatars" aria-hidden="true">
                    <span style={{ background: 'linear-gradient(135deg, #CFE3F3, #7CC0EC)' }} />
                    <span style={{ background: 'linear-gradient(135deg, #FBE3B5, #E8A33D)' }} />
                    <span style={{ background: 'linear-gradient(135deg, #D9D0F5, #8E7BE0)' }} />
                  </div>
                  <div className="hero-proof-text">
                    <b>
                      {proof.average} <span className="stars">★★★★★</span>
                    </b>
                    <span>من {proof.count} تقييم للمتدربين</span>
                  </div>
                </div>
                <span className="hero-proof-sep" />
              </>
            )}
            <div className="hero-proof-text">
              <b>شهادة معتمدة</b>
              <span>بعد إتمام كل دورة</span>
            </div>
          </div>
        </div>

        <div className="rise d2 hero-visual" aria-hidden="true">
          <div className="spin-slow hero-halo" />
          <div className="hero-arch">
            <img className="hero-watermark" src="/assets/brand/logo-white.webp" alt="" />
            <img className="hero-portrait" src="/assets/brand/saleh-cutout.webp" alt="" fetchPriority="high" />
          </div>
          {lastCourse && (
            <div className="float hero-card hero-card-progress">
              <div className="hero-card-row">
                <span className="hero-card-icon bg-navy">
                  <Icon name="play" size={18} filled />
                </span>
                <div className="hero-card-col">
                  <span className="muted">دورة مميزة</span>
                  <b>{lastCourse.titleAr}</b>
                </div>
              </div>
              <span className="muted">فيديو + PDF + شهادة</span>
            </div>
          )}
          <div className="float d2 hero-card hero-card-book">
            <span className="hero-card-icon gold">
              <Icon name="bookClosed" size={22} />
            </span>
            <div className="hero-card-col">
              <b>فن تربية الأبناء</b>
              <span className="muted">ورقي · رقمي · صوتي</span>
            </div>
          </div>
          {proof && (
            <div className="glass float hero-rating" style={{ animationDelay: '-1.5s' }}>
              <span>★</span> {proof.average} تقييم
            </div>
          )}
        </div>
      </div>

      <svg className="hero-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path className="wave-path" d="M0 40 C 360 100 1080 -20 1440 40 L1440 80 L0 80 Z" fill="#F6F8FB" />
      </svg>
    </section>
  )
}

function ratingSummary(courses: CourseSummary[]) {
  let sum = 0
  let count = 0
  for (const c of courses) {
    if (c.ratingAverage != null && c.ratingCount) {
      sum += c.ratingAverage * c.ratingCount
      count += c.ratingCount
    }
  }
  if (!count) return null
  return { average: (Math.round((sum / count) * 10) / 10).toFixed(1), count }
}

/* ---------------- media strip ---------------- */

function MediaStrip() {
  const doubled = [...CHANNELS, ...CHANNELS]
  return (
    <section className="media" aria-labelledby="media-title">
      <div className="container reveal media-head">
        <h2 id="media-title" className="section-title media-title">
          ضيف على <span className="g-ink uline">شاشات وإذاعات عربية</span>
        </h2>
      </div>
      <div className="marquee media-marquee">
        <div className="marquee-track media-track">
          {doubled.map((c, i) => (
            <span className="media-logo" key={`${c.src}-${i}`} aria-hidden={i >= CHANNELS.length || undefined}>
              <img src={c.src} alt={i < CHANNELS.length ? c.name : ''} loading="lazy" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- pillars ---------------- */

function Pillars() {
  return (
    <section className="section">
      <div className="inner stagger pillars">
        {PILLARS.map((p) => (
          <Link key={p.to} to={p.to} className="pillar glow-card">
            <div className="pillar-glow" style={{ background: p.glow }} aria-hidden="true" />
            <span className="pillar-icon" style={{ background: p.grad, boxShadow: `0 12px 24px -10px ${p.glow}` }}>
              <Icon name={p.icon} size={26} />
            </span>
            <span className="pillar-title">{p.title}</span>
            <span className="pillar-body">{p.body}</span>
            <span className="pillar-more">
              اكتشف <Icon name="arrowLeft" size={16} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ---------------- courses ---------------- */

function CoursesSection() {
  const t = useCopy()
  const [tab, setTab] = useState<string>('all')
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['courses', 'home'], queryFn: coursesApi.home })

  const courses = useMemo(() => data ?? [], [data])
  const categories = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of courses) if (c.category) map.set(c.category.id, c.category.nameAr)
    return [...map]
  }, [courses])
  const shown = courses.filter((c) => tab === 'all' || c.categoryId === tab).slice(0, 3)

  return (
    <section className="section">
      <div className="inner">
        <div className="section-head">
          <div className="title-wrap reveal">
            <span className="eyebrow">
              <Icon name="sparkle" size={16} />
              الأكثر طلبًا
            </span>
            <h2 className="section-title">
              <Highlight text={t('home.courses.title')} />
            </h2>
          </div>
          <Link to={routes.courses} className="more-link">
            كل الدورات <Icon name="arrowLeft" size={18} />
          </Link>
        </div>

        {categories.length > 1 && (
          <div role="tablist" aria-label="تصنيف الدورات" className="pill-tabs home-tabs">
            {[['all', 'الكل'] as const, ...categories].map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className="pill-tab"
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="course-grid">
            {[0, 1, 2].map((i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState icon="video" title="الدورات جاية قريب" body="بنجهّز أول دفعة من الدورات. تابعنا عشان تعرف أول ما تنزل." />
        ) : (
          <div className="course-grid stagger">
            {shown.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------------- stats ---------------- */

function useCountUp(target: number, run: boolean) {
  const [k, setK] = useState(0)
  useEffect(() => {
    if (!run) return
    const t0 = performance.now()
    let raf = 0
    const step = (now: number) => {
      const x = Math.min(1, (now - t0) / 1800)
      setK(1 - Math.pow(1 - x, 3))
      if (x < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [run])
  return target * k
}

function StatsBand() {
  const courses = useQuery({ queryKey: ['courses', 'list', { limit: 100 }], queryFn: () => coursesApi.list({ limit: 100 }) })
  const books = useQuery({ queryKey: ['books'], queryFn: booksApi.list })

  const ready = courses.isSuccess && books.isSuccess
  const totalCourses = courses.data?.pagination.total ?? 0
  const totalBooks = (books.data ?? []).filter((b) => b.isActive).length
  const rating = ratingSummary(courses.data?.courses ?? [])

  const nBooks = useCountUp(totalBooks, ready)
  const nCourses = useCountUp(totalCourses, ready)
  const nReviews = useCountUp(rating?.count ?? 0, ready)
  const nAvg = useCountUp(rating ? Number(rating.average) : 0, ready)

  if (!ready || (!totalCourses && !totalBooks)) return null

  const stats: { n: string; suf?: string; label: string; icon: IconName; show: boolean }[] = [
    { n: nAvg.toFixed(1), suf: '★', label: 'متوسط تقييم الدورات', icon: 'star', show: Boolean(rating) },
    { n: String(Math.round(nReviews)), label: 'تقييم من المتدربين', icon: 'quote', show: Boolean(rating) },
    { n: String(Math.round(nCourses)), label: 'دورات مسجّلة بشهادة', icon: 'video', show: totalCourses > 0 },
    { n: String(Math.round(nBooks)), label: 'كتب ورقية ورقمية وصوتية', icon: 'book', show: totalBooks > 0 },
  ]

  return (
    <section className="section">
      <div className="inner stats bg-navy-wide">
        <div className="dots stats-dots" aria-hidden="true" />
        <div className="orb" style={{ width: 260, height: 260, background: '#F7CF7E', right: -60, top: -120, opacity: 0.3 }} />
        {stats
          .filter((s) => s.show)
          .map((s) => (
            <div key={s.label} className="stat">
              <span className="glass stat-icon">
                <Icon name={s.icon} size={22} />
              </span>
              <span className="stat-n">
                {s.n}
                {s.suf && <span>{s.suf}</span>}
              </span>
              <span className="stat-l">{s.label}</span>
            </div>
          ))}
      </div>
    </section>
  )
}

/* ---------------- about ---------------- */

function AboutDoctor() {
  const t = useCopy()
  return (
    <section className="section">
      <div className="inner gborder about">
        <div className="tilt about-photo">
          <div className="spin-slow about-ring" aria-hidden="true" />
          <img src="/assets/brand/saleh-cutout.webp" alt="الدكتور صالح عبد الكريم" loading="lazy" />
        </div>
        <div className="about-text">
          <span className="eyebrow">
            <Icon name="user" size={16} />
            عن الدكتور
          </span>
          <img className="about-sign" src="/assets/brand/logo-blue.webp" alt="الدكتور صالح عبد الكريم" loading="lazy" />
          <p className="about-quote">
            «مش مطلوب إن ابنك يكون مثالي… المطلوب إنه يكون <span className="g-ink">سوي، واثق في نفسه</span>، وقادر يتكيّف مع
            الدنيا.»
          </p>
          <p className="about-body">
            مؤلف كتاب «فن تربية الأبناء»، وبيقدّم برامج في التربية الإيجابية والبناء النفسي للأطفال والمراهقين بأسلوب عملي مبسّط
            تقدر تطبقه في البيت.
          </p>
          <ul className="stagger about-list">
            <li>
              <span className="bg-navy">
                <Icon name="check" size={16} />
              </span>
              المستشار النفسي والتربوي
            </li>
            <li>
              <span className="bg-navy">
                <Icon name="check" size={16} />
              </span>
              رئيس مركز السعادة للاستشارات النفسية والتربوية
            </li>
            <li>
              <span className="bg-gold gold">
                <Icon name="video" size={16} />
              </span>
              مقدّم برنامج «فن التربية» على قناة الرحمة
            </li>
          </ul>
          <Link to={routes.consultation} className="btn btn-navy about-cta">
            {t('cta.bookDoctor')}
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ---------------- books ---------------- */

function bookStartPrice(book: Book): number | null {
  const prices = book.formats
    .filter((f) => f.isActive)
    .map((f) => f.discountPriceEGP ?? f.priceEGP)
    .filter((p): p is number => typeof p === 'number')
  if (prices.length) return Math.min(...prices)
  return book.discountPriceEGP ?? book.priceEGP ?? null
}

function BooksSection() {
  const t = useCopy()
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['books'], queryFn: booksApi.list })

  const books = useMemo(() => {
    const active = (data ?? []).filter((b) => b.isActive)
    const home = active.filter((b) => b.isHomeDisplay)
    return (home.length ? home : active).slice(0, 4)
  }, [data])

  if (!isLoading && !isError && books.length === 0) return null

  return (
    <section className="section">
      <div className="inner">
        <div className="section-head">
          <div className="title-wrap reveal">
            <span className="eyebrow">
              <Icon name="book" size={16} />
              من المكتبة
            </span>
            <h2 className="section-title">
              <Highlight text={t('home.books.title')} />
            </h2>
          </div>
          <Link to={routes.library} className="more-link">
            تصفّح المكتبة <Icon name="arrowLeft" size={18} />
          </Link>
        </div>

        {isError ? (
          <ErrorState onRetry={() => refetch()} compact />
        ) : (
          <div className="books-grid">
            {isLoading
              ? [0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 380, borderRadius: 24 }} />)
              : books.map((b, i) => <BookCard key={b.id} book={b} theme={BOOK_THEMES[i % BOOK_THEMES.length]} />)}
          </div>
        )}
      </div>
    </section>
  )
}

function BookCard({ book, theme }: { book: Book; theme: (typeof BOOK_THEMES)[number] }) {
  const cover = resolveAssetUrl(book.coverImage)
  const price = bookStartPrice(book)
  const formats = [...new Set(book.formats.filter((f) => f.isActive).map((f) => f.formatType))]
  return (
    <Link to={`${routes.library}/${book.slug}`} className="book-card glow-card">
      <div className="book-shelf" style={{ background: theme.shelf }}>
        {cover ? (
          <img className="tilt book-img" src={cover} alt="" loading="lazy" />
        ) : (
          <div className="tilt book-spine" style={{ background: theme.grad }}>
            <span className="book-spine-line" />
            <span className="book-spine-title">{book.titleAr}</span>
            <span className="book-spine-author">د. صالح عبد الكريم</span>
          </div>
        )}
      </div>
      <div className="book-info">
        <span className="book-title">{book.titleAr}</span>
        {formats.length > 0 && (
          <div className="book-formats">
            {formats.map((f) => (
              <span key={f}>{FORMAT_LABEL[f]}</span>
            ))}
          </div>
        )}
        {price !== null && (
          <span className="book-price">
            يبدأ من <b>{formatEGP(price)}</b>
          </span>
        )}
      </div>
    </Link>
  )
}

/* ---------------- consultation band ---------------- */

function ConsultBand() {
  const t = useCopy()
  const steps = [t('home.consult.step1'), t('home.consult.step2'), 'جلسة خاصة مع د. صالح وخطة عملية']
  return (
    <section className="section">
      <div className="inner consult bg-navy">
        <div className="dots consult-dots" aria-hidden="true" />
        <div className="orb" style={{ width: 340, height: 340, background: '#F7CF7E', left: -100, bottom: -160, opacity: 0.35 }} />
        <div className="spin-slow consult-ring" aria-hidden="true" />
        <div className="consult-text">
          <span className="eyebrow on-dark">
            <Icon name="chat" size={16} />
            استشارة فردية
          </span>
          <h2>{t('home.consult.title')}</h2>
          <p>{t('home.consult.body')}</p>
          <Link to={routes.consultation} className="btn btn-gold btn-lg">
            {t('cta.bookNow')}
          </Link>
        </div>
        <ol className="consult-steps">
          {steps.map((s, i) => (
            <li key={s} className="glass lift">
              <span className="consult-n">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- testimonials ---------------- */

function Testimonials() {
  const [i, setI] = useState(0)
  const n = TESTIMONIALS.length
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % n), 6000)
    return () => clearInterval(id)
  }, [n])
  const rv = TESTIMONIALS[i]
  return (
    <section className="section">
      <div className="inner">
        <div className="section-head center">
          <div className="title-wrap">
            <span className="eyebrow">
              <Icon name="quote" size={16} />
              آراء المتدربين
            </span>
            <h2 className="section-title">
              فرق <span className="g-ink uline">حقيقي</span> في البيت
            </h2>
          </div>
        </div>
        <div className="reviews">
          <figure className="gborder review-main">
            <span className="review-head">{rv.head}</span>
            <blockquote>{rv.body}</blockquote>
            <figcaption>
              <b>{rv.name}</b>
              <span>{rv.course}</span>
            </figcaption>
            <div className="review-nav">
              <button type="button" className="btn btn-outline btn-sm" aria-label="السابق" onClick={() => setI((i + n - 1) % n)}>
                <Icon name="arrowRight" size={16} />
              </button>
              <button type="button" className="btn btn-navy btn-sm" aria-label="التالي" onClick={() => setI((i + 1) % n)}>
                <Icon name="arrowLeft" size={16} />
              </button>
            </div>
          </figure>
          <div className="review-list">
            {TESTIMONIALS.map((r, k) => (
              <button key={r.head} type="button" className={`review-pick${k === i ? ' is-on' : ''}`} onClick={() => setI(k)}>
                <b>{r.head}</b>
                <span>{r.course}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- articles ---------------- */

const ARTICLE_GRADS = [
  'linear-gradient(135deg, #1E5F96 0%, #3D9BD8 55%, #7CD3FF 100%)',
  'linear-gradient(135deg, #E8A33D 0%, #F2B856 50%, #F7CF7E 100%)',
  'linear-gradient(135deg, #0B2E52 0%, #5B5BD6 60%, #F2A7C3 100%)',
]

function ArticlesSection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['articles', { page: 1, limit: 3 }],
    queryFn: () => articlesApi.list({ page: 1, limit: 3 }),
  })
  const articles = data?.articles ?? []
  if (isError || (!isLoading && articles.length === 0)) return null

  return (
    <section className="section">
      <div className="inner">
        <div className="section-head">
          <div className="title-wrap reveal">
            <span className="eyebrow">
              <Icon name="pen" size={16} />
              أحدث المقالات
            </span>
            <h2 className="section-title">اقرأ في ٥ دقايق</h2>
          </div>
          <Link to={routes.blog} className="more-link">
            كل المقالات <Icon name="arrowLeft" size={18} />
          </Link>
        </div>
        <div className="articles-grid">
          {isLoading
            ? [0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 24 }} />)
            : articles.map((a, i) => {
                const cover = resolveAssetUrl(a.coverImage)
                return (
                  <Link key={a.id} to={`${routes.blog}/${a.slug}`} className="article-card glow-card">
                    <div className="article-cover" style={{ background: ARTICLE_GRADS[i % ARTICLE_GRADS.length] }}>
                      {cover ? <img src={cover} alt="" loading="lazy" /> : <div className="dots" />}
                      {a.category && <span className="glass article-tag">{a.category.name}</span>}
                    </div>
                    <div className="article-meta">
                      <span>
                        <Icon name="calendar" size={15} />
                        {formatDate(a.createdAt)}
                      </span>
                      <span>
                        <Icon name="clock" size={15} />
                        {minutesLabel(readingMinutes(a.content ?? a.shortContent))}
                      </span>
                    </div>
                    <h3 className="article-title">{a.title}</h3>
                  </Link>
                )
              })}
        </div>
      </div>
    </section>
  )
}
