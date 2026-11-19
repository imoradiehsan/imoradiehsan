// سابقه قدرت حقیقی: چهار نمودار هم‌زمان (قیمت، حقیقی، حقوقی، سرانه) با نشانگر مشترک
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { makeBars } from './TVChart'
import { fa } from '../data/market'

const RANGES = [['۱ ماه', 22], ['۲ ماه', 44], ['۳ ماه', 66], ['۶ ماه', 130], ['۹ ماه', 195], ['۱ سال', 260], ['۲ سال', 320]]
const UP = 'rgb(var(--up))', DOWN = 'rgb(var(--down))'
const short = (n) => n >= 1e9 ? fa(n / 1e9, 1) + ' B' : n >= 1e6 ? fa(n / 1e6, n >= 1e7 ? 0 : 1) + ' M' : n >= 1e3 ? fa(n / 1e3, 0) + ' K' : fa(n)
const pdate = (t) => new Date(t * 1000).toLocaleDateString('fa-IR-u-ca-persian', { year: '2-digit', month: '2-digit', day: '2-digit' })

function Seg({ items, value, set, id }) {
  return (
    <div className="seg">{items.map(([k, t]) => (
      <button key={t} onClick={() => set(k)} className="seg-item">
        {value === k && <motion.span layoutId={id} className="absolute inset-0 rounded-[10px] bg-brand/15 ring-1 ring-brand/50" />}
        <span className={`relative ${value === k ? 'font-bold text-brand-light' : ''}`}>{t}</span>
      </button>
    ))}</div>
  )
}

function nice(max) { const p = 10 ** Math.floor(Math.log10(max || 1)), m = max / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p }

// generic pane (top-level so it is not remounted on every hover): y scale, grid, right axis, hover line, tooltip
function Pane({ ctx, title, h, max, min = 0, fmt, children, tip }) {
  const { W, padL, cw, X, ticksX, hover, hd } = ctx
    const y = (v) => 6 + (1 - (v - min) / (max - min || 1)) * (h - 12)
    const ticks = Array.from({ length: 4 }, (_, k) => min + (max - min) * (k + 1) / 4)
    return (
      <div className="relative border-b border-line/60 pb-1 pt-6">
        <div className="absolute right-2 top-1 text-xs font-semibold text-muted">{title}</div>
        <svg width={W} height={h} className="block overflow-visible">
          {ticks.map((t) => <g key={t}><line x1={padL} x2={padL + cw} y1={y(t)} y2={y(t)} stroke="rgb(var(--line))" strokeDasharray="3 4" /><text x={padL + cw + 6} y={y(t) + 4} fontSize="10" fill="rgb(var(--muted))">{fmt(t)}</text></g>)}
          {ticksX.map((i) => <line key={i} x1={X(i)} x2={X(i)} y1={0} y2={h} stroke="rgb(var(--line))" strokeDasharray="3 4" opacity=".6" />)}
          <line x1={padL + cw} x2={padL + cw} y1={0} y2={h} stroke="rgb(var(--muted))" opacity=".5" />
          {children(y)}
          {hd && <line x1={X(hover)} x2={X(hover)} y1={0} y2={h} stroke="rgba(240,80,110,.7)" />}
        </svg>
        <AnimatePresence>{hd && tip && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .1 }}
            style={{ left: X(hover) > W / 2 ? X(hover) - 172 : X(hover) + 14, top: 26 }}
            className="pointer-events-none absolute z-10 w-40 rounded-xl border border-line bg-surface2/95 p-2 text-[11px] shadow-2xl backdrop-blur" dir="rtl">
            <div className="num mb-1 border-b border-line pb-1 text-center font-bold text-brand-light">{pdate(hd.t)}</div>
            {tip(hd).map(([k, v]) => <div key={k} className="flex justify-between py-0.5"><span className="text-muted">{k}:</span><b className="num" dir="ltr">{v}</b></div>)}
          </motion.div>
        )}</AnimatePresence>
      </div>
    )
  }

export default function RealPower({ sym }) {
  const [type, setType] = useState('line'), [unit, setUnit] = useState('vol'), [adj, setAdj] = useState(true), [range, setRange] = useState('۱ ماه')
  const [hover, setHover] = useState(null)
  const box = useRef(null); const [W, setW] = useState(640)
  useEffect(() => { const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); ro.observe(box.current); return () => ro.disconnect() }, [])

  const n = RANGES.find((r) => r[0] === range)[1]
  const all = useMemo(() => makeBars(sym, 86400), [sym])
  const data = useMemo(() => {
    let x = [...sym.s].reduce((a, c) => a * 13 + c.charCodeAt(0), 9) % 2147483647
    const r = () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646
    const cut = Math.floor(all.length * .6)
    return all.slice(-n).map((b) => {
      const k = !adj && b.time < all[cut].time ? 1.25 : 1
      const v = b.volume, rb = .5 + r() * .45, rs = .45 + r() * .5
      const real = { b: v * rb, s: v * rs, bn: Math.round(50 + r() * 400), sn: Math.round(50 + r() * 500) }
      const legal = { b: v * (1 - rb), s: v * (1 - rs), bn: Math.round(r() * 6), sn: Math.round(r() * 6) }
      return { t: b.time, o: b.open * k, h: b.high * k, l: b.low * k, c: b.close * k, v, real, legal, pb: real.b / real.bn, ps: real.s / real.sn }
    })
  }, [all, n, adj, sym])

  const padR = 52, padL = 8, cw = W - padR - padL, step = cw / data.length
  const X = (i) => padL + i * step + step / 2
  const onMove = (e) => { const r = box.current.getBoundingClientRect(); const i = Math.floor((e.clientX - r.left - padL) / step); setHover(i >= 0 && i < data.length ? i : null) }
  const hd = hover != null ? data[hover] : null
  const ticksX = data.map((d, i) => i).filter((i) => i % Math.ceil(data.length / 7) === 0)

  const ctx = { W, padL, cw, X, ticksX, hover, hd }
  const bars2 = (y, vals) => vals.map(([a, b], i) => {
    const w = Math.max(1.5, step * .36), base = y(0)
    return <g key={i} opacity={hover == null || hover === i ? 1 : .55}>
      <motion.rect initial={{ height: 0, y: base }} animate={{ height: base - y(a), y: y(a) }} transition={{ duration: .4, delay: i * .004 }} x={X(i) - w - .5} width={w} fill={UP} rx="1" />
      <motion.rect initial={{ height: 0, y: base }} animate={{ height: base - y(b), y: y(b) }} transition={{ duration: .4, delay: i * .004 }} x={X(i) + .5} width={w} fill={DOWN} rx="1" />
    </g>
  })
  const side = (k) => data.map((d) => unit === 'vol' ? [d[k].b, d[k].s] : [d[k].b / d.v * 100, d[k].s / d.v * 100])
  const realV = side('real'), legalV = side('legal')
  const vmaxR = unit === 'vol' ? nice(Math.max(...realV.flat())) : 100, vmaxL = unit === 'vol' ? nice(Math.max(...legalV.flat())) : 100
  const fmtU = (t) => unit === 'vol' ? short(t) : fa(t) + '٪'
  const pmin = Math.min(...data.map((d) => d.l)), pmax = Math.max(...data.map((d) => d.h)), pad = (pmax - pmin) * .1
  const vmax = Math.max(...data.map((d) => d.v)), perMax = nice(Math.max(...data.flatMap((d) => [d.pb, d.ps])))

  return (
    <div className="-m-4 flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <Seg id="rp-type" value={type} set={setType} items={[['line', 'خطی'], ['candle', 'شمعی']]} />
        <Seg id="rp-unit" value={unit} set={setUnit} items={[['vol', 'حجم'], ['pct', 'درصد']]} />
        <Seg id="rp-adj" value={adj} set={setAdj} items={[[true, 'تعدیل شده'], [false, 'تعدیل نشده']]} />
      </div>
      <div ref={box} className="scroll-y min-h-0 flex-1 select-none" dir="ltr" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <Pane ctx={ctx} title={sym.s} h={220} min={pmin - pad} max={pmax + pad} fmt={(t) => fa(Math.round(t))} tip={(d) => [['قیمت', fa(Math.round(d.c))], ['حجم', fa(d.v)]]}>
          {(y) => <>
            {data.map((d, i) => { const hgt = d.v / vmax * 50; return <rect key={'v' + i} x={X(i) - step * .3} width={step * .6} y={y(pmin - pad) - hgt} height={hgt} fill={d.c >= d.o ? UP : DOWN} opacity=".35" /> })}
            {type === 'line'
              ? <motion.path key={range + adj} d={data.map((d, i) => `${i ? 'L' : 'M'}${X(i)},${y(d.c)}`).join('')} fill="none" stroke="#3C7CFF" strokeWidth="2.5" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .8 }} />
              : data.map((d, i) => { const col = d.c >= d.o ? UP : DOWN; return <g key={i}><line x1={X(i)} x2={X(i)} y1={y(d.h)} y2={y(d.l)} stroke={col} /><rect x={X(i) - step * .3} width={step * .6} y={y(Math.max(d.o, d.c))} height={Math.max(1, Math.abs(y(d.o) - y(d.c)))} fill={col} /></g> })}
            {hd && <><line x1={padL} x2={padL + cw} y1={y(hd.c)} y2={y(hd.c)} stroke="rgba(240,80,110,.7)" /><circle cx={X(hover)} cy={y(hd.c)} r="4" fill="#3C7CFF" stroke="rgb(var(--surface))" strokeWidth="2" /></>}
          </>}
        </Pane>
        <Pane ctx={ctx} title={`${unit === 'vol' ? 'حجم' : 'درصد'} خرید و فروش حقیقی`} h={130} max={vmaxR} fmt={fmtU} tip={(d) => [['حجم خرید', short(d.real.b)], ['تعداد خرید', fa(d.real.bn)], ['حجم فروش', short(d.real.s)], ['تعداد فروش', fa(d.real.sn)]]}>{(y) => bars2(y, realV)}</Pane>
        <Pane ctx={ctx} title={`${unit === 'vol' ? 'حجم' : 'درصد'} خرید و فروش حقوقی`} h={130} max={vmaxL} fmt={fmtU} tip={(d) => [['حجم خرید', short(d.legal.b)], ['تعداد خرید', fa(d.legal.bn)], ['حجم فروش', short(d.legal.s)], ['تعداد فروش', fa(d.legal.sn)]]}>{(y) => bars2(y, legalV)}</Pane>
        <Pane ctx={ctx} title="سرانه حجم معامله شده حقیقی" h={130} max={perMax} fmt={short} tip={(d) => [['سرانه حجم خریدار', fa(Math.round(d.pb))], ['سرانه حجم فروشنده', fa(Math.round(d.ps))], ['قدرت خریدار', fa(d.pb / d.ps, 2)]]}>{(y) => bars2(y, data.map((d) => [d.pb, d.ps]))}</Pane>
        <svg width={W} height={34} className="block">
          {ticksX.map((i) => <text key={i} x={X(i)} y={14} fontSize="10" fill="rgb(var(--muted))" textAnchor="end" transform={`rotate(-30 ${X(i)} 14)`}>{pdate(data[i].t)}</text>)}
        </svg>
      </div>
      <div className="flex items-center justify-center gap-4 border-t border-line px-4 py-1.5 text-[11px] text-muted">
        <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-up" />خرید</span><span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-down" />فروش</span>
      </div>
      <div className="overflow-x-auto border-t border-line px-4 py-2.5"><Seg id="rp-range" value={range} set={setRange} items={RANGES.map(([t]) => [t, t])} /></div>
    </div>
  )
}
