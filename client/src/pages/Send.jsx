import { useState, useEffect } from 'react'
import { api } from '../api/api'
import toast from 'react-hot-toast'

export default function Send() {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [batchName, setBatchName] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    api.getTemplates().then(setTemplates).catch(e => toast.error(e.message))
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
      if (s.pending > 0) setTimeout(pollStatus, 2000)
    } catch (e) {}
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Send Emails</h2>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Email Template</label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select a template...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Recipient Batch</label>
          <input
            type="text"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="e.g. event-2024-cert"
            className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !selectedTemplate || !batchName}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send Emails'}
        </button>
      </div>

      {status && (
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-lg p-4 max-w-2xl">
          <h3 className="font-semibold mb-2">Sending Progress</h3>
          <div className="flex gap-6 text-sm">
            <span className="text-green-400">Sent: {status.sent}</span>
            <span className="text-yellow-400">Pending: {status.pending}</span>
          </div>
          {status.pending > 0 && (
            <div className="mt-2 w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${(status.sent / (status.sent + status.pending)) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
