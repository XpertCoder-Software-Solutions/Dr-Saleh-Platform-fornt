import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/endpoints'
import { useAuth } from '@/auth/hooks'
import { routes } from '@/app/routes'
import { Spinner } from '@/components/ui/States'
import { usePageTitle } from '@/lib/usePageTitle'
import { AuthShell } from './AuthShell'
import { OtpInput } from './fields'
import { pendingSignup } from './pending'

const RESEND_SECONDS = 60

export function VerifyEmailPage() {
  usePageTitle('تفعيل الحساب')
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const state = (location.state as { email?: string; from?: string; resend?: boolean } | null) ?? {}
  const email = state.email ?? ''

  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [wait, setWait] = useState(state.resend ? 0 : RESEND_SECONDS)

  useEffect(() => {
    if (wait <= 0) return
    const id = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(id)
  }, [wait])

  if (!email) return <Navigate to={routes.login} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (otp.length !== 6) return
    setError(null)
    setBusy(true)
    try {
      await authApi.verifyEmail({ email, otp })
      const creds = pendingSignup.take(email)
      if (creds) {
        await login(creds.email, creds.password)
        navigate(state.from ?? routes.home, { replace: true })
      } else {
        navigate(routes.login, { replace: true, state: { from: state.from } })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'الكود مش صحيح.')
      setOtp('')
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    setError(null)
    setNotice(null)
    try {
      await authApi.resendVerification(email)
      setNotice('بعتنالك كود جديد.')
      setWait(RESEND_SECONDS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'مقدرناش نبعت الكود.')
    }
  }

  return (
    <AuthShell
      title="فعّل حسابك"
      sub={
        <>
          بعتنا كود من 6 أرقام على <b dir="ltr">{email}</b>. اكتبه هنا عشان تفعّل حسابك.
        </>
      }
    >
      <form className="auth-formbox" onSubmit={onSubmit}>
        {error && (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="alert alert-success" role="status">
            {notice}
          </p>
        )}
        <OtpInput value={otp} onChange={setOtp} />
        <button type="submit" className="btn btn-navy btn-lg btn-block" disabled={busy || otp.length !== 6}>
          {busy ? <Spinner label="جاري التفعيل" /> : 'تفعيل الحساب'}
        </button>
      </form>
      <p className="auth-switch">
        موصلكش الكود؟{' '}
        <button type="button" className="link-btn" disabled={wait > 0} onClick={resend}>
          {wait > 0 ? `ابعته تاني بعد ${wait} ثانية` : 'ابعته تاني'}
        </button>
      </p>
      <p className="auth-switch">
        <Link to={routes.register}>غيّر البريد الإلكتروني</Link>
      </p>
    </AuthShell>
  )
}
