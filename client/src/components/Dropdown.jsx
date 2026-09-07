import { useState, useRef, useEffect } from 'react'
import { ChevronDown, CircleCheck } from 'lucide-react'

export default function Dropdown({ value, onChange, options = [], placeholder, ariaLabel }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const esc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen(!open)}
        className="input flex items-center justify-between gap-2 text-left"
      >
        <span className={`truncate ${selected ? 'text-slate-100' : 'text-slate-500'}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="listbox" className="absolute z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-lg border border-white/10 bg-slate-900 p-1 shadow-2xl">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">No options</p>
          ) : (
            options.map((o, i) => (
              <button
                key={i}
                type="button"
                role="option"
                aria-selected={o.value === value}
                disabled={o.disabled}
                onClick={() => { onChange(o.value); setOpen(false) }}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${
                  o.disabled
                    ? 'cursor-not-allowed text-slate-600'
                    : o.value === value
                      ? 'bg-teal-400/10 text-teal-300'
                      : 'text-slate-200 hover:bg-white/[0.06]'
                }`}
              >
                <span className="flex-1">{o.label}</span>
                {o.value === value && <CircleCheck className="h-4 w-4 shrink-0 text-teal-400" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}