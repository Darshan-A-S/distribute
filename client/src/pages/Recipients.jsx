import { useState, useEffect } from 'react'
import { Trash2, RotateCcw } from 'lucide-react'
import { api } from '../api/api'
import toast from 'react-hot-toast'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Recipients() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [batchName, setBatchName] = useState('')
  const [columnMapping, setColumnMapping] = useState({})
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [currentBatch, setCurrentBatch] = useState('')
  const [batches, setBatches] = useState([])
  const [confirmAction, setConfirmAction] = useState(null)

  const handlePreview = async (f = file) => {
    if (!f) return toast.error('Select a file first')
    setLoading(true)
    try {
      const data = await api.previewExcel(f)
      setPreview(data)
      // Auto-init column mapping with name/email guesses
      const mapping = {}
      data.headers.forEach((h) => {
        const lower = h.toLowerCase()
        if (lower === 'name' || lower === 'full name' || lower === 'participant name') mapping['name'] = h
        else if (lower === 'email' || lower === 'email address') mapping['email'] = h
        else mapping[h] = h // map to self for other columns
      })
      setColumnMapping(mapping)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!file || !batchName) return toast.error('Fill in batch name')
    setLoading(true)
    try {
      const result = await api.uploadRecipients(file, batchName, columnMapping)
      toast.success(`Uploaded ${result.count} recipients to "${result.batchName}"`)
      setCurrentBatch(result.batchName)
      const s = await api.getBatchStats(result.batchName)
      setStats(s)
      setPreview(null)
      setFile(null)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!currentBatch) return
    try {
      const s = await api.getBatchStats(currentBatch)
      setStats(s)
    } catch (e) {}
  }

  useEffect(() => { loadStats() }, [currentBatch])

  const loadBatches = async () => {
    try {
      const data = await api.getBatches()
      setBatches(data)
    } catch (e) {
      toast.error(e.message)
    }
  }

  const runDeleteBatch = async (name) => {
    setLoading(true)
    try {
      await api.deleteBatch(name)
      toast.success(`Deleted batch "${name}"`)
      if (currentBatch === name) { setCurrentBatch(''); setStats(null) }
      await loadBatches()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const runResetBatch = async (name) => {
    setLoading(true)
    try {
      const result = await api.resetBatch(name)
      toast.success(`Reset ${result.reset} recipients in "${name}"`)
      if (currentBatch === name) await loadStats()
      await loadBatches()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBatches() }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Upload Recipients</h2>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Batch Name</label>
            <input
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="e.g. event-2024-cert"
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Excel File (.xlsx)</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const f = e.target.files[0]
                setFile(f)
                setPreview(null)
                if (f) handlePreview(f)
              }}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer"
            />
          </div>

          {loading && file && !preview && (
            <p className="text-sm text-gray-500">Previewing {file.name}...</p>
          )}

          {preview && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">{preview.totalRows} rows found</p>

              {/* Column Mapping */}
              <div className="bg-gray-950 rounded p-4 space-y-2">
                <p className="text-sm font-medium text-gray-300 mb-2">Map columns to template variables:</p>
                {preview.headers.map((h) => (
                  <div key={h} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-32 truncate" title={h}>{h}</span>
                    <span className="text-xs text-gray-600">→</span>
                    <input
                      type="text"
                      value={columnMapping[h] || ''}
                      onChange={(e) => setColumnMapping({ ...columnMapping, [h]: e.target.value })}
                      placeholder="template variable"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>

              {/* Preview table */}
              <div className="max-h-64 overflow-auto bg-gray-950 rounded">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {preview.headers.map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-gray-400 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-gray-800/50">
                        {preview.headers.map((h) => (
                          <td key={h} className="px-3 py-2 text-gray-300">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.rows.length > 5 && (
                  <p className="text-center text-gray-600 text-xs py-2">...and {preview.rows.length - 5} more rows</p>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={loading || !batchName}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload & Save'}
              </button>
            </div>
          )}
        </div>
      </div>

      {stats && currentBatch && (
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-lg p-4 max-w-2xl">
          <h3 className="font-semibold mb-2">Current Batch: {currentBatch}</h3>
          <div className="flex gap-6 text-sm">
            <span className="text-green-400">Sent: {stats.sent}</span>
            <span className="text-yellow-400">Pending: {stats.pending}</span>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">Uploaded Batches</h3>
        {batches.length === 0 ? (
          <p className="text-gray-500 text-sm">No batches uploaded yet.</p>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden max-w-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-xs text-gray-400">
                  <th className="px-4 py-3 font-medium">Batch</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Sent</th>
                  <th className="px-4 py-3 font-medium">Pending</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.batch} className="border-b border-gray-800/50 last:border-0">
                    <td className="px-4 py-3 text-gray-200">{b.batch}</td>
                    <td className="px-4 py-3">{b.total}</td>
                    <td className="px-4 py-3 text-green-400">{b.sent}</td>
                    <td className="px-4 py-3 text-yellow-400">{b.pending}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setConfirmAction({ kind: 'reset', name: b.batch })}
                        disabled={loading}
                        title="Reset"
                        aria-label="Reset"
                        className="text-indigo-400 hover:text-indigo-300 disabled:opacity-50 mr-3"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setConfirmAction({ kind: 'delete', name: b.batch })}
                        disabled={loading}
                        title="Delete"
                        aria-label="Delete"
                        className="text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmAction && (
        <ConfirmDialog
          danger={confirmAction.kind === 'delete'}
          title={confirmAction.kind === 'delete' ? 'Delete batch' : 'Reset batch'}
          message={confirmAction.kind === 'delete'
            ? `All recipients in "${confirmAction.name}" will be permanently deleted. This cannot be undone.`
            : `All recipients in "${confirmAction.name}" will be marked as unsent and can be selected again for sending.`}
          confirmLabel={confirmAction.kind === 'delete' ? 'Delete' : 'Reset'}
          loading={loading}
          onConfirm={() => {
            const { kind, name } = confirmAction
            setConfirmAction(null)
            if (kind === 'delete') runDeleteBatch(name)
            else runResetBatch(name)
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  )
}
