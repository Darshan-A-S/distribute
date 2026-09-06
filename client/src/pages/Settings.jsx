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
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <form onSubmit={submit} className="space-y-5">
        <section className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-1">Sender identity</h2>
          <p className="text-sm text-gray-500 mb-4">The "from" address shown on emails you send.</p>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Your email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@gmail.com"
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </section>

        <section className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-1">SMTP server</h2>
          <p className="text-sm text-gray-500 mb-4">
            Use your own mail server so emails are genuinely sent from your account (e.g. Gmail
            host <span className="text-gray-300">smtp.gmail.com</span>, port <span className="text-gray-300">587</span>, app password).
            Leave empty to use the default server.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">SMTP host</label>
              <input
                type="text"
                value={form.smtpHost}
                onChange={set('smtpHost')}
                placeholder="smtp.gmail.com"
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Port</label>
              <input
                type="number"
                value={form.smtpPort}
                onChange={set('smtpPort')}
                placeholder="587"
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
              <input
                type="text"
                value={form.smtpUsername}
                onChange={(e) => setForm((f) => ({ ...f, smtpUsername: e.target.value }))}
                placeholder="you@gmail.com"
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">App password</label>
              <input
                type="password"
                value={form.smtpPassword}
                onChange={(e) => setForm((f) => ({ ...f, smtpPassword: e.target.value }))}
                placeholder="Leave blank to keep current"
                autoComplete="new-password"
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 mt-4 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={form.startTls}
              onChange={(e) => setForm((f) => ({ ...f, startTls: e.target.checked }))}
              className="rounded border-gray-700 bg-gray-950"
            />
            Use STARTTLS
          </label>
        </section>

        <button
          type="submit"
          disabled={busy}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
        >
          {busy ? 'Saving...' : 'Save settings'}
        </button>
      </form>
    </div>
  )
}