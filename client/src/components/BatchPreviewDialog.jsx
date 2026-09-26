import { useState, useEffect, useMemo } from 'react'
import { X, Table, Search, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { api } from '../api/api'
import toast from 'react-hot-toast'
import Dropdown from './Dropdown'

export default function BatchPreviewDialog({ batchName, onClose }) {
  const [recipients, setRecipients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (!batchName) return
    let active = true
    setLoading(true)
    api.getBatch(batchName)
      .then((data) => {
        if (active) {
          setRecipients(data || [])
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          toast.error(err.message || 'Failed to load recipients')
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [batchName])

  const parsedRecipients = useMemo(() => {
    return recipients.map((r) => {
      let vars = {}
      if (r.variablesJson) {
        try {
          vars = typeof r.variablesJson === 'object' ? r.variablesJson : JSON.parse(r.variablesJson)
        } catch {}
      }
      return { ...r, parsedVars: vars }
    })
  }, [recipients])

  const dynamicKeys = useMemo(() => {
    const keys = new Set()
    parsedRecipients.forEach((r) => {
      Object.keys(r.parsedVars).forEach((k) => {
        const lower = k.toLowerCase()
        if (lower !== 'name' && lower !== 'email') {
          keys.add(k)
        }
      })
    })
    return Array.from(keys)
  }, [parsedRecipients])

  const hasAnySent = useMemo(() => recipients.some((r) => r.sent), [recipients])

  const filteredRecipients = useMemo(() => {
    let list = parsedRecipients

    if (statusFilter === 'sent') {
      list = list.filter((r) => r.sent)
    } else if (statusFilter === 'failed') {
      list = list.filter((r) => !r.sent)
    }

    if (!searchQuery.trim()) return list
    const q = searchQuery.trim().toLowerCase()
    return list.filter((r) => {
      if (r.name && r.name.toLowerCase().includes(q)) return true
      if (r.email && r.email.toLowerCase().includes(q)) return true
      const statusText = r.sent ? 'sent' : 'failed pending'
      if (statusText.includes(q)) return true
      for (const key of dynamicKeys) {
        const val = r.parsedVars[key]
        if (val !== undefined && val !== null && String(val).toLowerCase().includes(q)) {
          return true
        }
      }
      return false
    })
  }, [parsedRecipients, statusFilter, searchQuery, dynamicKeys])

  const totalItems = filteredRecipients.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const currentRows = filteredRecipients.slice(startIndex, endIndex)

  const goToPage = (p) => {
    setCurrentPage(Math.min(Math.max(1, p), totalPages))
  }

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (safePage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages]
    }
    if (safePage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }
    return [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages]
  }, [totalPages, safePage])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-slate-950/90" onClick={onClose} />
      <div className="relative flex flex-col w-full max-w-5xl max-h-[85vh] rounded-xl border border-teal-700/30 bg-slate-900 shadow-[0_0_45px_-15px_rgba(46,147,60,0.4)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] p-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-400/10 border border-teal-400/20">
              <Table className="h-4 w-4 text-teal-300" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-base sm:text-lg text-slate-50">{batchName}</h3>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="icon-btn shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-6 bg-white/[0.01] flex-wrap relative z-20">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search recipients or variables..."
              className="input pl-8 py-1.5 text-xs"
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="shrink-0">Status:</span>
              <div className="w-24">
                <Dropdown
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val)
                    setCurrentPage(1)
                  }}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'sent', label: 'Sent' },
                    { value: 'failed', label: 'Failed' },
                  ]}
                  placeholder="All"
                  ariaLabel="Filter by status"
                  buttonClassName="!py-1.5 !px-2.5 !text-xs !bg-slate-950/80"
                  menuClassName="!right-0 !text-xs"
                  itemClassName="!py-1.5 !px-2.5 !text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="shrink-0">Rows:</span>
              <div className="w-20">
                <Dropdown
                  value={pageSize}
                  onChange={(val) => {
                    setPageSize(Number(val))
                    setCurrentPage(1)
                  }}
                  options={[
                    { value: 10, label: '10' },
                    { value: 25, label: '25' },
                    { value: 50, label: '50' },
                    { value: 100, label: '100' },
                  ]}
                  placeholder="25"
                  ariaLabel="Rows per page"
                  buttonClassName="!py-1.5 !px-2.5 !text-xs !bg-slate-950/80"
                  menuClassName="!right-0 !text-xs"
                  itemClassName="!py-1.5 !px-2.5 !text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="min-h-0 flex-1 overflow-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center p-8 text-sm text-slate-400">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-teal-950/30 border-t-teal-400 mr-3" />
              Loading batch recipients...
            </div>
          ) : currentRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
              <p className="text-sm font-medium text-slate-400">
                {searchQuery || statusFilter !== 'all'
                  ? 'No recipients match your search or filter'
                  : 'No recipients in this batch'}
              </p>
              {(searchQuery || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                  }}
                  className="mt-2 text-xs text-teal-400 hover:text-teal-300 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="sticky top-0 z-10 bg-slate-900 border-b border-white/[0.08] text-xs uppercase tracking-wider text-slate-400 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold w-12 text-slate-500">#</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  {dynamicKeys.map((k) => (
                    <th key={k} className="px-4 py-3 font-semibold capitalize">
                      {k}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {currentRows.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{startIndex + idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-100">{r.name}</td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">{r.email}</td>
                    {dynamicKeys.map((k) => (
                      <td key={k} className="px-4 py-3 text-slate-300">
                        {r.parsedVars[k] !== undefined && r.parsedVars[k] !== null && r.parsedVars[k] !== '' ? (
                          String(r.parsedVars[k])
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      {r.sent ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-xs font-medium text-teal-300">
                          <CheckCircle2 className="h-3 w-3 text-teal-400" />
                          Sent
                        </span>
                      ) : hasAnySent ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-xs font-medium text-red-300">
                          <AlertTriangle className="h-3 w-3 text-red-400" />
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                          <Clock className="h-3 w-3 text-amber-400" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {r.sentAt ? new Date(r.sentAt).toLocaleString() : <span className="text-slate-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-end border-t border-white/[0.06] px-4 py-3 sm:px-6 bg-slate-900 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage <= 1}
              aria-label="Previous page"
              className="icon-btn disabled:opacity-30 disabled:pointer-events-none p-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {pageNumbers.map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-slate-600 select-none">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-medium transition-colors ${
                    safePage === p
                      ? 'bg-teal-400/10 text-teal-300 border border-teal-500/20'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage >= totalPages}
              aria-label="Next page"
              className="icon-btn disabled:opacity-30 disabled:pointer-events-none p-1.5"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
