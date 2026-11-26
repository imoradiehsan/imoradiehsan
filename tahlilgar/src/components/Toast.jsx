import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// App-wide toasts: call toast('متن', 'ok' | 'info' | 'warn' | 'error') from anywhere; <Toaster /> is mounted once in App
const subs = new Set()
let seq = 0
export function toast(text, kind = 'ok') { const t = { id: ++seq, text, kind }; subs.forEach((f) => f(t)) }

const ICON = {
  ok: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  warn: <><path d="M12 4 2.5 20h19L12 4Z" /><path d="M12 10v4M12 17h.01" /></>,
  error: <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>,
}
const TONE = { ok: 'text-up', info: 'text-brand-light', warn: 'text-amber-400', error: 'text-down' }

export function Toaster() {
  const [list, setList] = useState([])
  useEffect(() => {
    const on = (t) => {
      setList((l) => [...l.slice(-2), t])
      setTimeout(() => setList((l) => l.filter((x) => x.id !== t.id)), 2800)
    }
    subs.add(on); return () => subs.delete(on)
  }, [])
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4">
      <AnimatePresence initial={false}>{list.map((t) => (
        <motion.div key={t.id} layout initial={{ opacity: 0, y: 16, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .96 }} transition={{ duration: .2 }}
          role="status" className="flex max-w-md items-center gap-2.5 rounded-2xl border border-line bg-surface2 px-4 py-2.5 text-sm shadow-2xl">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${TONE[t.kind]}`}>{ICON[t.kind]}</svg>
          <span>{t.text}</span>
        </motion.div>
      ))}</AnimatePresence>
    </div>
  )
}
