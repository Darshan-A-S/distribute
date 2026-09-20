import { useState, useEffect } from 'react'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import UpgradeModal from '../components/UpgradeModal'
import { Check, Mail, Zap } from 'lucide-react'

export default function Plan() {
  const { user } = useAuth()
  const [plans, setPlans] = useState([])
  const [contact, setContact] = useState('')
  const [usage, setUsage] = useState(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  useEffect(() => {
    api.getPlans()
      .then((r) => {
        setPlans(r.plans || [])
        setContact(r.contactEmail || '')
      })
      .catch(() => {})
    api.getUsage().then(setUsage).catch(() => {})
  }, [])

  const myPlan = user?.plan || 'FREE'
  const pct = usage && usage.dailyLimit ? Math.min(100, Math.round((usage.usedToday / usage.dailyLimit) * 100)) : 0

  const mailto = contact ? `mailto:${contact}?subject=${encodeURIComponent('Pro plan upgrade')}` : null

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="page-title">Plan</h1>
        <p className="text-sm text-slate-500 mt-1">Your sending allowance and available plans.</p>
      </div>

      <section className="card p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${myPlan === 'PRO' ? 'bg-teal-500/10 border border-teal-500/20 text-teal-300' : 'bg-white/[0.06] text-slate-300'}`}>
              {myPlan}
            </span>
            <p className="text-lg font-semibold tracking-tight text-slate-50">{myPlan === 'PRO' ? 'Pro plan' : 'Free plan'}</p>
          </div>
          {myPlan !== 'PRO' && contact && (
            <button onClick={() => setUpgradeOpen(true)} className="btn-primary">
              <Mail className="h-4 w-4" /> Contact to upgrade
            </button>
          )}
        </div>

        {usage && (
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-slate-400">Emails sent today</span>
              <span className="font-medium text-slate-200">
                {usage.usedToday} of {usage.dailyLimit}
                {usage.remaining > 0 ? ` · ${usage.remaining} left` : ' · limit reached'}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${pct >= 100 ? 'bg-red-500' : 'bg-gradient-to-r from-teal-400 to-teal-600'}`}
                style={{ width: `${Math.max(pct, myPlan === 'PRO' ? 0 : 0)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">Resets at {usage.resetsAt ? new Date(usage.resetsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'midnight'}.</p>
          </div>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((p) => {
          const current = p.id === myPlan
          const isPro = p.id === 'PRO'
          return (
            <div key={p.id} className={`card flex flex-col p-6 ${isPro ? 'border-teal-500/30' : ''}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">{p.name}</h3>
                {current && (
                  <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-teal-300">
                    Current
                  </span>
                )}
              </div>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-slate-50">{p.price}</span>
                <span className="text-sm text-slate-500">/ {p.priceNote}</span>
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                    <span className="text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                {current ? (
                  <p className="flex items-center gap-2 text-sm text-teal-300">
                    <Zap className="h-4 w-4" /> Active on your account
                  </p>
                ) : (
                  contact && (
                    <button onClick={() => setUpgradeOpen(true)} className="btn-primary w-full">Contact to upgrade</button>
                  )
                )}
              </div>
            </div>
          )
        })}
      </div>

      {upgradeOpen && <UpgradeModal contact={contact} onClose={() => setUpgradeOpen(false)} />}
    </div>
  )
}