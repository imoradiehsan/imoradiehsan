import { motion } from 'framer-motion'
import { ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart } from 'recharts'
import { useState } from 'react'
import { MoreCircle, EditSquare, Category } from 'react-iconly'
import { fa } from '../data/market'

function seeded(s) { let x = [...s].reduce((a, c) => a + c.charCodeAt(0), 0); return () => ((x = (x * 9301 + 49297) % 233280) / 233280) }
const tick = { fill: 'rgb(var(--muted))', fontSize: 11 }

export default function SymbolDetails({ sym }) {
  const r = seeded(sym.s)
  const [period, setPeriod] = useState('سالانه')
  const perf = [['۱ هفته', 1], ['۱ ماه', 3], ['۳ ماه', 8], ['۶ ماه', 14], ['از ابتدای سال', 22], ['۱ سال', 30]].map(([t, m]) => [t, (sym.c * m * 0.6 + (r() - 0.4) * m * 1.5)])
  const years = period === 'سالانه' ? ['۱۴۰۰', '۱۴۰۱', '۱۴۰۲', '۱۴۰۳', '۱۴۰۴'] : ['بهار', 'تابستان', 'پاییز', 'زمستان']
  const inc = years.map((y, i) => { const rev = 40 + i * 12 + r() * 20; const ni = rev * (0.15 + r() * 0.15); return { y, rev: Math.round(rev), ni: Math.round(ni), m: +(ni / rev * 100).toFixed(1) } })
  const payout = Math.round(45 + r() * 40)
  const season = Array.from({ length: 12 }, (_, i) => ({ i, a: 100 + i * 2 + r() * 8, b: 100 + i * 1.2 + r() * 10, c: 100 - i + r() * 9 }))
  const box = 'px-4 py-4 border-b border-line/70'

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-line bg-surface/95 px-4 py-2.5 backdrop-blur">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/15 text-xs font-bold text-brand-light">{sym.s.slice(0, 2)}</span>
        <b className="flex-1">{sym.s}</b>
        {[Category, EditSquare, MoreCircle].map((I, k) => <button key={k} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-ink"><I set="light" size={18} primaryColor="currentColor" /></button>)}
      </div>

      <section className={box}>
        <h4 className="mb-3 text-sm font-semibold">بازدهی</h4>
        <div className="grid grid-cols-3 gap-1.5">
          {perf.map(([t, v], k) => (
            <motion.div key={t + sym.s} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: k * .04 }}
              className={`rounded-lg py-2 text-center ${v >= 0 ? 'bg-up/15 text-up' : 'bg-down/15 text-down'}`} style={{ opacity: .6 + Math.min(Math.abs(v), 30) / 75 }}>
              <div className="num text-sm font-bold" dir="ltr">{v >= 0 ? '+' : '−'}{fa(Math.abs(v), 2)}٪</div>
              <div className="text-[11px] text-muted">{t}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className={box}>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold">صورت سود و زیان</h4>
          <div className="flex gap-3 text-xs">{['سالانه', 'فصلی'].map((p) => <button key={p} onClick={() => setPeriod(p)} className={period === p ? 'text-brand-light underline underline-offset-4' : 'text-muted'}>{p}</button>)}</div>
        </div>
        <div className="h-44" dir="ltr">
          <ResponsiveContainer>
            <ComposedChart data={inc} margin={{ left: -18, right: -10 }}>
              <XAxis dataKey="y" reversed tick={tick} axisLine={false} tickLine={false} />
              <YAxis yAxisId="l" tick={tick} axisLine={false} tickLine={false} tickFormatter={(v) => fa(v)} />
              <YAxis yAxisId="r" orientation="right" tick={tick} axisLine={false} tickLine={false} tickFormatter={(v) => fa(v) + '٪'} />
              <Tooltip cursor={{ fill: 'rgb(var(--surface2))' }} contentStyle={{ background: 'rgb(var(--surface2))', border: 0, borderRadius: 12, fontFamily: 'inherit' }} formatter={(v, n) => [fa(v), { rev: 'درآمد (همت)', ni: 'سود خالص', m: 'حاشیه سود٪' }[n]]} />
              <Bar yAxisId="l" dataKey="rev" fill="#2E62FF" radius={[4, 4, 0, 0]} barSize={10} />
              <Bar yAxisId="l" dataKey="ni" fill="#22d3ee" radius={[4, 4, 0, 0]} barSize={10} />
              <Line yAxisId="r" dataKey="m" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: 'rgb(var(--surface))' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-center gap-4 text-[11px] text-muted">
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-brand" />درآمد</span>
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-cyan-400" />سود خالص</span>
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-amber-500" />حاشیه سود</span>
        </div>
      </section>

      <section className={box}>
        <h4 className="mb-2 text-sm font-semibold">سود نقدی</h4>
        <div className="relative mx-auto h-36 w-36">
          <ResponsiveContainer>
            <PieChart><Pie data={[{ v: payout }, { v: 100 - payout }]} dataKey="v" innerRadius="72%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="none">
              <Cell fill="#34d399" /><Cell fill="rgb(var(--surface2))" />
            </Pie></PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center text-center"><div><div className="num text-lg font-bold text-up">{fa(payout)}٪</div><div className="text-[10px] text-muted">نسبت تقسیم سود</div></div></div>
        </div>
        <dl className="mt-3 space-y-2 text-sm">
          {[['بازده سود نقدی', fa(r() * 9 + 2, 2) + '٪'], ['آخرین DPS', fa(Math.round(sym.p * 0.08)) + ' ریال'], ['تاریخ مجمع', '۱۵ تیر ۱۴۰۴'], ['تاریخ پرداخت', '۲۰ مهر ۱۴۰۴']].map(([k, v]) => (
            <div key={k} className="flex justify-between"><dt className="text-muted">{k}</dt><dd className="num font-semibold">{v}</dd></div>
          ))}
        </dl>
      </section>

      <section className="px-4 py-4">
        <h4 className="mb-2 text-sm font-semibold">فصلی بودن (۳ سال اخیر)</h4>
        <div className="h-36" dir="ltr">
          <ResponsiveContainer>
            <LineChart data={season} margin={{ left: 0, right: 0 }}>
              <YAxis hide domain={['dataMin', 'dataMax']} />
              <Line dataKey="c" stroke="#34d399" dot={false} strokeWidth={1.3} />
              <Line dataKey="b" stroke="#f59e0b" dot={false} strokeWidth={1.3} />
              <Line dataKey="a" stroke="#3C7CFF" dot={false} strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-center gap-4 text-[11px] text-muted">
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-brand-light" />۱۴۰۴</span>
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-amber-500" />۱۴۰۳</span>
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-emerald-400" />۱۴۰۲</span>
        </div>
      </section>
    </div>
  )
}
