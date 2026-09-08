import { useState, useEffect, useRef } from 'react'
import { Trash2, SquarePen, Plus, Library, Copy, Globe } from 'lucide-react'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import TemplateForm from '../components/TemplateForm'
import ConfirmDialog from '../components/ConfirmDialog'

const SAMPLE_VALUES = { name: 'John Doe', email: 'john@example.com', course: 'Java Development', date: 'January 15, 2025' }

function TemplatePreview({ body }) {
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
      className="mt-3 w-full h-56 bg-white rounded-lg border border-white/10 shrink-0"
    />
  )
}

function LibraryCard({ t, isAdmin, onCustomize, onEdit, onDelete, forking }) {
  return (
    <div className="card group flex flex-col p-4 transition-colors duration-150 hover:border-white/15">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-lg text-slate-100">{t.name}</h3>
          <p className="truncate text-xs text-slate-500">{t.subject}</p>
        </div>
        {isAdmin && (
          <div className="flex gap-1">
            <button onClick={() => onEdit(t)} title="Edit" aria-label="Edit" className="icon-btn"><SquarePen className="h-4 w-4" /></button>
            <button onClick={() => onDelete(t)} title="Delete" aria-label="Delete" className="icon-btn text-red-400/80 hover:bg-red-500/10 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
          </div>
        )}
      </div>
      <TemplatePreview body={t.body} />
      <button
        onClick={() => (isAdmin ? onEdit(t) : onCustomize(t))}
        disabled={forking}
        className="btn-primary mt-3 w-full justify-center disabled:opacity-60"
      >
        <Copy className="h-4 w-4" />
        {isAdmin ? 'Edit & Save' : 'Customize this template'}
      </button>
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
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmPublish, setConfirmPublish] = useState(null)
  const [deleting, setDeleting] = useState(false)

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="page-title">Email Templates</h2>
        </div>
        {!showForm && (
          <div className="flex gap-3">
            <button onClick={() => document.getElementById('library-section')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary">
              <Library className="h-4 w-4" />
              Browse Templates
            </button>
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
      ) : (
        <>
          <section id="library-section" className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Template Library
              </h3>
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
                  <LibraryCard
                    key={t.id}
                    t={t}
                    isAdmin={isAdmin}
                    onCustomize={handleCustomize}
                    onEdit={handleEdit}
                    onDelete={setConfirmDelete}
                    forking={forking}
                  />
                ))}
              </div>
            )}
          </section>

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
                <div key={t.id} className="card group p-4 transition-colors duration-150 hover:border-white/15">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-lg text-slate-100">{t.name}</h3>
                      <p className="truncate text-sm text-slate-500">Subject: {t.subject}</p>
                    </div>
                    <div className="flex gap-1">
                      {isAdmin && (
                        <button onClick={() => setConfirmPublish(t)} title="Publish to library" aria-label="Publish to library" className="icon-btn text-teal-400/80 hover:bg-teal-400/10 hover:text-teal-300"><Globe className="h-4 w-4" /></button>
                      )}
                      <button onClick={() => handleEdit(t)} title="Edit" aria-label="Edit" className="icon-btn"><SquarePen className="h-4 w-4" /></button>
                      <button onClick={() => setConfirmDelete(t)} title="Delete" aria-label="Delete" className="icon-btn text-red-400/80 hover:bg-red-500/10 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <TemplatePreview body={t.body} />
                </div>
              ))}
            </div>
          </section>
        </>
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