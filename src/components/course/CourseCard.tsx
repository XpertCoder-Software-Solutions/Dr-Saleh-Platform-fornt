import { Link } from 'react-router-dom'
import type { CourseSummary } from '@/types/api'
import { routes } from '@/app/routes'
import { Icon } from '@/components/ui/Icon'
import { coursePrice, durationLabel, formatEGP, lessonsLabel } from '@/lib/format'
import { CourseCover } from './CourseCover'
import './course.css'

const NEW_DAYS = 30
// Captured once per page load; precise enough for a "new" badge.
const LOADED_AT = Date.now()

interface CourseCardProps {
  course: CourseSummary
  /** Catalog cards show the category above the title, rating count and a wishlist heart. */
  variant?: 'home' | 'catalog'
  wishlisted?: boolean
  onToggleWishlist?: (courseId: string) => void
}

export function CourseCard({ course, variant = 'home', wishlisted, onToggleWishlist }: CourseCardProps) {
  const catalog = variant === 'catalog'
  const price = coursePrice(course)
  const isNew = LOADED_AT - new Date(course.createdAt).getTime() < NEW_DAYS * 86_400_000
  const badge = price.discountPercent > 0 ? `خصم ${price.discountPercent}%` : isNew ? 'جديد' : null
  const category = course.category?.nameAr ?? null

  return (
    <article className="ccard glow-card">
      {/* Whole-card link sits under the wishlist button (no buttons nested inside <a>). */}
      <Link to={routes.course(course.id)} className="ccard-link">
        <span className="sr-only">{course.titleAr}</span>
      </Link>
      <div className="ccard-cover">
        <CourseCover
          seed={course.categoryId || course.id}
          word={category ?? course.titleAr}
          tag={category}
          badge={badge}
          image={course.thumbnailImage}
          wordSize={catalog ? 24 : 28}
          height={catalog ? 200 : 230}
        />
        {onToggleWishlist && (
          <button
            type="button"
            className={`ccard-heart${wishlisted ? ' is-on' : ''}`}
            aria-pressed={wishlisted}
            aria-label={wishlisted ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            onClick={() => onToggleWishlist(course.id)}
          >
            <Icon name="heart" size={18} filled={wishlisted} />
          </button>
        )}
      </div>
      <div className={`ccard-body${catalog ? ' is-catalog' : ''}`}>
        {catalog && category && <span className="ccard-cat">{category}</span>}
        <h3 className="ccard-title">{course.titleAr}</h3>
        <div className="ccard-meta">
          {!!course.lessonsCount && (
            <span>
              <Icon name="video" size={16} />
              {lessonsLabel(course.lessonsCount)}
            </span>
          )}
          {!!course.totalDurationSeconds && (
            <span>
              <Icon name="clock" size={16} />
              {durationLabel(course.totalDurationSeconds)}
            </span>
          )}
          {course.certificateEnabled && (
            <span>
              <Icon name="award" size={16} />
              شهادة
            </span>
          )}
        </div>
        <div className="ccard-foot">
          <span className="ccard-price">
            <span className="g-ink">{price.isFree ? 'مجانًا' : formatEGP(price.current)}</span>
            {price.old !== null && <s>{formatEGP(price.old)}</s>}
          </span>
          {course.ratingAverage != null && (
            <span className="ccard-rating" aria-label={`التقييم ${course.ratingAverage} من 5`}>
              <span aria-hidden="true">★</span> {course.ratingAverage}
              {catalog && !!course.ratingCount && <small> ({course.ratingCount})</small>}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export function CourseCardSkeleton() {
  return (
    <div className="ccard" aria-hidden="true">
      <div className="skeleton" style={{ height: 230, borderRadius: 0 }} />
      <div className="ccard-body">
        <div className="skeleton" style={{ height: 24, width: '80%' }} />
        <div className="skeleton" style={{ height: 16, width: '60%' }} />
        <div className="skeleton" style={{ height: 28, width: '40%', marginTop: 12 }} />
      </div>
    </div>
  )
}
