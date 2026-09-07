import { useState, useEffect, useRef } from 'react'
import { Trash2, SquarePen, Plus } from 'lucide-react'
import { api } from '../api/api'
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
      className="mt-3 w-full h-64 bg-white rounded-lg border border-white/10 shrink-0"
    />
  )
}

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => api.getTemplates().then(setTemplates).catch(e => toast.error(e.message))
  useEffect(() => { load() }, [])

  const handleSave = async (data) => {
    try {
      if (editing) {
        await api.updateTemplate(editing.id, data)
        toast.success('Template updated')
      } else {
        await api.createTemplate(data)
        toast.success('Template created')
      }
      setShowForm(false)
      setEditing(null)
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await api.deleteTemplate(confirmDelete.id)
      toast.success('Deleted')
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="page-title">Email Templates</h2>
          <p className="text-sm text-slate-500 mt-1">Create HTML templates with dynamic {'{variables}'} for your certificates.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          New Template
        </button>
      </div>

      {showForm ? (
        <TemplateForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      ) : (
        <>
          {templates.length === 0 && (
            <div className="card flex flex-col items-center gap-3 p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/10">
                <SquarePen className="h-6 w-6 text-teal-400" />
              </div>
              <p className="font-medium text-slate-200">No templates yet</p>
              <p className="text-sm text-slate-500">Create one to get started.</p>
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
                    <button onClick={() => handleEdit(t)} title="Edit" aria-label="Edit" className="icon-btn"><SquarePen className="h-4 w-4" /></button>
                    <button onClick={() => setConfirmDelete(t)} title="Delete" aria-label="Delete" className="icon-btn text-red-400/80 hover:bg-red-500/10 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <TemplatePreview body={t.body} />
              </div>
            ))}
          </div>
        </>
      )}

      {confirmDelete && (
        <ConfirmDialog
          danger
          title="Delete template"
          message={`Template "${confirmDelete.name}" will be permanently deleted. This cannot be undone.`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
