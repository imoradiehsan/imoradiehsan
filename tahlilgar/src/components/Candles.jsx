import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { fa } from '../data/market'

export default function Candles({ data, type, showMA }) {
  const box = useRef(null)
  const [w, setW] = useState(800), [h, setH] = useState(400)
  const [hover, setHover] = useState(null)
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => { setW(e.contentRect.width); setH(e.contentRect.height) })
    ro.observe(box.current); return () => ro.disconnect()
  }, [])
  const padR = 64, padB = 26, volH = h * 0.16
  const cw = w - padR, ch = h - padB - volH - 8
  const hi = Math.max(...data.map((d) => d.h)), lo = Math.min(...data.map((d) => d.l))
  const span = hi - lo || 1
  const y = (v) => 8 + (1 - (v - lo) / span) * (ch - 16)
  const step = cw / data.length, bw = Math.max(2, step * 0.62)
  const x = (i) => i * step + step / 2
  const vmax = Math.max(...data.map((d) => d.v))
  const ticks = Array.from({ length: 5 }, (_, k) => lo + (span * k) / 4)
  const last = data.at(-1)
  const up = last.c >= data[0].o
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.c)}`).join('')
  const ma = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.ma)}`).join('')
  const hd = hover != null ? data[hover] : null

  return (
    <div ref={box} className="relative h-full w-full select-none" dir="ltr"
      onMouseMove={(e) => { const r = box.current.getBoundingClientRect(); const i = Math.floor((e.clientX - r.left) / step); setHover(i >= 0 && i < data.length ? i : null) }}
      onMouseLeave={() => setHover(null)}>
      <svg width={w} height={h} className="absolute inset-0">
        <defs>
          <linearGradient id="ca" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#3C7CFF" stopOpacity=".45" /><stop offset="1" stopColor="#2047FF" stopOpacity="0" /></linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1="0" x2={cw} y1={y(t)} y2={y(t)} stroke="rgb(var(--line))" strokeDasharray="3 5" />
            <text x={cw + 8} y={y(t) + 4} fontSize="11" fill="rgb(var(--muted))">{fa(t)}</text>
          </g>
        ))}
        {data.map((d, i) => i % Math.ceil(data.length / 6) === 0 && (
          <text key={i} x={x(i)} y={h - 8} fontSize="11" fill="rgb(var(--muted))" textAnchor="middle">{fa(i + 1)}</text>
        ))}
        <g key={type + data.length}>
          {type === 'candle' ? data.map((d, i) => {
            const g = d.c >= d.o, col = g ? 'rgb(var(--up))' : 'rgb(var(--down))'
            return (
              <motion.g key={i} initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} transition={{ delay: i * 0.004, duration: .3 }} style={{ originY: `${y(d.c)}px` }}>
                <line x1={x(i)} x2={x(i)} y1={y(d.h)} y2={y(d.l)} stroke={col} />
                <rect x={x(i) - bw / 2} width={bw} y={y(Math.max(d.o, d.c))} height={Math.max(1, Math.abs(y(d.o) - y(d.c)))} fill={col} rx="1" />
              </motion.g>
            )
          }) : (
            <>
              <motion.path d={`${line}L${x(data.length - 1)},${ch}L${x(0)},${ch}Z`} fill="url(#ca)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .8 }} />
              <motion.path d={line} fill="none" stroke="#3C7CFF" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
            </>
          )}
          {showMA && <motion.path d={ma} fill="none" stroke="#f59e0b" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />}
          {data.map((d, i) => (
            <rect key={'v' + i} x={x(i) - bw / 2} width={bw} y={h - padB - (d.v / vmax) * volH} height={(d.v / vmax) * volH}
              fill={d.c >= d.o ? 'rgb(var(--up))' : 'rgb(var(--down))'} opacity={hover === i ? .7 : .25} />
          ))}
        </g>
        <line x1="0" x2={cw} y1={y(last.c)} y2={y(last.c)} stroke={up ? 'rgb(var(--up))' : 'rgb(var(--down))'} strokeDasharray="2 3" />
        <rect x={cw + 2} y={y(last.c) - 10} width={padR - 4} height="20" rx="6" fill={up ? 'rgb(var(--up))' : 'rgb(var(--down))'} />
        <text x={cw + padR / 2} y={y(last.c) + 4} fontSize="11" fontWeight="700" fill="#fff" textAnchor="middle">{fa(last.c)}</text>
        {hd && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1="0" y2={h - padB} stroke="rgb(var(--muted))" strokeDasharray="4 4" />
            <line x1="0" x2={cw} y1={y(hd.c)} y2={y(hd.c)} stroke="rgb(var(--muted))" strokeDasharray="4 4" />
            <rect x={cw + 2} y={y(hd.c) - 10} width={padR - 4} height="20" rx="6" fill="rgb(var(--surface2))" />
            <text x={cw + padR / 2} y={y(hd.c) + 4} fontSize="11" fill="rgb(var(--ink))" textAnchor="middle">{fa(hd.c)}</text>
          </g>
        )}
      </svg>
      <div className="pointer-events-none absolute left-3 top-2 flex gap-3 rounded-xl bg-surface/70 px-3 py-1.5 text-xs backdrop-blur" dir="rtl">
        {(hd ? [['باز', hd.o], ['بیشترین', hd.h], ['کمترین', hd.l], ['پایانی', hd.c]] : [['آخرین', last.c]]).map(([k, v]) => (
          <span key={k} className="text-muted">{k} <b className={`num ${(hd || last).c >= (hd || last).o ? 'text-up' : 'text-down'}`}>{fa(v)}</b></span>
        ))}
        {showMA && <span className="text-amber-400">MA20</span>}
      </div>
    </div>
  )
}
