// Sortable column headers used across the app.
// Click cycles: descending → ascending → original order.
import { useMemo, useState } from 'react'

export function useSort(rows, getters) {
  const [s, setS] = useState(null) // { k, dir } or null = original order
  const sorted = useMemo(() => {
    if (!s) return rows
    const g = getters[s.k], m = s.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const x = g(a), y = g(b)
      if (typeof x === 'string') return x.localeCompare(y, 'fa') * m
      return ((x ?? -Infinity) - (y ?? -Infinity)) * m
    })
  }, [rows, s])
  const toggle = (k) => setS((p) => (!p || p.k !== k ? { k, dir: 'desc' } : p.dir === 'desc' ? { k, dir: 'asc' } : null))
  return [sorted, s, toggle]
}

export function SortHead({ label, k, s, toggle, className = '', align = 'center' }) {
  const on = s?.k === k
  const just = align === 'start' ? 'justify-start' : align === 'end' ? 'justify-end' : 'justify-center'
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); toggle(k) }}
      title={!on ? 'مرتب‌سازی نزولی' : s.dir === 'desc' ? 'مرتب‌سازی صعودی' : 'بازگشت به حالت اول'}
      className={`group inline-flex w-full items-center gap-1 ${just} whitespace-nowrap transition-colors ${on ? 'font-bold text-brand-light' : 'hover:text-ink'} ${className}`}>
      {label}
      <svg width="8" height="12" viewBox="0 0 8 12" className="shrink-0">
        <path d="M4 1 7 4.5H1Z" fill="currentColor" opacity={on && s.dir === 'asc' ? 1 : .3} />
        <path d="M4 11 1 7.5h6Z" fill="currentColor" opacity={on && s.dir === 'desc' ? 1 : .3} />
      </svg>
    </button>
  )
}
