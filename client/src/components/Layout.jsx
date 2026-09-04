import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Templates' },
  { to: '/recipients', label: 'Recipients' },
  { to: '/send', label: 'Send' },
]

export default function Layout() {
  const { user, loading, logout } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="h-screen flex">
      <aside className="w-56 bg-gray-900 border-r border-gray-800 p-4 flex flex-col gap-1">
        <h1 className="text-lg font-bold text-indigo-400 mb-6 px-3">Certificate Sender</h1>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `px-3 py-2 rounded text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
        <div className="mt-auto px-3 pt-4 border-t border-gray-800">
          <p className="text-sm text-gray-300 truncate">{user.username}</p>
          <button
            onClick={logout}
            className="mt-2 text-sm text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}