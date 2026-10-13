import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiClientError } from '@/api/client'
import { coursesApi } from '@/api/endpoints'
import { useWishlist } from '@/api/wishlist'
import { useAuth, useCopy } from '@/auth/hooks'
import { routes } from '@/app/routes'
import { CourseCover } from '@/components/course/CourseCover'
import { CTABand } from '@/components/layout/CTABand'
import { Icon, type IconName } from '@/components/ui/Icon'
import { EmptyState, ErrorState, Spinner } from '@/components/ui/States'
import { coursePrice, durationLabel, formatDate, formatEGP, lessonsLabel } from '@/lib/format'
import { usePageTitle } from '@/lib/usePageTitle'
import type { Course, CourseReview, CourseSection } from '@/types/api'
import { NotFoundPage } from '@/pages/NotFoundPage'
import './course-details.css'

type Tab = 'info' | 'content' | 'reviews'

export function CourseDetailsPage() {
  const { id = '' } = useParams()
  const isUuid = /^[0-9a-f-]{36}$/i.test(id)
  const { data: course, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['courses', 'detail', id],
    queryFn: () => coursesApi.byId(id),
    enabled: isUuid,
    retry: (count, err) => !(err instanceof ApiClientError && err.statusCode === 404) && count < 2,
  })
  usePageTitle(course?.titleAr ?? 'الدورة')

  if (!isUuid || (error instanceof ApiClientError && error.statusCode === 404)) return <NotFoundPage />

  if (isError) {
    return (
      <div className="cd-state">
        <ErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  if (isLoading || !course) {
    return (
      <div className="cd-state">
        <Spinner />
      </div>
    )
  }

  return <CourseDetails course={course} />
}

function CourseDetails({ course }: { course: Course }) {
  const [tab, setTab] = useState<Tab>('info')
  const [showPromo, setShowPromo] = useState(false)
  const sections = useMemo(
    () =>
      [...(course.sections ?? [])]
        .filter((s) => s.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((s) => ({
          ...s,
          lessons: [...(s.lessons ?? [])].filter((l) => l.isActive).sort((a, b) => a.displayOrder - b.displayOrder),
        })),
    [course.sections],
  )
  const lessonsCount = course.lessonsCount ?? sections.reduce((n, s) => n + s.lessons.length, 0)
  const seconds =
    course.totalDurationSeconds ??
    sections.reduce((n, s) => n + s.lessons.reduce((m, l) => m + (l.videoDurationSeconds ?? 0), 0), 0)
  const category = course.category?.nameAr
  const [titleHead, ...titleTail] = course.titleAr.split(' ')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'info', label: 'معلومات الدورة' },
    { id: 'content', label: 'محتوى الدورة' },
    { id: 'reviews', label: 'التقييمات' },
  ]

  function goTo(t: Tab) {
    setTab(t)
    document.getElementById(`cd-${t}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <section className="cd-hero bg-navy">
        <div className="dots cd-hero-dots" aria-hidden="true" />
        <div className="cd-hero-inner">
          <nav aria-label="مسار الصفحة" className="phero-crumbs">
            <Link to={routes.home}>الرئيسية</Link> / <Link to={routes.courses}>الدورات</Link> /{' '}
            <span aria-current="page">{course.titleAr}</span>
          </nav>
          {category && (
            <span className="glass cd-chip">
              <span className="pulse hero-dot-sm" />
              {course.isFeatured ? 'الأكثر طلبًا · ' : ''}
              {category}
            </span>
          )}
          <h1 className="cd-title rise">
            {titleHead} <span className="g-text">{titleTail.join(' ')}</span>
          </h1>
          <p className="cd-lead rise d1">{course.shortDescriptionAr}</p>
          <div className="cd-meta rise d2">
            {course.ratingAverage != null && (
              <span>
                <b>{course.ratingAverage}</b> <span className="stars">★★★★★</span> ({course.ratingCount} تقييم)
              </span>
            )}
            {lessonsCount > 0 && (
              <span>
                <Icon name="video" size={16} /> {lessonsLabel(lessonsCount)}
              </span>
            )}
            {seconds > 0 && (
              <span>
                <Icon name="clock" size={16} /> {durationLabel(seconds)}
              </span>
            )}
            <span>
              <Icon name="calendar" size={16} /> آخر تحديث: {formatDate(course.updatedAt)}
            </span>
          </div>
          <div className="cd-author rise d3">
            <span className="cd-author-img">
              <img src="/assets/brand/saleh-cutout.webp" alt="" />
            </span>
            <span>
              <b>د. صالح عبد الكريم</b>
              <small>المستشار النفسي والتربوي</small>
            </span>
          </div>
        </div>
        <svg className="phero-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path className="wave-path" d="M0 40 C 360 100 1080 -20 1440 40 L1440 80 L0 80 Z" fill="#F6F8FB" />
        </svg>
      </section>

      <section className="section cd-body">
        <div className="inner cd-layout">
          <div className="cd-main">
            <div role="tablist" aria-label="أقسام الدورة" className="cd-tabs">
              {tabs.map((t) => (
                <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => goTo(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            <article id="cd-info" className="card cd-card">
              <h2>عن الدورة</h2>
              <div className="cd-desc">
                {(course.descriptionAr || course.shortDescriptionAr)
                  .split(/\n{1,}/)
                  .filter(Boolean)
                  .map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
              </div>
              {course.certificateEnabled && (
                <>
                  <h3>نتائج الدورة</h3>
                  <p className="cd-muted">
                    تحصل على شهادة معتمدة من المنصة بعد إتمام كل محتوى الدورة، تقدر تشاركها وتتحقق منها برقمها.
                  </p>
                </>
              )}
            </article>

            <article id="cd-content" className="card cd-card">
              <div className="cd-card-head">
                <h2>محتوى الدورة</h2>
                <span className="cd-muted">
                  {sections.length} أقسام · {lessonsLabel(lessonsCount)}
                  {seconds > 0 && <> · {durationLabel(seconds)}</>}
                </span>
              </div>
              {sections.length === 0 ? (
                <EmptyState compact icon="list" title="المحتوى بيتجهّز" body="الدروس هتظهر هنا أول ما تنزل." />
              ) : (
                <Curriculum sections={sections} onPreview={course.promoVideoUrl ? () => setShowPromo(true) : undefined} />
              )}
            </article>

            <Reviews course={course} />
          </div>

          <BuyCard course={course} lessonsCount={lessonsCount} seconds={seconds} onPreview={() => setShowPromo(true)} />
        </div>
      </section>

      <CTABand title="ابنك يستاهل بداية صح" body="لو محتار تبدأ بأنهي دورة، احكيلنا عن ابنك ونرشّحلك المسار المناسب." />

      {showPromo && course.promoVideoUrl && (
        <PromoModal url={course.promoVideoUrl} title={course.titleAr} onClose={() => setShowPromo(false)} />
      )}
    </>
  )
}

/* ---------------- curriculum ---------------- */

function Curriculum({
  sections,
  onPreview,
}: {
  sections: (CourseSection & { lessons: NonNullable<CourseSection['lessons']> })[]
  onPreview?: () => void
}) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(sections.slice(0, 2).map((s) => s.id)))
  const toggle = (id: string) =>
    setOpen((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="cd-sections">
      {sections.map((s) => {
        const isOpen = open.has(s.id)
        const secs = s.lessons.reduce((n, l) => n + (l.videoDurationSeconds ?? 0), 0)
        return (
          <div key={s.id} className={`cd-section${isOpen ? ' is-open' : ''}`}>
            <button type="button" className="cd-section-head" aria-expanded={isOpen} onClick={() => toggle(s.id)}>
              <span>
                <b>{s.titleAr}</b>
                <small>
                  {lessonsLabel(s.lessons.length)}
                  {secs > 0 && <> · {durationLabel(secs)}</>}
                </small>
              </span>
              <span className="cd-toggle" aria-hidden="true">
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && (
              <ul className="cd-lessons">
                {s.lessons.map((l) => (
                  <li key={l.id}>
                    <span className="cd-lesson-icon">
                      <Icon name={l.lessonType === 'PDF' ? 'file' : 'play'} size={14} filled={l.lessonType !== 'PDF'} />
                    </span>
                    <span className="cd-lesson-title">{l.titleAr}</span>
                    {l.isPreview && onPreview && (
                      <button type="button" className="cd-preview" onClick={onPreview}>
                        معاينة مجانية
                      </button>
                    )}
                    {!!l.videoDurationSeconds && <span className="cd-lesson-time">{clock(l.videoDurationSeconds)}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}

function clock(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/* ---------------- buy card ---------------- */

function BuyCard({
  course,
  lessonsCount,
  seconds,
  onPreview,
}: {
  course: Course
  lessonsCount: number
  seconds: number
  onPreview: () => void
}) {
  const { user } = useAuth()
  const t = useCopy()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const wishlist = useWishlist('COURSE')
  const [currency, setCurrency] = useState<'EGP' | 'USD'>('EGP')
  const [error, setError] = useState<string | null>(null)

  const owned = useQuery({
    queryKey: ['me', 'my-courses'],
    queryFn: () => api.get<{ courseId: string }[]>('/my-courses'),
    enabled: Boolean(user),
  })
  const isOwned = (owned.data ?? []).some((c) => c.courseId === course.id)

  const price = coursePrice(course)
  const usd = {
    current: course.discountPriceUSD != null && course.discountPriceUSD < course.priceUSD ? course.discountPriceUSD : course.priceUSD,
    old: course.discountPriceUSD != null && course.discountPriceUSD < course.priceUSD ? course.priceUSD : null,
  }
  const shown = currency === 'EGP' ? { current: price.current, old: price.old } : usd
  const fmt = (n: number) => (currency === 'EGP' ? formatEGP(n) : `$${n}`)

  const addToCart = useMutation({
    mutationFn: () => api.post('/cart/items', { itemType: 'COURSE', itemId: course.id, quantity: 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me', 'cart-summary'] }),
  })

  async function buy(goToCart: boolean) {
    setError(null)
    if (!user) {
      navigate(routes.login, { state: { from: routes.course(course.id) } })
      return
    }
    try {
      await addToCart.mutateAsync()
    } catch (e) {
      // Already in the cart is fine; anything else is shown.
      if (!(e instanceof ApiClientError && e.statusCode === 409)) {
        setError(e instanceof Error ? e.message : 'حصلت مشكلة، حاول تاني.')
        return
      }
    }
    if (goToCart) navigate(routes.cart)
  }

  const includes: { icon: IconName; text: string; show: boolean }[] = [
    { icon: 'video', text: `${seconds ? durationLabel(seconds) + ' فيديو في ' : ''}${lessonsLabel(lessonsCount)}`, show: lessonsCount > 0 },
    { icon: 'file', text: 'موارد وملفات PDF قابلة للتنزيل', show: true },
    { icon: 'refresh', text: 'تتبّع التقدم وكمّل من حيث وقفت', show: true },
    { icon: 'phone', text: 'الوصول من الموبايل ومدى الحياة', show: true },
    { icon: 'award', text: 'شهادة قابلة للمشاركة', show: Boolean(course.certificateEnabled) },
  ]

  return (
    <aside className="cd-buy" aria-label="الاشتراك في الدورة">
      <div className="cd-buy-cover">
        <CourseCover
          seed={course.categoryId || course.id}
          word={course.category?.nameAr ?? course.titleAr}
          image={course.thumbnailImage}
          tag={course.promoVideoUrl ? 'معاينة مجانية' : null}
          badge={price.discountPercent ? `خصم ${price.discountPercent}%` : null}
          height={210}
          wordSize={24}
        />
        {course.promoVideoUrl && (
          <button type="button" className="cd-play" aria-label="شغّل فيديو المعاينة" onClick={onPreview}>
            <Icon name="play" size={26} filled />
          </button>
        )}
      </div>

      {isOwned ? (
        <div className="cd-owned">
          <span className="alert alert-success">الدورة دي في حسابك بالفعل.</span>
          <Link to={routes.myCourses} className="btn btn-gold btn-lg btn-block">
            {t('cta.continue')}
          </Link>
        </div>
      ) : (
        <>
          <div className="cd-price">
            <b>{price.isFree && currency === 'EGP' ? 'مجانًا' : fmt(shown.current)}</b>
            {shown.old != null && <s>{fmt(shown.old)}</s>}
            {price.discountPercent > 0 && <span className="cd-off">خصم {price.discountPercent}%</span>}
          </div>
          <div className="cd-currency" role="radiogroup" aria-label="العملة">
            <button type="button" role="radio" aria-checked={currency === 'EGP'} onClick={() => setCurrency('EGP')}>
              جنيه مصري
            </button>
            <button type="button" role="radio" aria-checked={currency === 'USD'} onClick={() => setCurrency('USD')}>
              دولار أمريكي
            </button>
          </div>
          {error && <p className="alert alert-error">{error}</p>}
          <button type="button" className="btn btn-gold btn-lg btn-block" disabled={addToCart.isPending} onClick={() => buy(true)}>
            {addToCart.isPending ? <Spinner /> : 'اشتري الآن'}
          </button>
          <div className="cd-buy-row">
            <button
              type="button"
              className={`btn btn-outline cd-heart${wishlist.has(course.id) ? ' is-on' : ''}`}
              aria-pressed={wishlist.has(course.id)}
              aria-label={wishlist.has(course.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
              onClick={() => wishlist.toggle(course.id)}
            >
              <Icon name="heart" size={18} filled={wishlist.has(course.id)} />
            </button>
            <button type="button" className="btn btn-outline cd-grow" disabled={addToCart.isPending} onClick={() => buy(false)}>
              {addToCart.isSuccess ? (
                <>
                  <Icon name="check" size={18} /> اتضافت للسلة
                </>
              ) : (
                t('cta.addToCart')
              )}
            </button>
          </div>
          <div className="cd-pay" aria-label="طرق الدفع">
            <img src="/assets/payments/apple-pay.png" alt="Apple Pay" />
            <img src="/assets/payments/visa.svg" alt="Visa" />
            <img src="/assets/payments/mastercard.png" alt="Mastercard" />
            <img src="/assets/payments/vodafone-cash.png" alt="Vodafone Cash" />
            <img src="/assets/payments/paypal.png" alt="PayPal" />
          </div>
        </>
      )}

      <div className="cd-includes">
        <b>الدورة تتضمن:</b>
        <ul>
          {includes
            .filter((i) => i.show)
            .map((i) => (
              <li key={i.text}>
                <span>
                  <Icon name={i.icon} size={16} />
                </span>
                {i.text}
              </li>
            ))}
        </ul>
      </div>
    </aside>
  )
}

/* ---------------- reviews ---------------- */

function Reviews({ course }: { course: Course }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [writing, setWriting] = useState(false)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['courses', 'reviews', course.id],
    queryFn: () => coursesApi.reviews(course.id, 1, 50),
  })
  const reviews = data?.reviews ?? []
  const total = data?.pagination.total ?? 0
  const avg = course.ratingAverage ?? (reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0)
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: reviews.length ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100) : 0,
  }))

  return (
    <article id="cd-reviews" className="card cd-card">
      <h2>التقييمات</h2>
      {isError ? (
        <ErrorState compact onRetry={() => refetch()} />
      ) : isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="cd-rating">
            <div className="cd-rating-big">
              <b>{total ? avg.toFixed(1) : '—'}</b>
              <span className="stars">★★★★★</span>
              <small>{total} تقييم</small>
            </div>
            <div className="cd-bars">
              {dist.map((d) => (
                <div key={d.star} className="cd-bar">
                  <span>{d.star}</span>
                  <span className="stars">★</span>
                  <span className="cd-bar-track">
                    <span style={{ width: `${d.pct}%` }} />
                  </span>
                  <span className="cd-bar-pct">{d.pct}%</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-navy"
              onClick={() => (user ? setWriting((w) => !w) : navigate(routes.login, { state: { from: routes.course(course.id) } }))}
            >
              اكتب تقييم
            </button>
          </div>

          {writing && <ReviewForm courseId={course.id} onDone={() => setWriting(false)} />}

          {reviews.length === 0 ? (
            <p className="cd-muted cd-no-reviews">لسه مفيش تقييمات للدورة دي.</p>
          ) : (
            <ul className="cd-review-list">
              {reviews.slice(0, 6).map((r) => (
                <ReviewItem key={r.id} review={r} />
              ))}
            </ul>
          )}
        </>
      )}
    </article>
  )
}

function ReviewItem({ review }: { review: CourseReview }) {
  const name = review.user?.fullName ?? 'متدرب'
  return (
    <li className="cd-review">
      <span className="cd-review-av" aria-hidden="true">
        {name.charAt(0)}
      </span>
      <div>
        <div className="cd-review-head">
          <b>{name}</b>
          <span className="stars" aria-label={`${review.rating} من 5`}>
            {'★'.repeat(review.rating)}
            <span className="stars-off">{'★'.repeat(5 - review.rating)}</span>
          </span>
          <small>{formatDate(review.createdAt)}</small>
        </div>
        {review.title && <b className="cd-review-title">{review.title}</b>}
        {review.comment && <p>{review.comment}</p>}
      </div>
    </li>
  )
}

function ReviewForm({ courseId, onDone }: { courseId: string; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const mutation = useMutation({
    mutationFn: () => api.post(`/courses/${courseId}/reviews`, { rating, comment: comment.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'reviews', courseId] })
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', courseId] })
      onDone()
    },
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <form className="cd-review-form" onSubmit={submit}>
      <div className="cd-stars-input" role="radiogroup" aria-label="التقييم">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} نجوم`} onClick={() => setRating(n)}>
            <Icon name="star" size={26} filled={n <= rating} />
          </button>
        ))}
      </div>
      <label className="form-field">
        <span className="form-label">رأيك في الدورة (اختياري)</span>
        <textarea className="input" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} />
      </label>
      {mutation.isError && <p className="alert alert-error">{(mutation.error as Error).message}</p>}
      <div className="cd-form-actions">
        <button type="submit" className="btn btn-navy" disabled={mutation.isPending}>
          {mutation.isPending ? <Spinner /> : 'نشر التقييم'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onDone}>
          إلغاء
        </button>
      </div>
    </form>
  )
}

/* ---------------- promo video ---------------- */

function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0` : null
}

function PromoModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const yt = youtubeEmbed(url)
  return (
    <div className="cd-modal" role="dialog" aria-modal="true" aria-label={`معاينة: ${title}`} onClick={onClose}>
      <div className="cd-modal-box" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="cd-modal-close" aria-label="إغلاق" onClick={onClose} autoFocus>
          <Icon name="close" />
        </button>
        {yt ? (
          <iframe src={yt} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        ) : (
          <video src={url} controls autoPlay playsInline />
        )}
      </div>
    </div>
  )
}
