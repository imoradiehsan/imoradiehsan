import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts'
import { Search, Notification, Category, Chart, Wallet, Plus, Delete } from 'react-iconly'
import { SYMBOLS, fa } from '../data/market'
import { Change } from './Count'
import { Marquee } from './OverviewExtra'

const TABS = [
  { k: 'watch', t: 'دیده‌بان', I: Category },
  { k: 'port', t: 'پرتفوی', I: Wallet },
  { k: 'alert', t: 'هشدار', I: Notification },
]

export default function AppPanel({ sym, setSym, tab, setTab, collapsed, setCollapsed }) {
  // Each rail tab has its own page stack, like a phone app: root page + pushed sub-pages
  const [stack, setStack] = useState([])
  const [dir, setDir] = useState(1)
  const [alerts, setAlerts] = useState([{ s: 'فولاد', t: 'قیمت بالای ۶٬۵۰۰', on: true }, { s: 'فملی', t: 'حجم بیش از ۲ برابر میانگین', on: true }, { s: 'شپنا', t: 'عبور از MA20', on: false }])
  const push = (page) => { setDir(1); setStack((st) => [...st, page]) }
  const back = () => { setDir(-1); setStack((st) => st.slice(0, -1)) }
  const goTab = (k) => { setDir(1); setStack([]); setTab(k) }
  const root = TABS.find((x) => x.k === tab).t
  const page = stack.at(-1)
  const crumbs = [root, ...stack.map((p) => p.title)]
  const pageKey = tab + '/' + stack.map((p) => p.title).join('/')
  const nav = { push, back, setSym, sym }
  return (
    <aside className="flex w-full bg-surface lg:h-full lg:w-auto lg:shrink-0">
      {/* Side rail — like an app's nav bar, pinned to the screen edge */}
      <nav className="flex w-[60px] shrink-0 flex-col items-center gap-1 border-l border-line bg-surface py-3">
        <img src="./logo.png" alt="تحلیلگر بورس" className="mb-3 h-9 w-9 rounded-xl" />
        {TABS.map(({ k, t, I }) => (
          <button key={k} title={t} onClick={() => { if (tab === k) setCollapsed(!collapsed); else { goTab(k); setCollapsed(false) } }} className="group relative grid h-11 w-11 place-items-center">
            {tab === k && !collapsed && <motion.span layoutId="tab" className="absolute inset-0 rounded-xl bg-brand/15" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <span className={`relative ${tab === k && !collapsed ? 'text-brand-light' : 'text-muted group-hover:text-ink'}`}><I set={tab === k && !collapsed ? 'bold' : 'light'} size={22} primaryColor="currentColor" /></span>
            <span className="pointer-events-none absolute left-full z-20 ml-2 whitespace-nowrap rounded-lg bg-surface2 px-2 py-1 text-xs opacity-0 transition group-hover:opacity-100">{t}</span>
          </button>
        ))}
        <div className="flex-1" />
        <button title="تنظیمات" className="grid h-11 w-11 place-items-center text-muted hover:text-ink"><Category set="light" size={22} primaryColor="currentColor" /></button>
      </nav>

      <div data-content className="flex min-w-0 flex-1 flex-col lg:min-h-0 lg:w-[var(--right-w)] lg:flex-none lg:overflow-hidden lg:transition-[width] lg:duration-300 lg:ease-out">
        {/* App bar — phone style: back button, current page title, breadcrumb */}
        <div className="flex h-14 shrink-0 items-center gap-1 border-b border-line px-2">
          <AnimatePresence initial={false}>
            {stack.length > 0 && (
              <motion.button key="back" onClick={back} title="بازگشت" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 40 }} exit={{ opacity: 0, width: 0 }}
                className="grid h-10 shrink-0 place-items-center overflow-hidden rounded-xl text-ink hover:bg-surface2 active:scale-90">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </motion.button>
            )}
          </AnimatePresence>
          <div className="min-w-0 flex-1 overflow-hidden px-2 leading-tight">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.div key={pageKey} custom={dir} initial={{ opacity: 0, x: dir * -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * 24 }} transition={{ duration: .2 }}>
                <div className="truncate font-bold">{page ? page.title : root}</div>
                {stack.length > 0 && (
                  <div className="flex items-center gap-1 truncate text-[11px] text-muted">
                    {crumbs.map((c, i) => (
                      <span key={i} className="flex items-center gap-1">
                        {i > 0 && <span className="opacity-60">‹</span>}
                        {i < crumbs.length - 1
                          ? <button onClick={() => { setDir(-1); setStack((st) => st.slice(0, i)) }} className="hover:text-brand-light">{c}</button>
                          : <span className="text-ink/70">{c}</span>}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          {!page && tab === 'alert' && <button onClick={() => push({ k: 'newAlert', title: 'هشدار جدید' })} title="هشدار جدید" className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-ink"><Plus set="light" size={20} primaryColor="currentColor" /></button>}
          <button onClick={() => goTab('alert')} title="اعلان‌ها" className="relative grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-ink"><Notification set="light" size={20} primaryColor="currentColor" /><span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-light" /></button>
        </div>

        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div key={pageKey} custom={dir} className="scroll-y min-h-0 flex-1 bg-surface" initial={{ opacity: 0, x: dir * -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * 40 }} transition={{ duration: .22, ease: [.2, .8, .2, 1] }}>
            {page ? (
              <div className="p-4">
                {page.k === 'symbol' && <SymbolPage x={page.x} nav={nav} />}
                                {page.k === 'holding' && <HoldingPage h={page.h} nav={nav} />}
                {page.k === 'newAlert' && <NewAlert x={page.x} onSave={(a) => { setAlerts((al) => [...al, a]); back() }} />}
              </div>
            ) : tab === 'watch' ? (
              <div className="p-2"><Watch sym={sym} setSym={setSym} open={(x) => { setSym(x); push({ k: 'symbol', title: x.s, x }) }} /></div>
            ) : (
              <div className="p-4">
                {tab === 'port' && <Portfolio open={(h) => { setSym(h.x); push({ k: 'holding', title: h.s, h }) }} />}
                {tab === 'alert' && <Alerts al={alerts} setAl={setAlerts} add={() => push({ k: 'newAlert', title: 'هشدار جدید' })} />}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  )
}

function Watch({ sym, setSym, open }) {
  const [q, setQ] = useState('')
  const list = SYMBOLS.filter((x) => x.s.includes(q) || x.n.includes(q))
  return (
    <>
      <label className="mb-2 flex items-center gap-2 rounded-xl border border-line/70 bg-surface2/50 px-3 py-2 focus-within:border-brand/60">
        <Search set="light" size={18} primaryColor="currentColor" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی نماد..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
      </label>
      <div className="mb-2 flex justify-between px-2 text-xs text-muted"><span>نماد</span><span>قیمت / تغییر</span></div>
      <div className="space-y-1.5">
        {list.map((x) => (
          <motion.button key={x.s} onClick={() => setSym(x)} whileTap={{ scale: .98 }}
            className={`relative flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-right transition-colors ${sym.s === x.s ? '' : 'hover:bg-surface2/60'}`}>
            {sym.s === x.s && <motion.span layoutId="sel" className="absolute inset-0 rounded-xl border border-brand/50 bg-brand/10" />}
            <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface2 text-xs font-bold text-brand-light">{x.s.slice(0, 2)}</span>
            <span className="relative min-w-0 flex-1">
              <span className="block font-semibold">{x.s}</span>
              <Marquee className="text-xs text-muted">{x.n}</Marquee>
            </span>
            <span className="relative h-8 w-14" dir="ltr">
              <ResponsiveContainer><LineChart data={x.spark}><YAxis hide domain={['dataMin', 'dataMax']} /><Line dataKey="v" dot={false} strokeWidth={1.6} isAnimationActive={false} stroke={x.c >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))'} /></LineChart></ResponsiveContainer>
            </span>
            <span className="relative w-16 text-left">
              <span className="num block text-sm font-semibold">{fa(x.p)}</span>
              <Change c={x.c} className="!text-xs" />
            </span>
            <span role="button" title="جزئیات" onClick={(e) => { e.stopPropagation(); open(x) }} className="relative grid h-8 w-6 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-brand-light">‹</span>
          </motion.button>
        ))}
      </div>
    </>
  )
}

const HOLD = [{ s: 'فولاد', q: 42000, avg: 5810 }, { s: 'شستا', q: 120000, avg: 1295 }, { s: 'خودرو', q: 60000, avg: 3050 }, { s: 'فارس', q: 8000, avg: 10600 }]

function Portfolio({ open }) {
  const rows = HOLD.map((h) => { const x = SYMBOLS.find((y) => y.s === h.s); return { ...h, x, val: h.q * x.p, pl: ((x.p - h.avg) / h.avg) * 100 } })
  const total = rows.reduce((a, b) => a + b.val, 0)
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-light via-brand to-[#14247a] p-5 text-white shadow-glow">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="relative text-sm opacity-80">ارزش کل پرتفوی</div>
        <div className="num relative mt-1 text-2xl font-bold">{fa(total / 10)} <small className="text-sm font-normal">تومان</small></div>
        <div className="relative mt-3 flex gap-2 text-xs"><span className="rounded-full bg-white/15 px-2.5 py-1">سود امروز: ↑ ۱٫۸۴٪</span><span className="rounded-full bg-white/15 px-2.5 py-1">۴ نماد</span></div>
      </div>
      {rows.map((r) => (
        <motion.button whileHover={{ x: -3 }} key={r.s} onClick={() => open(r)} className="flex w-full items-center gap-3 rounded-2xl border border-line/60 bg-surface2/40 p-3 text-right">
          <div className="flex-1"><div className="font-semibold">{r.s}</div><div className="num text-xs text-muted">{fa(r.q)} سهم · میانگین {fa(r.avg)}</div></div>
          <div className="text-left"><div className="num text-sm">{fa(r.val / 10)}</div><Change c={r.pl} className="!text-xs" /></div>
        </motion.button>
      ))}
    </div>
  )
}

function Alerts({ al, setAl, add }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {al.map((a, k) => (
          <div key={k} className="flex items-center gap-3 rounded-2xl border border-line/60 bg-surface2/40 p-3">
            <div className="flex-1"><div className="font-semibold">{a.s}</div><div className="text-xs text-muted">{a.t}</div></div>
            <button onClick={() => setAl(al.map((b, j) => (j === k ? { ...b, on: !b.on } : b)))} className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${a.on ? 'justify-end bg-brand' : 'justify-start bg-line'}`}>
              <motion.span layout className="h-5 w-5 rounded-full bg-white shadow" />
            </button>
            <button onClick={() => setAl(al.filter((_, j) => j !== k))} className="text-muted hover:text-down"><Delete set="light" size={18} primaryColor="currentColor" /></button>
          </div>
        ))}
        <motion.button whileTap={{ scale: .97 }} onClick={add} className="flex w-full items-center justify-center gap-1 rounded-2xl border border-dashed border-line py-3 text-sm text-muted hover:text-brand-light">
          <Plus set="light" size={18} primaryColor="currentColor" /> افزودن هشدار
        </motion.button>
      </div>
    </div>
  )
}

function SymbolPage({ x, nav }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-light to-brand-dark text-lg font-bold text-white shadow-glow">{x.s.slice(0, 2)}</span>
        <div className="flex-1"><div className="text-lg font-bold">{x.s}</div><div className="text-xs text-muted">{x.n}</div></div>
        <div className="text-left"><div className="num text-lg font-bold">{fa(x.p)}</div><Change c={x.c} /></div>
      </div>
      <div className="h-24 rounded-2xl bg-surface2/40 p-2" dir="ltr">
        <ResponsiveContainer><LineChart data={x.spark}><YAxis hide domain={['dataMin', 'dataMax']} /><Line dataKey="v" dot={false} strokeWidth={2} stroke={x.c >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))'} /></LineChart></ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {[['صنعت', x.ind], ['ارزش بازار', x.mc], ['حجم', x.vol], ['P/E', x.pe ? fa(x.pe, 1) : '—']].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-surface2/40 p-3"><div className="text-xs text-muted">{k}</div><div className="num font-semibold">{v}</div></div>
        ))}
      </div>
      <button onClick={() => nav.push({ k: 'newAlert', title: `هشدار ${x.s}`, x })} className="flex w-full items-center justify-between rounded-2xl border border-line/60 p-3 text-sm hover:border-brand/50">
        <span className="flex items-center gap-2"><Notification set="light" size={18} primaryColor="currentColor" />تنظیم هشدار قیمت</span><span className="text-muted">‹</span>
      </button>
    </div>
  )
}

function HoldingPage({ h, nav }) {
  const rows = [['تعداد سهم', fa(h.q)], ['میانگین خرید', fa(h.avg) + ' ریال'], ['قیمت روز', fa(h.x.p) + ' ریال'], ['ارزش روز', fa(h.val / 10) + ' تومان'], ['سود / زیان', fa(((h.x.p - h.avg) * h.q) / 10) + ' تومان']]
  return (
    <div className="space-y-4">
      <div className={`rounded-3xl p-5 text-white ${h.pl >= 0 ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : 'bg-gradient-to-br from-rose-500 to-rose-700'}`}>
        <div className="text-sm opacity-80">بازده این سهم</div>
        <div className="num text-3xl font-bold" dir="ltr" style={{ textAlign: 'right' }}>{h.pl >= 0 ? '+' : '−'}{fa(Math.abs(h.pl), 2)}٪</div>
      </div>
      <dl className="divide-y divide-line/60 rounded-2xl border border-line/60 px-4 text-sm">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between py-3"><dt className="text-muted">{k}</dt><dd className="num font-semibold">{v}</dd></div>)}
      </dl>
    </div>
  )
}

function NewAlert({ x, onSave }) {
  const [s, setS] = useState(x?.s || SYMBOLS[0].s)
  const [cond, setCond] = useState('بالای')
  const cur = SYMBOLS.find((y) => y.s === s)
  const [price, setPrice] = useState(Math.round(cur.p * 1.05))
  const field = 'mt-1.5 w-full rounded-2xl border border-line/70 bg-surface2/50 px-4 py-3 outline-none focus:border-brand/60'
  return (
    <div className="space-y-4">
      <label className="block text-sm text-muted">نماد
        <select value={s} onChange={(e) => { setS(e.target.value); setPrice(Math.round(SYMBOLS.find((y) => y.s === e.target.value).p * 1.05)) }} className={field + ' text-ink'}>
          {SYMBOLS.map((y) => <option key={y.s} value={y.s}>{y.s} — {y.n}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        {['بالای', 'زیر'].map((c) => <button key={c} onClick={() => setCond(c)} className={`rounded-2xl border py-2.5 text-sm ${cond === c ? 'border-brand bg-brand/15 text-brand-light' : 'border-line/70 text-muted'}`}>قیمت {c}</button>)}
      </div>
      <label className="block text-sm text-muted">قیمت هدف (ریال) · قیمت فعلی <span className="num">{fa(cur.p)}</span>
        <input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} className={field + ' num text-left text-ink'} />
      </label>
      <motion.button whileTap={{ scale: .96 }} onClick={() => onSave({ s, t: `قیمت ${cond} ${fa(price)}`, on: true })} className="w-full rounded-2xl bg-gradient-to-l from-brand-light to-brand-dark py-3.5 font-bold text-white shadow-glow">ذخیره هشدار</motion.button>
    </div>
  )
}
