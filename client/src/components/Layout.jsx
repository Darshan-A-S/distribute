import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Templates' },
  { to: '/recipients', label: 'Recipients' },
  { to: '/send', label: 'Send' },
]

function avatarUrl() {
  let seed = localStorage.getItem('avatarSeed')
  if (!seed) {
    seed = Math.random().toString(36).slice(2, 10)
    localStorage.setItem('avatarSeed', seed)
  }
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}`
}

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
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl()}
              alt="Profile"
              className="w-10 h-10 rounded-lg shrink-0 bg-gray-800"
            />
            <p className="text-sm text-gray-300 truncate flex-1">{user.username}</p>
            <NavLink
              to="/settings"
              title="Settings"
              aria-label="Settings"
              className={({ isActive }) =>
                isActive ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
              }
            >
              <Settings className="w-5 h-5" />
            </NavLink>
            <button
              onClick={logout}
              title="Logout"
              aria-label="Logout"
              className="text-red-400 hover:text-red-300"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}