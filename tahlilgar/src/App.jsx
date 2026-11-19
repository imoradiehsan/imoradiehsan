import { useEffect, useRef, useState } from 'react'
import AppPanel from './components/AppPanel'
import SitePanel from './components/SitePanel'
import { SYMBOLS } from './data/market'

const RAIL = 60, MIN_RIGHT = 300, MAX_RIGHT = 640, MIN_LEFT = 520, DEFAULT = 400, SNAP = 200
const load = () => { try { return +localStorage.getItem('rightW') || DEFAULT } catch { return DEFAULT } }

export default function App() {
  const [dark, setDark] = useState(true)
  const [sym, setSym] = useState(SYMBOLS[0])
  const [tab, setTab] = useState('watch')
  const [rightW, setRightW] = useState(load)
  const [drag, setDrag] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const root = useRef(null)
  const startW = useRef(DEFAULT)
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  // Right panel is pinned to the right edge, so its width = distance from pointer to that edge
  const clamp = (w) => {
    const total = root.current?.clientWidth || window.innerWidth
    return Math.round(Math.min(MAX_RIGHT, total - MIN_LEFT - RAIL, Math.max(MIN_RIGHT, w)))
  }
  useEffect(() => {
    if (!drag) return
    const move = (e) => {
      const r = root.current.getBoundingClientRect()
      const raw = r.right - e.clientX - RAIL
      // Past the snap point the right panel docks away and the left panel goes full screen
      if (raw < SNAP - RAIL) { setCollapsed(true); setRightW(startW.current) }
      else { setCollapsed(false); setRightW(clamp(raw)) }
    }
    const up = () => setDrag(false)
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
    document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'
    return () => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up)
      document.body.style.cursor = ''; document.body.style.userSelect = ''
    }
  }, [drag])
  useEffect(() => { try { localStorage.setItem('rightW', rightW) } catch {} }, [rightW])
  useEffect(() => {
    const fit = () => setRightW((w) => clamp(w))
    window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit)
  }, [])

  const nudge = (d) => setRightW((w) => clamp(w + d))

  return (
    <div ref={root} className="flex flex-col bg-bg lg:h-full lg:flex-row" style={{ '--right-w': (collapsed ? 0 : rightW) + 'px' }} data-drag={drag || undefined}>
      <AppPanel sym={sym} setSym={setSym} tab={tab} setTab={setTab} collapsed={collapsed} setCollapsed={(c) => { if (!c && collapsed) setRightW((w) => clamp(w)); setCollapsed(c) }} />

      {/* Splitter: hover → blue, drag → resize, double-click → reset, arrows for keyboard */}
      <div
        role="separator" aria-orientation="vertical" aria-label="تغییر اندازه پنل‌ها" tabIndex={0}
        aria-valuenow={rightW} aria-valuemin={MIN_RIGHT} aria-valuemax={MAX_RIGHT}
        onPointerDown={(e) => { e.preventDefault(); if (!collapsed) startW.current = rightW; setDrag(true) }}
        onDoubleClick={() => { setCollapsed(false); setRightW(clamp(DEFAULT)) }}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') { if (rightW <= MIN_RIGHT) setCollapsed(true); else nudge(-20) } if (e.key === 'ArrowLeft') { if (collapsed) setCollapsed(false); else nudge(20) } }}
        className="group relative hidden w-[3px] shrink-0 cursor-col-resize bg-bg outline-none lg:block"
      >
        <span className="absolute inset-y-0 -left-1.5 -right-1.5 z-20" />
        <span className={`absolute inset-y-0 left-0 right-0 z-10 transition-colors duration-150 ${drag ? 'bg-brand-light' : 'group-hover:bg-brand group-focus-visible:bg-brand'}`} />
        <span className={`absolute left-1/2 top-1/2 z-20 flex h-10 w-1.5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full transition-opacity ${drag ? 'bg-brand-light opacity-100' : 'bg-brand opacity-0 group-hover:opacity-100'}`}>
          <i className="h-0.5 w-0.5 rounded-full bg-white" /><i className="h-0.5 w-0.5 rounded-full bg-white" /><i className="h-0.5 w-0.5 rounded-full bg-white" />
        </span>
        {drag && (
          <span className="num absolute right-3 top-1/2 z-30 -translate-y-1/2 whitespace-nowrap rounded-lg bg-brand px-2 py-1 text-xs text-white shadow-glow">
            {collapsed ? 'رها کنید: تمام صفحه' : rightW.toLocaleString('fa-IR') + ' پیکسل'}
          </span>
        )}
      </div>

      <SitePanel sym={sym} dark={dark} setDark={setDark} />
    </div>
  )
}
