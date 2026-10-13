import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiClientError } from '@/api/client'
import { authApi } from '@/api/endpoints'
import { routes } from '@/app/routes'
import { Spinner } from '@/components/ui/States'
import { usePageTitle } from '@/lib/usePageTitle'
import type { Gender } from '@/types/api'
import { AuthShell } from './AuthShell'
import { PasswordField, TextField } from './fields'
import { pendingSignup } from './pending'

type Errors = Partial<Record<'fullName' | 'email' | 'phoneNumber' | 'password' | 'confirm' | 'gender', string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9\s-]{8,16}$/

export function RegisterPage() {
  usePageTitle('إنشاء حساب')
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirm: '',
    gender: '' as Gender | '',
    referralCode: params.get('ref') ?? '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  // Copy on this page follows the gender being picked.
  const female = form.gender === 'Female'
  const male = form.gender === 'Male'

  function validate(): Errors {
    const e: Errors = {}
    if (form.fullName.trim().split(/\s+/).length < 2) e.fullName = 'اكتب الاسم الأول واسم العيلة.'
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'البريد الإلكتروني مش صحيح.'
    if (!PHONE_RE.test(form.phoneNumber.trim())) e.phoneNumber = 'رقم الموبايل مش صحيح.'
    if (!form.gender) e.gender = 'اختار النوع عشان نكلمك بالصيغة المناسبة.'
    if (form.password.length < 8) e.password = 'كلمة المرور لازم تكون 8 حروف على الأقل.'
    if (form.confirm !== form.password) e.confirm = 'كلمتين المرور مش متطابقين.'
    return e
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    setServerError(null)
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return

    setBusy(true)
    const email = form.email.trim()
    try {
      await authApi.register({
        fullName: form.fullName.trim(),
        email,
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        gender: form.gender || undefined,
        referralCode: form.referralCode.trim().toUpperCase() || undefined,
      })
      pendingSignup.set({ email, password: form.password })
      navigate(routes.verifyEmail, { state: { email, from: (location.state as { from?: string } | null)?.from } })
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 409) {
        setServerError('البريد الإلكتروني أو رقم الموبايل ده مسجّل قبل كده. جرّب تسجّل دخول.')
      } else if (err instanceof ApiClientError && err.statusCode === 503) {
        // Account was created but the email failed; the verify page can resend.
        pendingSignup.set({ email, password: form.password })
        navigate(routes.verifyEmail, { state: { email, resend: true } })
      } else {
        setServerError(err instanceof Error ? err.message : 'حصلت مشكلة، حاول تاني.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="إنشاء حساب جديد" sub="حساب واحد لدوراتك وكتبك وشهاداتك.">
      <form className="auth-formbox" onSubmit={onSubmit} noValidate>
        {serverError && (
          <p className="alert alert-error" role="alert">
            {serverError}
          </p>
        )}
        <TextField
          label="الاسم بالكامل"
          autoComplete="name"
          value={form.fullName}
          onChange={set('fullName')}
          error={errors.fullName}
          required
        />

        <fieldset className="form-field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="form-label" style={{ marginBottom: 8 }}>
            النوع
          </legend>
          <div className="seg">
            <label>
              <input type="radio" name="gender" value="Male" checked={male} onChange={set('gender')} />
              ذكر
            </label>
            <label>
              <input type="radio" name="gender" value="Female" checked={female} onChange={set('gender')} />
              أنثى
            </label>
          </div>
          {errors.gender && <span className="field-error">{errors.gender}</span>}
        </fieldset>

        <div className="auth-row">
          <TextField
            label="البريد الإلكتروني"
            type="email"
            className="input-ltr"
            autoComplete="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            required
          />
          <TextField
            label="رقم الموبايل"
            type="tel"
            className="input-ltr"
            autoComplete="tel"
            placeholder="+20 10 0000 0000"
            value={form.phoneNumber}
            onChange={set('phoneNumber')}
            error={errors.phoneNumber}
            required
          />
        </div>
        <PasswordField
          label="كلمة المرور"
          autoComplete="new-password"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          hint="8 حروف على الأقل"
          required
        />
        <PasswordField
          label={female ? 'اكتبيها تاني' : male ? 'اكتبها تاني' : 'تأكيد كلمة المرور'}
          autoComplete="new-password"
          value={form.confirm}
          onChange={set('confirm')}
          error={errors.confirm}
          required
        />
        <TextField
          label="كود الدعوة (اختياري)"
          className="input-ltr"
          value={form.referralCode}
          onChange={set('referralCode')}
          autoCapitalize="characters"
        />
        <p className="field-hint">
          بإنشاء الحساب {female ? 'إنتي موافقة' : 'إنت موافق'} على <Link to={routes.terms}>الشروط والأحكام</Link> و
          <Link to={routes.privacy}>سياسة الخصوصية</Link>.
        </p>
        <button type="submit" className="btn btn-gold btn-lg btn-block" disabled={busy}>
          {busy ? <Spinner label="جاري إنشاء الحساب" /> : female ? 'ابدئي دلوقتي' : 'ابدأ دلوقتي'}
        </button>
      </form>
      <p className="auth-switch">
        عندك حساب؟ <Link to={routes.login} state={location.state}>سجّل دخول</Link>
      </p>
    </AuthShell>
  )
}
