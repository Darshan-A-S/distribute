import { useState, useRef, useEffect, useCallback } from 'react'
import { ImagePlus, Type, Trash2, Eye, PenLine } from 'lucide-react'
import Dropdown from './Dropdown'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const SAMPLE = { name: 'John Doe', courseName: 'Advanced Java', organizationName: 'Tech Academy', email: 'john@example.com', date: 'January 15, 2025' }
const DEFAULT_FONTS = ['Georgia, serif', 'Arial, sans-serif', 'Times New Roman, serif', 'Brush Script MT, cursive', 'Courier New, monospace']

const resolve = (variable) => {
  const m = variable.match(/^\{(\w+)\}$/)
  return m ? (SAMPLE[m[1]] || variable) : variable
}

async function rasterizePdf(dataUrl) {
  const bin = atob(dataUrl.split(',')[1])
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
  if (pdf.numPages !== 1) {
    pdf.destroy()
    throw new Error('Certificate PDF must contain exactly one page')
  }
  const page = await pdf.getPage(1)
  const design = page.getViewport({ scale: 1 })
  const hi = page.getViewport({ scale: 3 })
  const canvas = document.createElement('canvas')
  canvas.width = hi.width
  canvas.height = hi.height
  await page.render({ canvasContext: canvas.getContext('2d'), viewport: hi }).promise
  pdf.destroy()
  return { preview: canvas.toDataURL('image/png'), width: design.width, height: design.height }
}

export default function CertificateEditor({ value, onChange, variables = [] }) {
  const [selectedId, setSelectedId] = useState(null)
  const [dragId, setDragId] = useState(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [uploadError, setUploadError] = useState(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const dragRef = useRef(null)
  const imgRef = useRef(null)
  const fileInputRef = useRef(null)

  const { image, imageWidth, imageHeight, texts } = value
  const fontOptions = [...new Set([...DEFAULT_FONTS, ...texts.map((t) => t.fontFamily)])]

  useEffect(() => {
    if (value.image && !value.preview) {
      rasterizePdf(value.image).then(({ preview, width, height }) => {
        onChange({ ...value, preview, imageWidth: width, imageHeight: height })
      }).catch(() => {})
    }
  }, [value.image, value.preview])

  useEffect(() => {
    const src = value.preview || image
    if (!image) { imgRef.current = null; setImageLoaded(false); return }
    setImageLoaded(false)
    const img = new Image()
    img.onload = () => { imgRef.current = img; setImageLoaded(true) }
    img.src = src
  }, [image, value.preview])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => setContainerWidth(entries[0].contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const viewW = imageWidth ? Math.min(containerWidth, imageWidth) : 0
  const viewH = imageHeight ? viewW * (imageHeight / imageWidth) : 0
  const scale = viewW && imageWidth ? viewW / imageWidth : 1

  useEffect(() => {
    const c = canvasRef.current
    if (!c || !viewW || !viewH) return
    const dpr = window.devicePixelRatio || 1
    const w = Math.round(viewW * dpr)
    const h = Math.round(viewH * dpr)
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h }
  }, [viewW, viewH])

  const draw = useCallback(() => {
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (!ctx || !viewW || !viewH) return
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (imgRef.current) ctx.drawImage(imgRef.current, 0, 0, viewW, viewH)

    texts.forEach((t) => {
      const px = t.x * viewW
      const py = t.y * viewH
      const fontPx = t.fontSize * scale
      ctx.font = `${fontPx}px ${t.fontFamily}`
      ctx.textAlign = t.align
      ctx.textBaseline = 'middle'
      ctx.fillStyle = t.color
      const label = definedVar(t.variable) ? (previewMode ? resolve(t.variable) : t.variable) : ''
      ctx.fillText(label, px, py)

      if (t.id === selectedId && !previewMode) {
        const w = ctx.measureText(label).width
        ctx.strokeStyle = '#818cf8'
        ctx.lineWidth = 1.5
        ctx.setLineDash([5, 4])
        const x = t.align === 'center' ? px - w / 2 : t.align === 'right' ? px - w : px
        ctx.strokeRect(x - 4, py - fontPx / 2 - 4, w + 8, fontPx + 8)
        ctx.setLineDash([])
      }
    })
  }, [texts, selectedId, previewMode, viewW, viewH, scale, imageLoaded])

  useEffect(() => { draw() }, [draw])

  const pickText = (px, py) => {
    for (const t of [...texts].reverse()) {
      const half = Math.max(36, (t.fontSize * scale) * 0.6)
      if (Math.abs(px - t.x * viewW) <= half && Math.abs(py - t.y * viewH) <= half) return t.id
    }
    return null
  }

  const onMouseDown = (e) => {
    if (!viewW || previewMode) return
    const rect = canvasRef.current.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    const id = pickText(px, py)
    if (id) {
      const t = texts.find((x) => x.id === id)
      dragRef.current = { id, dx: px - t.x * viewW, dy: py - t.y * viewH }
      setSelectedId(id)
      setDragId(id)
    } else {
      setSelectedId(null)
    }
  }

  useEffect(() => {
    if (!dragId) return
    const move = (e) => {
      if (!dragRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const { id, dx, dy } = dragRef.current
      const fx = Math.max(0, Math.min(1, (e.clientX - rect.left - dx) / viewW))
      const fy = Math.max(0, Math.min(1, (e.clientY - rect.top - dy) / viewH))
      onChange({ ...value, texts: texts.map((t) => (t.id === id ? { ...t, x: fx, y: fy } : t)) })
    }
    const up = () => { dragRef.current = null; setDragId(null) }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [dragId, viewW, texts])

  const handlePdf = (file) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('PDF too large. Maximum size is 10 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result
      rasterizePdf(url).then(({ preview, width, height }) => {
        onChange({ ...value, image: url, preview, imageWidth: width, imageHeight: height })
        setSelectedId(null)
        setUploadError(null)
      }).catch((e) => {
        setUploadError(e.message || 'Invalid PDF')
        if (fileInputRef.current) fileInputRef.current.value = ''
      })
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const addText = () => {
    const variable = variables[0] ? `{${variables[0]}}` : 'Custom Text'
    const t = {
      id: crypto.randomUUID(),
      variable,
      x: 0.5, y: 0.5,
      fontSize: 36,
      fontFamily: 'Georgia, serif',
      color: '#000000',
      align: 'center',
    }
    onChange({ ...value, texts: [...texts, t] })
    setSelectedId(t.id)
  }

  const updateSelected = (patch) =>
    onChange({ ...value, texts: texts.map((t) => (t.id === selectedId ? { ...t, ...patch } : t)) })

  const removeText = (id) => {
    onChange({ ...value, texts: texts.filter((t) => t.id !== id) })
    if (selectedId === id) setSelectedId(null)
  }

  const selected = texts.find((t) => t.id === selectedId)
  const defaultVar = variables[0] ? `{${variables[0]}}` : 'Custom Text'
  const definedVar = (s) => {
    const m = /^\{(\w+)\}$/.exec(s)
    return m ? variables.includes(m[1]) : false
  }

  return (
    <div className="flex flex-col gap-4 min-h-0 flex-1">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => handlePdf(e.target.files[0])}
            className="hidden"
          />
          {image && (
            <button
              type="button"
              onClick={addText}
              className="btn-secondary"
            >
              <Type className="w-4 h-4" />
              Add Text
            </button>
          )}
        </div>

        {uploadError && <p className="text-xs text-red-400 w-full">{uploadError}</p>}

        {image && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setPreviewMode(!previewMode); setSelectedId(null) }}
              className={`btn-secondary ${previewMode ? '!border-teal-400/40 !bg-teal-400/10 !text-teal-300' : ''}`}
            >
              {previewMode ? <PenLine className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {previewMode ? 'Edit' : 'Preview'}
            </button>
            {image && (
              <button
                type="button"
                onClick={() => onChange({ ...value, image: null, preview: null, imageWidth: null, imageHeight: null, texts: [] })}
                className="btn-danger !px-3"
              >
                Remove PDF
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 flex gap-4">
        <div ref={wrapRef} className="flex-1 min-h-0 bg-slate-950/50 border border-white/[0.06] rounded-lg p-4 flex items-center justify-center overflow-auto">
          {image ? (
            <canvas
              ref={canvasRef}
              onMouseDown={onMouseDown}
              className={`max-w-full ${previewMode ? 'cursor-default' : 'cursor-move'} shadow-2xl ring-1 ring-white/10`}
              style={{ width: viewW, height: viewH }}
            />
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full flex flex-col items-center justify-center space-y-2 text-center text-slate-600 cursor-pointer select-none rounded-lg border-2 border-dashed border-white/10 p-8 hover:border-teal-400/40 hover:bg-teal-400/[0.03] transition-colors"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
                <ImagePlus className="h-7 w-7 opacity-60" />
              </div>
              <p className="text-sm text-slate-300 font-medium">Click to upload a certificate PDF</p>
              <p className="text-xs text-slate-600">Text is filled with each recipient's data when sending. First page is used; fonts map to standard PDF fonts.</p>
            </div>
          )}
        </div>

        {image && (
          <div className="w-72 flex flex-col gap-3 min-h-0 overflow-auto">
            {image && (
              <>
                {selected ? (
                <div className="card space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-200">Text Properties</h4>
                    <button type="button" onClick={() => removeText(selected.id)} title="Delete text" className="icon-btn text-red-400/80 hover:bg-red-500/10 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="label !mb-1 !text-xs">Text / Variable</label>
                    <Dropdown
                      value={definedVar(selected.variable) ? selected.variable : ''}
                      onChange={(v) => updateSelected({ variable: v })}
                      options={variables.map((v) => ({ value: `{${v}}`, label: `{${v}}` }))}
                      placeholder={definedVar(selected.variable) ? selected.variable : 'No variable — select one'}
                      ariaLabel="Certificate text variable"
                    />
                    <p className="text-[10px] text-slate-600 mt-1">Only variables from the template's email body are available</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label !mb-1 !text-xs">Font Size</label>
                      <input
                        type="number"
                        min="10"
                        max="200"
                        value={selected.fontSize}
                        onChange={(e) => updateSelected({ fontSize: Number(e.target.value) || 36 })}
                        className="input text-xs"
                      />
                    </div>
                    <div>
                      <label className="label !mb-1 !text-xs">Color</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={selected.color}
                          onChange={(e) => updateSelected({ color: e.target.value })}
                          className="h-8 w-8 cursor-pointer rounded border border-white/10 bg-slate-950"
                        />
                        <span className="font-mono text-xs text-slate-400">{selected.color}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label !mb-1 !text-xs">Font</label>
                    <select
                      value={selected.fontFamily}
                      onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                      className="input text-xs"
                    >
                      {fontOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="label !mb-1 !text-xs">Alignment</label>
                    <div className="grid grid-cols-3 gap-1">
                      {['left', 'center', 'right'].map((a) => (
                        <button
                          type="button"
                          key={a}
                          onClick={() => updateSelected({ align: a })}
                          className={`text-xs py-1 rounded capitalize ${selected.align === a ? 'bg-teal-500 text-teal-950 font-semibold' : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]'}`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card p-4 text-center">
                  <p className="text-xs text-slate-500">Click a text on the image to edit its properties.</p>
                </div>
              )}

              <div className="card p-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Texts ({texts.length})</h4>
                {texts.length === 0 ? (
                  <p className="text-xs text-slate-600">No text placed yet. Click "Add Text".</p>
                ) : (
                  <div className="space-y-1">
                    {texts.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedId(t.id)}
                        className={`flex items-center justify-between gap-2 px-2 py-1 rounded text-xs cursor-pointer border ${t.id === selectedId ? 'border-teal-400/40 bg-teal-400/10' : 'border-white/[0.06] bg-slate-950/50 hover:bg-white/[0.04]'}`}
                      >
                        <span className="truncate font-mono text-slate-300">{t.variable}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeText(t.id) }} className="shrink-0 text-red-400/80 hover:text-red-300">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card p-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Available Variables</h4>
                {variables.length === 0 ? (
                  <p className="text-xs text-slate-600">Add variables in the email body step.</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {variables.map((v) => (
                      <span key={v} className="badge">{"{"}{v}{"}"}</span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        )}
      </div>
    </div>
  )
}