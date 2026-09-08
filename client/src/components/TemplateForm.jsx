import { useState, useMemo } from 'react'
import { Mail, Award, ChevronLeft, ChevronRight } from 'lucide-react'
import CertificateEditor from './CertificateEditor'

const DEFAULT_BODY = `
<!DOCTYPE html>

<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
<div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; padding: 30px; border-radius: 8px;">
    <p style="color: #555555; font-size: 16px; line-height: 1.6;">
        Thank you for participating in our event. We truly appreciate
        your time and involvement.
    </p>

    <p style="color: #555555; font-size: 16px; line-height: 1.6;">
        Please find your certificate of participation attached to this email.
    </p>

    <p style="color: #555555; font-size: 16px; line-height: 1.6;">
        We hope you enjoyed the experience and look forward to seeing you
        again in our future events!
    </p>

    <p style="margin-top: 30px; color: #333333;">
        Best regards,<br>
        <strong>Event Team</strong>
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

function extractVars(subject, body) {
  const names = new Set(['name'])
  for (const text of [subject, body]) {
    for (const m of text.matchAll(/\{(\w+)\}/g)) names.add(m[1])
  }
  return Object.fromEntries([...names].map((n) => [n, '']))
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
  const [cert, setCert] = useState(() => ({
    image: initial?.certificateImage || null,
    imageWidth: initial?.certificateImageWidth || null,
    imageHeight: initial?.certificateImageHeight || null,
    texts: parseTexts(initial?.certificateTexts),
  }))
  const [step, setStep] = useState(1)

  const variables = useMemo(() => JSON.stringify(extractVars(subject, body)), [subject, body])
  const variableNames = useMemo(() => Object.keys(extractVars(subject, body)), [subject, body])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (step !== 2) {
      setStep(2)
      return
    }
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault()
  }

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex-1 min-h-0 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              {i > 0 && <div className={`w-10 h-px ${step > i ? 'bg-teal-500/60' : 'bg-white/10'}`} />}
              <button
                type="button"
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${step === s.id ? 'bg-white/[0.06] text-teal-300 shadow-[0_0_0_1px_rgba(129,193,75,0.25)_inset]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          {step === 2 && (
            <button type="submit" className="btn-primary">
              {initial ? 'Update Template' : 'Create Template'}
            </button>
          )}
        </div>
      </div>

      {step === 1 ? (
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-6">
          <div className="card flex flex-col gap-3 p-6 min-h-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-slate-100">{initial ? 'Edit Template' : 'New Template'}</h3>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm text-teal-400 hover:text-teal-300 inline-flex items-center gap-1"
              >
                Next: Certificate <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Template Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Event Certificate"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="e.g. Your Certificate - {name}"
                  className="input"
                />
              </div>
            </div>

            <p className="text-xs text-slate-600">Use {'{variable}'} for dynamic values, e.g. {'{name}'}, {'{email}'}</p>

            <div className="flex flex-col flex-1 min-h-0">
              <label className="label">HTML Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                className="input w-full min-h-[300px] flex-1 font-mono resize-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              />
            </div>

            <div>
              <label className="label">Detected Variables</label>
              <div className="w-full truncate rounded-lg border border-white/10 bg-slate-950/70 px-3 py-1.5 font-mono text-sm text-teal-300/80">
                {variables}
              </div>
              <p className="text-xs text-slate-600 mt-1">Extracted from subject & body. These must match the column mapping from your Excel upload.</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 min-h-0">
            <h3 className="font-semibold text-lg text-slate-100">Preview</h3>
            <iframe
              title="template-preview"
              sandbox=""
              srcDoc={body.replace(/\{(\w+)\}/g, (_, v) => SAMPLE_VALUES[v] || 'Sample Value')}
              className="w-full flex-1 min-h-0 bg-white rounded-lg border border-white/10"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 min-h-[560px]">
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
            className="text-sm text-teal-400 hover:text-teal-300 inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Email Body
          </button>
        ) : <span />}
      </div>
    </form>
  )
}