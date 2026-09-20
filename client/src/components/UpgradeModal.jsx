import { useState } from 'react'
import { X, Send } from 'lucide-react'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function UpgradeModal({ contact, onClose }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in your name, email and message')
      return
    }
    setBusy(true)
    try {
      await api.contactOwner({ name: name.trim(), email: email.trim(), message: message.trim() })
      toast.success('Request sent — you will hear back soon')
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90" onClick={onClose} />
      <form onSubmit={submit} className="relative w-full max-w-md rounded-xl border border-teal-700/30 bg-slate-900 p-6 shadow-[0_0_45px_-15px_rgba(46,147,60,0.4)]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-50">Contact to upgrade</h3>
            <p className="mt-0.5 text-sm text-slate-400">Tell us about your sending needs.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="icon-btn">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea
              className="input min-h-28 resize-y"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How many emails do you send per day?"
            />
          </div>
        </div>

        <button type="submit" disabled={busy} className="btn-primary mt-5 w-full">
          <Send className="h-4 w-4" /> {busy ? 'Sending…' : 'Send request'}
        </button>
        {contact && <p className="mt-3 text-center text-xs text-slate-500">Delivered straight to {contact}</p>}
      </form>
    </div>
  )
}