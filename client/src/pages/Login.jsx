import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Send, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, loading, login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await (mode === 'login' ? login(username, password) : register(username, password))
      toast.success(mode === 'login' ? 'Welcome back' : 'Account created')
      navigate('/')
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-[0_8px_24px_-6px_rgba(46,147,60,0.6)]">
              <Send className="h-6 w-6 text-teal-950" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-50">Certificate Sender</h1>
            <h2 className="text-sm font-medium text-slate-400">
              {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
            </h2>
          </div>

          <div className="space-y-4">
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

            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="w-full text-center text-sm font-medium text-teal-400 transition-colors hover:text-teal-300"
            >
              {mode === 'login' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}