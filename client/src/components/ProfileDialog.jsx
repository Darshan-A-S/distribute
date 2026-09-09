import { useEffect, useState } from 'react'
import { X, Mail, FileText, Layers, Calendar, ShieldCheck, Send } from 'lucide-react'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'

function avatarUrl() {
  let seed = localStorage.getItem('avatarSeed')
  if (!seed) {
    seed = Math.random().toString(36).slice(2, 10)
    localStorage.setItem('avatarSeed', seed)
  }
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}`
}

export default function ProfileDialog({ onClose }) {
  const { user } = useAuth()
  const [templateCount, setTemplateCount] = useState('—')
  const [batchCount, setBatchCount] = useState('—')
  const [sentCount, setSentCount] = useState('—')

  useEffect(() => {
    api.getTemplates().then((t) => setTemplateCount(t.length)).catch(() => {})
    api.getBatches().then((b) => setBatchCount(b.length)).catch(() => {})
    api.getRecentSends()
      .then((j) => setSentCount(j.reduce((n, x) => n + (x.success || 0), 0)))
      .catch(() => {})
  }, [])

  const stats = [
    { label: 'Templates', value: templateCount, icon: FileText },
    { label: 'Batches', value: batchCount, icon: Layers },
    { label: 'Emails sent', value: sentCount, icon: Send },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-teal-700/30 bg-slate-900 p-6 shadow-[0_0_45px_-15px_rgba(46,147,60,0.4)]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={avatarUrl()} alt="Profile" className="h-14 w-14 rounded-xl bg-slate-800" />
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-50">{user?.username}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="icon-btn">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 border-t border-white/[0.06] pt-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
              <Mail className="h-3.5 w-3.5" /> Email
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-200">
              {user?.email || '—'}
              {user?.emailVerified && <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />}
            </p>
          </div>

          <div>
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
              <Calendar className="h-3.5 w-3.5" /> Member since
            </p>
            <p className="mt-0.5 text-sm text-slate-200">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                <s.icon className="mx-auto mb-1.5 h-4 w-4 text-teal-400" />
                <p className="text-lg font-semibold text-slate-50">{s.value}</p>
                <p className="text-[11px] text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}