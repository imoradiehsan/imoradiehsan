import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts'
import { Search, Notification, Category, Chart, Wallet, Buy, Plus, Delete } from 'react-iconly'
import { SYMBOLS, fa } from '../data/market'
import { Change } from './Count'

const TABS = [
  { k: 'watch', t: 'دیده‌بان', I: Category },
  { k: 'order', t: 'سفارش', I: Buy },
  { k: 'port', t: 'پرتفوی', I: Wallet },
  { k: 'alert', t: 'هشدار', I: Notification },
]

export default function AppPanel({ sym, setSym, tab, setTab, orders, addOrder }) {
  return (
    <aside className="panel flex w-full flex-col overflow-hidden lg:w-[380px] lg:shrink-0">
      {/* App bar */}
      <div className="flex items-center gap-3 border-b border-line/70 px-4 py-3">
        <img src="./logo.png" alt="" className="h-9 w-9 rounded-xl" />
        <div className="flex-1 leading-tight">
          <div className="font-bold">تحلیلگر بورس</div>
          <div className="flex items-center gap-1.5 text-xs text-muted"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-up" />بازار باز است</div>
        </div>
        <button className="icon-btn !h-9 !w-9"><Search set="light" size={18} primaryColor="currentColor" /></button>
        <button className="icon-btn relative !h-9 !w-9"><Notification set="light" size={18} primaryColor="currentColor" /><span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-light" /></button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: .22 }}>
            {tab === 'watch' && <Watch sym={sym} setSym={setSym} />}
            {tab === 'order' && <Order sym={sym} addOrder={addOrder} />}
            {tab === 'port' && <Portfolio setSym={setSym} />}
            {tab === 'alert' && <Alerts orders={orders} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom app nav */}
      <nav className="grid grid-cols-4 border-t border-line/70 p-2">
        {TABS.map(({ k, t, I }) => (
          <button key={k} onClick={() => setTab(k)} className="relative flex flex-col items-center gap-1 rounded-2xl py-2 text-xs">
            {tab === k && <motion.span layoutId="tab" className="absolute inset-0 rounded-2xl bg-brand/15" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <span className={`relative ${tab === k ? 'text-brand-light' : 'text-muted'}`}><I set={tab === k ? 'bold' : 'light'} size={22} primaryColor="currentColor" /></span>
            <span className={`relative ${tab === k ? 'font-semibold text-ink' : 'text-muted'}`}>{t}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

function Watch({ sym, setSym }) {
  const [q, setQ] = useState('')
  const list = SYMBOLS.filter((x) => x.s.includes(q) || x.n.includes(q))
  return (
    <>
      <label className="mb-3 flex items-center gap-2 rounded-2xl border border-line/70 bg-surface2/50 px-3 py-2.5 focus-within:border-brand/60">
        <Search set="light" size={18} primaryColor="currentColor" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی نماد..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
      </label>
      <div className="mb-2 flex justify-between px-2 text-xs text-muted"><span>نماد</span><span>قیمت / تغییر</span></div>
      <div className="space-y-1.5">
        {list.map((x) => (
          <motion.button key={x.s} onClick={() => setSym(x)} whileTap={{ scale: .98 }}
            className={`relative flex w-full items-center gap-3 rounded-2xl p-2.5 text-right transition-colors ${sym.s === x.s ? '' : 'hover:bg-surface2/60'}`}>
            {sym.s === x.s && <motion.span layoutId="sel" className="absolute inset-0 rounded-2xl border border-brand/50 bg-brand/10" />}
            <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface2 text-xs font-bold text-brand-light">{x.s.slice(0, 2)}</span>
            <span className="relative min-w-0 flex-1">
              <span className="block font-semibold">{x.s}</span>
              <span className="block truncate text-xs text-muted">{x.n}</span>
            </span>
            <span className="relative h-8 w-14" dir="ltr">
              <ResponsiveContainer><LineChart data={x.spark}><YAxis hide domain={['dataMin', 'dataMax']} /><Line dataKey="v" dot={false} strokeWidth={1.6} isAnimationActive={false} stroke={x.c >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))'} /></LineChart></ResponsiveContainer>
            </span>
            <span className="relative w-16 text-left">
              <span className="num block text-sm font-semibold">{fa(x.p)}</span>
              <Change c={x.c} className="!text-xs" />
            </span>
          </motion.button>
        ))}
      </div>
    </>
  )
}

function Order({ sym, addOrder }) {
  const [side, setSide] = useState('buy')
  const [price, setPrice] = useState(sym.p)
  const [qty, setQty] = useState(1000)
  const [done, setDone] = useState(false)
  const buy = side === 'buy'
  const total = price * qty
  const field = 'w-full rounded-2xl border border-line/70 bg-surface2/50 px-4 py-3 text-left num outline-none focus:border-brand/60'
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl bg-surface2/50 p-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/15 text-sm font-bold text-brand-light">{sym.s.slice(0, 2)}</span>
        <div className="flex-1"><div className="font-bold">{sym.s}</div><div className="text-xs text-muted">{sym.n}</div></div>
        <div className="text-left"><div className="num font-semibold">{fa(sym.p)}</div><Change c={sym.c} className="!text-xs" /></div>
      </div>
      <div className="relative grid grid-cols-2 rounded-2xl bg-surface2/60 p-1">
        <motion.span className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-xl ${buy ? 'right-1 bg-up' : 'right-[calc(50%+3px)] bg-down'}`} layout transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
        {[['buy', 'خرید'], ['sell', 'فروش']].map(([k, t]) => (
          <button key={k} onClick={() => setSide(k)} className={`relative py-2.5 font-semibold transition-colors ${side === k ? 'text-white' : 'text-muted'}`}>{t}</button>
        ))}
      </div>
      <label className="block text-sm text-muted">قیمت (ریال)
        <input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} className={field + ' mt-1.5 text-ink'} />
      </label>
      <label className="block text-sm text-muted">تعداد سهم
        <input type="number" value={qty} onChange={(e) => setQty(+e.target.value)} className={field + ' mt-1.5 text-ink'} />
      </label>
      <div className="grid grid-cols-4 gap-2">
        {[1000, 5000, 10000, 50000].map((n) => (
          <motion.button whileTap={{ scale: .9 }} key={n} onClick={() => setQty(n)} className={`rounded-xl border py-2 text-xs num ${qty === n ? 'border-brand bg-brand/15 text-brand-light' : 'border-line/70 text-muted'}`}>{fa(n)}</motion.button>
        ))}
      </div>
      <div className="space-y-2 rounded-2xl border border-dashed border-line p-3 text-sm">
        <div className="flex justify-between"><span className="text-muted">ارزش معامله</span><span className="num">{fa(total)} ریال</span></div>
        <div className="flex justify-between"><span className="text-muted">کارمزد (۰٫۳۷٪)</span><span className="num">{fa(total * 0.0037)} ریال</span></div>
        <div className="flex justify-between font-bold"><span>جمع کل</span><span className="num">{fa(total * 1.0037)} ریال</span></div>
      </div>
      <motion.button whileTap={{ scale: .96 }} whileHover={{ y: -2 }}
        onClick={() => { addOrder({ s: sym.s, side, price, qty, at: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) }); setDone(true); setTimeout(() => setDone(false), 1800) }}
        className={`relative w-full overflow-hidden rounded-2xl py-3.5 font-bold text-white ${buy ? 'bg-up' : 'bg-down'}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={String(done)} className="block" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
            {done ? '✓ سفارش ثبت شد' : `ثبت سفارش ${buy ? 'خرید' : 'فروش'}`}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

const HOLD = [{ s: 'فولاد', q: 42000, avg: 5810 }, { s: 'شستا', q: 120000, avg: 1295 }, { s: 'خودرو', q: 60000, avg: 3050 }, { s: 'فارس', q: 8000, avg: 10600 }]

function Portfolio({ setSym }) {
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
        <motion.button whileHover={{ x: -3 }} key={r.s} onClick={() => setSym(r.x)} className="flex w-full items-center gap-3 rounded-2xl border border-line/60 bg-surface2/40 p-3 text-right">
          <div className="flex-1"><div className="font-semibold">{r.s}</div><div className="num text-xs text-muted">{fa(r.q)} سهم · میانگین {fa(r.avg)}</div></div>
          <div className="text-left"><div className="num text-sm">{fa(r.val / 10)}</div><Change c={r.pl} className="!text-xs" /></div>
        </motion.button>
      ))}
    </div>
  )
}

function Alerts({ orders }) {
  const [al, setAl] = useState([{ s: 'فولاد', t: 'قیمت بالای ۶٬۵۰۰', on: true }, { s: 'فملی', t: 'حجم بیش از ۲ برابر میانگین', on: true }, { s: 'شپنا', t: 'عبور از MA20', on: false }])
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
        <motion.button whileTap={{ scale: .97 }} onClick={() => setAl([...al, { s: 'وبملت', t: 'قیمت زیر ۳٬۱۰۰', on: true }])} className="flex w-full items-center justify-center gap-1 rounded-2xl border border-dashed border-line py-3 text-sm text-muted hover:text-brand-light">
          <Plus set="light" size={18} primaryColor="currentColor" /> افزودن هشدار
        </motion.button>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">سفارش‌های امروز</h3>
        {orders.length === 0 && <p className="rounded-2xl bg-surface2/40 p-3 text-xs text-muted">هنوز سفارشی ثبت نشده. از تب «سفارش» اولین سفارش را ثبت کنید.</p>}
        <AnimatePresence>
          {orders.map((o, k) => (
            <motion.div key={k} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-2 flex items-center justify-between rounded-2xl bg-surface2/40 p-3 text-sm">
              <span><b className={o.side === 'buy' ? 'text-up' : 'text-down'}>{o.side === 'buy' ? 'خرید' : 'فروش'}</b> {o.s} · <span className="num">{fa(o.qty)}</span></span>
              <span className="num text-xs text-muted">{o.at}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
