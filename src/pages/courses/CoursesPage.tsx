import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { coursesApi } from '@/api/endpoints'
import { useWishlist } from '@/api/wishlist'
import { useCopy } from '@/auth/hooks'
import { routes } from '@/app/routes'
import { PageHero } from '@/components/layout/PageHero'
import { CTABand } from '@/components/layout/CTABand'
import { CourseCard, CourseCardSkeleton } from '@/components/course/CourseCard'
import { Icon } from '@/components/ui/Icon'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { usePageTitle } from '@/lib/usePageTitle'
import './courses.css'

const PAGE_SIZE = 9

export function CoursesPage() {
  usePageTitle('الدورات')
  const t = useCopy()
  const [params, setParams] = useSearchParams()
  const search = params.get('q') ?? ''
  const categoryId = params.get('cat') ?? ''
  const page = Math.max(1, Number(params.get('page')) || 1)

  // The input follows the URL (back/forward, clear filters) but stays editable.
  const [draft, setDraft] = useState(search)
  const [lastSearch, setLastSearch] = useState(search)
  if (lastSearch !== search) {
    setLastSearch(search)
    setDraft(search)
  }

  const query = { page, limit: PAGE_SIZE, search: search || undefined, categoryId: categoryId || undefined }
  const list = useQuery({
    queryKey: ['courses', 'list', query],
    queryFn: () => coursesApi.list(query),
    placeholderData: keepPreviousData,
  })
  const categories = useQuery({ queryKey: ['courses', 'categories'], queryFn: coursesApi.categories, staleTime: 10 * 60_000 })
  const total = useQuery({ queryKey: ['courses', 'list', { limit: 1 }], queryFn: () => coursesApi.list({ limit: 1 }) })
  const wishlist = useWishlist('COURSE')

  function update(next: Record<string, string | null>) {
    const p = new URLSearchParams(params)
    for (const [k, v] of Object.entries(next)) {
      if (v) p.set(k, v)
      else p.delete(k)
    }
    setParams(p)
  }

  function onSearch(e: FormEvent) {
    e.preventDefault()
    update({ q: draft.trim() || null, page: null })
  }

  const courses = list.data?.courses ?? []
  const pagination = list.data?.pagination
  const totalCount = total.data?.pagination.total
  const filtered = Boolean(search || categoryId)

  return (
    <>
      <PageHero
        crumbs={[{ label: 'الرئيسية', to: routes.home }, { label: 'الدورات' }]}
        eyebrow={
          totalCount ? (
            <>
              <span className="pulse hero-dot-sm" />
              {totalCount} دورات مسجّلة بشهادة
            </>
          ) : undefined
        }
        title={
          <>
            دورات تبني <span className="g-text">شخصية ابنك</span>
          </>
        }
        body={t('courses.hero.body')}
      >
        <form className="cq-search" role="search" onSubmit={onSearch}>
          <label className="cq-field">
            <Icon name="search" />
            <span className="sr-only">ابحث عن دورة</span>
            <input
              type="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="ابحث عن دورة في التربية أو تطوير الذات…"
            />
          </label>
          <span className="cq-chip blue">
            <Icon name="video" size={18} /> فيديو + PDF
          </span>
          <span className="cq-chip gold">
            <Icon name="award" size={18} /> شهادة لكل دورة
          </span>
          <button type="submit" className="btn btn-navy">
            بحث
          </button>
        </form>
      </PageHero>

      <section className="section cq-body">
        <div className="inner cq-layout">
          <aside className="cq-side" aria-label="تصفية النتائج">
            <div className="card cq-filter">
              <div className="cq-filter-head">
                <b>تصفية النتائج</b>
                {filtered && (
                  <button type="button" className="cq-clear" onClick={() => setParams(new URLSearchParams())}>
                    مسح
                  </button>
                )}
              </div>
              <span className="cq-group">التصنيف</span>
              <div className="cq-cats" role="radiogroup" aria-label="التصنيف">
                <button
                  type="button"
                  role="radio"
                  aria-checked={!categoryId}
                  className="cq-cat"
                  onClick={() => update({ cat: null, page: null })}
                >
                  كل الدورات
                </button>
                {(categories.data ?? []).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={categoryId === c.id}
                    className="cq-cat"
                    onClick={() => update({ cat: c.id, page: null })}
                  >
                    {c.nameAr}
                  </button>
                ))}
              </div>
            </div>

            <div className="cq-help">
              <b>مش عارف تبدأ بإيه؟</b>
              <p>اطلب استشارة قصيرة ونرشّحلك المسار المناسب لابنك.</p>
              <Link to={routes.consultation}>
                {t('cta.bookNow')} <Icon name="arrowLeft" size={16} />
              </Link>
              <img src="/assets/brand/saleh-cutout.webp" alt="" aria-hidden="true" loading="lazy" />
            </div>
          </aside>

          <div className="cq-main">
            <div className="cq-bar">
              <span aria-live="polite">
                {pagination ? (
                  <>
                    <b>{pagination.total}</b> دورة متاحة
                    {search && <> لـ «{search}»</>}
                  </>
                ) : (
                  ' '
                )}
              </span>
            </div>

            {list.isError ? (
              <ErrorState onRetry={() => list.refetch()} />
            ) : list.isLoading ? (
              <div className="course-grid cq-grid">
                {Array.from({ length: 6 }, (_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <EmptyState
                icon="search"
                title={filtered ? 'مفيش دورات بالمواصفات دي' : 'الدورات جاية قريب'}
                body={filtered ? 'جرّب كلمة تانية أو امسح الفلاتر.' : 'بنجهّز أول دفعة من الدورات.'}
                action={
                  filtered && (
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setParams(new URLSearchParams())}>
                      مسح الفلاتر
                    </button>
                  )
                }
              />
            ) : (
              <div className={`course-grid cq-grid${list.isPlaceholderData ? ' is-stale' : ''}`}>
                {courses.map((c) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    variant="catalog"
                    wishlisted={wishlist.has(c.id)}
                    onToggleWishlist={wishlist.toggle}
                  />
                ))}
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <Pager
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                pageSize={pagination.limit}
                onChange={(p) => {
                  update({ page: p > 1 ? String(p) : null })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            )}
          </div>
        </div>
      </section>

      <CTABand />
    </>
  )
}

function Pager({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
}: {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}) {
  const from = (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  )
  return (
    <nav className="cq-pager" aria-label="الصفحات">
      <span>
        عرض {from}-{to} من {total} دورة
      </span>
      <div className="cq-pages">
        <button type="button" aria-label="الصفحة السابقة" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <Icon name="arrowRight" size={16} />
        </button>
        {pages.map((p, i) => (
          <span key={p} className="cq-page-wrap">
            {i > 0 && p - pages[i - 1] > 1 && <span className="cq-gap">…</span>}
            <button type="button" aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)}>
              {p}
            </button>
          </span>
        ))}
        <button type="button" aria-label="الصفحة التالية" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          <Icon name="arrowLeft" size={16} />
        </button>
      </div>
    </nav>
  )
}
