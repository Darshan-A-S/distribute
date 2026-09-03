import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Templates' },
  { to: '/recipients', label: 'Recipients' },
  { to: '/send', label: 'Send' },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex">
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
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
