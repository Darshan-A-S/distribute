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
  const [status, setStatus] = useState(null)
  const [recent, setRecent] = useState([])

  const loadRecent = () => api.getRecentSends().then(setRecent).catch(() => {})
  const loadBatches = () => api.getBatches().then(setBatches).catch(() => {})
  useEffect(() => {
    api.getTemplates().then(setTemplates).catch(e => toast.error(e.message))
    loadBatches()
    loadRecent()
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
      pollStatus()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSending(false)
    }
  }

  const pollStatus = async () => {
    try {
      const s = await api.getSendStatus(batchName)
      setStatus(s)
      if (s.pending > 0) {
        setTimeout(pollStatus, 2000)
      } else {
        loadBatches()
        loadRecent()
      }
    } catch (e) {}
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
            <p className="text-xs text-slate-500 mt-1.5">No batches uploaded yet — import recipients first.</p>
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

      {status && (
        <div className="card mt-6 p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-200">Sending Progress</h3>
          <div className="flex gap-5 text-sm">
            <span className="font-medium text-teal-300">Sent: {status.sent}</span>
            <span className="font-medium text-amber-400">Pending: {status.pending}</span>
            {status.failed > 0 && <span className="font-medium text-red-400">Failed: {status.failed}</span>}
          </div>
          {status.pending > 0 && (
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-300"
                style={{ width: `${(status.sent / (status.sent + status.pending)) * 100}%` }}
              />
            </div>
          )}
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
