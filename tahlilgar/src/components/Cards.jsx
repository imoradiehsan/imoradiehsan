import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LabelList, LineChart, Line } from 'recharts'
import { ArrowDown, ArrowUp, Plus, Filter, ChevronDown } from 'react-iconly'
import Count, { Change } from './Count'
import { RANGES, fa, tradeValue, watchlist, portfolios, trades } from '../data/market'

const enter = (k) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay: k * 0.08, duration: .5, ease: [.2, .8, .2, 1] } })

function Tabs({ items, value, onChange, id }) {
  return (
    <div className="flex rounded-full border border-line/70 bg-surface2/50 p-1">
      {items.map((t) => (
        <button key={t} onClick={() => onChange(t)} className="chip relative">
          {value === t && <motion.span layoutId={id} className="absolute inset-0 rounded-full bg-surface2 ring-1 ring-line" />}
          <span className={`relative ${value === t ? 'text-ink' : ''}`}>{t}</span>
        </button>
      ))}
    </div>
  )
}

const Tip = ({ active, payload }) =>
  active && payload?.length ? (
    <div className="rounded-2xl bg-white px-4 py-2.5 text-slate-900 shadow-xl">
      <div className="text-xs text-slate-500">{payload[0].payload.d}</div>
      <div className="num text-sm font-bold">{fa(payload[0].value)} واحد</div>
    </div>
  ) : null

export function IndexCard() {
  const [r, setR] = useState('۶ ماهه')
  const data = RANGES[r]
  const last = data.at(-1).v, first = data[0].v
  return (
    <motion.section {...enter(0)} className="card lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-muted">شاخص کل بورس تهران</h2>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-3xl font-bold"><Count to={last} /></span>
            <Change c={((last - first) / first) * 100} />
          </div>
        </div>
        <Tabs id="range" items={Object.keys(RANGES)} value={r} onChange={setR} />
      </div>
      <div className="mt-4 h-64" dir="ltr">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 10 }}>
            <defs>
              <linearGradient id="ga" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#3C7CFF" stopOpacity=".75" />
                <stop offset="1" stopColor="#2047FF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <XAxis dataKey="i" tickFormatter={(i) => data[i]?.m} interval={Math.floor(data.length / 6)} axisLine={false} tickLine={false} tick={{ fill: 'rgb(var(--muted))', fontSize: 12 }} reversed />
            <YAxis orientation="right" domain={['dataMin - 50000', 'dataMax + 50000']} tickFormatter={(v) => fa(v / 1e6, 1) + 'م'} axisLine={false} tickLine={false} width={44} tick={{ fill: 'rgb(var(--muted))', fontSize: 12 }} />
            <Tooltip content={<Tip />} cursor={{ stroke: 'rgb(var(--muted))', strokeDasharray: '4 4' }} />
            <Area key={r} type="monotone" dataKey="v" stroke="#3C7CFF" strokeWidth={2} fill="url(#ga)" animationDuration={900}
              activeDot={{ r: 7, fill: '#fff', stroke: '#2E62FF', strokeWidth: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span>میانگین ارزش معاملات روزانه: <b className="num text-ink">{fa(9840)} میلیارد تومان</b></span>
        <span className="flex gap-4">
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-brand" />شاخص کل</span>
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-up" />شاخص هم‌وزن</span>
        </span>
      </div>
    </motion.section>
  )
}

export function PortfolioCard() {
  const [top, setTop] = useState(0)
  const order = portfolios.map((_, k) => (top + k) % portfolios.length)
  const p = portfolios[top]
  return (
    <motion.section {...enter(1)} className="card relative overflow-hidden lg:row-span-2 flex flex-col">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/40 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <h2 className="text-lg font-semibold">پرتفوی‌های من</h2>
        <motion.button whileTap={{ scale: .92 }} className="flex items-center gap-1 rounded-full border border-line bg-surface2/60 px-3 py-1.5 text-sm text-muted hover:text-ink">
          <Plus set="light" size={16} primaryColor="currentColor" /> افزودن
        </motion.button>
      </div>

      <div className="relative mt-5 h-[230px]">
        {order.slice().reverse().map((idx) => {
          const depth = order.indexOf(idx)
          const x = portfolios[idx]
          return (
            <motion.button key={idx} onClick={() => setTop(idx)} layout
              animate={{ y: (2 - depth) * -26 + 52, scale: 1 - depth * 0.06, opacity: 1 - depth * 0.25 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              style={{ zIndex: 10 - depth }}
              className={`absolute inset-x-0 top-0 h-[178px] rounded-3xl p-5 text-right text-white ${depth === 0 ? 'bg-gradient-to-br from-[#3C7CFF] via-[#2E62FF] to-[#1b3cd6] shadow-glow' : 'bg-gradient-to-br from-[#2a3a6e] to-[#1a2448]'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold">{x.broker}</span>
                <span className="num text-xs opacity-70">کد: {x.code}</span>
              </div>
              {depth === 0 && (
                <>
                  <div className="mt-8 text-sm opacity-80">ارزش روز پرتفوی</div>
                  <div className="mt-1 flex items-end justify-between">
                    <span className="text-2xl font-bold"><Count to={x.value / 10} /> <small className="text-sm font-normal opacity-80">تومان</small></span>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs backdrop-blur">{x.c >= 0 ? '↑' : '↓'} {fa(Math.abs(x.c), 2)}٪</span>
                  </div>
                </>
              )}
            </motion.button>
          )
        })}
      </div>

      <div className="relative mt-3 grid grid-cols-2 gap-3">
        <motion.button whileTap={{ scale: .95 }} whileHover={{ y: -2 }} className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface2/70 py-3.5 font-medium">
          <ArrowDown set="light" size={18} primaryColor="currentColor" /> فروش
        </motion.button>
        <motion.button whileTap={{ scale: .95 }} whileHover={{ y: -2 }} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-brand-light to-brand-dark py-3.5 font-medium text-white shadow-glow">
          <ArrowUp set="light" size={18} primaryColor="currentColor" /> خرید
        </motion.button>
      </div>

      <div className="relative mt-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">آخرین معاملات</h3>
        <button className="text-sm text-muted hover:text-brand-light">مشاهده همه</button>
      </div>
      <div className="relative mt-3 space-y-2.5">
        {trades.map((t, k) => (
          <motion.div key={k} {...enter(k + 3)} whileHover={{ x: -4 }} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line/60 bg-surface2/40 p-3">
            <div className={`grid h-11 w-11 place-items-center rounded-xl text-sm font-bold ${t.t === 'خرید' ? 'bg-up/15 text-up' : 'bg-down/15 text-down'}`}>{t.s.slice(0, 2)}</div>
            <div className="flex-1">
              <div className="font-medium">{t.t} {t.s} <span className="num text-xs text-muted">({fa(t.q)} سهم)</span></div>
              <div className="text-xs text-muted">{t.at}</div>
            </div>
            <div className={`num text-sm font-semibold ${t.t === 'خرید' ? 'text-down' : 'text-up'}`}>{t.t === 'خرید' ? '−' : '+'}{fa(t.amt / 10)}</div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

export function PromoCard() {
  return (
    <motion.section {...enter(2)} className="relative flex min-h-[290px] flex-col overflow-hidden rounded-[28px] bg-gradient-to-br from-[#3C7CFF] via-[#2E62FF] to-[#14247a] p-6 text-white">
      <motion.div animate={{ y: [0, -12, 0], rotate: [0, 6, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-sm" />
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute bottom-16 left-10 h-24 w-24 rounded-[30%] border border-white/25 bg-white/10 backdrop-blur-md" />
      <h3 className="relative text-2xl font-extrabold leading-snug">مورد اعتماد هزاران سرمایه‌گذار<br /><span className="text-white/70">همین امروز عضو شوید!</span></h3>
      <p className="relative mt-2 text-sm text-white/80">تحلیل تکنیکال و بنیادی، سیگنال‌های لحظه‌ای و مشاوره تخصصی</p>
      <div className="relative mt-4 flex -space-x-3 space-x-reverse">
        {['#f59e0b', '#10b981', '#ec4899'].map((c, k) => (
          <span key={k} className="grid h-10 w-10 place-items-center rounded-full border-2 border-white/80 text-sm font-bold" style={{ background: c }}>{['ع', 'م', 'ز'][k]}</span>
        ))}
        <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-white/80 bg-white text-brand"><Plus set="bold" size={18} primaryColor="currentColor" /></span>
      </div>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .96 }} className="relative mt-auto rounded-2xl bg-white py-3.5 font-bold text-brand-dark">خرید اشتراک ویژه</motion.button>
    </motion.section>
  )
}

export function VolumeCard() {
  const [hover, setHover] = useState(4)
  const [period, setPeriod] = useState('ماهانه')
  return (
    <motion.section {...enter(3)} className="card">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-muted">ارزش معاملات خرد</h2>
          <div className="mt-1 flex items-center gap-2"><span className="text-2xl font-bold"><Count to={841} /> همت</span><Change c={1.52} /></div>
        </div>
        <div className="flex gap-2">
          <button className="chip flex items-center gap-1 border border-line"><Filter set="light" size={14} primaryColor="currentColor" />مرتب‌سازی</button>
          <button onClick={() => setPeriod(period === 'ماهانه' ? 'هفتگی' : 'ماهانه')} className="chip flex items-center gap-1 border border-line">{period}<ChevronDown set="light" size={14} primaryColor="currentColor" /></button>
        </div>
      </div>
      <div className="mt-4 h-52" dir="ltr">
        <ResponsiveContainer>
          <BarChart data={tradeValue} margin={{ top: 28 }} onMouseMove={(s) => s.activeTooltipIndex != null && setHover(s.activeTooltipIndex)}>
            <defs>
              <linearGradient id="gb" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#3C7CFF" /><stop offset="1" stopColor="#2047FF" stopOpacity=".15" /></linearGradient>
              <linearGradient id="gm" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="rgb(var(--surface2))" /><stop offset="1" stopColor="rgb(var(--surface2))" stopOpacity=".2" /></linearGradient>
            </defs>
            <XAxis dataKey="m" reversed axisLine={false} tickLine={false} tick={{ fill: 'rgb(var(--muted))', fontSize: 12 }} />
            <Tooltip cursor={false} content={() => null} />
            <Bar dataKey="v" radius={[10, 10, 4, 4]}>
              {tradeValue.map((_, k) => <Cell key={k} fill={k === hover ? 'url(#gb)' : 'url(#gm)'} className="transition-all" />)}
              <LabelList dataKey="v" position="top" formatter={(v) => fa(v)} style={{ fill: 'rgb(var(--muted))', fontSize: 12 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  )
}

export function Watchlist() {
  const [fav, setFav] = useState(['فولاد'])
  return (
    <motion.section {...enter(4)} className="card lg:col-span-3 overflow-x-auto">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">دیده‌بان بازار</h2>
        <button className="text-sm text-muted hover:text-brand-light">مشاهده همه</button>
      </div>
      <table className="w-full min-w-[640px] text-sm">
        <thead className="text-muted"><tr className="text-right">
          <th className="py-2 font-normal">نماد</th><th className="font-normal">آخرین قیمت</th><th className="font-normal">تغییر</th><th className="font-normal">حجم</th><th className="font-normal">روند ۲۰ روزه</th><th />
        </tr></thead>
        <tbody>
          {watchlist.map((w, k) => (
            <motion.tr key={w.s} {...enter(k + 5)} className="border-t border-line/60 transition-colors hover:bg-surface2/40">
              <td className="py-3"><div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/15 text-xs font-bold text-brand-light">{w.s.slice(0, 2)}</span>
                <div><div className="font-semibold">{w.s}</div><div className="text-xs text-muted">{w.n}</div></div>
              </div></td>
              <td className="num font-medium">{fa(w.p)}</td>
              <td><Change c={w.c} /></td>
              <td className="text-muted">{w.vol}</td>
              <td className="w-32"><div className="h-9" dir="ltr"><ResponsiveContainer><LineChart data={w.spark}><YAxis hide domain={['dataMin', 'dataMax']} /><Line dataKey="v" dot={false} strokeWidth={2} stroke={w.c >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))'} /></LineChart></ResponsiveContainer></div></td>
              <td className="text-left">
                <motion.button whileTap={{ scale: .7 }} onClick={() => setFav(fav.includes(w.s) ? fav.filter((x) => x !== w.s) : [...fav, w.s])}
                  className={fav.includes(w.s) ? 'text-amber-400' : 'text-muted hover:text-ink'}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={fav.includes(w.s) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" strokeLinejoin="round" /></svg>
                </motion.button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.section>
  )
}
