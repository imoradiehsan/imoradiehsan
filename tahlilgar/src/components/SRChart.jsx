// نمودار حمایت و مقاومت: خطی/شمعی، تعدیل افزایش سرمایه، بازه زمانی و مقیاس لگاریتمی
import { useEffect, useMemo, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'
import { motion, AnimatePresence } from 'framer-motion'
import { makeBars } from './TVChart'
import { fa } from '../data/market'

const RANGES = [['۱ ماه', 22], ['۲ ماه', 44], ['۳ ماه', 66], ['۶ ماه', 130], ['۹ ماه', 195], ['۱ سال', 260], ['۲ سال', 320]]
const css = (n) => `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--' + n).trim().replace(/ /g, ',')})`

// swing highs / lows that were touched at least twice → support & resistance
function findLevels(bars, last) {
  const piv = []
  for (let i = 3; i < bars.length - 3; i++) {
    const w = bars.slice(i - 3, i + 4)
    if (bars[i].high === Math.max(...w.map((x) => x.high))) piv.push(bars[i].high)
    if (bars[i].low === Math.min(...w.map((x) => x.low))) piv.push(bars[i].low)
  }
  const tol = last * 0.015, groups = []
  piv.sort((a, b) => a - b).forEach((p) => { const g = groups.find((g) => Math.abs(g.p - p) < tol); g ? (g.p = (g.p * g.n + p) / (g.n + 1), g.n++) : groups.push({ p, n: 1 }) })
  return groups.filter((g) => g.n >= 2).map((g) => ({ price: g.p, touches: g.n, kind: g.p > last ? 'مقاومت' : 'حمایت' }))
}

export default function SRChart({ sym, dark }) {
  const host = useRef(null), wrap = useRef(null)
  const [type, setType] = useState('خطی')
  const [adj, setAdj] = useState(false)
  const [range, setRange] = useState('۶ ماه')
  const [log, setLog] = useState(false)
  const n = RANGES.find((r) => r[0] === range)[1]
  const all = useMemo(() => makeBars(sym, 86400), [sym])
  const bars = useMemo(() => {
    const b = all.slice(-n)
    if (adj) return b
    // without capital-increase adjustment: prices before the (sample) event at bar 60% are higher
    const cut = Math.floor(all.length * 0.6), k = 1.25
    return b.map((x) => (x.time < all[cut].time ? { ...x, open: x.open * k, high: x.high * k, low: x.low * k, close: x.close * k } : x))
  }, [all, n, adj])
  const levels = useMemo(() => (n < 60 ? [] : findLevels(bars, sym.p).slice(-6)), [bars, n, sym.p])

  useEffect(() => {
    const c = createChart(host.current, {
      autoSize: true, layout: { background: { color: 'transparent' }, textColor: css('muted'), fontFamily: 'IRANYekanX', fontSize: 11 },
      grid: { vertLines: { color: css('line').replace('rgb', 'rgba').replace(')', ',.35)') }, horzLines: { color: css('line').replace('rgb', 'rgba').replace(')', ',.35)') } },
      rightPriceScale: { borderVisible: false, mode: log ? 1 : 0, scaleMargins: { top: .08, bottom: .25 } },
      timeScale: { borderVisible: false, tickMarkFormatter: (t) => new Date(t * 1000).toLocaleDateString('fa-IR-u-ca-persian', { month: 'short', day: 'numeric' }) },
      localization: { priceFormatter: (p) => fa(p), timeFormatter: (t) => new Date(t * 1000).toLocaleDateString('fa-IR-u-ca-persian') },
      crosshair: { vertLine: { labelBackgroundColor: '#2E62FF' }, horzLine: { labelBackgroundColor: '#2E62FF' } },
    })
    const s = type === 'خطی'
      ? c.addLineSeries({ color: '#7aa2ff', lineWidth: 2 })
      : c.addCandlestickSeries({ upColor: '#26c281', downColor: '#f0506e', wickUpColor: '#26c281', wickDownColor: '#f0506e', borderVisible: false })
    s.setData(type === 'خطی' ? bars.map((b) => ({ time: b.time, value: b.close })) : bars)
    const v = c.addHistogramSeries({ priceScaleId: 'v', priceFormat: { type: 'volume' }, lastValueVisible: false, priceLineVisible: false })
    v.priceScale().applyOptions({ scaleMargins: { top: .78, bottom: 0 } })
    v.setData(bars.map((b) => ({ time: b.time, value: b.volume, color: b.close >= b.open ? 'rgba(38,194,129,.45)' : 'rgba(240,80,110,.45)' })))
    levels.forEach((l) => s.createPriceLine({ price: l.price, color: l.kind === 'مقاومت' ? '#f0506e' : '#26c281', lineWidth: 2, lineStyle: 0, axisLabelVisible: true, title: `${l.kind} (${fa(l.touches)} برخورد)` }))
    c.timeScale().fitContent()
    return () => c.remove()
  }, [bars, type, log, levels, dark])

  const tb = (on) => `flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${on ? 'font-bold text-brand-light' : 'text-muted hover:text-ink'}`
  return (
    <div ref={wrap} className="flex h-full flex-col bg-surface">
      <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-line/70 px-3 py-1.5">
        {['شمعی', 'خطی'].map((t) => <button key={t} onClick={() => setType(t)} className={tb(type === t)}>{t === 'شمعی' ? '▥' : '〰'} {t}</button>)}
        <i className="mx-1 h-5 w-px bg-line" />
        {[[false, 'بدون تعدیل'], [true, 'تعدیل افزایش سرمایه']].map(([k, t]) => <button key={t} onClick={() => setAdj(k)} className={tb(adj === k)}>{t}</button>)}
        <div className="flex-1" />
        <button title="تمام صفحه" onClick={() => (document.fullscreenElement ? document.exitFullscreen() : wrap.current.requestFullscreen?.().catch(() => {}))} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-ink">⛶</button>
      </div>
      <AnimatePresence initial={false}>
        {levels.length === 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex items-center justify-center gap-2 border-b border-amber-400/40 bg-amber-400/10 py-2.5 text-sm font-semibold text-amber-300">
              <span className="grid h-5 w-5 place-items-center rounded-full border border-current text-xs">i</span>
              خط حمایت و مقاومت در بازه انتخابی وجود ندارد. بازه بلندتری را انتخاب کنید.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative min-h-0 flex-1" dir="ltr">
        <div ref={host} className="absolute inset-0" />
        <b className="pointer-events-none absolute left-3 top-2 z-10 text-sm">{sym.s}</b>
      </div>
      {levels.length > 0 && (
        <div className="flex shrink-0 flex-wrap gap-2 border-t border-line/70 px-3 py-2 text-xs">
          {levels.slice().sort((a, b) => b.price - a.price).map((l) => (
            <span key={l.price} className={`num rounded-lg px-2 py-1 ${l.kind === 'مقاومت' ? 'bg-down/15 text-down' : 'bg-up/15 text-up'}`}>{l.kind} {fa(l.price)} · فاصله {fa(Math.abs(l.price - sym.p) / sym.p * 100, 1)}٪</span>
          ))}
        </div>
      )}
      <div className="flex h-10 shrink-0 items-center justify-between border-t border-line/70 px-3">
        <div className="flex gap-0.5">{RANGES.map(([t]) => (
          <button key={t} onClick={() => setRange(t)} className="relative rounded-md px-2.5 py-1 text-xs">
            {range === t && <motion.span layoutId="sr-range" className="absolute inset-0 rounded-md bg-surface2 ring-1 ring-line" />}
            <span className={`relative ${range === t ? 'font-bold text-ink' : 'text-muted'}`}>{t}</span>
          </button>
        ))}</div>
        <button onClick={() => setLog(!log)} className={`rounded-md px-2 py-1 text-xs font-bold ${log ? 'bg-brand/15 text-brand-light' : 'text-muted hover:bg-surface2'}`}>log</button>
      </div>
    </div>
  )
}
