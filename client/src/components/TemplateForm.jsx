import { useState, useMemo } from 'react'
import { Mail, Award, ChevronLeft, ChevronRight } from 'lucide-react'
import CertificateEditor from './CertificateEditor'

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
  Congratulations, {name}! 🎉
</h2>

<p style="font-size:16px; color:#444; line-height:1.6;">
  We're pleased to share your certificate for
  <strong>{courseName}</strong>.
</p>

<p style="font-size:16px; color:#444; line-height:1.6;">
  You can download your certificate using the button below.
</p>

<div style="text-align:center; margin:30px 0;">
  <a href="{certificateUrl}"
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
  <strong>{organizationName}</strong>
</p>
</div>
</body>
</html>
`

const SAMPLE_VALUES = { name: 'John Doe', email: 'john@example.com', course: 'Java Development', date: 'January 15, 2025' }

const STEPS = [
  { id: 1, label: 'Email Body', icon: Mail },
  { id: 2, label: 'Certificate Setup', icon: Award },
]

function parseVars(json) {
  try {
    const obj = JSON.parse(json || '{}')
    return Object.keys(obj)
  } catch {
    return []
  }
}

function parseTexts(json) {
  try {
    const arr = JSON.parse(json || '[]')
    if (!Array.isArray(arr)) return []
    return arr.map((t) => ({
      id: t.id || crypto.randomUUID(),
      variable: t.variable ?? '',
      x: t.x ?? 0.5,
      y: t.y ?? 0.5,
      fontSize: t.fontSize ?? 36,
      fontFamily: t.fontFamily || 'Georgia, serif',
      color: t.color || '#000000',
      align: t.align || 'center',
    }))
  } catch {
    return []
  }
}

export default function TemplateForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [subject, setSubject] = useState(initial?.subject || '')
  const [body, setBody] = useState(initial?.body || DEFAULT_BODY)
  const [variables, setVariables] = useState(initial?.variablesJson || '{"name":"", "email":""}')
  const [cert, setCert] = useState(() => ({
    image: initial?.certificateImage || null,
    imageWidth: initial?.certificateImageWidth || null,
    imageHeight: initial?.certificateImageHeight || null,
    texts: parseTexts(initial?.certificateTexts),
  }))
  const [step, setStep] = useState(1)

  const variableNames = useMemo(() => parseVars(variables), [variables])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      name,
      subject,
      body,
      variablesJson: variables,
      certificateImage: cert.image,
      certificateImageWidth: cert.imageWidth,
      certificateImageHeight: cert.imageHeight,
      certificateTexts: JSON.stringify(cert.texts),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              {i > 0 && <div className={`w-10 h-px ${step > i ? 'bg-indigo-500' : 'bg-gray-700'}`} />}
              <button
                type="button"
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${step === s.id ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
            Cancel
          </button>
          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors inline-flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
              {initial ? 'Update Template' : 'Create Template'}
            </button>
          )}
        </div>
      </div>

      {step === 1 ? (
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col gap-3 min-h-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{initial ? 'Edit Template' : 'New Template'}</h3>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
              >
                Next: Certificate <ChevronRight className="w-4 h-4" />
              </button>
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
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <CertificateEditor
            value={cert}
            onChange={setCert}
            variables={variableNames}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        {step === 2 ? (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-sm text-gray-400 hover:text-gray-200 inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Email Body
          </button>
        ) : <span />}

        <p className="text-xs text-gray-600">
          Step {step} of 2 — {step === 1 ? 'Write your email & define variables' : 'Upload a certificate (image or PDF) and position the text fields'}
        </p>
      </div>
    </form>
  )
}