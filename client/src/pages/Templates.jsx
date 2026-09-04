import { useState, useEffect } from 'react'
import { api } from '../api/api'
import toast from 'react-hot-toast'
import TemplateForm from '../components/TemplateForm'

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

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

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return
    try {
      await api.deleteTemplate(id)
      toast.success('Deleted')
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const handleEdit = (t) => {
    setEditing(t)
    setShowForm(true)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Email Templates</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          + New Template
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
            <p className="text-gray-500">No templates yet. Create one to get started.</p>
          )}

          <div className="grid gap-4">
            {templates.map((t) => (
              <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{t.name}</h3>
                    <p className="text-sm text-gray-400">Subject: {t.subject}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(t)} className="text-sm text-indigo-400 hover:text-indigo-300">Edit</button>
                    <button onClick={() => handleDelete(t.id)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500 bg-gray-950 rounded p-3 max-h-32 overflow-auto font-mono whitespace-pre-wrap">
                  {t.body.substring(0, 200)}{t.body.length > 200 ? '...' : ''}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
