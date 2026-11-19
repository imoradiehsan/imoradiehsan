import { useEffect, useState } from 'react'
import { animate } from 'framer-motion'
import { fa } from '../data/market'
export default function Count({ to, d = 0 }) {
  const [v, setV] = useState(0)
  useEffect(() => { const c = animate(v, to, { duration: 1.1, ease: 'easeOut', onUpdate: setV }); return c.stop }, [to])
  return <span className="num">{fa(v, d)}</span>
}
export const Change = ({ c, className = '' }) => (
  <span className={`num inline-flex items-center gap-0.5 text-sm font-semibold ${c >= 0 ? 'text-up' : 'text-down'} ${className}`}>
    {c >= 0 ? '↑' : '↓'} {fa(Math.abs(c), 2)}٪
  </span>
)
