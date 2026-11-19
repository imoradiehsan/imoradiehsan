import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Star, Notification, EditSquare, Search, TwoUsers, Discovery, Category, InfoCircle, Graph, TimeCircle, People, Work, Chart, Paper, Activity, Chat, Show } from 'react-iconly'
import TVChart from './TVChart'
import { Intraday, RealLegal, Returns, Compare, Poll } from './OverviewExtra'
import { Change } from './Count'
import { fa } from '../data/market'
import { symbolData } from '../data/symbol'

const MENUS = [
  ['امکانات', ['دیده‌بان هوشمند', 'فیلترنویسی', 'هشدارهای قیمتی', 'مقایسه نمادها']],
  ['بازارها', ['بورس تهران', 'فرابورس', 'صندوق‌ها', 'اوراق بدهی', 'آپشن']],
  ['دسترسی سریع', ['نقشه بازار', 'شاخص‌ها', 'ورود و خروج پول', 'تقویم مجامع']],
  ['سایر', ['آموزش', 'درباره ما', 'تماس با ما']],
]
const TABS = ['نمای کلی', 'چارت', 'اخبار و اطلاعیه‌ها', 'حمایت/مقاومت', 'نظرات و تحلیل‌ها', 'تکنیکال']
const LINKS = [
  ['peers', 'هم‌گروه‌ها', TwoUsers], ['strategy', 'استراتژی', Discovery], ['option', 'آپشن', Category], ['details', 'جزئیات نماد', InfoCircle],
  ['real', 'قدرت حقیقی', Graph], ['history', 'سابقه معاملات', TimeCircle], ['big', 'عمده‌ها', People], ['holders', 'سهامداران', Work],
]
const ico = (I, s = 18) => <I set="light" size={s} primaryColor="currentColor" />

function Card({ title, actions, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-line bg-surface2/25 p-4 ${className}`}>
      {(title || actions) && <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">{title}</h3><div className="flex gap-2">{actions}</div></div>}
      {children}
    </div>
  )
}
const Pill = ({ on, onClick, children }) => (
  <button onClick={onClick} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${on ? 'border-brand/60 bg-brand/15 text-brand-light' : 'border-line text-muted hover:text-ink'}`}>{children}</button>
)

export default function SitePanel({ sym, dark, setDark }) {
  const [tab, setTab] = useState('نمای کلی')
  const [menu, setMenu] = useState(null)
  const [drawer, setDrawer] = useState(null)
  const [fav, setFav] = useState(false)
  const d = useMemo(() => symbolData(sym), [sym])
  const chg = sym.p - d.prev

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-surface lg:h-full" onClick={() => menu && setMenu(null)}>
      {/* Site header */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-4" onClick={(e) => e.stopPropagation()}>
        <img src="./logo.png" alt="" className="h-8 w-8 rounded-lg" />
        <span className="hidden whitespace-nowrap font-bold xl:block">تحلیل‌گر بورس</span>
        <label className="hidden h-9 w-56 items-center gap-2 rounded-xl border border-line bg-surface2/40 px-3 text-sm focus-within:border-brand/60 md:flex">
          {ico(Search, 16)}<input placeholder="جست‌وجوی نماد" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted" />
          <kbd className="text-[10px] text-muted" dir="ltr">Ctrl K</kbd>
        </label>
        <nav className="hidden items-center lg:flex">
          {MENUS.map(([t, items]) => (
            <div key={t} className="relative">
              <button onClick={() => setMenu(menu === t ? null : t)} className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm transition-colors ${menu === t ? 'bg-surface2 text-ink' : 'text-muted hover:text-ink'}`}>
                {t}<motion.span animate={{ rotate: menu === t ? 180 : 0 }}>{ico(ChevronDown, 14)}</motion.span>
              </button>
              <AnimatePresence>{menu === t && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .15 }} className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-line bg-surface p-1 shadow-2xl">
                  {items.map((i) => <button key={i} onClick={() => setMenu(null)} className="block w-full rounded-lg px-3 py-2 text-right text-sm hover:bg-surface2">{i}</button>)}
                </motion.div>
              )}</AnimatePresence>
            </div>
          ))}
        </nav>
        <div className="flex-1" />
        <button onClick={() => setDark(!dark)} className="icon-btn !h-9 !w-9" title="تغییر تم">
          {dark ? <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
            : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>}
        </button>
        <span className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-light to-brand-dark text-xs font-bold text-white" title="احسان مرادی">ا‌م<i className="absolute -top-0.5 right-0 h-2.5 w-2.5 rounded-full bg-down ring-2 ring-surface" /></span>
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: .95 }} className="whitespace-nowrap rounded-xl bg-gradient-to-l from-brand-light to-brand-dark px-4 py-2 text-sm font-bold text-white shadow-glow">ارتقای اشتراک</motion.button>
      </header>

      <div className="scroll-y min-h-0 flex-1">
        {/* Breadcrumb + symbol header */}
        <AnimatePresence mode="wait">
          <motion.div key={sym.s} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .22 }} className="px-5 pt-4">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <button className="hover:text-brand-light">بازار</button><span>/</span><button className="hover:text-brand-light">{sym.ind}</button><span>/</span><b className="text-ink">{sym.s}</b>
            </div>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-lg font-extrabold text-brand-dark shadow">{sym.s.slice(0, 2)}</span>
                <div>
                  <h1 className="text-2xl font-extrabold">{sym.n}</h1>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="rounded-lg border border-line px-2.5 py-1 text-xs"><b>{sym.s}</b> · {d.market}</span>
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-down/15" title="در حال معامله"><i className="h-2.5 w-2.5 animate-pulse rounded-full bg-down" /></span>
                    <motion.button whileTap={{ scale: .7 }} onClick={() => setFav(!fav)} title="افزودن به دیده‌بان" className={`grid h-7 w-7 place-items-center rounded-lg border border-line ${fav ? 'text-amber-400' : 'text-muted hover:text-ink'}`}><Star set={fav ? 'bold' : 'light'} size={15} primaryColor="currentColor" /></motion.button>
                    <button title="هشدار قیمت" className="grid h-7 w-7 place-items-center rounded-lg border border-line text-muted hover:text-ink">{ico(Notification, 15)}</button>
                    <button title="یادداشت" className="grid h-7 w-7 place-items-center rounded-lg border border-line text-muted hover:text-ink">{ico(EditSquare, 15)}</button>
                  </div>
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2" dir="ltr">
                  <span className="num text-3xl font-extrabold">{fa(sym.p)}</span>
                  <span className={`num flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-bold ${chg >= 0 ? 'bg-up/15 text-up' : 'bg-down/15 text-down'}`}>{chg >= 0 ? '▲' : '▼'} {chg >= 0 ? '+' : '−'}{fa(Math.abs(chg))} <i className="h-4 w-px bg-current opacity-30" /> {fa(Math.abs(sym.c), 2)}٪</span>
                </div>
                <div className="mt-1 flex items-center justify-end gap-1 text-xs text-muted">{ico(TimeCircle, 13)} ۱۲:۲۹ · ۱۴۰۵/۰۷/۲۴</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Symbol tabs */}
        <div className="sticky top-0 z-20 mt-4 flex gap-1 overflow-x-auto border-b border-line bg-surface/95 px-5 backdrop-blur">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`relative whitespace-nowrap px-3 py-3 text-sm transition-colors ${tab === t ? 'font-bold text-ink' : 'text-muted hover:text-ink'}`}>
              {t}{tab === t && <motion.span layoutId="sym-tab" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand-light" />}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab + sym.s} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .2 }} className="space-y-4 p-5">
            {tab === 'نمای کلی' && <Overview sym={sym} d={d} open={setDrawer} dark={dark} />}
            {tab === 'چارت' && <div className="h-[72vh] min-h-[420px] overflow-hidden rounded-2xl border border-line"><TVChart sym={sym} dark={dark} /></div>}
            {tab === 'اخبار و اطلاعیه‌ها' && <News d={d} />}
            {tab === 'حمایت/مقاومت' && <Levels sym={sym} d={d} />}
            {tab === 'نظرات و تحلیل‌ها' && <Opinions d={d} />}
            {tab === 'تکنیکال' && <Technical d={d} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <Drawer k={drawer} close={() => setDrawer(null)} sym={sym} d={d} />
    </section>
  )
}

function Overview({ sym, d, open, dark }) {
  const [rows, setRows] = useState(true)
  const [cum, setCum] = useState(false)
  return (
    <>
      <Card className="!p-0 overflow-hidden">
        <div className="grid grid-cols-2 divide-line sm:grid-cols-3 xl:grid-cols-5 xl:divide-x xl:divide-x-reverse">
          {d.stats.map(([k, v]) => <div key={k} className="border-b border-line/60 p-4 text-center"><div className="text-xs text-muted">{k}</div><div className="num mt-1.5 text-lg font-extrabold">{v}</div></div>)}
        </div>
        <div className="grid grid-cols-2 gap-2 p-3 md:grid-cols-4">
          {LINKS.map(([k, t, I]) => (
            <motion.button key={k} whileHover={{ y: -2 }} whileTap={{ scale: .96 }} onClick={() => open(k)} className="flex items-center justify-center gap-2 rounded-xl bg-surface2/60 py-3 text-sm font-semibold text-brand-light transition-colors hover:bg-brand/15">
              {ico(I)}{t}
            </motion.button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="دفتر سفارش" actions={<><Pill on={rows} onClick={() => setRows(!rows)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg> ردیف‌های عرضه و تقاضا</Pill><Pill on={cum} onClick={() => setCum(!cum)}>{ico(Show, 14)} نمودار تجمعی</Pill></>}>
          <OrderBook d={d} prev={d.prev} rows={rows} cum={cum} />
        </Card>
        <div className="space-y-4">
          <Card title="دامنه قیمت امروز"><Range sym={sym} d={d} /></Card>
          <Card title="اطلاعات بنیادی" actions={['TSETMC', 'پیام ناظر', 'کدال'].map((t) => <a key={t} href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-1.5 rounded-lg bg-brand/15 px-3 py-1.5 text-xs font-bold text-brand-light transition-colors hover:bg-brand/25">{t}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg></a>)}>
            <Fundamentals d={d} />
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Intraday sym={sym} dark={dark} />
        <RealLegal sym={sym} />
        <Returns sym={sym} />
        <Compare sym={sym} />
      </div>
      <Poll sym={sym} />
    </>
  )
}

function OrderBook({ d, prev, rows, cum }) {
  const book = rows ? d.book : d.book.slice(0, 3)
  let cb = 0, ca = 0
  const data = book.map((r) => ({ ...r, cb: (cb += r.bq), ca: (ca += r.aq) }))
  const mx = Math.max(...data.flatMap((r) => cum ? [r.cb, r.ca] : [r.bq, r.aq]))
  const pc = (p) => ((p - prev) / prev) * 100
  const vol = (n) => n >= 1e5 ? fa(n / 1000, 1) + ' K' : fa(n)
  const pct = (p) => { const v = pc(p); return (v >= 0 ? '+' : '−') + fa(Math.abs(v), 2) + '٪' }
  // Volume bars grow outward from the price columns in the middle
  const Vol = ({ v, w, buy }) => (
    <td className="px-0.5 py-1.5">
      <div className={`relative flex h-8 items-center ${buy ? 'justify-end' : 'justify-start'}`}>
        <motion.span initial={{ width: 0 }} animate={{ width: `${Math.max(4, w)}%` }} transition={{ duration: .5, ease: 'easeOut' }}
          className={`absolute inset-y-0 rounded-lg ${buy ? 'left-0 bg-up/20' : 'right-0 bg-down/20'}`} />
        <span className="relative whitespace-nowrap px-1.5 font-semibold" dir="ltr">{vol(v)}</span>
      </div>
    </td>
  )
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[360px]">
        <div className="grid grid-cols-2 text-center font-bold">
          <div className="border-b-2 border-up pb-2 text-up">تقاضا</div>
          <div className="border-b-2 border-down pb-2 text-down">عرضه</div>
        </div>
        <table className="num w-full table-fixed text-center text-sm">
          <thead className="text-xs text-muted"><tr>{['تعداد', 'حجم', 'قیمت', 'قیمت', 'حجم', 'تعداد'].map((h, i) => <th key={i} className="py-3 font-normal">{h}</th>)}</tr></thead>
          <tbody>
            {data.map((r, i) => (
              <motion.tr key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .04 }} className="transition-colors hover:bg-surface2/40">
                <td className="py-1.5">{fa(r.bn)}</td>
                <Vol v={r.bq} w={((cum ? r.cb : r.bq) / mx) * 100} buy />
                <td className="leading-tight"><b className="text-[15px]">{fa(r.bp)}</b><div className="text-[11px] text-up" dir="ltr">{pct(r.bp)}</div></td>
                <td className="leading-tight"><b className="text-[15px]">{fa(r.ap)}</b><div className="text-[11px] text-down" dir="ltr">{pct(r.ap)}</div></td>
                <Vol v={r.aq} w={((cum ? r.ca : r.aq) / mx) * 100} />
                <td>{fa(r.an)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        <div className="my-3 flex items-center gap-3 text-xs text-muted"><i className="flex-1 border-t border-dashed border-line" />جمع سفارش‌ها<i className="flex-1 border-t border-dashed border-line" /></div>
        <div className="num grid grid-cols-2 overflow-hidden rounded-xl text-[15px] font-bold">
          <div className="grid grid-cols-2 bg-up/10 py-3 text-center text-up"><span>{fa(data.reduce((a, r) => a + r.bn, 0))}</span><span>{fa(data.at(-1).cb)}</span></div>
          <div className="grid grid-cols-2 bg-down/10 py-3 text-center text-down"><span>{fa(data.at(-1).ca)}</span><span>{fa(data.reduce((a, r) => a + r.an, 0))}</span></div>
        </div>
      </div>
    </div>
  )
}

function Range({ sym, d }) {
  const lo = d.low, hi = d.high, span = hi - lo || 1
  const pos = (v) => ((v - lo) / span) * 100           // 0 = left (کمترین) … 100 = right (بیشترین)
  const close = Math.round(sym.p * 0.998)
  const pct = (v) => (v >= d.prev ? '+' : '−') + fa(Math.abs((v - d.prev) / d.prev * 100), 2) + '٪'
  const upCandle = sym.p >= d.open
  const basePct = 50
  const Marker = ({ v, top }) => (
    <motion.div initial={{ left: '50%', opacity: 0 }} animate={{ left: `${pos(v)}%`, opacity: 1 }} transition={{ type: 'spring', stiffness: 110, damping: 16 }}
      className={`num absolute -translate-x-1/2 whitespace-nowrap text-sm ${top ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}`} style={{ left: `${pos(v)}%` }}>
      <span className="text-xs text-up">({pct(v)})</span> <b>{fa(v)}</b> <span className="text-[10px]">{top ? '▼' : '▲'}</span>
    </motion.div>
  )
  return (
    <div className="flex items-stretch gap-4">
      <div className="flex items-center gap-1.5" title="جهت کندل امروز">
        <span className={`h-full w-1.5 rounded-full ${upCandle ? 'bg-up' : 'bg-down'}`} />
        <span className="text-[11px] text-muted [writing-mode:vertical-rl]">{upCandle ? 'کندل صعودی' : 'کندل نزولی'}</span>
      </div>
      <div className="flex-1 pb-8 pt-2" dir="ltr">
        <div className="num relative h-5 text-xs text-muted">
          <span className="absolute left-0">{fa(lo)}</span>
          <span className="absolute -translate-x-1/2" style={{ left: `${pos(d.prev)}%` }}>{fa(d.prev)}</span>
          <span className="absolute right-0">{fa(hi)}</span>
        </div>
        <div className="relative mx-1.5 mt-7 h-1.5">
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: .6 }} style={{ width: `${pos(d.prev)}%`, originX: 1 }} className="absolute inset-y-0 left-0 rounded-l-full bg-down" />
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: .6 }} style={{ left: `${pos(d.prev)}%`, originX: 0 }} className="absolute inset-y-0 right-0 rounded-r-full bg-up" />
          <span className="absolute -left-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-down" />
          <span className="absolute -right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-up" />
          <Marker v={sym.p} top />
          <Marker v={close} />
        </div>
      </div>
      <div className="flex items-center gap-1.5" title="حجم معاملات نسبت به حجم مبنا">
        <span className="num text-[11px] text-muted [writing-mode:vertical-rl]">{fa(basePct)}٪ حجم مبنا</span>
        <span className="relative h-full w-1.5 overflow-hidden rounded-full bg-surface2 ring-1 ring-line">
          <motion.span initial={{ height: 0 }} animate={{ height: `${basePct}%` }} transition={{ duration: .8 }} className="absolute inset-x-0 bottom-0 rounded-full bg-brand" />
        </span>
      </div>
    </div>
  )
}

// Hover / focus tooltip with a short explanation of each metric
function Tip({ label, tip }) {
  const [open, setOpen] = useState(false)
  const [align, setAlign] = useState('center')
  // keep the bubble inside the scrolling panel: flip its anchor near either edge
  const show = (e) => {
    const r = e.currentTarget.getBoundingClientRect(), box = e.currentTarget.closest('.scroll-y')?.getBoundingClientRect() || { left: 0, right: innerWidth }
    const mid = (r.left + r.right) / 2
    setAlign(mid + 112 > box.right ? 'right' : mid - 112 < box.left ? 'left' : 'center'); setOpen(true)
  }
  const pos = { center: 'left-1/2 -translate-x-1/2', right: 'right-0', left: 'left-0' }[align]
  const arrow = { center: 'left-1/2 -translate-x-1/2', right: 'right-4', left: 'left-4' }[align]
  return (
    <span className="relative inline-flex" onMouseEnter={show} onMouseLeave={() => setOpen(false)} onFocus={show} onBlur={() => setOpen(false)}>
      <span tabIndex={0} className="cursor-help border-b border-dotted border-muted/60 text-xs text-muted outline-none">{label}</span>
      <span className={`pointer-events-none absolute bottom-full z-40 mb-2 w-52 ${pos}`}>
        <AnimatePresence>{open && (
          <motion.span role="tooltip" initial={{ opacity: 0, y: 4, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: .96 }} transition={{ duration: .14 }}
            className="relative block rounded-xl border border-line bg-surface2 px-3 py-2 text-right text-xs font-normal leading-6 text-ink shadow-2xl">
            <b className="mb-0.5 block text-brand-light">{label}</b>{tip}
            <i className={`absolute top-full -mt-1 h-2 w-2 rotate-45 border-b border-r border-line bg-surface2 ${arrow}`} />
          </motion.span>
        )}</AnimatePresence>
      </span>
    </span>
  )
}

const TIPS = {
  'ارزش بازار': 'قیمت فعلی سهم ضرب در تعداد کل سهام؛ اندازه شرکت در بازار را نشان می‌دهد.',
  'P/E': 'نسبت قیمت به سود هر سهم؛ نشان می‌دهد بازار چند برابر سود سالانه برای سهم پول می‌دهد.',
  'EPS': 'سود خالص هر سهم در یک سال (ریال)؛ سود شرکت تقسیم بر تعداد سهام.',
  'P/E گروه': 'میانگین P/E شرکت‌های هم‌صنعت؛ برای مقایسه ارزان یا گران بودن سهم نسبت به گروه.',
  'P/S': 'نسبت ارزش بازار به فروش سالانه؛ برای شرکت‌های کم‌سود یا زیان‌ده کاربرد دارد.',
  'سهام شناور': 'درصدی از سهام که در دست سهامداران خرد است و در بازار معامله می‌شود.',
  'تعداد سهام': 'تعداد کل سهام منتشرشده شرکت.',
}

function Fundamentals({ d }) {
  const f = Object.fromEntries(d.fundamentals)
  const Cell = ({ k, label = k }) => (
    <div className="flex flex-col items-center justify-center gap-1 bg-surface px-2 py-3.5 text-center">
      <Tip label={label} tip={TIPS[k]} />
      <b className="num text-[15px]">{f[k]}</b>
    </div>
  )
  const [num, unit] = String(f['ارزش بازار']).split(' ')
  return (
    <div className="grid grid-cols-2 gap-px rounded-xl border border-line bg-line sm:grid-cols-4">
      <div className="col-span-2 flex flex-col items-center justify-center gap-1 rounded-tr-xl bg-brand/10 px-2 py-3.5 text-center">
        <Tip label="ارزش بازار" tip={TIPS['ارزش بازار']} />
        <b className="num text-xl">{num} <small className="text-xs font-normal text-muted">{unit}</small></b>
      </div>
      <Cell k="P/E" />
      <Cell k="EPS" />
      <Cell k="P/E گروه" />
      <Cell k="P/S" />
      <Cell k="سهام شناور" label="درصد شناور" />
      <Cell k="تعداد سهام" />
    </div>
  )
}

function Real({ d }) {
  const b = Math.min(90, Math.max(10, d.real.buyPct)), s = Math.min(90, Math.max(10, d.real.sellPct))
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[['خرید حقیقی', b, 'bg-up'], ['فروش حقیقی', s, 'bg-down']].map(([t, v, c]) => (
        <div key={t}><div className="mb-1.5 flex justify-between text-sm"><span>{t}</span><b className="num">{fa(v)}٪</b></div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface2"><motion.div initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: .8 }} className={`h-full ${c}`} /></div>
          <div className="mt-1 text-xs text-muted">حقوقی: <span className="num">{fa(100 - v)}٪</span></div></div>
      ))}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-surface2/50 p-3 text-center"><div className="text-xs text-muted">قدرت خریدار</div><div className={`num text-lg font-extrabold ${d.real.power >= 1 ? 'text-up' : 'text-down'}`}>{fa(d.real.power, 2)}</div></div>
        <div className="rounded-xl bg-surface2/50 p-3 text-center"><div className="text-xs text-muted">ورود پول حقیقی</div><div className={`num text-lg font-extrabold ${d.real.money >= 0 ? 'text-up' : 'text-down'}`} dir="ltr">{d.real.money >= 0 ? '+' : '−'}{fa(Math.abs(d.real.money))}<small className="text-xs"> میلیارد</small></div></div>
      </div>
    </div>
  )
}

function News({ d }) {
  const [f, setF] = useState('همه')
  const list = d.news.filter((n) => f === 'همه' || n[2] === f)
  return (
    <>
      <div className="flex gap-2">{['همه', 'اطلاعیه', 'خبر', 'تحلیل', 'ناظر'].map((t) => <Pill key={t} on={f === t} onClick={() => setF(t)}>{t}</Pill>)}</div>
      <div className="divide-y divide-line/60 rounded-2xl border border-line">
        {list.map(([t, src, type, at]) => (
          <motion.a layout key={t} href="#" onClick={(e) => e.preventDefault()} className="flex items-start gap-3 p-4 transition-colors hover:bg-surface2/40">
            <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${type === 'اطلاعیه' ? 'bg-amber-400/15 text-amber-400' : type === 'ناظر' ? 'bg-down/15 text-down' : 'bg-brand/15 text-brand-light'}`}>{ico(Paper)}</span>
            <div className="flex-1"><div className="font-semibold">{t}</div><div className="mt-1 text-xs text-muted">{src} · {type} · {at}</div></div>
          </motion.a>
        ))}
      </div>
    </>
  )
}

function Levels({ sym, d }) {
  return (
    <Card title="سطوح حمایت و مقاومت" actions={<span className="text-xs text-muted">بر اساس سقف و کف‌های روزانه</span>}>
      <div className="space-y-2">
        {d.levels.map((l, i) => {
          const res = l.t.startsWith('مقاومت')
          return (
            <motion.div key={l.t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .05 }}
              className={`flex items-center gap-3 rounded-xl p-3 ${l.cur ? 'border border-brand/60 bg-brand/10' : 'bg-surface2/40'}`}>
              <span className={`w-20 text-sm font-semibold ${l.cur ? 'text-brand-light' : res ? 'text-down' : 'text-up'}`}>{l.t}</span>
              <span className="num w-20 font-bold">{fa(l.p)}</span>
              {!l.cur && <><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface2"><motion.div initial={{ width: 0 }} animate={{ width: `${l.str}%` }} className={`h-full ${res ? 'bg-down' : 'bg-up'}`} /></div>
                <span className="num w-24 text-left text-xs text-muted">فاصله {fa(Math.abs((l.p - sym.p) / sym.p * 100), 1)}٪</span></>}
              {l.cur && <span className="flex-1 text-left text-xs text-muted">قیمت لحظه‌ای</span>}
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}

function Opinions({ d }) {
  const [likes, setLikes] = useState({})
  const [text, setText] = useState('')
  const [mine, setMine] = useState([])
  const all = [...mine, ...d.opinions]
  return (
    <>
      <Card>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="تحلیل یا نظرت رو درباره این نماد بنویس..." className="w-full resize-none rounded-xl bg-surface2/50 p-3 text-sm outline-none focus:ring-1 focus:ring-brand" />
        <div className="mt-2 flex justify-end"><motion.button whileTap={{ scale: .95 }} disabled={!text.trim()} onClick={() => { setMine([['احسان مرادی', 'تکنیکال', 'خنثی', text, 0], ...mine]); setText('') }} className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white disabled:opacity-40">انتشار</motion.button></div>
      </Card>
      <AnimatePresence initial={false}>
        {all.map(([who, kind, view, body, lk], i) => (
          <motion.div key={who + body} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-surface2 font-bold">{who[0]}</span>
                <div className="flex-1"><div className="font-semibold">{who}</div><div className="text-xs text-muted">تحلیل {kind}</div></div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${view === 'صعودی' ? 'bg-up/15 text-up' : view === 'نزولی' ? 'bg-down/15 text-down' : 'bg-surface2 text-muted'}`}>{view}</span>
              </div>
              <p className="mt-3 text-sm leading-7">{body}</p>
              <div className="mt-2 flex gap-4 text-xs text-muted">
                <motion.button whileTap={{ scale: 1.3 }} onClick={() => setLikes({ ...likes, [i]: !likes[i] })} className={likes[i] ? 'text-down' : 'hover:text-ink'}>♥ <span className="num">{fa(lk + (likes[i] ? 1 : 0))}</span></motion.button>
                <button className="flex items-center gap-1 hover:text-ink">{ico(Chat, 14)} پاسخ</button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  )
}

function Gauge({ title, v, id }) {
  const [s, n, b] = v, total = s + n + b, score = (b - s) / total
  const label = score > .5 ? 'خرید قوی' : score > .1 ? 'خرید' : score < -.5 ? 'فروش قوی' : score < -.1 ? 'فروش' : 'خنثی'
  const col = score > .1 ? 'text-up' : score < -.1 ? 'text-down' : 'text-muted'
  const ang = score * 90
  return (
    <Card className="text-center">
      <h4 className="mb-2 text-sm font-semibold">{title}</h4>
      <svg viewBox="0 0 200 110" className="mx-auto w-full max-w-[220px]">
        <defs><linearGradient id={'gauge' + id} x1="0" x2="1"><stop offset="0" stopColor="rgb(var(--down))" /><stop offset=".5" stopColor="rgb(var(--muted))" /><stop offset="1" stopColor="rgb(var(--up))" /></linearGradient></defs>
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke={`url(#gauge${id})`} strokeWidth="12" strokeLinecap="round" opacity=".85" />
        <motion.g initial={{ rotate: 0 }} animate={{ rotate: ang }} transition={{ type: 'spring', stiffness: 60, damping: 10 }} style={{ originX: '100px', originY: '100px' }}>
          <line x1="100" y1="100" x2="100" y2="34" stroke="rgb(var(--ink))" strokeWidth="3" strokeLinecap="round" />
        </motion.g>
        <circle cx="100" cy="100" r="6" fill="rgb(var(--ink))" />
      </svg>
      <div className={`text-lg font-extrabold ${col}`}>{label}</div>
      <div className="num mt-2 flex justify-center gap-4 text-xs"><span className="text-down">فروش {fa(s)}</span><span className="text-muted">خنثی {fa(n)}</span><span className="text-up">خرید {fa(b)}</span></div>
    </Card>
  )
}

function Technical({ d }) {
  const sum = d.tech.osc.map((v, i) => v + d.tech.ma[i])
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Gauge id={1} title="اسیلاتورها" v={d.tech.osc} />
      <Gauge id={2} title="خلاصه" v={sum} />
      <Gauge id={3} title="میانگین‌های متحرک" v={d.tech.ma} />
    </div>
  )
}

const DRAWER_TITLES = Object.fromEntries(LINKS.map(([k, t]) => [k, t]))
function Drawer({ k, close, sym, d }) {
  return (
    <AnimatePresence>
      {k && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
          <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col border-r border-line bg-surface shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b border-line px-4"><b>{DRAWER_TITLES[k]} · {sym.s}</b><button onClick={close} className="grid h-9 w-9 place-items-center rounded-lg text-xl text-muted hover:bg-surface2">×</button></div>
            <div className="scroll-y flex-1 space-y-2 p-4 text-sm">
              {k === 'peers' && d.peers.map((x) => <div key={x.s} className="flex justify-between rounded-xl bg-surface2/40 p-3"><div><b>{x.s}</b><div className="text-xs text-muted">{x.n}</div></div><div className="text-left"><div className="num">{fa(x.p)}</div><Change c={x.c} className="!text-xs" /></div></div>)}
              {k === 'holders' && d.holders.map((h) => <div key={h.n} className="rounded-xl bg-surface2/40 p-3"><div className="flex justify-between"><span>{h.n}</span><b className="num">{fa(h.p, 2)}٪</b></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface2"><motion.div initial={{ width: 0 }} animate={{ width: `${h.p * 2.5}%` }} className="h-full bg-brand" /></div><div className={`num mt-1 text-xs ${h.d >= 0 ? 'text-up' : 'text-down'}`}>تغییر امروز: {h.d >= 0 ? '+' : '−'}{fa(Math.abs(h.d))} سهم</div></div>)}
              {k === 'big' && d.big.map((b, i) => <div key={i} className="num flex items-center justify-between rounded-xl bg-surface2/40 p-3"><span className="text-muted">{b.t}</span><b className={b.side === 'خرید' ? 'text-up' : 'text-down'}>{b.side}</b><span>{fa(b.q)} سهم</span><span>{fa(b.p)}</span></div>)}
              {k === 'history' && d.history.map((h) => <div key={h.d} className="num flex items-center justify-between rounded-xl bg-surface2/40 p-3"><span>{h.d}</span><b>{fa(h.p)}</b><Change c={h.c} className="!text-xs" /><span className="text-muted">{h.v}</span></div>)}
              {k === 'real' && <Real d={d} />}
              {k === 'details' && [['نام کامل', sym.n], ['نماد', sym.s], ['بازار', d.market], ['صنعت', sym.ind], ['آستانه مجاز', `${fa(d.limLo)} تا ${fa(d.limHi)}`], ['قیمت پایانی دیروز', fa(d.prev)], ...d.fundamentals].map(([a, b]) => <div key={a} className="flex justify-between border-b border-line/50 py-2.5"><span className="text-muted">{a}</span><b className="num">{b}</b></div>)}
              {k === 'strategy' && ['کاورد کال روی ' + sym.s, 'خرید پله‌ای در نواحی حمایتی', 'معامله شکست مقاومت ۱'].map((t, i) => <div key={t} className="rounded-xl bg-surface2/40 p-3"><b>{t}</b><div className="mt-1 text-xs text-muted">ریسک: {['کم', 'متوسط', 'زیاد'][i]} · افق: {['۱ ماه', '۳ ماه', '۲ هفته'][i]}</div></div>)}
              {k === 'option' && [0.95, 1, 1.05, 1.1].map((m) => <div key={m} className="num flex justify-between rounded-xl bg-surface2/40 p-3"><span>ض{sym.s.slice(0, 3)}{fa(Math.round(sym.p * m / 100))}</span><span>اعمال {fa(Math.round(sym.p * m))}</span><b className="text-brand-light">{fa(Math.round(sym.p * .06 / m))}</b></div>)}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
