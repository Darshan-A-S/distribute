import { useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, Mail, KeyRound, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function Settings() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({
    email: user?.email || '',
    smtpHost: user?.smtpHost || 'smtp.gmail.com',
    smtpPort: user?.smtpPort || 587,
    smtpUsername: user?.smtpUsername || '',
    smtpPassword: '',
    startTls: true,
  })
  const [busy, setBusy] = useState(false)

  // Email verification state
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)

  const isVerified = user?.emailVerified
  const hasEmail = form.email && form.email.trim().length > 0

  // Change password state
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [changing, setChanging] = useState(false)

  const set = (k) => (e) => {
    const v = e.target.value
    setForm((f) => ({ ...f, [k]: k === 'smtpPort' ? (v ? Number(v) : '') : v }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const updated = await api.updateSettings(form)
      setUser(updated)
      toast.success('Settings saved')
      setForm((f) => ({ ...f, smtpPassword: '' }))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleSendOtp = async () => {
    setSendingOtp(true)
    try {
      await api.sendVerification()
      setOtpSent(true)
      toast.success('OTP sent to your email')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSendingOtp(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) return toast.error('Enter the 6-digit code')
    setVerifying(true)
    try {
      await api.verifyEmail(otp)
      setUser({ ...user, emailVerified: true })
      setOtpSent(false)
      setOtp('')
      toast.success('Email verified!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setVerifying(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pw.next.length < 6) return toast.error('New password must be at least 6 characters')
    if (pw.next !== pw.confirm) return toast.error('Passwords do not match')
    setChanging(true)
    try {
      await api.changePassword({ currentPassword: pw.current, newPassword: pw.next })
      setPw({ current: '', next: '', confirm: '' })
      toast.success('Password changed')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setChanging(false)
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your sender identity and mail server.</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {/* Email Verification */}
        <section className="card p-5">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-semibold text-slate-100">Email verification</h2>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-xs font-medium text-teal-300">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                <AlertTriangle className="h-3 w-3" /> Not verified
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Verify your email before configuring SMTP settings.
          </p>

          {!isVerified && (
            <>
              <div className="mb-3">
                <label className="label">Your email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@gmail.com"
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={!hasEmail || sendingOtp}
                    className="btn-secondary shrink-0"
                  >
                    {sendingOtp ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit code"
                    maxLength={6}
                    className="input flex-1 tracking-widest font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifying || otp.length !== 6}
                    className="btn-primary shrink-0"
                  >
                    {verifying ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* SMTP Config */}
        <section className={`card p-5 ${!isVerified ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-slate-100">SMTP server</h2>
            {!isVerified && <ShieldCheck className="h-4 w-4 text-amber-400" />}
          </div>
          <p className="text-sm text-slate-500 mb-4">
            {isVerified
              ? 'Use your own mail server so emails are genuinely sent from your account.'
              : 'Verify your email above to configure SMTP settings.'}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">SMTP host</label>
              <input
                type="text"
                value={form.smtpHost}
                onChange={set('smtpHost')}
                placeholder="smtp.gmail.com"
                className="input"
              />
            </div>
            <div>
              <label className="label">Port</label>
              <input
                type="number"
                value={form.smtpPort}
                onChange={set('smtpPort')}
                placeholder="587"
                className="input"
              />
            </div>
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                value={form.smtpUsername}
                onChange={(e) => setForm((f) => ({ ...f, smtpUsername: e.target.value }))}
                placeholder="you@gmail.com"
                className="input"
              />
            </div>
            <div>
              <label className="label">App password</label>
              <input
                type="password"
                value={form.smtpPassword}
                onChange={(e) => setForm((f) => ({ ...f, smtpPassword: e.target.value }))}
                placeholder="Leave blank to keep current"
                autoComplete="new-password"
                className="input"
              />
            </div>
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={form.startTls}
              onChange={(e) => setForm((f) => ({ ...f, startTls: e.target.checked }))}
              className="h-4 w-4 rounded border-white/20 bg-slate-950 accent-teal-500"
            />
            Use STARTTLS
          </label>
        </section>

        <button type="submit" disabled={busy || !isVerified} className="btn-primary">
          {busy ? 'Saving...' : 'Save settings'}
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="card p-5 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-slate-100">Change password</h2>
            <KeyRound className="h-4 w-4 text-slate-500" />
          </div>
          <p className="text-sm text-slate-500">Update the password used to sign in to your account.</p>
        </div>
        <div>
          <label className="label">Current password</label>
          <input
            type="password"
            value={pw.current}
            onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
            autoComplete="current-password"
            className="input"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              value={pw.next}
              onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
              autoComplete="new-password"
              className="input"
            />
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
              autoComplete="new-password"
              className="input"
            />
          </div>
        </div>
        <button type="submit" disabled={changing} className="btn-secondary">
          {changing ? 'Changing...' : 'Change password'}
        </button>
      </form>
    </div>
  )
}
