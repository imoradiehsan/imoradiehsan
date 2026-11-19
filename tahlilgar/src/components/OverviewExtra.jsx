import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createChart } from 'lightweight-charts'
import { fa } from '../data/market'

function rnd(s) { let x = [...s].reduce((a, c) => a * 37 + c.charCodeAt(0), 11) % 2147483647; return () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646 }
const css = (n) => `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--' + n).trim().replace(/ /g, ',')})`
const big = (n) => n >= 1e9 ? fa(n / 1e9, 1) + ' B' : n >= 1e6 ? fa(n / 1e6, 1) + ' M' : n >= 1e3 ? fa(n / 1e3, 1) + ' K' : fa(n)

// Text that doesn't fit its box scrolls back and forth (marquee); short text stays still
export function Marquee({ children, className = '' }) {
  const box = useRef(null), inner = useRef(null)
  const [shift, setShift] = useState(0)
  useLayoutEffect(() => {
    const measure = () => setShift(Math.max(0, inner.current.scrollWidth - box.current.clientWidth))
    measure(); const ro = new ResizeObserver(measure); ro.observe(box.current); return () => ro.disconnect()
  }, [children])
  return (
    <span ref={box} className={`block overflow-hidden whitespace-nowrap ${className}`} title={typeof children === 'string' ? children : undefined}
      style={shift ? { maskImage: 'linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)' } : undefined}>
      <motion.span ref={inner} className="inline-block" animate={shift ? { x: [0, shift, shift, 0, 0] } : { x: 0 }}
        transition={shift ? { duration: 2 + shift / 25, times: [0, .4, .5, .9, 1], repeat: Infinity, ease: 'linear', repeatDelay: .6 } : { duration: 0 }}>
        {children}
      </motion.span>
    </span>
  )
}

export function Card({ title, actions, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-line bg-surface2/25 p-4 ${className}`}>
      {(title || actions) && <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">{title}</h3><div className="flex gap-2">{actions}</div></div>}
      {children}
    </div>
  )
}
function Seg({ items, value, onChange, id, icons = {} }) {
  return (
    <div className="seg">
      {items.map((t) => (
        <button key={t} onClick={() => onChange(t)} className="seg-item">
          {value === t && <motion.span layoutId={id} className="absolute inset-0 rounded-[10px] bg-brand/15 ring-1 ring-brand/50" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
          <span className={`relative flex items-center gap-1 ${value === t ? 'font-bold text-brand-light' : ''}`}>{icons[t]}{t}</span>
        </button>
      ))}
    </div>
  )
}
function Underline({ items, value, onChange, id }) {
  return (
    <div className="mb-3 grid border-b border-line" style={{ gridTemplateColumns: `repeat(${items.length},1fr)` }}>
      {items.map((t) => (
        <button key={t} onClick={() => onChange(t)} className={`relative py-2 text-sm ${value === t ? 'font-bold text-brand-light' : 'text-muted hover:text-ink'}`}>
          {t}{value === t && <motion.span layoutId={id} className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-brand-light" />}
        </button>
      ))}
    </div>
  )
}

/* ---------- روند معاملات امروز (intraday) ---------- */
export function Intraday({ sym, dark }) {
  const [mode, setMode] = useState('خطی')
  const host = useRef(null)
  const data = useMemo(() => {
    const r = rnd(sym.s + 'i'); const prev = sym.p / (1 + sym.c / 100); let c = prev * (1 + (r() - .3) * .01)
    const start = Math.floor(Date.UTC(2026, 9, 16, 9, 0) / 1000), n = 42
    return Array.from({ length: n }, (_, i) => {
      const o = c; c = i === n - 1 ? sym.p : o * (1 + (sym.p - o) / o / (n - i) + (r() - .5) * .006)
      return { time: start + i * 300, open: o, close: c, high: Math.max(o, c) * (1 + r() * .002), low: Math.min(o, c) * (1 - r() * .002), v: 2e5 + r() * 2e6 }
    })
  }, [sym])
  useEffect(() => {
    const ch = createChart(host.current, {
      autoSize: true, layout: { background: { color: 'transparent' }, textColor: css('muted'), fontFamily: 'IRANYekanX', fontSize: 11 },
      grid: { vertLines: { visible: false }, horzLines: { color: css('line').replace('rgb', 'rgba').replace(')', ',.5)') } },
      rightPriceScale: { borderVisible: false, scaleMargins: { top: .08, bottom: .3 } }, timeScale: { borderVisible: false, timeVisible: true, fixLeftEdge: true, fixRightEdge: true },
      localization: { priceFormatter: (p) => fa(p), timeFormatter: (t) => new Date(t * 1000).toISOString().slice(11, 16) },
      handleScroll: false, handleScale: false,
    })
    const up = '#26c281', down = '#f0506e', col = sym.c >= 0 ? up : down
    const s = mode === 'خطی'
      ? ch.addAreaSeries({ lineColor: col, topColor: col + '40', bottomColor: col + '00', lineWidth: 2, lastPriceAnimation: 1, crosshairMarkerRadius: 5 })
      : ch.addCandlestickSeries({ upColor: up, downColor: down, wickUpColor: up, wickDownColor: down, borderVisible: false })
    s.setData(mode === 'خطی' ? data.map((d) => ({ time: d.time, value: d.close })) : data)
    const v = ch.addHistogramSeries({ priceScaleId: 'v', priceFormat: { type: 'volume' }, lastValueVisible: false, priceLineVisible: false })
    v.priceScale().applyOptions({ scaleMargins: { top: .75, bottom: 0 } })
    v.setData(data.map((d) => ({ time: d.time, value: d.v, color: d.close >= d.open ? 'rgba(38,194,129,.5)' : 'rgba(240,80,110,.5)' })))
    ch.timeScale().fitContent()
    return () => ch.remove()
  }, [data, mode, dark])
  return (
    <Card className="flex flex-col" title="روند معاملات امروز" actions={<Seg id="intra" items={['خطی', 'شمعی']} value={mode} onChange={setMode} icons={{ 'خطی': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18" /><path d="m7 15 4-5 3 3 5-6" /></svg>, 'شمعی': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 3v4M7 17v4M17 3v6M17 17v4" /><rect x="5" y="7" width="4" height="10" rx="1" /><rect x="15" y="9" width="4" height="8" rx="1" /></svg> }} />}>
      <div ref={host} className="min-h-64 flex-1" dir="ltr" />
    </Card>
  )
}

/* ---------- معاملات حقیقی و حقوقی ---------- */
export function RealLegal({ sym }) {
  const r = rnd(sym.s + 'r')
  const total = Math.round((80 + r() * 150) * 1e6)
  const rb = .45 + r() * .4 + sym.c / 40, rs = .4 + r() * .4
  const rows = [
    { t: 'حقیقی', b: total * rb, s: total * rs, bn: Math.round(300 + r() * 1500), sn: Math.round(300 + r() * 2000) },
    { t: 'حقوقی', b: total * (1 - rb), s: total * (1 - rs), bn: Math.round(2 + r() * 30), sn: Math.round(2 + r() * 40) },
  ]
  const perB = rows[0].b * sym.p / rows[0].bn, perS = rows[0].s * sym.p / rows[0].sn, power = perB / perS
  const money = (rows[0].b - rows[0].s) * sym.p
  return (
    <Card title="معاملات حقیقی و حقوقی">
      <div className="space-y-4">
        {rows.map((x, i) => (
          <div key={x.t} className={`grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xs ${i ? 'border-t border-dashed border-line pt-4' : ''}`}>
            <div>
              <div className="num mb-1.5 flex items-baseline gap-1.5"><b className="text-[15px]">{fa(Math.round(x.b))}</b><span className="text-muted">({fa(x.b / total * 100, 2)}٪)</span></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface2"><motion.div initial={{ width: 0 }} animate={{ width: `${x.b / total * 100}%` }} transition={{ duration: .7 }} className="h-full rounded-full bg-up" /></div>
              <div className="num mt-1.5 text-muted">{fa(x.bn)}</div>
            </div>
            <div className="flex flex-col items-center gap-1"><span className="text-[11px] text-muted">حجم</span><b className="text-sm text-brand-light">{x.t}</b><span className="text-[11px] text-muted">تعداد</span></div>
            <div>
              <div className="num mb-1.5 flex items-baseline justify-end gap-1.5"><span className="text-muted">({fa(x.s / total * 100, 2)}٪)</span><b className="text-[15px]">{fa(Math.round(x.s))}</b></div>
              <div className="flex h-1.5 justify-end overflow-hidden rounded-full bg-surface2"><motion.div initial={{ width: 0 }} animate={{ width: `${x.s / total * 100}%` }} transition={{ duration: .7 }} className="h-full rounded-full bg-down" /></div>
              <div className="num mt-1.5 text-left text-muted">{fa(x.sn)}</div>
            </div>
          </div>
        ))}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[['سرانه خرید حقیقی', perB], ['سرانه فروش حقیقی', perS], ['ورود پول حقیقی', money]].map(([t, v]) => (
            <div key={t} className="rounded-xl border border-line bg-surface/60 p-3"><div className="text-[11px] text-muted">{t}</div><div className={`num mt-1.5 flex items-baseline justify-center gap-1 font-extrabold ${t.startsWith('ورود') ? (v >= 0 ? 'text-up' : 'text-down') : ''}`}><span className="text-[10px] font-normal text-muted">ریال</span><span dir="ltr">{v < 0 ? '−' : ''}{big(Math.abs(v))}</span></div></div>
          ))}
        </div>
        <div className="rounded-xl border border-line bg-surface/60 p-3">
          <div className="mb-2.5 flex items-center justify-between text-sm"><span className="text-muted">قدرت خریدار به فروشنده حقیقی</span><b className="num text-xl">{fa(power, 2)}</b></div>
          <div className="flex h-2 gap-1 overflow-hidden">
            <motion.div initial={{ width: '50%' }} animate={{ width: `${power / (1 + power) * 100}%` }} transition={{ duration: .8 }} className="h-full rounded-full bg-up" />
            <div className="h-full flex-1 rounded-full bg-down" />
          </div>
        </div>
      </div>
    </Card>
  )
}

/* ---------- بازدهی نماد / مقایسه ---------- */
function BarRow({ label, v, max }) {
  const pos = v >= 0
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs">
      <div className="flex h-7 justify-end rounded-md bg-surface2/40">{pos && <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(14, v / max * 100)}%` }} className="num flex items-center rounded-md bg-up/25 px-2 font-bold text-ink" dir="ltr">+{fa(v, 2)}٪</motion.div>}</div>
      <Marquee className="w-24 text-center text-sm text-muted">{label}</Marquee>
      <div className="flex h-7 justify-start rounded-md bg-surface2/40">{!pos && <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(14, Math.abs(v) / max * 100)}%` }} className="num flex items-center justify-end rounded-md bg-down/25 px-2 font-bold text-ink" dir="ltr">{fa(v, 2)}٪</motion.div>}</div>
    </div>
  )
}
export function Returns({ sym }) {
  const [mode, setMode] = useState('تقویمی')
  const r = rnd(sym.s + mode)
  const rows = [['۱ هفته', 1], ['۱ ماهه', 2], ['۳ ماهه', 3.5], ['۶ ماهه', 5], ['۱ ساله', 7], ['۲ ساله', 10]].map(([t, k]) => [t, sym.c * k * 0.9 + (r() - 0.35) * k * 4])
  const max = Math.max(...rows.map((x) => Math.abs(x[1])))
  return (
    <Card title={<span className="flex items-center gap-1.5">بازدهی نماد <span title="بازدهی بر اساس قیمت پایانی" className="grid h-4 w-4 cursor-help place-items-center rounded-full border border-muted text-[10px] text-muted">؟</span></span>}>
      <Underline id="ret" items={['تقویمی', 'معاملاتی', 'ابتدای دوره']} value={mode} onChange={setMode} />
      <AnimatePresence mode="wait"><motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">{rows.map(([t, v]) => <BarRow key={t} label={t} v={v} max={max} />)}</motion.div></AnimatePresence>
    </Card>
  )
}
export function Compare({ sym }) {
  const [mode, setMode] = useState('تقویمی')
  const [period, setPeriod] = useState('۱ هفته')
  const [open, setOpen] = useState(false)
  const r = rnd(sym.s + mode + period)
  const k = { '۱ هفته': 1, '۱ ماه': 2.5, '۳ ماه': 5, '۱ سال': 10 }[period]
  const rows = [[`صنعت ${sym.ind}`, sym.c * .6], ['شاخص بورس', 0], ['شاخص فرابورس', .5], ['دلار', 1], ['سکه', .8], ['اونس طلا', .6]].map(([t, b]) => [t, (b + (r() - .45) * 2) * k])
  const max = Math.max(...rows.map((x) => Math.abs(x[1])))
  return (
    <Card title="مقایسه با صنعت و شاخص" actions={
      <div className="relative">
        <button onClick={() => setOpen(!open)} className={`btn ${open ? 'btn-on' : ''}`}>{period}<motion.span animate={{ rotate: open ? 180 : 0 }} className="grid"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg></motion.span></button>
        <AnimatePresence>{open && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-0 top-10 z-30 w-28 rounded-xl border border-line bg-surface p-1 shadow-xl">
          {['۱ هفته', '۱ ماه', '۳ ماه', '۱ سال'].map((p) => <button key={p} onClick={() => { setPeriod(p); setOpen(false) }} className={`block w-full rounded-lg px-3 py-1.5 text-right text-xs hover:bg-surface2 ${p === period ? 'text-brand-light' : ''}`}>{p}</button>)}
        </motion.div>}</AnimatePresence>
      </div>}>
      <Underline id="cmp" items={['تقویمی', 'معاملاتی', 'ابتدای دوره']} value={mode} onChange={setMode} />
      <AnimatePresence mode="wait"><motion.div key={mode + period} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">{rows.map(([t, v]) => <BarRow key={t} label={t} v={v} max={max} />)}</motion.div></AnimatePresence>
    </Card>
  )
}

/* ---------- پیش‌بینی کاربران ---------- */
export function Poll({ sym }) {
  const r = rnd(sym.s + 'p')
  const base = { up: Math.round(600 + r() * 1200), down: Math.round(300 + r() * 900) }
  const [vote, setVote] = useState(null)
  const up = base.up + (vote === 'up' ? 1 : 0), down = base.down + (vote === 'down' ? 1 : 0), total = up + down
  const opt = (k, label, n, good) => {
    const pct = Math.round(n / total * 100), mine = vote === k
    return (
      <motion.button whileTap={{ scale: .97 }} onClick={() => setVote(mine ? null : k)}
        className={`relative flex flex-1 items-center justify-between overflow-hidden rounded-xl border p-4 transition-colors ${mine ? (good ? 'border-up' : 'border-down') : 'border-line hover:border-muted'}`}>
        <motion.span initial={{ width: 0 }} animate={{ width: vote ? `${pct}%` : '0%' }} transition={{ duration: .6 }} className={`absolute inset-y-0 right-0 ${good ? 'bg-up/15' : 'bg-down/15'}`} />
        <span className={`relative flex h-7 items-center gap-2 text-lg font-extrabold ${good ? 'text-up' : 'text-down'}`}>{good ? '↗' : '↘'} {label}<AnimatePresence>{mine && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className={`rounded-full px-2 py-0.5 text-[10px] text-white ${good ? 'bg-up' : 'bg-down'}`}>رأی شما</motion.span>}</AnimatePresence></span>
        <motion.span animate={{ opacity: vote ? 1 : 0 }} className="relative flex items-baseline gap-2" aria-hidden={!vote}><span className="num text-[11px] text-muted">{fa(n)} نفر</span><b className="num text-xl">{fa(pct)}٪</b></motion.span>
      </motion.button>
    )
  }
  return (
    <Card title={`پیش‌بینی کاربران برای ${sym.s} در روز معاملاتی بعد`} actions={<span className="num text-xs text-muted">{vote ? `${fa(total)} رأی ثبت شده` : 'برای دیدن نتیجه رأی بدهید'}</span>}>
      <div className="flex flex-col gap-3 sm:flex-row">{opt('up', 'صعودی', up, true)}{opt('down', 'نزولی', down, false)}</div>
    </Card>
  )
}
