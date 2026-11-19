// چارت مبتنی بر Lightweight Charts (کتابخانه متن‌باز TradingView، Apache-2.0)
import { useEffect, useMemo, useRef, useState } from 'react'
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts'
import { motion, AnimatePresence } from 'framer-motion'
import { fa } from '../data/market'

const INTERVALS = [
  { k: '15m', t: '۱۵ دقیقه', sec: 900 }, { k: '1h', t: '۱ ساعت', sec: 3600 }, { k: '4h', t: '۴ ساعت', sec: 14400 },
  { k: '1D', t: 'روزانه', sec: 86400 }, { k: '1W', t: 'هفتگی', sec: 604800 },
]
const TYPES = [
  { k: 'candle', t: 'شمعی' }, { k: 'hollow', t: 'شمعی توخالی' }, { k: 'bar', t: 'میله‌ای (OHLC)' },
  { k: 'line', t: 'خطی' }, { k: 'area', t: 'ناحیه‌ای' }, { k: 'baseline', t: 'خط مبنا' },
]
const INDICATORS = [
  { k: 'vol', t: 'حجم معاملات', d: 'Volume' }, { k: 'ma20', t: 'میانگین متحرک ساده ۲۰', d: 'SMA 20', c: '#f59e0b' },
  { k: 'ema50', t: 'میانگین متحرک نمایی ۵۰', d: 'EMA 50', c: '#a855f7' }, { k: 'bb', t: 'باندهای بولینگر (۲۰، ۲)', d: 'Bollinger Bands', c: '#22d3ee' },
  { k: 'vwap', t: 'میانگین وزنی حجم', d: 'VWAP', c: '#ec4899' },
]
const TOOLS = [
  { k: 'cursor', t: 'نشانگر', i: <path d="M5 3l14 8-6 2-2 6z" /> },
  { k: 'trend', t: 'خط روند', i: <><path d="M4 20 20 4" /><circle cx="4" cy="20" r="2" /><circle cx="20" cy="4" r="2" /></> },
  { k: 'ray', t: 'پرتو', i: <><path d="M4 18 22 6" /><circle cx="4" cy="18" r="2" /></> },
  { k: 'hline', t: 'خط افقی', i: <><path d="M2 12h20" /><circle cx="12" cy="12" r="2" /></> },
  { k: 'rect', t: 'مستطیل', i: <rect x="4" y="6" width="16" height="12" rx="1" /> },
  { k: 'fib', t: 'فیبوناچی اصلاحی', i: <><path d="M3 5h18M3 10h18M3 14h18M3 19h18" /></> },
  { k: 'measure', t: 'اندازه‌گیری', i: <><path d="M4 20 20 4M8 20H4v-4" /></> },
]
const FIB = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]

function seedRand(s) { let x = s; return () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646 }
export function makeBars(sym, sec) {
  const n = 320, r = seedRand(sym.s.length * 977 + sec % 9973)
  const vol = { 900: .006, 3600: .01, 14400: .016, 86400: .025, 604800: .05 }[sec]
  const end = Math.floor(Date.UTC(2026, 10, 19, 8, 30) / 1000)
  let c = sym.p * (0.7 + r() * 0.2); const out = []
  for (let i = 0; i < n; i++) {
    const o = c; c = o * (1 + (sym.p - o) / o / (n - i) + (r() - .5) * vol)
    if (i === n - 1) c = sym.p
    out.push({ time: end - (n - 1 - i) * sec, open: o, high: Math.max(o, c) * (1 + r() * vol / 2), low: Math.min(o, c) * (1 - r() * vol / 2), close: c, volume: Math.round((20 + r() * 80) * 1e5) })
  }
  return out
}
const sma = (d, n) => d.map((b, i) => i < n - 1 ? null : { time: b.time, value: d.slice(i - n + 1, i + 1).reduce((a, x) => a + x.close, 0) / n }).filter(Boolean)
const ema = (d, n) => { const k = 2 / (n + 1); let e; return d.map((b) => ({ time: b.time, value: (e = e == null ? b.close : b.close * k + e * (1 - k)) })) }
const boll = (d, n = 20, m = 2) => d.map((b, i) => { if (i < n - 1) return null; const w = d.slice(i - n + 1, i + 1).map((x) => x.close); const mu = w.reduce((a, x) => a + x, 0) / n; const sd = Math.sqrt(w.reduce((a, x) => a + (x - mu) ** 2, 0) / n); return { time: b.time, up: mu + m * sd, mid: mu, lo: mu - m * sd } }).filter(Boolean)
const vwap = (d) => { let pv = 0, v = 0; return d.map((b) => { pv += ((b.high + b.low + b.close) / 3) * b.volume; v += b.volume; return { time: b.time, value: pv / v } }) }
const faDate = (t, withTime) => new Date(t * 1000).toLocaleString('fa-IR-u-ca-persian', withTime ? { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' } : { year: 'numeric', month: 'short', day: 'numeric' })
const css = (n) => `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--' + n).trim().replace(/ /g, ',')})`
const cssa = (n, a) => css(n).replace('rgb(', 'rgba(').replace(')', `,${a})`)

function Icon({ children, size = 20 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{children}</svg> }

function Menu({ label, open, setOpen, children, w = 'w-52' }) {
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-surface2 ${open ? 'bg-surface2 text-ink' : 'text-muted'}`}>{label}<Icon size={12}><path d="m6 9 6 6 6-6" /></Icon></button>
      <AnimatePresence>{open && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .15 }}
          className={`absolute right-0 top-9 z-40 ${w} overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-2xl`} dir="rtl">{children}</motion.div>
      )}</AnimatePresence>
    </div>
  )
}

export default function TVChart({ sym, dark, technical = false }) {
  const wrap = useRef(null), host = useRef(null), chart = useRef(null), main = useRef(null), extra = useRef([]), hlines = useRef([])
  const [interval, setInterval_] = useState('1D')
  const [type, setType] = useState('candle')
  const [inds, setInds] = useState(['vol', 'ma20'])
  const [menu, setMenu] = useState(null)
  const [tool, setTool] = useState('cursor')
  const [magnet, setMagnet] = useState(false)
  const [hideDraw, setHideDraw] = useState(false)
  const [drawings, setDrawings] = useState([])
  const [pending, setPending] = useState(null)
  const [mouse, setMouse] = useState(null)
  const [legend, setLegend] = useState(null)
  const [tick, setTick] = useState(0)
  const [indSearch, setIndSearch] = useState('')
  const [osc, setOsc] = useState(technical ? 'adx' : null)
  const [ready, setReady] = useState(false)
  const [log, setLog] = useState(false)

  const sec = INTERVALS.find((x) => x.k === interval).sec
  const bars = useMemo(() => makeBars(sym, sec), [sym, sec])

  // create chart once
  useEffect(() => {
    const c = createChart(host.current, {
      autoSize: true,
      layout: { background: { color: 'transparent' }, fontFamily: 'IRANYekanX, Tahoma', fontSize: 11 },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderVisible: false, scaleMargins: { top: .08, bottom: .22 } },
      timeScale: { borderVisible: false, rightOffset: 6, barSpacing: 8, timeVisible: true },
      localization: { priceFormatter: (p) => fa(p), timeFormatter: (t) => faDate(t, true) },
    })
    chart.current = c
    setReady(true)
    const bump = () => setTick((x) => x + 1)
    c.timeScale().subscribeVisibleLogicalRangeChange(bump)
    const ro = new ResizeObserver(bump); ro.observe(host.current)
    return () => { ro.disconnect(); c.remove() }
  }, [])

  // theme
  useEffect(() => {
    const id = requestAnimationFrame(() => chart.current.applyOptions({
      layout: { textColor: css('muted') },
      grid: { vertLines: { color: css('line').replace('rgb', 'rgba').replace(')', ',.45)') }, horzLines: { color: css('line').replace('rgb', 'rgba').replace(')', ',.45)') } },
      crosshair: { vertLine: { labelBackgroundColor: '#2E62FF' }, horzLine: { labelBackgroundColor: '#2E62FF' } },
      timeScale: { tickMarkFormatter: (t) => new Date(t * 1000).toLocaleDateString('fa-IR-u-ca-persian', sec >= 86400 ? { month: 'short', day: 'numeric' } : { hour: '2-digit', minute: '2-digit' }) },
    }))
    return () => cancelAnimationFrame(id)
  }, [dark, sec])

  useEffect(() => { chart.current.applyOptions({ crosshair: { mode: magnet ? CrosshairMode.Magnet : CrosshairMode.Normal } }) }, [magnet])
  useEffect(() => { chart.current?.applyOptions({ rightPriceScale: { mode: log ? 1 : 0 }, timeScale: { visible: !osc } }) }, [log, osc, ready])

  // series
  useEffect(() => {
    const c = chart.current
    if (main.current) c.removeSeries(main.current)
    extra.current.forEach((s) => c.removeSeries(s)); extra.current = []
    const up = css('up'), down = css('down')
    let s
    const ohlc = bars.map(({ time, open, high, low, close }) => ({ time, open, high, low, close }))
    const line = bars.map((b) => ({ time: b.time, value: b.close }))
    if (type === 'candle') s = c.addCandlestickSeries({ upColor: up, downColor: down, wickUpColor: up, wickDownColor: down, borderVisible: false })
    if (type === 'hollow') s = c.addCandlestickSeries({ upColor: 'rgba(0,0,0,0)', downColor: down, borderUpColor: up, borderDownColor: down, wickUpColor: up, wickDownColor: down })
    if (type === 'bar') s = c.addBarSeries({ upColor: up, downColor: down, thinBars: false })
    if (type === 'line') s = c.addLineSeries({ color: '#3C7CFF', lineWidth: 2 })
    if (type === 'area') s = c.addAreaSeries({ lineColor: '#3C7CFF', topColor: 'rgba(60,124,255,.45)', bottomColor: 'rgba(32,71,255,0)', lineWidth: 2 })
    if (type === 'baseline') s = c.addBaselineSeries({ baseValue: { type: 'price', price: bars[0].close }, topLineColor: up, bottomLineColor: down, topFillColor1: cssa('up', .3), bottomFillColor2: cssa('down', .3) })
    s.setData(['candle', 'hollow', 'bar'].includes(type) ? ohlc : line)
    main.current = s
    const add = (x) => { extra.current.push(x); return x }
    if (inds.includes('vol')) {
      const v = add(c.addHistogramSeries({ priceScaleId: 'vol', priceFormat: { type: 'volume' }, lastValueVisible: false, priceLineVisible: false }))
      v.priceScale().applyOptions({ scaleMargins: { top: .82, bottom: 0 } })
      v.setData(bars.map((b) => ({ time: b.time, value: b.volume, color: b.close >= b.open ? cssa('up', .35) : cssa('down', .35) })))
    }
    const opt = (color, w = 1.5) => ({ color, lineWidth: w, lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false })
    if (inds.includes('ma20')) add(c.addLineSeries(opt('#f59e0b'))).setData(sma(bars, 20))
    if (inds.includes('ema50')) add(c.addLineSeries(opt('#a855f7'))).setData(ema(bars, 50))
    if (inds.includes('vwap')) add(c.addLineSeries(opt('#ec4899'))).setData(vwap(bars))
    if (inds.includes('bb')) {
      const b = boll(bars)
      add(c.addLineSeries(opt('rgba(34,211,238,.9)', 1))).setData(b.map((x) => ({ time: x.time, value: x.up })))
      add(c.addLineSeries({ ...opt('rgba(34,211,238,.6)', 1), lineStyle: LineStyle.Dashed })).setData(b.map((x) => ({ time: x.time, value: x.mid })))
      add(c.addLineSeries(opt('rgba(34,211,238,.9)', 1))).setData(b.map((x) => ({ time: x.time, value: x.lo })))
    }
    hlines.current = []
    const last = bars.at(-1)
    setLegend({ ...last, prev: bars.at(-2).close })
    const onMove = (p) => {
      const d = p.time && p.seriesData.get(s)
      if (!d) return setLegend({ ...last, prev: bars.at(-2).close })
      const i = bars.findIndex((b) => b.time === p.time)
      setLegend({ ...bars[i], prev: bars[Math.max(0, i - 1)].close })
    }
    c.subscribeCrosshairMove(onMove)
    c.timeScale().setVisibleLogicalRange({ from: bars.length - 120, to: bars.length + 6 })
    setTick((x) => x + 1)
    return () => c.unsubscribeCrosshairMove(onMove)
  }, [bars, type, inds, dark])

  // drawings reset on symbol / interval change
  useEffect(() => { setDrawings([]); setPending(null) }, [sym, interval])

  // horizontal lines are native price lines
  useEffect(() => {
    const s = main.current; if (!s) return
    hlines.current.forEach((l) => { try { s.removePriceLine(l) } catch {} })
    hlines.current = hideDraw ? [] : drawings.filter((d) => d.type === 'hline').map((d) => s.createPriceLine({ price: d.a.price, color: '#3C7CFF', lineWidth: 1, lineStyle: LineStyle.Solid, axisLabelVisible: true }))
  }, [drawings, hideDraw, type, bars, inds])

  const toPoint = (e) => {
    const r = host.current.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top
    const ts = chart.current.timeScale(), logical = Math.round(ts.coordinateToLogical(x))
    const b = bars[Math.max(0, Math.min(bars.length - 1, logical))]
    let price = main.current.coordinateToPrice(y)
    if (magnet && b) price = [b.open, b.high, b.low, b.close].reduce((a, v) => (Math.abs(v - price) < Math.abs(a - price) ? v : a))
    return { logical, price }
  }
  const toXY = (p) => ({ x: chart.current.timeScale().logicalToCoordinate(p.logical), y: main.current.priceToCoordinate(p.price) })

  const onClick = (e) => {
    if (tool === 'cursor') return
    const p = toPoint(e)
    if (tool === 'hline') { setDrawings((d) => [...d, { type: 'hline', a: p }]); return }
    if (!pending) setPending(p)
    else { setDrawings((d) => [...d, { type: tool, a: pending, b: p }]); setPending(null); if (tool === 'measure') setTool('cursor') }
  }

  const W = host.current?.clientWidth || 0, H = host.current?.clientHeight || 0
  const renderShape = (d, k, ghost) => {
    if (d.type === 'hline') return null
    const A = toXY(d.a), B = toXY(d.b); if ([A.x, A.y, B.x, B.y].some((v) => v == null)) return null
    const col = ghost ? 'rgba(60,124,255,.7)' : '#3C7CFF'
    if (d.type === 'trend') return <g key={k}><line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={col} strokeWidth="2" /><circle cx={A.x} cy={A.y} r="4" fill="rgb(var(--surface))" stroke={col} strokeWidth="2" /><circle cx={B.x} cy={B.y} r="4" fill="rgb(var(--surface))" stroke={col} strokeWidth="2" /></g>
    if (d.type === 'ray') { const dx = B.x - A.x, dy = B.y - A.y, t = dx === 0 ? 0 : (dx > 0 ? (W - A.x) : -A.x) / dx; return <g key={k}><line x1={A.x} y1={A.y} x2={A.x + dx * t} y2={A.y + dy * t} stroke={col} strokeWidth="2" /><circle cx={A.x} cy={A.y} r="4" fill="rgb(var(--surface))" stroke={col} strokeWidth="2" /></g> }
    if (d.type === 'rect') return <rect key={k} x={Math.min(A.x, B.x)} y={Math.min(A.y, B.y)} width={Math.abs(B.x - A.x)} height={Math.abs(B.y - A.y)} fill="rgba(60,124,255,.12)" stroke={col} strokeWidth="1.5" />
    if (d.type === 'fib') {
      const x1 = Math.min(A.x, B.x), x2 = Math.max(A.x, B.x)
      return <g key={k}>{FIB.map((f, i) => { const price = d.b.price + (d.a.price - d.b.price) * f, y = main.current.priceToCoordinate(price); const cols = [css('down'), '#f59e0b', css('up'), '#3C7CFF', '#22d3ee', '#a855f7', '#94a3b8']; return y == null ? null : <g key={f}><rect x={x1} y={y} width={x2 - x1} height={i < FIB.length - 1 ? Math.max(0, (main.current.priceToCoordinate(d.b.price + (d.a.price - d.b.price) * FIB[i + 1]) ?? y) - y) : 0} fill={cols[i]} opacity=".07" /><line x1={x1} x2={x2} y1={y} y2={y} stroke={cols[i]} strokeWidth="1" /><text x={x1 + 4} y={y - 3} fontSize="10" fill={cols[i]}>{f} ({fa(price)})</text></g> })}</g>
    }
    if (d.type === 'measure') {
      const pct = ((d.b.price - d.a.price) / d.a.price) * 100, bars_ = d.b.logical - d.a.logical, upm = pct >= 0
      const fill = upm ? cssa('up', .15) : cssa('down', .15), st = upm ? css('up') : css('down')
      return <g key={k}><rect x={Math.min(A.x, B.x)} y={Math.min(A.y, B.y)} width={Math.abs(B.x - A.x)} height={Math.abs(B.y - A.y)} fill={fill} stroke={st} />
        <foreignObject x={(A.x + B.x) / 2 - 70} y={Math.max(A.y, B.y) + 6} width="140" height="44"><div dir="rtl" style={{ background: st, color: '#fff', borderRadius: 8, fontSize: 11, padding: '4px 6px', textAlign: 'center', lineHeight: 1.5 }}>{fa(d.b.price - d.a.price)} ({upm ? '+' : '−'}{fa(Math.abs(pct), 2)}٪)<br />{fa(Math.abs(bars_))} کندل</div></foreignObject></g>
    }
  }

  const chg = legend ? legend.close - legend.prev : 0
  const legendCol = chg >= 0 ? 'text-up' : 'text-down'
  const typeLabel = TYPES.find((x) => x.k === type).t

  return (
    <div ref={wrap} className="flex h-full flex-col" onClick={() => menu && setMenu(null)}>
      {/* Top toolbar (TradingView-style) */}
      <div className="flex shrink-0 flex-wrap items-center gap-0.5 border-b border-line/70 px-2 py-1" onClick={(e) => e.stopPropagation()}>
        <span className="ml-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-bold"><Icon size={16}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>{sym.s}</span>
        <i className="mx-1 h-5 w-px bg-line" />
        {INTERVALS.map((x) => (
          <button key={x.k} onClick={() => setInterval_(x.k)} className={`rounded-lg px-2 py-1.5 text-xs transition-colors ${interval === x.k ? 'bg-brand/15 font-bold text-brand-light' : 'text-muted hover:bg-surface2 hover:text-ink'}`}>{x.t}</button>
        ))}
        <i className="mx-1 h-5 w-px bg-line" />
        <Menu label={typeLabel} open={menu === 'type'} setOpen={(o) => setMenu(o ? 'type' : null)}>
          {TYPES.map((x) => <button key={x.k} onClick={() => { setType(x.k); setMenu(null) }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-surface2 ${type === x.k ? 'text-brand-light' : ''}`}>{x.t}{type === x.k && '✓'}</button>)}
        </Menu>
        <Menu label={<span className="flex items-center gap-1"><Icon size={15}><path d="M3 17l5-6 4 4 8-9" /></Icon>اندیکاتورها {inds.length > 0 && <b className="num rounded bg-brand px-1 text-[10px] text-white">{fa(inds.length)}</b>}</span>} open={menu === 'ind'} setOpen={(o) => setMenu(o ? 'ind' : null)} w="w-72">
          <input autoFocus value={indSearch} onChange={(e) => setIndSearch(e.target.value)} placeholder="جستجوی اندیکاتور..." className="mb-1 w-full rounded-lg bg-surface2 px-3 py-2 text-sm outline-none" />
          {INDICATORS.filter((x) => (x.t + x.d).toLowerCase().includes(indSearch.toLowerCase())).map((x) => {
            const on = inds.includes(x.k)
            return <button key={x.k} onClick={() => setInds(on ? inds.filter((y) => y !== x.k) : [...inds, x.k])} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-right text-sm hover:bg-surface2">
              <span className={`grid h-4 w-4 place-items-center rounded border text-[10px] ${on ? 'border-brand bg-brand text-white' : 'border-line'}`}>{on && '✓'}</span>
              <span className="flex-1">{x.t}<span className="block text-[11px] text-muted" dir="ltr" style={{ textAlign: 'right' }}>{x.d}</span></span>
              {x.c && <i className="h-2 w-2 rounded-full" style={{ background: x.c }} />}
            </button>
          })}
        </Menu>
        <div className="flex-1" />
        <button title="بازگرداندن نما" onClick={() => chart.current.timeScale().setVisibleLogicalRange({ from: bars.length - 120, to: bars.length + 6 })} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-ink"><Icon size={17}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Icon></button>
        <button title="تمام صفحه" onClick={() => { const el = wrap.current; document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen?.().catch(() => {}) }} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-ink"><Icon size={17}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></Icon></button>
      </div>

      <div className="flex min-h-0 flex-1 bg-surface">
        <div className="flex min-w-0 flex-1 flex-col">
        {/* Chart area */}
        <div className="relative min-h-0 min-w-0 flex-1" dir="ltr">
          <div ref={host} className="absolute inset-0" />
          <svg data-tick={tick} className={`absolute inset-0 h-full w-full ${tool === 'cursor' ? 'pointer-events-none' : 'cursor-crosshair'}`}
            onClick={onClick} onMouseMove={(e) => pending && setMouse(toPoint(e))} onContextMenu={(e) => { e.preventDefault(); setPending(null); setTool('cursor') }}>
            {!hideDraw && drawings.map((d, k) => renderShape(d, k))}
            {pending && mouse && renderShape({ type: tool, a: pending, b: mouse }, 'g', true)}
          </svg>
          {legend && (
            <div className="pointer-events-none absolute left-3 top-2 z-10 space-y-0.5 text-[11px]" dir="ltr">
              <div className="flex flex-wrap items-center gap-x-2">
                <b className="text-ink">{sym.s} · {INTERVALS.find((x) => x.k === interval).t}</b>
                {[['O', legend.open], ['H', legend.high], ['L', legend.low], ['C', legend.close]].map(([k, v]) => <span key={k} className="text-muted">{k}<b className={`num ml-0.5 ${legendCol}`}>{fa(v)}</b></span>)}
                <b className={`num ${legendCol}`}>{chg >= 0 ? '+' : '−'}{fa(Math.abs(chg))} ({chg >= 0 ? '+' : '−'}{fa(Math.abs(chg / legend.prev * 100), 2)}٪)</b>
              </div>
              {INDICATORS.filter((x) => inds.includes(x.k)).map((x) => <div key={x.k} className="text-muted"><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ background: x.c || '#94a3b8' }} />{x.d}</div>)}
            </div>
          )}
          {tool !== 'cursor' && <div className="pointer-events-none absolute bottom-10 left-1/2 z-10 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs text-white shadow-glow" dir="rtl">{pending ? 'نقطه دوم را انتخاب کنید · کلیک راست برای لغو' : `${TOOLS.find((x) => x.k === tool).t}: روی چارت کلیک کنید`}</div>}
        </div>

        {osc && ready && <OscPane key={osc + sym.s + interval} kind={osc} setKind={setOsc} bars={bars} mainChart={chart} dark={dark} />}
        {technical && (
          <div className="flex h-11 shrink-0 items-center justify-between border-t border-line/70 px-3 text-xs text-muted">
            <span>{sym.s} · {INTERVALS.find((x) => x.k === interval).t}</span>
            <div className="flex items-center gap-1">
              {!osc && <button onClick={() => setOsc('adx')} className="btn !h-7">+ اسیلاتور</button>}
              <button onClick={() => setLog(!log)} className={`btn !h-7 ${log ? 'btn-on' : ''}`} dir="ltr">log</button>
            </div>
          </div>
        )}
        </div>

        {/* Drawing tools rail */}
        <div className="flex w-11 shrink-0 flex-col items-center gap-0.5 border-r border-line/70 py-2">
          {TOOLS.map((x) => (
            <button key={x.k} title={x.t} onClick={() => { setTool(x.k); setPending(null) }} className={`group relative grid h-9 w-9 place-items-center rounded-lg transition-colors ${tool === x.k ? 'bg-brand/15 text-brand-light' : 'text-muted hover:bg-surface2 hover:text-ink'}`}>
              <Icon>{x.i}</Icon>
              <span className="pointer-events-none absolute left-full z-30 ml-2 whitespace-nowrap rounded-md bg-surface2 px-2 py-1 text-xs text-ink opacity-0 shadow-lg transition group-hover:opacity-100">{x.t}</span>
            </button>
          ))}
          <i className="my-1 h-px w-6 bg-line" />
          <button title="آهنربا" onClick={() => setMagnet(!magnet)} className={`grid h-9 w-9 place-items-center rounded-lg ${magnet ? 'bg-brand/15 text-brand-light' : 'text-muted hover:bg-surface2 hover:text-ink'}`}><Icon><path d="M6 3v8a6 6 0 0 0 12 0V3h-4v8a2 2 0 0 1-4 0V3z" /></Icon></button>
          <button title={hideDraw ? 'نمایش ترسیم‌ها' : 'پنهان کردن ترسیم‌ها'} onClick={() => setHideDraw(!hideDraw)} className={`grid h-9 w-9 place-items-center rounded-lg ${hideDraw ? 'bg-brand/15 text-brand-light' : 'text-muted hover:bg-surface2 hover:text-ink'}`}><Icon><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />{hideDraw && <path d="M3 3l18 18" />}</Icon></button>
          <button title="حذف همه ترسیم‌ها" onClick={() => { setDrawings([]); setPending(null) }} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-down/15 hover:text-down"><Icon><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></Icon></button>
          {drawings.length > 0 && <span className="num mt-1 text-[10px] text-muted">{fa(drawings.length)}</span>}
        </div>
      </div>
    </div>
  )
}

/* ---------- Oscillator pane (synced with the main chart) ---------- */
function calcRSI(b, n = 14) { let g = 0, l = 0; return b.map((x, i) => { if (!i) return null; const d = x.close - b[i - 1].close; g = (g * (n - 1) + Math.max(d, 0)) / n; l = (l * (n - 1) + Math.max(-d, 0)) / n; return i < n ? null : { time: x.time, value: 100 - 100 / (1 + g / (l || 1e-9)) } }).filter(Boolean) }
function calcADX(b, n = 14) {
  let tr = 0, pdm = 0, mdm = 0, adx = null; const out = { adx: [], pdi: [], mdi: [] }
  b.forEach((x, i) => {
    if (!i) return
    const p = b[i - 1], up = x.high - p.high, dn = p.low - x.low
    const t = Math.max(x.high - x.low, Math.abs(x.high - p.close), Math.abs(x.low - p.close))
    tr = tr - tr / n + t; pdm = pdm - pdm / n + (up > dn && up > 0 ? up : 0); mdm = mdm - mdm / n + (dn > up && dn > 0 ? dn : 0)
    const pdi = 100 * pdm / tr, mdi = 100 * mdm / tr, dx = 100 * Math.abs(pdi - mdi) / ((pdi + mdi) || 1)
    adx = adx == null ? dx : (adx * (n - 1) + dx) / n
    if (i >= n) { out.adx.push({ time: x.time, value: adx }); out.pdi.push({ time: x.time, value: pdi }); out.mdi.push({ time: x.time, value: mdi }) }
  })
  return out
}
function calcMACD(b) { const e = (n) => { const k = 2 / (n + 1); let v; return b.map((x) => (v = v == null ? x.close : x.close * k + v * (1 - k))) }; const f = e(12), sl = e(26), m = f.map((v, i) => v - sl[i]); let sg; const k = 2 / 10; return b.map((x, i) => { sg = sg == null ? m[i] : m[i] * k + sg * (1 - k); return { time: x.time, m: m[i], s: sg, h: m[i] - sg } }).slice(26) }

const OSC = { adx: 'ADX (14, 14)', rsi: 'RSI (14)', macd: 'MACD (12, 26, 9)' }
function OscPane({ kind, setKind, bars, mainChart, dark }) {
  const host = useRef(null)
  const [hidden, setHidden] = useState(false)
  const [menu, setMenu] = useState(false)
  useEffect(() => {
    const c = createChart(host.current, {
      autoSize: true, layout: { background: { color: 'transparent' }, textColor: css('muted'), fontFamily: 'IRANYekanX', fontSize: 11 },
      grid: { vertLines: { color: css('line').replace('rgb', 'rgba').replace(')', ',.35)') }, horzLines: { color: css('line').replace('rgb', 'rgba').replace(')', ',.35)') } },
      rightPriceScale: { borderVisible: false, minimumWidth: 64 }, timeScale: { borderVisible: false, timeVisible: true, tickMarkFormatter: (t) => new Date(t * 1000).toLocaleDateString('fa-IR-u-ca-persian', { month: 'short', day: 'numeric' }) },
      localization: { priceFormatter: (p) => fa(p, 1), timeFormatter: (t) => faDate(t, true) },
      crosshair: { vertLine: { labelBackgroundColor: '#2E62FF' }, horzLine: { labelBackgroundColor: '#2E62FF' } },
    })
    const o = (color, w = 1.5) => ({ color, lineWidth: w, priceLineVisible: false, lastValueVisible: true })
    if (!hidden) {
      if (kind === 'adx') { const a = calcADX(bars); c.addLineSeries(o('#f59e0b', 2)).setData(a.adx); c.addLineSeries(o('#3C7CFF')).setData(a.pdi); c.addLineSeries(o(css('down'))).setData(a.mdi)
        const g = c.addLineSeries({ ...o('rgba(0,0,0,0)'), lastValueVisible: false }); g.setData(a.adx); g.createPriceLine({ price: 20, color: cssa('down', .6), lineStyle: 2, lineWidth: 1, axisLabelVisible: false }) }
      if (kind === 'rsi') { const s = c.addLineSeries(o('#a855f7', 2)); s.setData(calcRSI(bars)); s.createPriceLine({ price: 70, color: cssa('down', .6), lineStyle: 2, lineWidth: 1, axisLabelVisible: true }); s.createPriceLine({ price: 30, color: cssa('up', .6), lineStyle: 2, lineWidth: 1, axisLabelVisible: true }) }
      if (kind === 'macd') { const m = calcMACD(bars); c.addHistogramSeries({ priceLineVisible: false, lastValueVisible: false }).setData(m.map((x) => ({ time: x.time, value: x.h, color: x.h >= 0 ? cssa('up', .5) : cssa('down', .5) }))); c.addLineSeries(o('#3C7CFF')).setData(m.map((x) => ({ time: x.time, value: x.m }))); c.addLineSeries(o('#f59e0b')).setData(m.map((x) => ({ time: x.time, value: x.s }))) }
    }
    // keep both charts scrolled/zoomed together and the same price-axis width
    mainChart.current.applyOptions({ rightPriceScale: { minimumWidth: 64 } })
    let lock = false
    const a2b = (r) => { if (lock || !r) return; lock = true; c.timeScale().setVisibleLogicalRange(r); lock = false }
    const b2a = (r) => { if (lock || !r) return; lock = true; mainChart.current.timeScale().setVisibleLogicalRange(r); lock = false }
    mainChart.current.timeScale().subscribeVisibleLogicalRangeChange(a2b)
    c.timeScale().subscribeVisibleLogicalRangeChange(b2a)
    a2b(mainChart.current.timeScale().getVisibleLogicalRange())
    return () => { mainChart.current?.timeScale().unsubscribeVisibleLogicalRangeChange(a2b); c.remove() }
  }, [kind, bars, hidden, dark])
  return (
    <div className="relative h-[30%] min-h-[120px] shrink-0 border-t-2 border-line" dir="ltr">
      <div ref={host} className="absolute inset-0" />
      <div className="absolute left-2 top-1.5 z-10 flex items-center gap-1 rounded-lg bg-surface/80 px-2 py-0.5 text-xs backdrop-blur">
        <div className="relative">
          <button onClick={() => setMenu(!menu)} className="font-semibold hover:text-brand-light">{OSC[kind]}</button>
          {menu && <div className="absolute left-0 top-6 z-20 w-40 rounded-lg border border-line bg-surface p-1 shadow-xl">{Object.entries(OSC).map(([k, t]) => <button key={k} onClick={() => { setKind(k); setMenu(false) }} className={`block w-full rounded px-2 py-1.5 text-left hover:bg-surface2 ${k === kind ? 'text-brand-light' : ''}`}>{t}</button>)}</div>}
        </div>
        <button title={hidden ? 'نمایش' : 'پنهان'} onClick={() => setHidden(!hidden)} className={`grid h-5 w-5 place-items-center rounded hover:bg-surface2 ${hidden ? 'text-brand-light' : 'text-muted'}`}><Icon size={13}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Icon></button>
        <button title="حذف" onClick={() => setKind(null)} className="grid h-5 w-5 place-items-center rounded text-muted hover:bg-surface2 hover:text-down"><Icon size={13}><path d="M6 6l12 12M18 6 6 18" /></Icon></button>
      </div>
    </div>
  )
}
