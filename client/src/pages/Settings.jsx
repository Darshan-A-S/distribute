import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, Mail, KeyRound, CheckCircle2, AlertTriangle, User, Users, Server, TriangleAlert, Calendar, FileText, Layers, Send, BarChart3 } from 'lucide-react'
import ConfirmDialog from '../components/ConfirmDialog'
import { avatarUrl } from '../components/ProfileDialog'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'smtp', label: 'SMTP Settings', icon: Server },
  { id: 'password', label: 'Change Password', icon: KeyRound },
  { id: 'danger', label: 'Delete Account', icon: TriangleAlert },
]

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 text-center">
      <Icon className="mx-auto mb-1.5 h-4 w-4 text-teal-400" />
      <p className="text-lg font-semibold text-slate-50">{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  )
}

function StatsTab() {
  const [daily, setDaily] = useState([])
  const [batches, setBatches] = useState([])
  const [templateCount, setTemplateCount] = useState('—')

  useEffect(() => {
    api.getDailyStats(14).then(setDaily).catch(() => {})
    api.getBatches().then(setBatches).catch(() => {})
    api.getTemplates().then((t) => setTemplateCount(t.length)).catch(() => {})
  }, [])

  const batchTotal = batches.reduce((n, b) => n + (b.total || 0), 0)
  const batchSent = batches.reduce((n, b) => n + (b.sent || 0), 0)
  const maxDaily = Math.max(1, ...daily.map((d) => d.count || 0))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={FileText} label="Templates" value={templateCount} />
        <StatCard icon={Layers} label="Batches" value={batches.length} />
        <StatCard icon={Users} label="Total recipients" value={batchTotal} />
        <StatCard icon={Send} label="Emails sent" value={batchSent} />
      </div>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Sends per day</h2>
          <span className="text-[11px] text-slate-500">last 14 days</span>
        </div>
        <div className="flex h-40 items-end gap-1.5">
          {daily.map((d, i) => (
            <div key={i} className="group relative flex h-full flex-1 flex-col justify-end">
              <div
                className={`relative w-full rounded-sm transition-colors ${d.count > 0 ? 'bg-teal-500/80' : 'bg-white/[0.06]'}`}
                style={{ height: `${d.count > 0 ? Math.round((d.count / maxDaily) * 100) : 4}%` }}
              >
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-200 opacity-0 transition-opacity group-hover:opacity-100">
                  {d.count} {d.count === 1 ? 'send' : 'sends'}
                </div>
              </div>
              <p className="mt-1 text-center text-[9px] text-slate-500">
                {new Date(d.date).toLocaleDateString('en-US', { weekday: 'narrow' })}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Day by day</h2>
          <span className="text-[11px] text-slate-500">last 5 days</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {daily.every((d) => d.count === 0) && (
            <p className="py-2 text-sm text-slate-500">No sends in the last 5 days.</p>
          )}
          {[...daily].reverse().slice(0, 5).map((d, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 text-sm">
              <span className="text-slate-400">
                {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span className={d.count > 0 ? 'font-medium text-slate-200' : 'text-slate-600'}>{d.count}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function Settings() {
  const { user, setUser, logout } = useAuth()
  const [tab, setTab] = useState('profile')
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

  // Delete account state
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Profile stats
  const [templateCount, setTemplateCount] = useState('—')
  const [batchCount, setBatchCount] = useState('—')
  const [sentCount, setSentCount] = useState('—')

  useEffect(() => {
    if (tab !== 'profile') return
    api.getTemplates().then((t) => setTemplateCount(t.length)).catch(() => {})
    api.getBatches().then((b) => setBatchCount(b.length)).catch(() => {})
    api.getRecentSends()
      .then((j) => setSentCount(j.reduce((n, x) => n + (x.success || 0), 0)))
      .catch(() => {})
  }, [tab])

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

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await api.deleteAccount()
      toast.success('Account deleted')
      setConfirmDelete(false)
      await logout()
    } catch (err) {
      toast.error(err.message)
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your profile, mail server, password, and account.</p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <nav className="flex shrink-0 gap-1 md:w-56 md:flex-col">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-teal-400/10 text-teal-300'
                  : t.id === 'danger'
                    ? 'text-red-400/80 hover:bg-red-500/10 hover:text-red-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {tab === 'profile' && (
            <section className="card p-5">
              <div className="flex items-center gap-3 mb-5">
                <img src={avatarUrl(user?.username)} alt="Profile" className="h-14 w-14 rounded-xl bg-slate-800" />
                <p className="text-lg font-semibold tracking-tight text-slate-50">{user?.username}</p>
              </div>

              <div className="mb-5 space-y-3">
                <div>
                  <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-200">
                    {user?.email || '—'}
                    {isVerified && <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    <Calendar className="h-3.5 w-3.5" /> Member since
                  </p>
                  <p className="mt-0.5 text-sm text-slate-200">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Templates', value: templateCount, icon: FileText },
                  { label: 'Batches', value: batchCount, icon: Layers },
                  { label: 'Emails sent', value: sentCount, icon: Send },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                    <s.icon className="mx-auto mb-1.5 h-4 w-4 text-teal-400" />
                    <p className="text-lg font-semibold text-slate-50">{s.value}</p>
                    <p className="text-[11px] text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/[0.06] pt-4">
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
                Your email is your sender identity and is required to configure SMTP settings.
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
              </div>
            </section>
          )}

          {tab === 'stats' && <StatsTab />}

          {tab === 'smtp' && (
            <form onSubmit={submit} className="space-y-5">
              <section className={`card p-5 ${!isVerified ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-slate-100">SMTP server</h2>
                  {!isVerified && <ShieldCheck className="h-4 w-4 text-amber-400" />}
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  {isVerified
                    ? 'Use your own mail server so emails are genuinely sent from your account.'
                    : 'Verify your email in the Profile tab to configure SMTP settings.'}
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
          )}

          {tab === 'password' && (
            <form onSubmit={handleChangePassword} className="card p-5 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Change password</h2>
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
          )}

          {tab === 'danger' && (
            <section className="card border-red-500/25 bg-red-500/[0.02] p-5">
              <div className="flex items-center gap-2 mb-1">
                <TriangleAlert className="h-4 w-4 text-red-400" />
                <h2 className="text-lg font-semibold text-red-300">Danger Zone</h2>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Deleting your account is permanent and irreversible. Your templates and recipient
                batches will be removed along with it.
              </p>
              <button onClick={() => setConfirmDelete(true)} className="btn-danger">
                Delete account
              </button>
            </section>
          )}
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          danger
          title="Delete account"
          message={`This will permanently delete your account (${user?.username}). This cannot be undone.`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleDeleteAccount}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}