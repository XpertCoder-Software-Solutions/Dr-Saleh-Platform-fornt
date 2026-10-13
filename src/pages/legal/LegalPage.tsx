import { Link, NavLink, useParams } from 'react-router-dom'
import { routes } from '@/app/routes'
import { PageHero } from '@/components/layout/PageHero'
import { Icon, type IconName } from '@/components/ui/Icon'
import { innerClass, sectionClass } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { usePageTitle } from '@/lib/usePageTitle'
import { NotFoundPage } from '@/pages/NotFoundPage'

// TODO(Amr): draft texts from the design; they need a lawyer's review and the
// bracketed values filled in before launch.
const DOCS: Record<string, { title: string; icon: IconName; sections: [string, string][] }> = {
  terms: {
    title: 'الشروط والأحكام',
    icon: 'file',
    sections: [
      ['استخدام المنصة', 'باستخدامك للمنصة انت موافق على الشروط دي. الحساب شخصي، وممنوع مشاركته مع حد تاني.'],
      [
        'المحتوى وحقوق الملكية',
        'كل الدورات والكتب والمقالات ملك المنصة ود. صالح عبد الكريم، وممنوع تسجيلها أو إعادة نشرها.',
      ],
      [
        'الدفع',
        'الأسعار بالجنيه المصري وشاملة الضرايب. الدفع متاح بـ Apple Pay والمحافظ الإلكترونية والكروت البنكية وPayPal.',
      ],
      ['الشهادات', 'الشهادة بتطلع بعد إكمال الدورة، ولكل شهادة رقم تحقق.'],
    ],
  },
  refunds: {
    title: 'سياسة الاسترداد',
    icon: 'refresh',
    sections: [
      [
        'الدورات',
        'تقدر تطلب استرداد خلال [عدد] أيام من الشراء، بشرط إنك متكونش شفت أكتر من [نسبة] من الدورة.',
      ],
      [
        'الكتب الرقمية والصوتية',
        'المنتجات الرقمية مش بتترد بعد ما تتفتح، إلا لو فيه مشكلة تقنية مقدرناش نحلها.',
      ],
      [
        'المنتجات والكتب الورقية',
        'تقدر ترجّع المنتج خلال 14 يوم من الاستلام لو لسه في حالته الأصلية. مصاريف الشحن عليك إلا لو المنتج فيه عيب.',
      ],
      [
        'الاستشارات',
        'تقدر تأجّل الميعاد مرة مجانًا قبلها بـ 24 ساعة. الإلغاء قبلها بـ 48 ساعة بيرجعلك المبلغ كامل.',
      ],
    ],
  },
  privacy: {
    title: 'سياسة الخصوصية',
    icon: 'shield',
    sections: [
      ['البيانات اللي بنجمعها', 'الاسم، ورقم الموبايل، والإيميل، وبيانات الطلبات، وتقدّمك في الدورات.'],
      ['بنستخدمها في إيه', 'عشان نفتحلك المحتوى، ونبعتلك تأكيدات الطلبات والمواعيد، ونحسّن المنصة.'],
      ['الدفع', 'بيانات الكارت مش بتتحفظ عندنا، الدفع بيتم عن طريق بوابة دفع آمنة.'],
      ['الاستشارات', 'كل اللي بتحكيه في الاستشارة سري، ومحدش بيشوفه غير الدكتور.'],
    ],
  },
}

export function LegalPage() {
  const { doc = 'terms' } = useParams()
  const current = DOCS[doc]
  usePageTitle(current?.title)
  if (!current) return <NotFoundPage />

  return (
    <>
      <PageHero
        portrait={false}
        crumbs={[{ label: 'الرئيسية', to: routes.home }, { label: 'السياسات' }]}
        title={
          <>
            الشروط <span className="text-sheen">والسياسات</span>
          </>
        }
        body="كل اللي محتاج تعرفه عن استخدام المنصة، والاسترداد، وخصوصية بياناتك، بكلام واضح."
      />
      <section className={cn(sectionClass, 'relative z-2 -mt-12')}>
        <div className={cn(innerClass, 'grid grid-cols-[260px_1fr] items-start gap-7 max-md:grid-cols-1')}>
          <nav
            aria-label="السياسات"
            className="sticky top-27 flex flex-col gap-1 rounded-card bg-white p-2.5 shadow-[0_30px_60px_-36px_rgba(12,42,74,.5)] max-md:static"
          >
            {Object.entries(DOCS).map(([id, d]) => (
              <NavLink
                key={id}
                to={`/legal/${id}`}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-[15px]',
                    isActive
                      ? 'bg-surface-blue font-bold text-ink shadow-[inset_-3px_0_0_var(--color-blue-400)]'
                      : 'text-text-2 hover:bg-hover',
                  )
                }
              >
                <Icon name={d.icon} size={18} />
                {d.title}
              </NavLink>
            ))}
            <p className="m-1.5 mt-2 rounded-xl bg-surface p-3 text-xs leading-relaxed text-muted">
              عندك سؤال؟ <Link to={routes.contact}>كلّمنا</Link>
            </p>
          </nav>
          <article className="rounded-card bg-white p-8 shadow-[0_30px_60px_-36px_rgba(12,42,74,.5)] max-sm:p-5">
            <h2 className="text-[30px]">{current.title}</h2>
            <p className="my-4 flex items-center gap-2 rounded-xl border border-gold-light bg-gold-soft px-4 py-2.5 text-sm text-gold-ink">
              <Icon name="alert" size={16} /> نص مبدئي، لازم يتراجع من محامي قبل النشر.
            </p>
            <ol className="flex flex-col">
              {current.sections.map(([h, p], i) => (
                <li key={h} className="border-t border-divider py-5">
                  <h3 className="flex items-center gap-3 text-xl">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-surface-blue text-sm text-blue-600">
                      {i + 1}
                    </span>
                    {h}
                  </h3>
                  <p className="mt-2 leading-loose text-text-2">{p}</p>
                </li>
              ))}
            </ol>
          </article>
        </div>
      </section>
    </>
  )
}
