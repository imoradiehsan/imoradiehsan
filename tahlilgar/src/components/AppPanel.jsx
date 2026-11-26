import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts'
import { Search, Notification, Category, Chart, Wallet, Plus, Delete, TimeCircle, InfoSquare } from 'react-iconly'
import { SYMBOLS, fa } from '../data/market'
import { Change } from './Count'
import { useSort, SortHead } from './sort'
import { Marquee } from './OverviewExtra'
import Watchlist from './Watchlist'
import { AlertsHome, AlertForm, AlertHistory, AlertHelp } from './Alerts'

const TABS = [
  { k: 'watch', t: 'دیده‌بان', I: Category },
  { k: 'port', t: 'پرتفوی', I: Wallet },
  { k: 'alert', t: 'هشدار', I: Notification },
]

export default function AppPanel({ sym, setSym, tab, setTab, collapsed, setCollapsed, setAlertIntro, alertReq }) {
  // Each rail tab has its own page stack, like a phone app: root page + pushed sub-pages
  const [stack, setStack] = useState([])
  const [dir, setDir] = useState(1)
  const [alerts, setAlerts] = useState([{ id: 1, s: 'خودرو', type: 'general', cond: 'از بین رفتن صف خرید' }, { id: 2, s: 'فولاد', type: 'value', metric: 'قیمت آخرین معامله', op: 'بزرگتر از', val: '۶۵۰۰' }])
  const [help, setHelp] = useState(false)
  useEffect(() => { setAlertIntro?.(tab === 'alert' && alerts.length === 0) }, [tab, alerts.length])
  useEffect(() => { if (alertReq) { setDir(1); setTimeout(() => setStack([{ k: 'newAlert', title: 'هشدار جدید', a: alertReq.preset }]), 0) } }, [alertReq])
  const saveAlert = (a) => { setAlerts((al) => (al.some((b) => b.id === a.id) ? al.map((b) => (b.id === a.id ? a : b)) : [...al, a])); back() }
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
        {TABS.map(({ k, t, I }) => (
          <button key={k} title={t} onClick={() => { const now = Date.now(); if (tab === k) { if (now - (AppPanel.sw || 0) > 450) setCollapsed(!collapsed) } else { AppPanel.sw = now; goTab(k); setCollapsed(false) } }} className="group relative grid h-11 w-11 place-items-center">
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
              </motion.div>
            </AnimatePresence>
          </div>
          {!page && tab === 'alert' && <>
            <button onClick={() => push({ k: 'alertHistory', title: 'سابقه هشدارها' })} title="سابقه هشدارها" className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-ink"><TimeCircle set="light" size={20} primaryColor="currentColor" /></button>
            <button onClick={() => setHelp(true)} title="راهنما" className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-ink"><InfoSquare set="light" size={20} primaryColor="currentColor" /></button>
          </>}
          <AlertHelp open={help} close={() => setHelp(false)} />
        </div>

        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div key={pageKey} custom={dir} className={`min-h-0 flex-1 bg-surface ${!page && (tab === 'watch' || tab === 'port') ? 'relative overflow-hidden' : 'scroll-y'}`} initial={{ opacity: 0, x: dir * -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, transition: { duration: .06 } }} transition={{ duration: .18, ease: [.2, .8, .2, 1] }}>
            {page?.k === 'newAlert' ? <AlertForm init={page.a || (page.x && { s: page.x.s })} onSave={saveAlert} onCancel={back} />
            : page?.k === 'alertHistory' ? <AlertHistory />
            : page ? (
              <div className="p-4">
                {page.k === 'symbol' && <SymbolPage x={page.x} nav={nav} />}
                                {page.k === 'holding' && <HoldingPage h={page.h} nav={nav} />}
                
              </div>
            ) : tab === 'watch' ? (
              <Watchlist sym={sym} setSym={setSym} initial="watch" />
            ) : tab === 'port' ? (
              <Watchlist sym={sym} setSym={setSym} initial="port" />
            ) : (
              tab === 'alert' && <AlertsHome sym={sym} setSym={setSym} list={alerts} setList={setAlerts} add={() => push({ k: 'newAlert', title: 'هشدار جدید' })} edit={(i) => push({ k: 'newAlert', title: 'ویرایش هشدار', a: alerts[i] })} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  )
}

function Watch({ sym, setSym, open }) {
  const [q, setQ] = useState('')
  const found = SYMBOLS.filter((x) => x.s.includes(q) || x.n.includes(q))
  const [list, st, toggle] = useSort(found, { s: (x) => x.s, p: (x) => x.p, c: (x) => x.c })
  return (
    <>
      <label className="mb-2 flex items-center gap-2 rounded-xl border border-line/70 bg-surface2/50 px-3 py-2 focus-within:border-brand/60">
        <Search set="light" size={18} primaryColor="currentColor" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی نماد..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
      </label>
      <div className="mb-2 flex justify-between px-2 text-xs text-muted"><span><SortHead label="نماد" k="s" s={st} toggle={toggle} align="start" /></span><span className="flex gap-3"><SortHead label="قیمت" k="p" s={st} toggle={toggle} /><SortHead label="تغییر" k="c" s={st} toggle={toggle} /></span></div>
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
      <div className={`rounded-3xl p-5 text-white ${h.pl >= 0 ? 'bg-gradient-to-br from-emerald-600 to-emerald-800' : 'bg-gradient-to-br from-rose-600 to-rose-800'}`}>
        <div className="text-sm opacity-80">بازده این سهم</div>
        <div className="num text-3xl font-bold" dir="ltr" style={{ textAlign: 'right' }}>{h.pl >= 0 ? '+' : '−'}{fa(Math.abs(h.pl), 2)}٪</div>
      </div>
      <dl className="divide-y divide-line/60 rounded-2xl border border-line/60 px-4 text-sm">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between py-3"><dt className="text-muted">{k}</dt><dd className="num font-semibold">{v}</dd></div>)}
      </dl>
    </div>
  )
}

