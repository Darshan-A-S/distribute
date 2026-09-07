import { useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'

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

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your sender identity and mail server.</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <section className="card p-5">
          <h2 className="text-lg font-semibold text-slate-100 mb-1">Sender identity</h2>
          <p className="text-sm text-slate-500 mb-4">The "from" address shown on emails you send.</p>
          <div>
            <label className="label">Your email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@gmail.com"
              className="input"
            />
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-semibold text-slate-100 mb-1">SMTP server</h2>
          <p className="text-sm text-slate-500 mb-4">
            Use your own mail server so emails are genuinely sent from your account (e.g. Gmail
            host <span className="text-slate-300">smtp.gmail.com</span>, port <span className="text-slate-300">587</span>, app password).
            Leave empty to use the default server.
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

        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? 'Saving...' : 'Save settings'}
        </button>
      </form>
    </div>
  )
}