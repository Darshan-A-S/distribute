import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { LogOut, Newspaper, Users, Send, Settings, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ProfileDialog from './ProfileDialog'
import logo from '../assets/logo-transparent.svg'

const links = [
  { to: '/app', label: 'Templates', icon: Newspaper, end: true },
  { to: '/app/recipients', label: 'Recipients', icon: Users },
  { to: '/app/send', label: 'Send', icon: Send },
]

function AdminLink({ to, label, icon: Icon }) {
  return (
    <div className="mt-6">
      <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Admin</p>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
            isActive
              ? 'bg-white/[0.06] text-teal-300 shadow-[0_0_0_1px_rgba(129,193,75,0.25)_inset]'
              : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
          }`
        }
      >
        <Icon className="h-4 w-4 text-slate-500 group-hover:text-slate-300" />
        {label}
      </NavLink>
    </div>
  )
}

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
  const [showProfile, setShowProfile] = useState(false)

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="h-screen flex">
      {showProfile && <ProfileDialog onClose={() => setShowProfile(false)} />}
      <aside className="w-56 shrink-0 border-r border-white/[0.06] bg-slate-950/50 p-4 flex flex-col gap-1">
        <div className="flex items-center gap-1 px-3 pb-6">
          <img src={logo} alt="distribute" className="h-8 w-8" />
          <p className="text-sm font-semibold tracking-tight text-slate-50">distribute</p>
        </div>

        <nav className="flex flex-col gap-0.5">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-white/[0.06] text-teal-300 shadow-[0_0_0_1px_rgba(129,193,75,0.25)_inset]'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <l.icon className={`h-4 w-4 ${isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {l.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {user.role === 'ADMIN' && <AdminLink to="/app/admin/users" label="Users" icon={ShieldCheck} />}

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
            <button onClick={() => setShowProfile(true)} title="Profile" aria-label="Profile" className="flex min-w-0 flex-1 items-center gap-1.5">
              <img
                src={avatarUrl()}
                alt="Profile"
                className="h-9 w-9 shrink-0 rounded-lg bg-slate-800"
              />
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200 hover:text-slate-50">
                {user.username}
              </p>
            </button>
            <NavLink
              to="/app/settings"
              title="Settings"
              aria-label="Settings"
              className={({ isActive }) => (isActive ? 'icon-btn text-teal-400' : 'icon-btn')}
            >
              <Settings className="h-4 w-4" />
            </NavLink>
            <button onClick={logout} title="Logout" aria-label="Logout" className="icon-btn text-red-400/80 hover:bg-red-500/10 hover:text-red-300">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}