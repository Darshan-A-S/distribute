import { useState, useEffect, useRef } from 'react'
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
  const fileRef = useRef(null)
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
      await loadBatches()
      setPreview(null)
      setFile(null)
      setBatchName('')
      fileRef.current.value = ''
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

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
      await loadBatches()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBatches() }, [])

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="page-title">Upload Recipients</h2>
        <p className="text-sm text-slate-500 mt-1">Import an Excel file and map columns to template variables.</p>
      </div>

      <div className="card p-6">
        <div className="space-y-4">
          <div>
            <label className="label">Batch Name</label>
            <input
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="e.g. event-2024-cert"
              className="input"
            />
          </div>

          <div>
            <label className="label">Excel File (.xlsx)</label>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const f = e.target.files[0]
                setFile(f)
                setPreview(null)
                if (f) handlePreview(f)
              }}
              className="block w-full cursor-pointer text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-teal-950 file:cursor-pointer hover:file:bg-teal-400"
            />
          </div>

          {loading && file && !preview && (
            <p className="text-sm text-slate-500">Previewing {file.name}...</p>
          )}

          {preview && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">{preview.totalRows} rows found</p>

              {/* Column Mapping */}
              <div className="rounded-lg border border-white/[0.06] bg-slate-950/50 p-4 space-y-2">
                <p className="text-sm font-medium text-slate-300 mb-2">Map columns to template variables:</p>
                {preview.headers.map((h) => (
                  <div key={h} className="flex items-center gap-3">
                    <span className="w-32 truncate text-xs text-slate-500" title={h}>{h}</span>
                    <span className="text-xs text-slate-600">→</span>
                    <input
                      type="text"
                      value={columnMapping[h] || ''}
                      onChange={(e) => setColumnMapping({ ...columnMapping, [h]: e.target.value })}
                      placeholder="template variable"
                      className="input flex-1 text-xs"
                    />
                  </div>
                ))}
              </div>

              {/* Preview table */}
              <div className="max-h-64 overflow-auto rounded-lg border border-white/[0.06] bg-slate-950/50">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {preview.headers.map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-white/[0.04]">
                        {preview.headers.map((h) => (
                          <td key={h} className="px-3 py-2 text-slate-300">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.rows.length > 5 && (
                  <p className="py-2 text-center text-xs text-slate-600">...and {preview.rows.length - 5} more rows</p>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={loading || !batchName}
                className="btn-primary"
              >
                {loading ? 'Uploading...' : 'Upload & Save'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-lg font-semibold tracking-tight text-slate-100">Uploaded Batches</h3>
        {batches.length === 0 ? (
          <div className="card p-8 text-center text-sm text-slate-500">No batches uploaded yet.</div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs text-slate-400">
                  <th className="px-4 py-3 font-medium">Batch</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Sent</th>
                  <th className="px-4 py-3 font-medium">Pending</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.batch} className="border-b border-white/[0.04] last:border-0">
                    <td className="px-4 py-3 text-slate-200">{b.batch}</td>
                    <td className="px-4 py-3 text-slate-300">{b.total}</td>
                    <td className="px-4 py-3 text-teal-300">{b.sent}</td>
                    <td className="px-4 py-3 text-amber-400">{b.pending}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setConfirmAction({ kind: 'reset', name: b.batch })}
                        disabled={loading}
                        title="Reset"
                        aria-label="Reset"
                        className="icon-btn mr-2 text-teal-400/80 hover:bg-teal-400/10 hover:text-teal-300 disabled:opacity-50"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmAction({ kind: 'delete', name: b.batch })}
                        disabled={loading}
                        title="Delete"
                        aria-label="Delete"
                        className="icon-btn text-red-400/80 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
