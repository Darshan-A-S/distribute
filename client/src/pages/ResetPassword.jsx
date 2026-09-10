import { useState } from 'react'
import { Navigate, Link, useSearchParams } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo-transparent.svg'

export default function ResetPassword() {
  const { user, loading } = useAuth()
  const [params] = useSearchParams()
  const token = params.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  if (!loading && user) return <Navigate to="/app" replace />

  const submit = async (e) => {
    e.preventDefault()
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    if (password !== confirm) return toast.error('Passwords do not match')
    setBusy(true)
    try {
      await api.resetPassword({ token, newPassword: password })
      setDone(true)
      toast.success('Password reset! Sign in with your new password.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[480px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <form onSubmit={submit} className="relative w-full max-w-sm">
        <div className="card p-8">
          <div className="mb-8 flex flex-col items-center gap-3">
            <img src={logo} alt="distribute" className="h-12 w-12" />
            <h1 className="text-lg font-semibold tracking-tight text-slate-50">distribute</h1>
            <h2 className="text-sm font-medium text-slate-400">
              {done ? 'Password reset' : 'Set a new password'}
            </h2>
          </div>

          {done ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <p className="text-sm text-slate-400">Your password has been reset successfully.</p>
              <Link to="/login" className="btn-primary w-full">
                <><KeyRound className="h-4 w-4" /> Sign in</>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="password">New password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="confirm">Confirm new password</label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  className="input"
                />
              </div>
              <button type="submit" disabled={busy || !password || !confirm} className="btn-primary w-full">
                {busy ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-950/30 border-t-teal-950" />
                ) : (
                  <><KeyRound className="h-4 w-4" /> Reset password</>
                )}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}