import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { LogIn, UserPlus, Eye, EyeOff, KeyRound, MailCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo-transparent.svg'

export default function Login() {
  const { user, loading, login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'forgot'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (!loading && user) return <Navigate to="/app" replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      if (mode === 'forgot') {
        await api.forgotPassword(forgotEmail)
        setForgotSent(true)
        toast.success('If the email exists, a reset link has been sent')
        return
      }
      await (mode === 'login' ? login(username, password) : register(username, password))
      toast.success(mode === 'login' ? 'Welcome back' : 'Account created')
      navigate('/app')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  const switchMode = (m) => {
    setMode(m)
    setForgotSent(false)
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
              {mode === 'login' ? 'Sign in to your account'
                : mode === 'register' ? 'Create your account'
                : 'Reset your password'}
            </h2>
          </div>

          <div className="space-y-4">
            {mode === 'forgot' ? (
              forgotSent ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <MailCheck className="h-10 w-10 text-teal-400" />
                  <p className="text-sm text-slate-400">
                    If an account exists for <span className="text-slate-200">{forgotEmail}</span>,
                    a reset link has been sent. Check your inbox and follow the link.
                  </p>
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="mt-2 text-sm font-medium text-teal-400 transition-colors hover:text-teal-300"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="label" htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      autoFocus
                      placeholder="you@example.com"
                      className="input"
                    />
                  </div>
                  <button type="submit" disabled={busy || !forgotEmail} className="btn-primary w-full">
                    {busy ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-950/30 border-t-teal-950" />
                    ) : (
                      <><KeyRound className="h-4 w-4" /> Send reset link</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="w-full text-center text-sm font-medium text-teal-400 transition-colors hover:text-teal-300"
                  >
                    Back to sign in
                  </button>
                </>
              )
            ) : (
            <>
            <div>
              <label className="label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-950/30 border-t-teal-950" />
              ) : mode === 'login' ? (
                <><LogIn className="h-4 w-4" /> Sign in</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Create account</>
              )}
            </button>

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="w-full text-center text-sm font-medium text-slate-500 transition-colors hover:text-teal-300"
              >
                Forgot password?
              </button>
            )}

            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="w-full text-center text-sm font-medium text-teal-400 transition-colors hover:text-teal-300"
            >
              {mode === 'login' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
            </button>
            </>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}