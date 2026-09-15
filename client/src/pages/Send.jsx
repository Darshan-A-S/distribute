import { useState, useEffect } from 'react'
import { api } from '../api/api'
import toast from 'react-hot-toast'
import Dropdown from '../components/Dropdown'

export default function Send() {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [batchName, setBatchName] = useState('')
  const [batches, setBatches] = useState([])
  const [sending, setSending] = useState(false)
  const [activeJobs, setActiveJobs] = useState([])
  const [recent, setRecent] = useState([])

  const loadRecent = () => api.getRecentSends().then(setRecent).catch(() => {})
  const loadBatches = () => api.getBatches().then(setBatches).catch(() => {})

  const refreshActive = async () => {
    try {
      const jobs = await api.getActiveSends()
      setActiveJobs(jobs)
      if (jobs.some((j) => j.status === 'QUEUED' || j.status === 'RUNNING')) {
        setTimeout(refreshActive, 2000)
      } else {
        loadBatches()
        loadRecent()
      }
    } catch (e) {}
  }

  useEffect(() => {
    api.getTemplates().then(setTemplates).catch(e => toast.error(e.message))
    loadBatches()
    loadRecent()
    refreshActive()
  }, [])

  const handleSend = async () => {
    if (!selectedTemplate || !batchName) return toast.error('Select template and batch')
    setSending(true)
    try {
      const result = await api.send({
        templateId: Number(selectedTemplate),
        batchName,
      })
      toast.success(result.message)
      setBatchName('')
      refreshActive()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="page-title">Send Emails</h2>
        <p className="text-sm text-slate-500 mt-1">Dispatch your template to every recipient in a batch.</p>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <label className="label">Email Template</label>
          <Dropdown
            value={selectedTemplate}
            onChange={setSelectedTemplate}
            placeholder="Select a template..."
            ariaLabel="Email template"
            options={templates.map((t) => ({ value: String(t.id), label: t.name }))}
          />
        </div>

        <div>
          <label className="label">Recipient Batch</label>
          <Dropdown
            value={batchName}
            onChange={setBatchName}
            placeholder="Select a batch..."
            ariaLabel="Recipient batch"
            options={batches.map((b) => ({ value: b.batch, label: `${b.batch} (${b.pending} unsent)`, disabled: b.pending === 0 }))}
          />
          {batches.length === 0 && (
            <p className="text-xs text-slate-500 mt-1.5">No batches uploaded yet; import recipients first.</p>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !selectedTemplate || !batchName}
          className="btn-primary w-full sm:w-auto"
        >
          {sending ? (
            <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-950/30 border-t-teal-950" /> Sending...</>
          ) : (
            'Send Emails'
          )}
        </button>
        </div>

      {activeJobs.length > 0 && (
        <div className="card mt-6 p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-200">
            Active Sends ({activeJobs.length})
          </h3>
          <div className="space-y-4">
            {activeJobs.map((j) => (
              <div key={j.id} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-100">{j.templateName || 'Template'}</p>
                    <p className="truncate text-sm text-slate-500">Batch: {j.batchName}</p>
                  </div>
                  {j.status === 'QUEUED' ? (
                    <span className="shrink-0 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                      Queued
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 text-xs font-medium text-teal-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
                      Sending
                    </span>
                  )}
                </div>

                {j.status === 'RUNNING' ? (
                  <>
                    <div className="mt-3 flex flex-wrap gap-5 text-sm">
                      <span className="font-medium text-teal-300">Sent: {j.success}</span>
                      <span>Pending: {Math.max(0, j.total - j.success - j.failed)}</span>
                      {j.failed > 0 && <span className="font-medium text-red-400">Failed: {j.failed}</span>}
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-300"
                        style={{ width: `${j.total ? Math.min(100, (j.success / j.total) * 100) : 0}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-xs text-amber-400/80">
                    Waiting; one batch sends at a time per account. Starts automatically when the previous one finishes.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="mb-3 text-lg font-semibold tracking-tight text-slate-100">Recent Sends</h3>
        {recent.length === 0 ? (
          <div className="card p-8 text-center text-sm text-slate-500">No sends yet.</div>
        ) : (
          <div className="space-y-2">
            {recent.map((j) => (
              <div key={j.id} className="card flex items-center justify-between p-4 transition-colors duration-150 hover:border-white/15">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-100">{j.templateName || 'Template'}</p>
                  <p className="truncate text-sm text-slate-500">Batch: {j.batchName} · {new Date(j.startedAt).toLocaleString()}</p>
                </div>
                <div className="shrink-0 text-right text-sm">
                  <p className="font-medium text-teal-300">{j.success} sent{failedCount(j) ? ` · ${failedCount(j)} failed` : ''}</p>
                  <p className={`${j.status === 'DONE' ? 'text-slate-500' : 'text-amber-400'}`}>
                    {j.status} · {j.total} total
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function failedCount(j) {
  return j.failed || 0
}
