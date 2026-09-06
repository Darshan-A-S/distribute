import { useState, useRef, useEffect, useCallback } from 'react'
import { ImagePlus, Type, Trash2, Eye, PenLine } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const SAMPLE = { name: 'John Doe', courseName: 'Advanced Java', organizationName: 'Tech Academy', email: 'john@example.com', date: 'January 15, 2025' }
const DEFAULT_FONTS = ['Georgia, serif', 'Arial, sans-serif', 'Times New Roman, serif', 'Brush Script MT, cursive', 'Courier New, monospace']
const PREVIEW_W = 1000

const resolve = (variable) => {
  const m = variable.match(/^\{(\w+)\}$/)
  return m ? (SAMPLE[m[1]] || variable) : variable
}

async function rasterizePdf(dataUrl) {
  const bin = atob(dataUrl.split(',')[1])
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
  const page = await pdf.getPage(1)
  const vp = page.getViewport({ scale: Math.max(1, PREVIEW_W / page.getViewport({ scale: 1 }).width) })
  const canvas = document.createElement('canvas')
  canvas.width = vp.width
  canvas.height = vp.height
  await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise
  pdf.destroy()
  return { preview: canvas.toDataURL('image/png'), width: vp.width, height: vp.height }
}

export default function CertificateEditor({ value, onChange, variables = [] }) {
  const [selectedId, setSelectedId] = useState(null)
  const [dragId, setDragId] = useState(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const dragRef = useRef(null)
  const imgRef = useRef(null)

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

  const draw = useCallback(() => {
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (!ctx || !viewW || !viewH) return
    ctx.clearRect(0, 0, c.width, c.height)
    if (imgRef.current) ctx.drawImage(imgRef.current, 0, 0, viewW, viewH)

    texts.forEach((t) => {
      const px = t.x * viewW
      const py = t.y * viewH
      const fontPx = t.fontSize * scale
      ctx.font = `${fontPx}px ${t.fontFamily}`
      ctx.textAlign = t.align
      ctx.textBaseline = 'middle'
      ctx.fillStyle = t.color
      const label = previewMode ? resolve(t.variable) : (t.variable || 'text')
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
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result
      rasterizePdf(url).then(({ preview, width, height }) => {
        onChange({ ...value, image: url, preview, imageWidth: width, imageHeight: height })
        setSelectedId(null)
      }).catch(() => {})
    }
    reader.readAsDataURL(file)
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

  return (
    <div className="flex flex-col gap-4 min-h-0 flex-1">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 items-center">
          <label className="px-3 py-1.5 rounded text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer inline-flex items-center gap-1.5">
            <ImagePlus className="w-4 h-4" />
            Upload Certificate (PDF)
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => handlePdf(e.target.files[0])}
              className="hidden"
            />
          </label>
          {image && (
            <button
              type="button"
              onClick={addText}
              className="px-3 py-1.5 rounded text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white inline-flex items-center gap-1.5"
            >
              <Type className="w-4 h-4" />
              Add Text
            </button>
          )}
        </div>

        {image && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setPreviewMode(!previewMode); setSelectedId(null) }}
              className={`px-3 py-1.5 rounded text-sm font-medium inline-flex items-center gap-1.5 transition-colors ${previewMode ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
            >
              {previewMode ? <PenLine className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {previewMode ? 'Edit' : 'Preview'}
            </button>
            {image && (
              <button
                type="button"
                onClick={() => onChange({ ...value, image: null, preview: null, imageWidth: null, imageHeight: null, texts: [] })}
                className="px-3 py-1.5 rounded text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-800"
              >
                Remove PDF
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 flex gap-4">
        <div ref={wrapRef} className="flex-1 min-h-0 bg-gray-950 border border-gray-800 rounded-lg p-4 flex items-center justify-center overflow-auto">
          {image ? (
            <canvas
              ref={canvasRef}
              width={viewW}
              height={viewH}
              onMouseDown={onMouseDown}
              className={`max-w-full ${previewMode ? 'cursor-default' : 'cursor-move'} shadow-lg`}
              style={{ width: viewW, height: viewH }}
            />
          ) : (
            <div className="text-center text-gray-600 space-y-2">
              <ImagePlus className="w-12 h-12 mx-auto opacity-50" />
              <p className="text-sm">Upload a certificate PDF to start placing text.</p>
              <p className="text-xs text-gray-700">Text is filled with each recipient's data when sending. First page is used; fonts map to standard PDF fonts.</p>
            </div>
          )}
        </div>

        <div className="w-72 flex flex-col gap-3 min-h-0 overflow-auto">
          {image && (
            <>
              {selected ? (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Text Properties</h4>
                    <button type="button" onClick={() => removeText(selected.id)} title="Delete text" className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Text / Variable</label>
                    <input
                      type="text"
                      value={selected.variable}
                      onChange={(e) => updateSelected({ variable: e.target.value })}
                      list="cert-variables"
                      className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                    <datalist id="cert-variables">
                      {variables.map((v) => <option key={v} value={`{${v}}`} />)}
                    </datalist>
                    <p className="text-[10px] text-gray-600 mt-1">Use {'{variable}'} or write static text</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                      <input
                        type="number"
                        min="10"
                        max="200"
                        value={selected.fontSize}
                        onChange={(e) => updateSelected({ fontSize: Number(e.target.value) || 36 })}
                        className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Color</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={selected.color}
                          onChange={(e) => updateSelected({ color: e.target.value })}
                          className="w-8 h-8 bg-gray-950 border border-gray-700 rounded cursor-pointer"
                        />
                        <span className="text-xs font-mono text-gray-400">{selected.color}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Font</label>
                    <select
                      value={selected.fontFamily}
                      onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      {fontOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Alignment</label>
                    <div className="grid grid-cols-3 gap-1">
                      {['left', 'center', 'right'].map((a) => (
                        <button
                          type="button"
                          key={a}
                          onClick={() => updateSelected({ align: a })}
                          className={`text-xs py-1 rounded capitalize ${selected.align === a ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500">Click a text on the image to edit its properties.</p>
                </div>
              )}

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2">Texts ({texts.length})</h4>
                {texts.length === 0 ? (
                  <p className="text-xs text-gray-600">No text placed yet. Click "Add Text".</p>
                ) : (
                  <div className="space-y-1">
                    {texts.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedId(t.id)}
                        className={`flex items-center justify-between gap-2 px-2 py-1 rounded text-xs cursor-pointer ${t.id === selectedId ? 'bg-indigo-600/20 border border-indigo-500/40' : 'bg-gray-950 hover:bg-gray-800 border border-gray-800'}`}
                      >
                        <span className="font-mono truncate">{t.variable}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeText(t.id) }} className="text-red-400 hover:text-red-300 shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2">Available Variables</h4>
                {variables.length === 0 ? (
                  <p className="text-xs text-gray-600">Add variables in the email body step.</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {variables.map((v) => (
                      <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-950 border border-gray-800 font-mono text-gray-400">{"{"}{v}{"}"}</span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-600">
        Text is saved by position (% of the page) so it scales to any size or PDF page. Variables (like {defaultVar}) are filled from recipient data when sending.
      </p>
    </div>
  )
}