import { useState, useEffect, useRef } from 'react'
import { Trash2, SquarePen, Plus, Library, Copy, Globe, X, ArrowLeft } from 'lucide-react'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import TemplateForm from '../components/TemplateForm'
import ConfirmDialog from '../components/ConfirmDialog'

const SAMPLE_VALUES = { name: 'John Doe', email: 'john@example.com', course: 'Java Development', date: 'January 15, 2025' }

function TemplatePreview({ body, fill = false }) {
  const ref = useRef(null)

  const onLoad = () => {
    const doc = ref.current.contentDocument
    if (!doc) return
    doc.documentElement.style.overflow = 'hidden'
    doc.body.style.overflow = 'hidden'
    doc.body.style.margin = '0'
    const cw = ref.current.clientWidth
    const ch = ref.current.clientHeight
    const dw = doc.documentElement.scrollWidth
    const dh = doc.documentElement.scrollHeight
    const scale = Math.min(cw / dw || 1, ch / dh || 1, 1)
    doc.body.style.transformOrigin = 'top left'
    doc.body.style.transform = `scale(${scale})`
  }

  return (
    <iframe
      ref={ref}
      title="Template preview"
      sandbox=""
      onLoad={onLoad}
      srcDoc={body.replace(/\{(\w+)\}/g, (_, v) => SAMPLE_VALUES[v] || 'Sample Value')}
      className={`bg-white rounded-lg border border-white/10 ${fill ? 'w-full h-full' : 'mt-3 w-full h-56 shrink-0'}`}
    />
  )
}

function TemplateDialog({ t, actionLabel, onAction, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90" onClick={onClose} />
      <div className="relative flex h-[40vh] w-full max-w-4xl overflow-hidden rounded-xl border border-teal-700/30 bg-slate-900 shadow-[0_0_45px_-15px_rgba(46,147,60,0.4)]">
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
          <TemplatePreview body={t.body} fill />
        </div>

        <div className="flex w-72 shrink-0 flex-col gap-4 border-l border-white/[0.06] p-6">
          <button onClick={onClose} aria-label="Close" className="icon-btn self-end">
            <X className="h-4 w-4" />
          </button>
          <div>
            <h3 className="break-words text-xl font-semibold tracking-tight text-slate-50">{t.name}</h3>
            <p className="mt-1.5 text-sm text-slate-400">{t.subject}</p>
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <button onClick={onAction} className="btn-primary w-full justify-center">
              <Copy className="h-4 w-4" />
              {actionLabel}
            </button>
            <button onClick={onClose} className="btn-secondary w-full justify-center">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TemplateCard({ t, isAdmin, onOpen, onEdit, onDelete, onPublish }) {
  return (
    <div onClick={() => onOpen(t)} className="card group cursor-pointer p-4 transition-colors duration-150 hover:border-teal-400/30">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-lg text-slate-100">{t.name}</h3>
          <p className="truncate text-xs text-slate-500">{t.subject}</p>
        </div>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          {isAdmin && onPublish && (
            <button onClick={() => onPublish(t)} title="Publish to library" aria-label="Publish to library" className="icon-btn text-teal-400/80 hover:bg-teal-400/10 hover:text-teal-300"><Globe className="h-4 w-4" /></button>
          )}
          {onEdit && <button onClick={() => onEdit(t)} title="Edit" aria-label="Edit" className="icon-btn"><SquarePen className="h-4 w-4" /></button>}
          {onDelete && <button onClick={() => onDelete(t)} title="Delete" aria-label="Delete" className="icon-btn text-red-400/80 hover:bg-red-500/10 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>}
        </div>
      </div>
      <TemplatePreview body={t.body} />
      <span className="mt-3 inline-block text-sm font-medium text-teal-400 group-hover:text-teal-300">View template</span>
    </div>
  )
}

export default function Templates() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [templates, setTemplates] = useState([])
  const [library, setLibrary] = useState([])
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [isFork, setIsFork] = useState(false)
  const [forkFrom, setForkFrom] = useState(null)
  const [forking, setForking] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmPublish, setConfirmPublish] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [browsing, setBrowsing] = useState(false)

  const load = () => {
    api.getTemplates().then(setTemplates).catch(e => toast.error(e.message))
    api.getLibraryTemplates().then(setLibrary).catch(e => toast.error(e.message))
  }
  useEffect(() => { load() }, [])

  const handleSave = async (data) => {
    try {
      if (forkFrom) {
        const fork = await api.saveLibraryTemplate(forkFrom)
        await api.updateTemplate(fork.id, data)
        toast.success('Template saved')
      } else if (editing?.builtIn) {
        await api.updateLibraryTemplate(editing.id, data)
        toast.success('Library template updated')
      } else if (editing && data.builtIn) {
        await api.publishTemplate(editing.id)
        toast.success('Published to library')
      } else if (editing) {
        await api.updateTemplate(editing.id, data)
        toast.success('Template updated')
      } else if (data.builtIn) {
        await api.createTemplate(data)
        toast.success('Published to library')
      } else {
        await api.createTemplate(data)
        toast.success('Template created')
      }
      setShowForm(false)
      setEditing(null)
      setIsFork(false)
      setForkFrom(null)
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const handleCustomize = async (t) => {
    if (forking) return
    setForking(true)
    try {
      setEditing(t)
      setForkFrom(t.id)
      setIsFork(true)
      setShowForm(true)
      toast.success('Copied to your templates — personalize and save')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setForking(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      if (confirmDelete.builtIn) {
        await api.deleteLibraryTemplate(confirmDelete.id)
        toast.success('Removed from library')
      } else {
        await api.deleteTemplate(confirmDelete.id)
        toast.success('Deleted')
      }
      load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
      setConfirmDelete(null)
    }
  }

  const handleEdit = (t) => {
    setEditing(t)
    setShowForm(true)
  }

  const handlePublish = async () => {
    if (!confirmPublish) return
    setDeleting(true)
    try {
      await api.publishTemplate(confirmPublish.id)
      toast.success('Published to library')
      load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
      setConfirmPublish(null)
    }
  }

  const openDialog = (t) => setViewing(t)

  const handleViewAction = () => {
    if (!viewing) return
    const t = viewing
    setViewing(null)
    if (t.builtIn && !isAdmin) handleCustomize(t)
    else handleEdit(t)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="page-title">Email Templates</h2>
        {!showForm && (
          <div className="flex gap-3">
            {browsing ? (
              <button onClick={() => setBrowsing(false)} className="btn-secondary">
                <ArrowLeft className="h-4 w-4" />
                My Templates
              </button>
            ) : (
              <button onClick={() => setBrowsing(true)} className="btn-secondary">
                <Library className="h-4 w-4" />
                Browse Templates
              </button>
            )}
            <button
              onClick={() => { setEditing(null); setShowForm(true) }}
              className="btn-primary"
            >
              <Plus className="h-4 w-4" />
              Create New Template
            </button>
          </div>
        )}
      </div>

      {showForm ? (
        <TemplateForm
          initial={editing}
          isAdmin={isAdmin}
          forked={isFork}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditing(null)
            setIsFork(false)
            setForkFrom(null)
          }}
        />
      ) : browsing ? (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Template Library</h3>
          </div>

          {library.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/10">
                <Library className="h-6 w-6 text-teal-400" />
              </div>
              <p className="font-medium text-slate-200">No templates in the library yet</p>
              {isAdmin && <p className="text-sm text-slate-500">Create a template and check "Publish to Template Library" to add one.</p>}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {library.map((t) => (
                <TemplateCard
                  key={t.id}
                  t={t}
                  isAdmin={isAdmin}
                  onOpen={openDialog}
                  onEdit={isAdmin ? handleEdit : null}
                  onDelete={isAdmin ? setConfirmDelete : null}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Your Templates</h3>
          </div>

          {templates.length === 0 && (
            <div className="card flex flex-col items-center gap-3 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/10">
                <SquarePen className="h-6 w-6 text-teal-400" />
              </div>
              <p className="font-medium text-slate-200">No personal templates yet</p>
              <p className="text-sm text-slate-500">Create your own or customize one from the library.</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((t) => (
              <TemplateCard
                key={t.id}
                t={t}
                isAdmin={isAdmin}
                onOpen={openDialog}
                onEdit={handleEdit}
                onDelete={setConfirmDelete}
                onPublish={isAdmin ? setConfirmPublish : null}
              />
            ))}
          </div>
        </section>
      )}

      {viewing && (
        <TemplateDialog
          t={viewing}
          actionLabel={(viewing.builtIn && !isAdmin) ? 'Customize this template' : 'Edit template'}
          onAction={handleViewAction}
          onClose={() => setViewing(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          danger
          title={confirmDelete.builtIn ? 'Remove from library' : 'Delete template'}
          message={confirmDelete.builtIn
            ? `"${confirmDelete.name}" will be removed from the library for all users. This cannot be undone.`
            : `Template "${confirmDelete.name}" will be permanently deleted. This cannot be undone.`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {confirmPublish && (
        <ConfirmDialog
          title="Publish to library"
          message={`"${confirmPublish.name}" will be shared with all users as a built-in template. It will be removed from your personal templates.`}
          confirmLabel="Publish"
          loading={deleting}
          onConfirm={handlePublish}
          onCancel={() => setConfirmPublish(null)}
        />
      )}
    </div>
  )
}