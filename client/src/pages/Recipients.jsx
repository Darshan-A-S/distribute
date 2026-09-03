import { useState, useEffect } from 'react'
import { api } from '../api/api'
import toast from 'react-hot-toast'

export default function Recipients() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [batchName, setBatchName] = useState('')
  const [columnMapping, setColumnMapping] = useState({})
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [currentBatch, setCurrentBatch] = useState('')

  const handlePreview = async () => {
    if (!file) return toast.error('Select a file first')
    setLoading(true)
    try {
      const data = await api.previewExcel(file)
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
              onChange={(e) => { setFile(e.target.files[0]); setPreview(null) }}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer"
            />
          </div>

          {file && !preview && (
            <button
              onClick={handlePreview}
              disabled={loading}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Preview Excel'}
            </button>
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
    </div>
  )
}
