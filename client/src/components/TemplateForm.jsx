import { useState } from 'react'

const DEFAULT_BODY = `<!DOCTYPE html>

<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate</title>
</head>

<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:Arial, sans-serif;">
  <div style="max-width:600px; margin:30px auto; background:#ffffff; padding:30px; border-radius:8px;">

<h2 style="margin-top:0; color:#222;">
  Congratulations, {{name}}! 🎉
</h2>

<p style="font-size:16px; color:#444; line-height:1.6;">
  We're pleased to share your certificate for
  <strong>{{courseName}}</strong>.
</p>

<p style="font-size:16px; color:#444; line-height:1.6;">
  You can download your certificate using the button below.
</p>

<div style="text-align:center; margin:30px 0;">
  <a href="{{certificateUrl}}"
     style="display:inline-block;
            padding:12px 24px;
            background:#2563eb;
            color:#ffffff;
            text-decoration:none;
            border-radius:6px;
            font-size:15px;">
    View Certificate
  </a>
</div>

<p style="font-size:14px; color:#777; line-height:1.5;">
  Congratulations once again, and we wish you all the best!
</p>

<p style="font-size:14px; color:#777;">
  Regards,<br>
  <strong>{{organizationName}}</strong>
</p>
</div>
</body>
</html>
`

const SAMPLE_VALUES = { name: 'John Doe', email: 'john@example.com', course: 'Java Development', date: 'January 15, 2025' }

export default function TemplateForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [subject, setSubject] = useState(initial?.subject || '')
  const [body, setBody] = useState(initial?.body || DEFAULT_BODY)
  const [variables, setVariables] = useState(initial?.variablesJson || '{"name":"", "email":""}')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ name, subject, body, variablesJson: variables })
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 min-h-0 grid grid-cols-2 gap-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col gap-3 min-h-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{initial ? 'Edit Template' : 'New Template'}</h3>
          <div className="flex gap-3">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
              {initial ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={onCancel} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
              Cancel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Template Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Event Certificate"
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="e.g. Your Certificate - {name}"
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <p className="text-xs text-gray-600">Use {'{variable}'} for dynamic values, e.g. {'{name}'}, {'{email}'}</p>

        <div className="flex flex-col flex-1 min-h-0">
          <label className="block text-sm font-medium text-gray-400 mb-1">HTML Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            className="w-full min-h-0 flex-1 resize-none bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-indigo-500 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Available Variables (JSON)</label>
          <input
            type="text"
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-indigo-500"
          />
          <p className="text-xs text-gray-600 mt-1">These must match the column mapping from your Excel upload</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 min-h-0">
        <h3 className="font-semibold text-lg">Preview</h3>
        <iframe
          title="template-preview"
          sandbox=""
          srcDoc={body.replace(/\{(\w+)\}/g, (_, v) => SAMPLE_VALUES[v] || 'Sample Value')}
          className="w-full flex-1 min-h-0 bg-white rounded-lg border border-gray-700"
        />
        <p className="text-xs text-gray-600">Live preview with sample values. Unknown variables show as 'Sample Value'.</p>
      </div>
    </form>
  )
}
