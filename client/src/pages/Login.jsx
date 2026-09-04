import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, loading, login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

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
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <form onSubmit={submit} className="bg-gray-900 border border-gray-800 rounded-lg p-8 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-indigo-400 text-center">Certificate Sender</h1>
        <h2 className="text-lg font-semibold text-center">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
        >
          {busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="w-full text-sm text-indigo-400 hover:text-indigo-300"
        >
          {mode === 'login' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  )
}