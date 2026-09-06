import { useState, useRef, useEffect } from 'react'

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
        className="w-full flex items-center justify-between gap-2 bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-left focus:outline-none focus:border-indigo-500"
      >
        <span className={selected ? 'text-gray-100' : 'text-gray-500'}>{selected ? selected.label : placeholder}</span>
        <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div role="listbox" className="absolute z-20 mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg shadow-xl max-h-60 overflow-auto">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-500">No options</p>
          ) : (
            options.map((o, i) => (
              <button
                key={i}
                type="button"
                role="option"
                aria-selected={o.value === value}
                disabled={o.disabled}
                onClick={() => { onChange(o.value); setOpen(false) }}
                className={`block w-full text-left px-3 py-2 text-sm ${
                  o.disabled
                    ? 'text-gray-600 cursor-not-allowed'
                    : o.value === value
                      ? 'bg-indigo-600/20 text-indigo-300'
                      : 'text-gray-200 hover:bg-gray-800'
                }`}
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}