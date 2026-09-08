import { useState, useEffect } from 'react'
import { Trash2, ShieldCheck, Shield, ShieldOff } from 'lucide-react'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import ConfirmDialog from '../components/ConfirmDialog'

export default function AdminUsers() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmRole, setConfirmRole] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () => api.getUsers().then(setUsers).catch(e => toast.error(e.message))
  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    if (!confirmDelete) return
    setBusy(true)
    try {
      await api.deleteUser(confirmDelete.id)
      toast.success('User deleted')
      load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
      setConfirmDelete(null)
    }
  }

  const handleRole = async () => {
    if (!confirmRole) return
    setBusy(true)
    try {
      await api.setUserRole(confirmRole.id, confirmRole.role)
      toast.success(confirmRole.role === 'ADMIN' ? 'User promoted to admin' : 'Admin role removed')
      load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
      setConfirmRole(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="page-title">Users</h2>
          <span className="rounded-full bg-teal-400/10 px-2 py-0.5 text-xs font-medium text-teal-300 inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Admin
          </span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 font-semibold">Username</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/[0.04] last:border-0">
                <td className="px-4 py-3 font-medium text-slate-200">
                  {u.username}
                  {u.id === user?.id && <span className="ml-2 text-xs text-slate-500">(you)</span>}
                </td>
                <td className="px-4 py-3 text-slate-400">{u.email || '—'}</td>
                <td className="px-4 py-3">
                  {u.role === 'ADMIN' ? (
                    <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-300">Admin</span>
                  ) : (
                    <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-slate-400">User</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex gap-1">
                    {u.id !== user?.id && (u.role === 'ADMIN' ? (
                      <button
                        onClick={() => setConfirmRole({ id: u.id, role: 'USER', username: u.username })}
                        title="Remove admin role"
                        aria-label="Remove admin role"
                        className="icon-btn text-amber-400/80 hover:bg-amber-500/10 hover:text-amber-300"
                      >
                        <ShieldOff className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmRole({ id: u.id, role: 'ADMIN', username: u.username })}
                        title="Make admin"
                        aria-label="Make admin"
                        className="icon-btn text-teal-400/80 hover:bg-teal-400/10 hover:text-teal-300"
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                    ))}
                    <button
                      onClick={() => setConfirmDelete(u)}
                      disabled={u.id === user?.id}
                      title={u.id === user?.id ? 'You cannot delete your own account' : 'Delete user'}
                      aria-label="Delete user"
                      className="icon-btn text-red-400/80 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          danger
          title="Delete user"
          message={`User "${confirmDelete.username}" will be permanently deleted. Their templates and recipient batches are kept.`}
          confirmLabel="Delete"
          loading={busy}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {confirmRole && (
        <ConfirmDialog
          title={confirmRole.role === 'ADMIN' ? 'Promote to admin' : 'Remove admin role'}
          message={
            confirmRole.role === 'ADMIN'
              ? `"${confirmRole.username}" will get full admin access (library, users, sending).`
              : `"${confirmRole.username}" will lose admin access and become a regular user.`
          }
          confirmLabel={confirmRole.role === 'ADMIN' ? 'Promote' : 'Remove'}
          loading={busy}
          onConfirm={handleRole}
          onCancel={() => setConfirmRole(null)}
        />
      )}
    </div>
  )
}