import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Star, Notification, EditSquare, Search, TwoUsers, Discovery, Category, InfoCircle, Graph, TimeCircle, People, Work, Chart, Paper, Activity, Chat, Show } from 'react-iconly'
import TVChart, { makeBars } from './TVChart'
import SRChart from './SRChart'
import RealPower from './RealPower'
import { Intraday, RealLegal, Returns, Compare, Poll, Marquee } from './OverviewExtra'
import { Change } from './Count'
import { fa, SYMBOLS } from '../data/market'
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
  ['real', 'قدرت حقیقی', Graph], ['history', 'سابقه معاملات', TimeCircle], ['big', 'سابقه سهامداران', People], ['holders', 'سهامداران', Work],
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
  <button onClick={onClick} className={`btn ${on ? 'btn-on' : ''}`}>{children}</button>
)

// open any ticker as the active symbol (falls back to a sample profile for tickers outside the watchlist)
function toSymbol(code) {
  const hit = SYMBOLS.find((y) => y.s === code)
  if (hit) return hit
  const seed = [...code].reduce((a, c) => a * 31 + c.charCodeAt(0), 1)
  const p = 1000 + (seed % 9000), c = ((seed % 700) - 300) / 100
  const ind = (PORTFOLIO_POOL.find(([x]) => x === code) || [0, 'سایر'])[1]
  return { s: code, n: code, p, c, ind, pe: 4 + (seed % 90) / 10, mc: fa(20 + seed % 300) + ' همت', vol: fa(20 + seed % 200) + ' م', spark: SYMBOLS[seed % SYMBOLS.length].spark }
}

export default function SitePanel({ sym, dark, setDark, setSym }) {
  const [tab, setTab] = useState('نمای کلی')
  const [menu, setMenu] = useState(null)
  const [drawer, setDrawer] = useState(null)
  const [fav, setFav] = useState(false)
  const d = useMemo(() => symbolData(sym), [sym])

  // Chart tab: scrolling snaps the tab bar to the top, and the chart then fills everything below it
  const scroller = useRef(null), tabsBar = useRef(null)
  const [fill, setFill] = useState(600)
  const isChart = ['چارت', 'حمایت/مقاومت', 'تکنیکال'].includes(tab)
  const cardH = Math.max(380, fill - 40)   // card fills the space under the stuck tab bar (p-5 = 20px top + bottom)
  useEffect(() => {
    const sc = scroller.current, bar = tabsBar.current
    const measure = () => setFill(sc.clientHeight - bar.offsetHeight)
    measure(); const ro = new ResizeObserver(measure); ro.observe(sc); return () => ro.disconnect()
  }, [])
  useEffect(() => {
    if (!isChart) return
    const sc = scroller.current, snapTop = () => tabsBar.current.offsetTop
    let busy = false, last = sc.scrollTop
    const go = (top) => { busy = true; sc.scrollTo({ top, behavior: 'smooth' }); setTimeout(() => { busy = false; last = sc.scrollTop }, 500) }
    // capture phase: runs before the chart sees the wheel, so even a tiny scroll snaps first
    const onWheel = (e) => {
      const t = snapTop(), snapped = sc.scrollTop >= t - 1
      if (!snapped && e.deltaY > 0) { e.preventDefault(); e.stopPropagation(); if (!busy) go(t); return }
      if (busy) { e.preventDefault(); e.stopPropagation(); return }
      if (snapped && e.deltaY < 0 && !e.target.closest('[data-chart]')) { e.preventDefault(); if (sc.scrollTop <= t + 1) go(0) }
    }
    // scrollbar drag / keyboard / touch momentum: any movement in the header zone snaps
    const onScroll = () => {
      if (busy) return
      const t = snapTop(), y = sc.scrollTop
      if (y > 0 && y < t - 1) go(y > last ? t : 0)
      last = y
    }
    sc.addEventListener('wheel', onWheel, { passive: false, capture: true })
    sc.addEventListener('scroll', onScroll, { passive: true })
    return () => { sc.removeEventListener('wheel', onWheel, { capture: true }); sc.removeEventListener('scroll', onScroll) }
  }, [isChart])
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

      <div ref={scroller} className="scroll-y min-h-0 flex-1">
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
        <div ref={tabsBar} className="sticky top-0 z-20 mt-4 flex gap-1 overflow-x-auto border-b border-line bg-surface/95 px-5 backdrop-blur">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`relative whitespace-nowrap px-3 py-3 text-sm transition-colors ${tab === t ? 'font-bold text-ink' : 'text-muted hover:text-ink'}`}>
              {t}{tab === t && <motion.span layoutId="sym-tab" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand-light" />}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab + sym.s} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .2 }} className="space-y-4 p-5">
            {tab === 'نمای کلی' && <Overview sym={sym} d={d} open={setDrawer} dark={dark} />}
            {tab === 'چارت' && <div data-chart style={{ height: cardH }} className="overflow-hidden rounded-2xl border border-line"><TVChart sym={sym} dark={dark} /></div>}
            {tab === 'اخبار و اطلاعیه‌ها' && <News d={d} />}
            {tab === 'حمایت/مقاومت' && <div data-chart style={{ height: cardH }} className="overflow-hidden rounded-2xl border border-line"><SRChart sym={sym} dark={dark} /></div>}
            {tab === 'نظرات و تحلیل‌ها' && <Opinions d={d} />}
            {tab === 'تکنیکال' && <div data-chart style={{ height: cardH }} className="overflow-hidden rounded-2xl border border-line"><TVChart sym={sym} dark={dark} technical /></div>}
          </motion.div>
        </AnimatePresence>
      </div>

      <Drawer k={drawer} close={() => setDrawer(null)} sym={sym} d={d} openSym={(code) => { setDrawer(null); setTab('نمای کلی'); setSym(toSymbol(code)) }} />
    </section>
  )
}

function Overview({ sym, d, open, dark }) {
  const [modal, setModal] = useState(null)   // 'rows' | 'depth'
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
        <Card className="flex flex-col" title="دفتر سفارش" actions={<><Pill on={modal === 'rows'} onClick={() => setModal('rows')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg> ردیف‌های عرضه و تقاضا</Pill><Pill on={modal === 'depth'} onClick={() => setModal('depth')}>{ico(Show, 14)} نمودار تجمعی</Pill></>}>
          <OrderBook d={d} prev={d.prev} rows cum={false} />
          <Modal open={modal === 'rows'} title="ردیف‌های عرضه و تقاضا" onClose={() => setModal(null)}><FullBook sym={sym} prev={d.prev} /></Modal>
          <Modal open={modal === 'depth'} title="نمودار تجمعی ردیف‌ها" onClose={() => setModal(null)}><DepthChart sym={sym} /></Modal>
        </Card>
        <div className="flex flex-col gap-4">
          <Card title="دامنه قیمت امروز"><Range sym={sym} d={d} /></Card>
          <Card title="اطلاعات بنیادی" actions={['TSETMC', 'پیام ناظر', 'کدال'].map((t) => <a key={t} href="#" onClick={(e) => e.preventDefault()} className="btn btn-on">{t}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg></a>)}>
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
    <td className="px-0.5 py-1">
      <div className={`relative flex h-7 items-center ${buy ? 'justify-end' : 'justify-start'}`}>
        <motion.span initial={{ width: 0 }} animate={{ width: `${Math.max(4, w)}%` }} transition={{ duration: .5, ease: 'easeOut' }}
          className={`absolute inset-y-0 rounded-lg ${buy ? 'left-0 bg-up/20' : 'right-0 bg-down/20'}`} />
        <span className="relative whitespace-nowrap px-1.5 font-semibold" dir="ltr">{vol(v)}</span>
      </div>
    </td>
  )
  return (
    <div className="flex flex-1 flex-col overflow-x-auto">
      <div className="flex min-w-[360px] flex-1 flex-col">
        <div className="grid grid-cols-2 text-center font-bold">
          <div className="border-b-2 border-up pb-1.5 text-up">تقاضا</div>
          <div className="border-b-2 border-down pb-1.5 text-down">عرضه</div>
        </div>
        <table className="num w-full table-fixed text-center text-sm">
          <thead className="text-xs text-muted"><tr>{['تعداد', 'حجم', 'قیمت', 'قیمت', 'حجم', 'تعداد'].map((h, i) => <th key={i} className="py-2 font-normal">{h}</th>)}</tr></thead>
          <tbody>
            {data.map((r, i) => (
              <motion.tr key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .04 }} className="transition-colors hover:bg-surface2/40">
                <td className="py-1">{fa(r.bn)}</td>
                <Vol v={r.bq} w={((cum ? r.cb : r.bq) / mx) * 100} buy />
                <td className="leading-tight"><b className="text-sm">{fa(r.bp)}</b><div className="text-[10px] text-up" dir="ltr">{pct(r.bp)}</div></td>
                <td className="leading-tight"><b className="text-sm">{fa(r.ap)}</b><div className="text-[10px] text-down" dir="ltr">{pct(r.ap)}</div></td>
                <Vol v={r.aq} w={((cum ? r.ca : r.aq) / mx) * 100} />
                <td>{fa(r.an)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        <div className="mb-2 mt-auto flex items-center gap-3 pt-2 text-xs text-muted"><i className="flex-1 border-t border-dashed border-line" />جمع سفارش‌ها<i className="flex-1 border-t border-dashed border-line" /></div>
        <div className="num grid grid-cols-2 overflow-hidden rounded-xl text-[15px] font-bold">
          <div className="grid grid-cols-2 bg-up/10 py-2 text-center text-up"><span>{fa(data.reduce((a, r) => a + r.bn, 0))}</span><span>{fa(data.at(-1).cb)}</span></div>
          <div className="grid grid-cols-2 bg-down/10 py-2 text-center text-down"><span>{fa(data.at(-1).ca)}</span><span>{fa(data.reduce((a, r) => a + r.an, 0))}</span></div>
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
  // grid keeps overflow visible for tooltips, so corner cells carry their own radius
  const Cell = ({ k, label = k, r = '' }) => (
    <div className={`flex flex-col items-center justify-center gap-1 bg-surface px-2 py-3.5 text-center ${r}`}>
      <Tip label={label} tip={TIPS[k]} />
      <b className="num text-[15px]">{f[k]}</b>
    </div>
  )
  const [num, unit] = String(f['ارزش بازار']).split(' ')
  return (
    <div className="grid grid-cols-2 gap-px rounded-xl border border-line bg-line sm:grid-cols-4">
      <div className="col-span-2 flex flex-col items-center justify-center gap-1 rounded-t-[11px] bg-[rgb(var(--surface))] bg-gradient-to-b from-brand/10 to-brand/10 px-2 py-3.5 text-center sm:rounded-tl-none">
        <Tip label="ارزش بازار" tip={TIPS['ارزش بازار']} />
        <b className="num text-xl">{num} <small className="text-xs font-normal text-muted">{unit}</small></b>
      </div>
      <Cell k="P/E" />
      <Cell k="EPS" r="sm:rounded-tl-[11px]" />
      <Cell k="P/E گروه" r="sm:rounded-br-[11px]" />
      <Cell k="P/S" />
      <Cell k="سهام شناور" label="درصد شناور" r="rounded-br-[11px] sm:rounded-br-none" />
      <Cell k="تعداد سهام" r="rounded-bl-[11px]" />
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
  const [open, setOpen] = useState(null)
  const list = d.news
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="font-bold">اخبار و اطلاعیه‌ها</h3>
      </div>
      <AnimatePresence initial={false}>
        {list.map((n, i) => (
          <motion.article key={n.t} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ delay: i * .04 }}
            onClick={() => setOpen(open === i ? null : i)} className="cursor-pointer rounded-2xl border border-line bg-surface2/25 p-4 transition-colors hover:border-brand/40">
            <h4 className="font-bold">{n.t}</h4>
            <p className={`mt-2 text-sm leading-7 text-muted ${open === i ? '' : 'line-clamp-2'}`}>{n.b}</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className={`flex items-center gap-1.5 font-semibold ${n.k === 'پیام ناظر' ? 'text-amber-400' : 'text-brand-light'}`}>{ico(Paper, 15)}{n.k}</span>
              <span className="num text-muted" dir="ltr">{n.at}</span>
            </div>
          </motion.article>
        ))}
      </AnimatePresence>
    </>
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

const DRAWER_TITLES = Object.fromEntries(LINKS.map(([k, t]) => [k, t]))
function Drawer({ k, close, sym, d, openSym }) {
  return (
    <AnimatePresence>
      {k && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
          <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className={`fixed inset-y-0 left-0 z-50 flex w-full flex-col border-r border-line bg-surface shadow-2xl max-w-lg`}>
            {k !== 'holders' && k !== 'big' && <div className="flex h-14 items-center justify-between border-b border-line px-4"><b>{k === 'holders' ? `سهامداران عمده ${sym.s}` : k === 'real' ? `سابقه قدرت حقیقی ${sym.s}` : k === 'peers' ? `هم‌گروه‌های ${sym.s}` : `${DRAWER_TITLES[k]} · ${sym.s}`}</b><span className="flex items-center gap-1">{k === 'holders' && <HoldersHelp />}<button onClick={close} className="grid h-9 w-9 place-items-center rounded-lg text-xl text-muted hover:bg-surface2">×</button></span></div>}
            <div className={`flex-1 space-y-2 p-4 text-sm ${k === 'real' || k === 'peers' || k === 'holders' || k === 'big' ? 'flex min-h-0 flex-col overflow-hidden !space-y-0 !p-0' : 'scroll-y'}`}>
              {k === 'peers' && <Peers sym={sym} openSym={openSym} />}
              {k === 'holders' && <Holders sym={sym} close={close} openSym={openSym} />}
              {k === 'big' && <HolderHistory sym={sym} close={close} openSym={openSym} />}
              {k === 'history' && d.history.map((h) => <div key={h.d} className="num flex items-center justify-between rounded-xl bg-surface2/40 p-3"><span>{h.d}</span><b>{fa(h.p)}</b><Change c={h.c} className="!text-xs" /><span className="text-muted">{h.v}</span></div>)}
              {k === 'real' && <RealPower sym={sym} />}
              {k === 'details' && <SymbolFlags sym={sym} />}
              {k === 'strategy' && ['کاورد کال روی ' + sym.s, 'خرید پله‌ای در نواحی حمایتی', 'معامله شکست مقاومت ۱'].map((t, i) => <div key={t} className="rounded-xl bg-surface2/40 p-3"><b>{t}</b><div className="mt-1 text-xs text-muted">ریسک: {['کم', 'متوسط', 'زیاد'][i]} · افق: {['۱ ماه', '۳ ماه', '۲ هفته'][i]}</div></div>)}
              {k === 'option' && [0.95, 1, 1.05, 1.1].map((m) => <div key={m} className="num flex justify-between rounded-xl bg-surface2/40 p-3"><span>ض{sym.s.slice(0, 3)}{fa(Math.round(sym.p * m / 100))}</span><span>اعمال {fa(Math.round(sym.p * m))}</span><b className="text-brand-light">{fa(Math.round(sym.p * .06 / m))}</b></div>)}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

/* ---------- جزئیات نماد: وضعیت سیگنال‌ها ---------- */
const FLAGS = [
  ['حمایت/مقاومت', 'قیمت نزدیک یکی از سطوح مهم حمایت یا مقاومت است.'],
  ['واگرایی', 'بین روند قیمت و اندیکاتورهایی مثل RSI یا MACD واگرایی دیده می‌شود.'],
  ['الگو', 'یک الگوی کلاسیک (مثل مثلث، سر و شانه یا پرچم) روی نمودار شناسایی شده است.'],
  ['مجمع', 'مجمع عمومی نماد به‌زودی برگزار می‌شود.'],
  ['پولبک', 'قیمت پس از شکست یک سطح، به آن برگشته و در حال تست مجدد است.'],
  ['مستعد رشد', 'ترکیب حجم، روند و قدرت خریدار نشانه احتمال رشد است.'],
  ['حجم مشکوک', 'حجم معاملات امروز به‌طور غیرعادی بیشتر از میانگین ماهانه است.'],
  ['جمع شدن صف', 'صف خرید یا فروش نماد در حال جمع شدن است.'],
  ['صف فردا', 'احتمال تشکیل صف در جلسه معاملاتی فردا وجود دارد.'],
]
function SymbolFlags({ sym }) {
  const seed = [...sym.s].reduce((a, c) => a + c.charCodeAt(0), 0)
  const on = FLAGS.map((_, i) => ((seed * (i + 3) * 7919) % 100) < (sym.c > 0 ? 45 : 30))
  const [tip, setTip] = useState(null)
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>وضعیت سیگنال‌های {sym.s}</span>
        <span className="num"><b className="text-brand-light">{fa(on.filter(Boolean).length)}</b> از {fa(FLAGS.length)} فعال</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {FLAGS.map(([t, desc], i) => (
          <motion.button key={t} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * .04 }}
            onMouseEnter={() => setTip(i)} onMouseLeave={() => setTip(null)} onFocus={() => setTip(i)} onBlur={() => setTip(null)}
            className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors ${on[i] ? 'border-brand/40 bg-brand/10' : 'border-line bg-surface2/30'} ${tip === i ? 'border-brand/70' : ''}`}>
            <span className="text-xs font-semibold">{t}</span>
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: .15 + i * .04, type: 'spring', stiffness: 400, damping: 15 }}
              className={`grid h-5 w-5 place-items-center rounded-full text-white ${on[i] ? 'bg-brand' : 'bg-down'}`} aria-label={on[i] ? 'دارد' : 'ندارد'}>
              {on[i]
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>
                : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>}
            </motion.span>
          </motion.button>
        ))}
      </div>
      <div className="min-h-[52px] rounded-xl bg-surface2/40 p-3 text-xs leading-6 text-muted">
        {tip == null ? 'برای دیدن توضیح هر مورد، ماوس را روی آن ببرید.' : <><b className="text-ink">{FLAGS[tip][0]}: </b>{FLAGS[tip][1]}</>}
      </div>
      <div className="flex justify-center gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-brand" />دارد</span>
        <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-down" />ندارد</span>
      </div>
    </div>
  )
}

/* ---------- مقایسه هم‌گروه‌ها ---------- */
const PEER_POOL = ['فولاد', 'فملی', 'کگل', 'فخوز', 'ذوب', 'فاسمین', 'کچاد', 'فسپا', 'فلامی', 'فجهان', 'شپنا', 'شبندر', 'شتران', 'فارس', 'پارسان', 'شپدیس', 'وبملت', 'وتجارت', 'وبصادر', 'وپاسار', 'خودرو', 'خساپا', 'خگستر', 'رمپنا', 'شستا', 'وغدیر', 'تاپیکو']
const SORTS = [['chg', 'درصد آخرین قیمت'], ['pe', 'P/E'], ['eps', 'EPS'], ['ps', 'P/S'], ['mc', 'ارزش بازار'], ['r1m', 'بازده ۱ ماهه'], ['r1y', 'بازده ۱ ساله']]
const tri = (n) => n >= 1e12 ? fa(n / 1e12, 1) + ' T' : n >= 1e9 ? fa(n / 1e9, 1) + ' B' : n >= 1e6 ? fa(n / 1e6, 1) + ' M' : fa(n)
function peerRows(sym) {
  let x = [...sym.s].reduce((a, c) => a * 31 + c.charCodeAt(0), 3) % 2147483647
  const r = () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646
  return PEER_POOL.filter((s) => s !== sym.s).slice(0, 16).map((s) => {
    const p = Math.round(1000 + r() * 30000), chg = (r() - .3) * 6, eps = Math.round((r() - .1) * 4000)
    return { s, mkt: ['بورس', 'فرابورس', 'فرابورس پایه'][Math.floor(r() * 3)], p, chg, vol: Math.round(r() * 1.2e8), avg: Math.round(r() * 1e8),
      eps, pe: eps > 0 ? p / eps : null, ps: r() > .5 ? .5 + r() * 4 : null, mc: Math.round((1 + r() * 600) * 1e12), r1m: (r() - .25) * 40, r1y: (r() - .1) * 400 }
  })
}
function Dropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className={`btn min-w-[120px] justify-between ${open ? 'btn-on' : ''}`}>
        {options.find((o) => o[0] === value)[1]}
        <motion.svg animate={{ rotate: open ? 180 : 0 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></motion.svg>
      </button>
      <AnimatePresence>{open && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .15 }}
          className="absolute right-0 top-10 z-30 max-h-64 w-full min-w-[11rem] overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-2xl">
          {options.map(([k, t]) => (
            <button key={String(k)} onClick={() => { onChange(k); setOpen(false) }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-right text-sm hover:bg-surface2 ${k === value ? 'text-brand-light' : ''}`}>
              {t}{k === value && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="m5 12 5 5 9-10" /></svg>}
            </button>
          ))}
        </motion.div>
      )}</AnimatePresence>
    </div>
  )
}
function Peers({ sym, openSym }) {
  const [by, setBy] = useState('mc')
  const [dir, setDir] = useState('desc')
  const rows = useMemo(() => {
    const v = (x) => x[by] ?? -Infinity
    return peerRows(sym).sort((a, b) => (dir === 'desc' ? v(b) - v(a) : v(a) - v(b)))
  }, [sym, by, dir])
  const pct = (v, cls = true) => <span className={`num ${cls ? (v >= 0 ? 'text-up' : 'text-down') : ''}`} dir="ltr">{v >= 0 ? '' : '−'}{fa(Math.abs(v), 2)}٪</span>
  const two = (a, b) => <div className="leading-5"><div>{a}</div><div className="text-muted">{b}</div></div>
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3 text-sm">
        <span className="text-muted">ترتیب بر حسب:</span>
        <Dropdown value={by} options={SORTS} onChange={setBy} />
        <Dropdown value={dir} options={[['desc', 'نزولی'], ['asc', 'صعودی']]} onChange={setDir} />
      </div>
      <div className="overflow-x-auto">
        <table className="num w-full min-w-[500px] text-[11px]">
          <thead className="sticky top-0 z-10 bg-surface2/90 text-muted backdrop-blur">
            <tr className="text-center">
              <th className="px-3 py-2.5 text-right font-normal">نماد</th><th className="font-normal">قیمت</th><th className="font-normal">{two('حجم', 'م. حجم')}</th>
              <th className="font-normal">EPS</th><th className="font-normal">{two('P/E', 'P/S')}</th><th className="font-normal">ارزش بازار</th><th className="font-normal">{two('بازده ۱ ماهه', 'بازده ۱ ساله')}</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rows.map((x, i) => (
                <motion.tr key={x.s} onClick={() => openSym(x.s)} layout transition={{ type: 'spring', stiffness: 400, damping: 36 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="cursor-pointer border-b border-line/50 text-center transition-colors hover:bg-surface2/40">
                  <td className="px-3 py-2.5 text-right"><div className="flex items-center gap-2"><i className={`h-2.5 w-2.5 rounded-sm ${x.chg >= 0 ? 'bg-up' : 'bg-down'}`} /><div><b className="text-sm">{x.s}</b><div className="text-[10px] text-muted">({x.mkt})</div></div></div></td>
                  <td>{two(<b>{fa(x.p)}</b>, pct(x.chg))}</td>
                  <td>{two(tri(x.vol), tri(x.avg))}</td>
                  <td className={x.eps < 0 ? 'text-down' : ''}>{fa(x.eps)}</td>
                  <td>{two(x.pe ? fa(x.pe, 2) : '-', x.ps ? fa(x.ps, 2) : '-')}</td>
                  <td>{tri(x.mc)}</td>
                  <td>{two(pct(x.r1m), pct(x.r1y))}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------- Modal (bottom sheet on phones, centered dialog on desktop) ---------- */
function Modal({ open, title, onClose, children, closeText = 'بستن', visible = false, actions, primary = false }) {
  useEffect(() => {
    if (!open) return
    const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [open])
  // one card: header (title + close) · body · footer actions — bottom sheet on phones, centered dialog on desktop
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
          <motion.div role="dialog" aria-modal="true" aria-label={title} initial={{ y: 60, opacity: 0, scale: .97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 60, opacity: 0, scale: .97 }} transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            className={`relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-3xl border border-line bg-surface shadow-2xl sm:m-3 sm:rounded-3xl ${visible ? '' : 'overflow-hidden'}`}>
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line sm:hidden" />
            <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
              <h3 className="flex-1 font-bold">{title}</h3>
              <button onClick={onClose} aria-label="بستن" className="grid h-8 w-8 place-items-center rounded-lg text-lg text-muted hover:bg-surface2 hover:text-ink">×</button>
            </div>
            <div className={`min-h-0 px-5 py-4 ${visible ? '' : 'scroll-y'}`}>{children}</div>
            <div className="flex items-center gap-2 border-t border-line px-5 py-3.5">
              {actions || <motion.button whileTap={{ scale: .97 }} onClick={onClose} className={`h-11 flex-1 rounded-xl font-bold transition-colors ${primary ? 'bg-gradient-to-l from-brand-light to-brand-dark text-white shadow-glow' : 'border border-line bg-surface2/50 hover:border-brand/40'}`}>{closeText}</motion.button>}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function deepBook(sym) {
  let x = [...sym.s].reduce((a, c) => a * 17 + c.charCodeAt(0), 5) % 2147483647
  const r = () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646
  const tick = Math.max(1, Math.round(sym.p * 0.0006))
  let bp = sym.p, ap = sym.p + tick
  const bids = Array.from({ length: 14 }, () => { const row = { p: bp, q: Math.round(r() < .3 ? r() * 3e6 : r() * 6e5) + 1000, n: 1 + Math.floor(r() * 5) }; bp -= tick * (1 + Math.floor(r() * 4)); return row })
  const asks = Array.from({ length: 16 }, () => { const row = { p: ap, q: Math.round(r() < .3 ? r() * 3e6 : r() * 6e5) + 1000, n: 1 + Math.floor(r() * 5) }; ap += tick * (1 + Math.floor(r() * 5)); return row })
  return { bids, asks }
}

function FullBook({ sym, prev }) {
  const { bids, asks } = useMemo(() => deepBook(sym), [sym])
  const n = Math.max(bids.length, asks.length), mx = Math.max(...bids.map((b) => b.q), ...asks.map((a) => a.q))
  const pc = (p) => { const v = (p - prev) / prev * 100; return <div className={`text-[10px] ${v >= 0 ? 'text-up' : 'text-down'}`} dir="ltr">{v >= 0 ? '+' : '−'}{fa(Math.abs(v), 2)}٪</div> }
  const Vol = ({ q, buy }) => (
    <td className="px-1 py-1"><div className={`relative flex h-7 items-center ${buy ? 'justify-end' : 'justify-start'}`}>
      <motion.span initial={{ width: 0 }} animate={{ width: `${Math.max(3, q / mx * 100)}%` }} transition={{ duration: .5 }} className={`absolute inset-y-0 rounded-lg ${buy ? 'left-0 bg-up/20' : 'right-0 bg-down/20'}`} />
      <span className="relative px-1.5" dir="ltr">{fa(q)}</span></div></td>
  )
  const empty = <><td className="py-3 text-muted/50">۰</td><td className="text-muted/50">۰</td><td className="text-muted/50">۰</td></>
  return (
    <div className="overflow-x-auto">
      <table className="num w-full min-w-[460px] table-fixed text-center text-xs">
        <thead>
          <tr className="text-sm font-bold"><th colSpan={3} className="border-b-2 border-up pb-2 text-up">تقاضا</th><th colSpan={3} className="border-b-2 border-down pb-2 text-down">عرضه</th></tr>
          <tr className="text-muted">{['تعداد', 'حجم', 'قیمت', 'قیمت', 'حجم', 'تعداد'].map((h, i) => <th key={i} className={`py-2 font-normal ${i === 3 ? 'border-r border-line' : ''}`}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {Array.from({ length: n }, (_, i) => { const b = bids[i], a = asks[i]; return (
            <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * .02 }} className="hover:bg-surface2/40">
              {b ? <><td>{fa(b.n)}</td><Vol q={b.q} buy /><td className="leading-tight"><b>{fa(b.p)}</b>{pc(b.p)}</td></> : empty}
              {a ? <><td className="border-r border-line leading-tight"><b>{fa(a.p)}</b>{pc(a.p)}</td><Vol q={a.q} /><td>{fa(a.n)}</td></> : <><td className="border-r border-line py-3 text-muted/50">۰</td><td className="text-muted/50">۰</td><td className="text-muted/50">۰</td></>}
            </motion.tr>) })}
        </tbody>
      </table>
    </div>
  )
}

function DepthChart({ sym }) {
  const { bids, asks } = useMemo(() => deepBook(sym), [sym])
  const [hover, setHover] = useState(null)
  let cb = 0, ca = 0
  const B = bids.map((b) => ({ p: b.p, v: (cb += b.q) })), A = asks.map((a) => ({ p: a.p, v: (ca += a.q) }))
  const W = 520, H = 300, pl = 44, pr = 44, pt = 16, pb = 44
  const lo = B.at(-1).p, hi = A.at(-1).p, vmax = Math.max(cb, ca) * 1.08
  const x = (p) => pl + (p - lo) / (hi - lo) * (W - pl - pr), y = (v) => pt + (1 - v / vmax) * (H - pt - pb)
  const mid = (bids[0].p + asks[0].p) / 2
  // step paths: bids accumulate leftwards from best bid, asks rightwards from best ask
  const step = (pts) => pts.map((q, i) => (i ? `L${x(q.p)},${y(pts[i - 1].v)} L${x(q.p)},${y(q.v)}` : `M${x(q.p)},${y(0)} L${x(q.p)},${y(q.v)}`)).join(' ')
  const bPath = step(B), aPath = step(A)
  const yt = Array.from({ length: 6 }, (_, i) => vmax / 6 * (i + 1) * .95)
  const xt = Array.from({ length: 7 }, (_, i) => lo + (hi - lo) * i / 6)
  const vfmt = (v) => fa(v / 1e6, 1) + ' M'
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * W
    const price = lo + (px - pl) / (W - pl - pr) * (hi - lo)
    const side = price <= mid ? B.filter((q) => q.p >= price).at(-1) : A.filter((q) => q.p <= price).at(-1)
    setHover(side ? { ...side, buy: price <= mid } : null)
  }
  return (
    <div dir="ltr">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="dg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="rgb(var(--up))" stopOpacity=".45" /><stop offset="1" stopColor="rgb(var(--up))" stopOpacity=".03" /></linearGradient>
          <linearGradient id="dr" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="rgb(var(--down))" stopOpacity=".45" /><stop offset="1" stopColor="rgb(var(--down))" stopOpacity=".03" /></linearGradient>
        </defs>
        {yt.map((v) => <g key={v}><line x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} stroke="rgb(var(--line))" strokeDasharray="3 4" />
          <text x={pl - 6} y={y(v) + 4} fontSize="10" textAnchor="end" fill="rgb(var(--muted))">{vfmt(v)}</text><text x={W - pr + 6} y={y(v) + 4} fontSize="10" fill="rgb(var(--muted))">{vfmt(v)}</text></g>)}
        {xt.map((p) => <g key={p}><line x1={x(p)} x2={x(p)} y1={pt} y2={H - pb} stroke="rgb(var(--line))" strokeDasharray="3 4" />
          <text x={x(p)} y={H - pb + 16} fontSize="10" textAnchor="end" fill="rgb(var(--muted))" transform={`rotate(-40 ${x(p)} ${H - pb + 16})`}>{fa(p)}</text></g>)}
        <line x1={pl} x2={pl} y1={pt} y2={H - pb} stroke="rgb(var(--muted))" /><line x1={W - pr} x2={W - pr} y1={pt} y2={H - pb} stroke="rgb(var(--muted))" /><line x1={pl} x2={W - pr} y1={H - pb} y2={H - pb} stroke="rgb(var(--muted))" />
        <motion.path d={`${bPath} L${x(B.at(-1).p)},${y(0)} Z`} fill="url(#dg)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .6 }} />
        <motion.path d={bPath} fill="none" stroke="rgb(var(--up))" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .9 }} />
        <motion.path d={`${aPath} L${x(A.at(-1).p)},${y(0)} Z`} fill="url(#dr)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .6 }} />
        <motion.path d={aPath} fill="none" stroke="rgb(var(--down))" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .9 }} />
        <line x1={x(mid)} x2={x(mid)} y1={pt} y2={H - pb} stroke="rgb(var(--muted))" strokeWidth="1.5" strokeDasharray="8 6" />
        <text x={x(mid) + 5} y={pt + 12} fontSize="11" fill="rgb(var(--muted))">{fa(Math.round(mid))}</text>
        {hover && <g pointerEvents="none">
          <circle cx={x(hover.p)} cy={y(hover.v)} r="5" fill={hover.buy ? 'rgb(var(--up))' : 'rgb(var(--down))'} stroke="rgb(var(--surface))" strokeWidth="2" />
          <rect x={Math.min(W - pr - 120, Math.max(pl, x(hover.p) - 60))} y={Math.max(pt, y(hover.v) - 46)} width="120" height="36" rx="8" fill="rgb(var(--surface2))" stroke="rgb(var(--line))" />
          <text x={Math.min(W - pr - 60, Math.max(pl + 60, x(hover.p)))} y={Math.max(pt, y(hover.v) - 46) + 15} fontSize="11" textAnchor="middle" fill="rgb(var(--ink))">{fa(hover.p)}</text>
          <text x={Math.min(W - pr - 60, Math.max(pl + 60, x(hover.p)))} y={Math.max(pt, y(hover.v) - 46) + 29} fontSize="10" textAnchor="middle" fill={hover.buy ? 'rgb(var(--up))' : 'rgb(var(--down))'}>{(hover.buy ? 'تقاضا ' : 'عرضه ') + vfmt(hover.v)}</text>
        </g>}
      </svg>
      <div className="mt-1 flex justify-center gap-5 text-xs text-muted" dir="rtl">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-up" />تقاضای تجمعی</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-down" />عرضه تجمعی</span>
      </div>
    </div>
  )
}

/* ---------- سهامداران عمده ---------- */
const HOLDER_NAMES = ['صندوق س. بازارگردانی امید لوتوس پارسیان', 'سبد-شرکت سرمایه‌گذاری PRX', 'صندوق س. در اوراق بهادار با درآمد ثابت تصمیم', 'شخص حقیقی', 'شرکت سرمایه‌گذاری گروه صنایع بهشهر ایران-سهامی', 'صندوق بازنشستگی کشوری', 'شرکت سرمایه‌گذاری تأمین اجتماعی']
const OTHER_CO = ['فملی', 'شپنا', 'وبملت', 'خودرو', 'کگل', 'فارس', 'شستا', 'رمپنا']
function holdersData(sym) {
  let x = [...sym.s].reduce((a, c) => a * 23 + c.charCodeAt(0), 7) % 2147483647
  const r = () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646
  const shares = (2 + r() * 8) * 1e9
  const list = HOLDER_NAMES.slice(0, 5).map((n, i) => { const p = +(Math.max(.5, (6 - i * 1.1) * (.6 + r() * .8))).toFixed(3); return { n, p, v: shares * p / 100, d: Math.round((r() - .5) * 6e6),
    others: OTHER_CO.filter((c) => c !== sym.s).filter(() => r() > .55).slice(0, 4).map((c) => ({ c, p: +(r() * 5 + .2).toFixed(2) })) } })
  const sum = list.reduce((a, h) => a + h.p, 0)
  return { list, sum, float: 100 - sum }
}
const bigN = (n) => n >= 1e9 ? fa(n / 1e9, 1) + ' B' : n >= 1e6 ? fa(n / 1e6, 1) + ' M' : fa(Math.round(n))

const PORTFOLIO_POOL = [
  ['هامون', 'صندوق سرمایه‌گذاری قابل معامله'], ['تاپیکو', 'رایانه و فعالیت‌های وابسته به آن'], ['رتاپ', 'رایانه و فعالیت‌های وابسته به آن'], ['وبملت', 'بانک‌ها و موسسات اعتباری'],
  ['ونوین', 'بانک‌ها و موسسات اعتباری'], ['وپارس', 'بانک‌ها و موسسات اعتباری'], ['شوینده', 'محصولات شیمیایی'], ['غچین', 'محصولات غذایی و آشامیدنی'], ['قنیشا', 'قند و شکر'],
  ['شستا', 'سرمایه‌گذاری‌ها'], ['فولاد', 'فلزات اساسی'], ['فملی', 'فلزات اساسی'], ['کگل', 'استخراج کانه‌های فلزی'], ['شپنا', 'فراورده‌های نفتی'], ['هوشمند', 'صندوق سرمایه‌گذاری قابل معامله'], ['عرش', 'صندوق سرمایه‌گذاری قابل معامله'],
]
function holderPortfolio(h, sym) {
  if (h.n === 'شخص حقیقی') return []
  let x = [...h.n].reduce((a, c) => a * 29 + c.charCodeAt(0), 11) % 2147483647
  const r = () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646
  const picks = PORTFOLIO_POOL.filter(([c]) => c !== sym.s).filter(() => r() > .55).slice(0, 2 + Math.floor(r() * 8))
  return [{ c: sym.s, ind: sym.ind, v: h.v * sym.p, q: h.v, p: h.p }, ...picks.map(([c, ind]) => { const q = (1 + r() * 200) * 1e6; return { c, ind, q, v: q * (800 + r() * 20000), p: +(1 + r() * 4).toFixed(3) } })].sort((a, b) => b.v - a.v)
}

// donut + linked legend: hovering a row highlights its slice (and vice versa); "سایر" expands to its parts
function IndustryPie({ rows }) {
  const total = rows.reduce((a, r) => a + r.v, 0)
  const by = Object.entries(rows.reduce((m, r) => ((m[r.ind] = (m[r.ind] || 0) + r.v), m), {})).map(([k, v]) => ({ k, v, pct: v / total * 100 })).sort((a, b) => b.pct - a.pct)
  const main = by.filter((x) => x.pct >= 10), rest = by.filter((x) => x.pct < 10)
  const slices = rest.length ? [...main, { k: 'سایر', v: rest.reduce((a, x) => a + x.v, 0), pct: rest.reduce((a, x) => a + x.pct, 0) }] : main
  const PAL = ['#2E62FF', '#14B8A6', '#F59E0B', '#A855F7', '#EC4899', '#22C55E']
  const color = (sl, i) => (sl.k === 'سایر' ? '#94A3B8' : PAL[i % PAL.length])
  const [hot, setHot] = useState(null), [openRest, setOpenRest] = useState(false)
  const R = 60, r0 = 40, C = 70
  let ang = -Math.PI / 2
  const arcs = slices.map((sl) => { const a0 = ang, a1 = (ang += sl.pct / 100 * Math.PI * 2); return [a0, a1] })
  const pt = (a, rr) => `${C + rr * Math.cos(a)},${C + rr * Math.sin(a)}`
  const arc = ([a0, a1], grow) => {
    const R2 = R + grow, big = a1 - a0 > Math.PI ? 1 : 0
    if (a1 - a0 >= Math.PI * 2 - 1e-6) return `M${C - R2},${C} a${R2},${R2} 0 1,0 ${R2 * 2},0 a${R2},${R2} 0 1,0 ${-R2 * 2},0 M${C - r0},${C} a${r0},${r0} 0 1,1 ${r0 * 2},0 a${r0},${r0} 0 1,1 ${-r0 * 2},0`
    return `M${pt(a0, R2)} A${R2},${R2} 0 ${big} 1 ${pt(a1, R2)} L${pt(a1, r0)} A${r0},${r0} 0 ${big} 0 ${pt(a0, r0)} Z`
  }
  const cur = hot != null ? slices[hot] : null
  return (
    <div className="mt-4 rounded-2xl border border-line bg-surface2/25 p-4">
      <div className="mb-3 text-xs font-semibold text-muted">ترکیب صنایع پرتفوی</div>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 140 140" className="h-36 w-36 shrink-0">
          {slices.map((sl, i) => (
            <motion.path key={sl.k} d={arc(arcs[i], hot === i ? 5 : 0)} fill={color(sl, i)} fillRule="evenodd" stroke="rgb(var(--surface))" strokeWidth="1.5"
              opacity={hot == null || hot === i ? 1 : .35} onMouseEnter={() => setHot(i)} onMouseLeave={() => setHot(null)}
              initial={{ opacity: 0 }} animate={{ opacity: hot == null || hot === i ? 1 : .35 }} transition={{ duration: .25, delay: hot == null ? i * .06 : 0 }} className="cursor-pointer" />
          ))}
          <text x="70" y="66" textAnchor="middle" fontSize="15" fontWeight="800" fill="rgb(var(--ink))">{cur ? fa(cur.pct, 1) + '٪' : fa(slices.length)}</text>
          <text x="70" y="84" textAnchor="middle" fontSize="9" fill="rgb(var(--muted))">{cur ? (cur.k.length > 14 ? cur.k.slice(0, 13) + '…' : cur.k) : 'صنعت'}</text>
        </svg>
        <div className="min-w-0 flex-1 space-y-1">
          {slices.map((sl, i) => (
            <div key={sl.k}>
              <button onMouseEnter={() => setHot(i)} onMouseLeave={() => setHot(null)} onClick={() => sl.k === 'سایر' && setOpenRest(!openRest)}
                className={`w-full rounded-lg px-2 py-1.5 text-right text-xs transition-colors ${hot === i ? 'bg-surface2' : ''} ${sl.k === 'سایر' ? 'cursor-pointer' : 'cursor-default'}`}>
                <div className="flex items-center gap-2">
                  <i className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: color(sl, i) }} />
                  <span className="min-w-0 flex-1 leading-5">{sl.k}{sl.k === 'سایر' && <span className="text-muted"> ({fa(rest.length)} صنعت) {openRest ? '▴' : '▾'}</span>}</span>
                  <b className="num w-12 shrink-0 text-left tabular-nums">{fa(sl.pct, 1)}٪</b>
                </div>
                <div className="mr-4.5 mt-1 h-1 overflow-hidden rounded-full bg-surface2"><motion.div initial={{ width: 0 }} animate={{ width: `${sl.pct}%` }} transition={{ duration: .6, delay: i * .05 }} className="h-full rounded-full" style={{ background: color(sl, i) }} /></div>
              </button>
              <AnimatePresence initial={false}>{sl.k === 'سایر' && openRest && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mr-6 space-y-1 border-r border-line py-1 pl-2 pr-3 text-[11px]">
                    {rest.map((x) => <div key={x.k} className="num flex items-center gap-2"><span className="min-w-0 flex-1 text-muted">{x.k}</span><span className="w-12 shrink-0 text-left tabular-nums">{fa(x.pct, 1)}٪</span></div>)}
                  </div>
                </motion.div>
              )}</AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HolderPage({ h, sym, hist, setHist, openSym }) {
  const rows = useMemo(() => holderPortfolio(h, sym), [h, sym])
  const total = rows.reduce((a, r) => a + r.v, 0)
  // ownership changes: old/new holding, delta, and a badge for full exit / new entry
  const trades = useMemo(() => {
    if (!rows.length) return []
    let x = [...h.n].reduce((a, c) => a * 7 + c.charCodeAt(0), 3) % 2147483647
    const r = () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646
    const pool = [...rows.map((q) => q.c), 'فیرا', 'ذرت', 'نورا', 'رز', 'وهنر']
    return Array.from({ length: 8 }, (_, i) => {
      const c = pool[Math.floor(r() * pool.length)], kind = r()
      const oldP = kind < .3 ? 0 : +(r() * 6 + .5).toFixed(3)
      const newP = kind > .7 ? 0 : kind < .3 ? +(r() * 3 + .5).toFixed(3) : +Math.max(0, oldP + (r() - .5) * 1.5).toFixed(3)
      const per = (40 + r() * 60) * 1e6
      return { c, oldP, newP, dP: newP - oldP, oldV: oldP * per, newV: newP * per, d: `۱۴۰۵/۰۸/${fa(27 - i * 2).padStart(2, '۰')}`,
        tag: newP === 0 ? 'خروج کامل' : oldP === 0 ? 'ورود جدید' : null }
    })
  }, [rows, h])
  return (
    <div className="flex h-full flex-col">
      <AnimatePresence initial={false}>{!hist && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .2 }} className="shrink-0 overflow-hidden">
      <div className="border-b border-line bg-surface2/40 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <b className="text-sm leading-6">{h.n}</b>
          {<button onClick={() => setHist(true)} className="btn btn-on shrink-0">سابقه معاملات <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="m15 6-6 6 6 6" /></svg></button>}
        </div>
        <div className="num mt-1 flex items-center gap-2 text-xs text-muted">تعداد شرکت: <b className="text-ink">{fa(rows.length)}</b><i className="h-3 w-px bg-line" />ارزش کل سرمایه در سهام: <b className="text-ink" dir="ltr">{bigN(total).replace('B', 'B').replace(/^(.*)$/, (m) => total >= 1e12 ? fa(total / 1e12, 1) + ' T' : m)}</b></div>
      </div>
        </motion.div>
      )}</AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={hist ? 'h' : 'p'} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: .18 }} className="scroll-y min-h-0 flex-1 p-4">
          {hist ? (
            <div className="space-y-2">
              {trades.length ? trades.map((t, i) => <TradeCard key={i} i={i} t={t} title={t.c} onClick={() => openSym(t.c)} />) : <Empty text="معامله‌ای برای این سهامدار ثبت نشده است." />}
            </div>
          ) : (
            <>
              <div className="mb-2 grid grid-cols-[1fr_76px_70px_64px] px-3 text-[11px] text-muted"><span>نماد</span><span className="text-center">ارزش</span><span className="text-center">حجم</span><span className="text-left">٪ مالکیت</span></div>
              {rows.length ? (
                <div className="space-y-2">
                  {rows.map((r, i) => (
                    <motion.div key={r.c} role="button" tabIndex={0} onClick={() => openSym(r.c)} onKeyDown={(e) => e.key === 'Enter' && openSym(r.c)} whileTap={{ scale: .98 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .04 }}
                      className={`num cursor-pointer transition-colors hover:border-brand/50 hover:bg-brand/5 grid grid-cols-[1fr_76px_70px_64px] items-center rounded-2xl border px-3 py-3 text-xs border-line bg-surface2/25`}>
                      <b className="text-sm text-brand-light">{r.c}</b>
                      <span className="text-center" dir="ltr">{r.v >= 1e12 ? fa(r.v / 1e12, 1) + ' T' : bigN(r.v)}</span>
                      <span className="text-center" dir="ltr">{bigN(r.q)}</span>
                      <span className="text-left font-bold" dir="ltr">{fa(r.p, 3)}٪</span>
                    </motion.div>
                  ))}
                  <IndustryPie rows={rows} />
                </div>
              ) : <Empty text="این سهامدار مالکیت عمده دیگری در بازار ندارد." />}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
const Empty = ({ text }) => (
  <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 7h18v12H3z" /><path d="M8 7V5h8v2M3 12h18" /></svg>{text}
  </div>
)

function Holders({ sym, close, openSym }) {
  const { list, sum, float } = useMemo(() => holdersData(sym), [sym])
  const [sel, setSel] = useState(null)
  const [hist, setHist] = useState(false)
  const back = () => (hist ? setHist(false) : setSel(null))
  const title = sel == null ? `سهامداران عمده ${sym.s}` : hist ? `سابقه معاملات ${list[sel].n}` : 'سهامدار عمده'
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* app bar: back arrow appears on inner pages, title follows the current page */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-3">
        <AnimatePresence initial={false}>{sel != null && (
          <motion.button key="back" onClick={back} title="بازگشت" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 36 }} exit={{ opacity: 0, width: 0 }} className="grid h-9 shrink-0 place-items-center overflow-hidden rounded-xl text-ink hover:bg-surface2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </motion.button>
        )}</AnimatePresence>
        <AnimatePresence mode="wait" initial={false}>
          <motion.b key={title} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: .15 }} className="min-w-0 flex-1"><Marquee>{title}</Marquee></motion.b>
        </AnimatePresence>
        <HoldersHelp />
        <button onClick={close} title="بستن" className="grid h-9 w-9 place-items-center rounded-lg text-xl text-muted hover:bg-surface2">×</button>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {sel != null ? (
          <motion.div key="page" className="min-h-0 flex-1" initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} transition={{ duration: .22 }}>
            <HolderPage h={list[sel]} sym={sym} hist={hist} setHist={setHist} openSym={openSym} />
          </motion.div>
        ) : (
          <motion.div key="list" className="flex min-h-0 flex-1 flex-col" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} transition={{ duration: .22 }}>
            <div className="num flex items-center justify-between border-b border-line bg-surface2/40 px-4 py-3 text-xs">
              <span className="text-muted">مجموع سهم سهامداران عمده: <b className="text-ink">{fa(sum, 2)}٪</b></span>
              <span className="text-muted">سهام شناور: <b className="text-ink">{fa(float, 2)}٪</b></span>
            </div>
            <div className="scroll-y min-h-0 flex-1 p-4">
              <div className="mb-2 grid grid-cols-[1fr_80px_64px] px-3 text-[11px] text-muted"><span>نام سهامدار</span><span className="text-center">حجم</span><span className="text-left">درصد</span></div>
              <div className="space-y-2">
                {list.map((h, i) => (
                  <motion.button key={h.n} onClick={() => { setHist(false); setSel(i) }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .05 }} whileTap={{ scale: .98 }}
                    className="grid w-full grid-cols-[1fr_80px_64px] items-center gap-2 rounded-2xl border border-line bg-surface2/25 px-3 py-3 text-right text-sm transition-colors hover:border-brand/40">
                    <span className="min-w-0 font-medium text-brand-light"><Marquee>{h.n}</Marquee></span>
                    <span className="num text-center text-xs" dir="ltr">{bigN(h.v)}</span>
                    <span className="num text-left text-xs font-bold" dir="ltr">{fa(h.p, 3)}٪</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const HOLDERS_HELP = [
    ['این بخش چه اطلاعاتی را در اختیار ما می‌گذارد؟', 'در این صفحه لیست تمامی سهامداران عمده حقیقی و حقوقی نماد نمایش داده می‌شود. در کنار نام هر سهامدار عمده، تعداد و درصد سهام وی نسبت به تعداد و درصد کل سهام آن نماد نوشته شده است. همچنین مجموع سهام سهامداران عمده و سهام شناور (درصد سهامی که در اختیار معامله‌گران خرد است) قابل مشاهده است. درصد سهام شناور در این صفحه ممکن است با اطلاعات اعلام‌شده از طرف سازمان بورس متفاوت باشد؛ چرا که محاسبات این صفحه دقیق‌تر و به‌روزتر است.'],
    ['این بخش شامل چه امکاناتی می‌باشد؟', 'سهامداران عمده ممکن است در سایر شرکت‌ها نیز سهامدار باشند؛ با انتخاب هرکدام از این سهامداران عمده، می‌توانید سایر مالکیت‌های این سهامدار را نیز مشاهده کنید.'],
]
const HISTORY_HELP = [
  ['چرا سهامداران عمده اقدام به خرید و فروش سهام می‌کنند؟', 'انگیزه سهامداران عمده از خرید و فروش سهام شامل مواردی همچون داشتن حق رأی در تصمیم‌گیری‌های شرکت و افزایش قدرت مالکیت، ایجاد تعادل بین عرضه و تقاضا، حمایت از سهم، کسب سود و ... می‌باشد.'],
  ['انگیزه اصلی معاملات سهامداران عمده را چگونه تشخیص دهیم؟', 'با بررسی روند معاملات هر سهامدار عمده بر روی نمودار می‌توانید به اهداف وی پی ببرید. اگر سهامدار عمده در قله اقدام به فروش و در کف اقدام به خرید نماید هدف وی کسب سود است، لذا بهتر است رفتار آن سهامدار عمده را زیر نظر گرفته و مطابق با آن اقدام به معامله کنیم.'],
  ['این بخش شامل چه امکاناتی می‌باشد؟', 'برای حذف معاملات کم‌ارزش با حجم پایین می‌توانید از تنظیمات فیلتر استفاده کنید. همچنین در صورتی که قصد بررسی تحرکات سهامدار خاصی را داشته باشید می‌توانید از این گزینه استفاده کنید.\nنمایش نمودار این امکان را در اختیار ما قرار می‌دهد تا واکنش قیمت سهام به رفتار سهامدار عمده را شناسایی کنیم. در صورتی که روند ثابتی مشاهده شد می‌توان از آن برای نوسان‌گیری بهره برد.\nاین نکته را در نظر داشته باشید که اگر لیست سابقه سهامداران نماد را فیلتربندی کنید، نمودار نیز بر اساس پارامترهای فیلتر شما تنظیم می‌شود.'],
]
function HoldersHelp({ items = HOLDERS_HELP }) {
  const [open, setOpen] = useState(false), [acc, setAcc] = useState(0)
  return (
    <>
      <button onClick={() => setOpen(true)} title="راهنما" className="btn-icon !rounded-full"><span className="text-sm font-bold">?</span></button>
      <Modal open={open} title="راهنما" onClose={() => setOpen(false)} closeText="متوجه شدم" primary>
        <div className="space-y-2">
          {items.map(([q, a], i) => (
            <div key={q} className={`overflow-hidden rounded-2xl border ${acc === i ? 'border-brand/40' : 'border-line'}`}>
              <button onClick={() => setAcc(acc === i ? null : i)} className="flex w-full items-center justify-between px-4 py-3 text-right text-sm font-semibold">
                {q}<motion.svg animate={{ rotate: acc === i ? 180 : 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></motion.svg>
              </button>
              <AnimatePresence initial={false}>{acc === i && (
                <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="whitespace-pre-line px-4 pb-3 text-sm leading-7 text-muted">{a}</motion.p>
              )}</AnimatePresence>
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}

// one ownership change: old volume → traded volume → new volume, with exit/entry badge
function TradeCard({ t, title, onClick, i = 0 }) {
  const up = t.dP >= 0, col = up ? 'text-up' : 'text-down'
  return (
                  <motion.div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} whileTap={{ scale: .98 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .04 }} className="num cursor-pointer space-y-2 rounded-2xl border border-line bg-surface2/25 p-3 text-xs transition-colors hover:border-brand/50">
                    <div className="flex items-center justify-between">
                      <b className="min-w-0 text-sm text-brand-light"><Marquee>{title}</Marquee></b>
                      <span className="flex items-center gap-2">
                        {t.tag && <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${t.tag === 'خروج کامل' ? 'bg-down/15 text-down' : 'bg-up/15 text-up'}`}>{t.tag}</span>}
                        <span className="text-muted">{t.d}</span>
                      </span>
                    </div>
                    {/* before → change → after: each value sits under its own label */}
                    <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-1.5 text-center">
                      <div className="rounded-xl bg-surface2/50 px-2 py-2">
                        <div className="text-[10px] text-muted">حجم قدیم</div>
                        <b className="mt-0.5 block text-[13px]" dir="ltr">{bigN(t.oldV)}</b>
                        <div className="text-[10px] text-muted" dir="ltr">{fa(t.oldP, 3)}٪</div>
                      </div>
                      <span className="self-center text-muted">←</span>
                      <div className={`rounded-xl px-2 py-2 ${up ? 'bg-up/10' : 'bg-down/10'}`}>
                        <div className="text-[10px] text-muted">{up ? 'حجم خرید' : 'حجم فروش'}</div>
                        <b className={`mt-0.5 block text-[13px] ${col}`} dir="ltr">{up ? '+' : '−'}{bigN(Math.abs(t.newV - t.oldV))}</b>
                        <div className={`text-[10px] ${col}`} dir="ltr">{up ? '+' : '−'}{fa(Math.abs(t.dP), 3)}٪</div>
                      </div>
                      <span className="self-center text-muted">←</span>
                      <div className="rounded-xl bg-surface2/50 px-2 py-2">
                        <div className="text-[10px] text-muted">حجم جدید</div>
                        <b className="mt-0.5 block text-[13px]" dir="ltr">{bigN(t.newV)}</b>
                        <div className="text-[10px] text-muted" dir="ltr">{fa(t.newP, 3)}٪</div>
                      </div>
                    </div>
                  </motion.div>
  )
}

/* ---------- سابقه سهامداران عمده نماد ---------- */
function historyData(sym) {
  let x = [...sym.s].reduce((a, c) => a * 41 + c.charCodeAt(0), 13) % 2147483647
  const r = () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646
  const names = HOLDER_NAMES
  return Array.from({ length: 14 }, (_, i) => {
    const kind = r(), oldP = kind < .2 ? 0 : +(r() * 40 + .5).toFixed(3)
    const newP = kind > .82 ? 0 : kind < .2 ? +(r() * 3 + .3).toFixed(3) : +Math.max(.01, oldP + (r() - .5) * 2.5).toFixed(3)
    const per = 5e7
    return { name: names[Math.floor(r() * names.length)], oldP, newP, dP: newP - oldP, oldV: oldP * per, newV: newP * per, day: i * 2 + Math.floor(r() * 2),
      d: `۱۴۰۵/۰۸/${fa(Math.max(1, 27 - i * 2)).padStart(2, '۰')}`, tag: newP === 0 ? 'خروج کامل' : oldP === 0 ? 'ورود جدید' : null }
  })
}

function HolderHistory({ sym, close, openSym }) {
  const all = useMemo(() => historyData(sym), [sym])
  const holders = useMemo(() => holdersData(sym).list, [sym])
  const [view, setView] = useState('list')          // 'list' | 'chart' | 'holder'
  const [from, setFrom] = useState('list')          // where the holder page was opened from
  const [holder, setHolder] = useState(null), [hist, setHist] = useState(false)
  const [ctype, setCtype] = useState('line')
  const [sheet, setSheet] = useState(false)
  const [f, setF] = useState({ name: 'all', pct: 'all', type: 'all' })
  const [draft, setDraft] = useState(f)
  const maxAbs = Math.max(...all.map((t) => Math.abs(t.dP)))
  const steps = [1, .66, .5, .33, 0].map((k) => +(maxAbs * k).toFixed(2))
  const list = all.filter((t) => (f.name === 'all' || t.name === f.name) && (f.pct === 'all' || Math.abs(t.dP) >= +f.pct) &&
    (f.type === 'all' || (f.type === 'chg' ? !t.tag : t.tag === f.type)))
  const active = Object.values(f).filter((v) => v !== 'all').length
  const openHolder = (name) => {
    const h = holders.find((x) => x.n === name) || { n: name, p: .5, v: 2e7, d: 0, others: [] }
    setHolder(h); setHist(false); setFrom(view); setView('holder')
  }
  const back = () => (view === 'holder' ? (hist ? setHist(false) : setView(from)) : setView('list'))
  const title = view === 'chart' ? `نمودار سابقه سهامداران ${sym.s}` : view === 'holder' ? (hist ? `سابقه معاملات ${holder.n}` : 'سهامدار عمده') : `سابقه سهامداران ${sym.s}`
  const filterBtn = (compact) => (
    <button onClick={() => { setDraft(f); setSheet(true) }} title="تنظیمات فیلتر" className={compact ? `btn-icon relative ${active ? '!border-brand/60 !text-brand-light' : ''}` : `btn ${active ? 'btn-on' : ''}`}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></svg>
      {!compact && (active ? `فیلتر شده (${fa(active)} مورد)` : 'تنظیمات فیلتر')}
      {compact && active > 0 && <i className="num absolute -left-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-brand text-[9px] not-italic text-white">{fa(active)}</i>}
    </button>
  )
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-3">
        <AnimatePresence initial={false}>{view !== 'list' && (
          <motion.button key="back" onClick={back} title="بازگشت" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 36 }} exit={{ opacity: 0, width: 0 }} className="grid h-9 shrink-0 place-items-center overflow-hidden rounded-xl hover:bg-surface2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </motion.button>
        )}</AnimatePresence>
        <b className="min-w-0 flex-1"><Marquee>{title}</Marquee></b>
        <HoldersHelp items={view === 'holder' ? HOLDERS_HELP : HISTORY_HELP} />
        <button onClick={close} title="بستن" className="grid h-9 w-9 place-items-center rounded-lg text-xl text-muted hover:bg-surface2">×</button>
      </div>
      {view === 'list' && (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          {filterBtn(false)}
          <button onClick={() => setView('chart')} className="btn btn-on">نمایش سابقه روی نمودار <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="m15 6-6 6 6 6" /></svg></button>
        </div>
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={view} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: .18 }} className={`min-h-0 flex-1 ${view === 'list' ? 'scroll-y p-4' : ''}`}>
          {view === 'chart' && <HistoryChart sym={sym} trades={list} type={ctype} setType={setCtype} filter={filterBtn(false)} onPick={openHolder} />}
          {view === 'holder' && <HolderPage h={holder} sym={sym} hist={hist} setHist={setHist} openSym={openSym} />}
          {view === 'list' && (list.length
            ? <div className="space-y-2">{list.map((t, i) => <TradeCard key={i} i={i} t={t} title={t.name} onClick={() => openHolder(t.name)} />)}</div>
            : <Empty text="با این فیلترها معامله‌ای پیدا نشد." />)}
        </motion.div>
      </AnimatePresence>
      <Modal open={sheet} visible title="فیلتر سهامداران عمده" onClose={() => setSheet(false)}
        actions={<>
          <button onClick={() => setDraft({ name: 'all', pct: 'all', type: 'all' })} disabled={!Object.values(draft).some((v) => v !== 'all')} className="h-11 rounded-xl border border-line px-5 text-sm font-semibold text-muted transition-colors hover:text-ink disabled:opacity-40">پاک کردن</button>
          <motion.button whileTap={{ scale: .97 }} onClick={() => { setF(draft); setSheet(false) }} className="h-11 flex-1 rounded-xl bg-gradient-to-l from-brand-light to-brand-dark font-bold text-white shadow-glow">اعمال فیلتر</motion.button>
        </>}>
        <div className="space-y-4 text-sm">
          {[['name', 'نام سهامدار', [['all', 'همه سهامداران'], ...[...new Set(all.map((t) => t.name))].map((n) => [n, n])]],
            ['pct', 'درصد معامله', [['all', 'همه'], ...steps.map((v) => [String(v), `بزرگتر از ${fa(v, 2)}٪`])]],
            ['type', 'نوع تغییر', [['all', 'همه'], ['ورود جدید', 'ورود جدید'], ['خروج کامل', 'خروج کامل'], ['chg', 'افزایش یا کاهش درصد']]]].map(([k, label, opts], i) => (
            <label key={k} className="block" style={{ position: 'relative', zIndex: 3 - i }}>
              <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span>
              <div className="[&_.btn]:h-11 [&_.btn]:w-full [&_.btn]:text-sm [&>div>div]:w-full"><Dropdown value={draft[k]} options={opts} onChange={(v) => setDraft({ ...draft, [k]: v })} /></div>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  )
}

// full-height price chart (line/candle) with volume; trade dots: green = buy, red = sell. Click a dot to open that holder.
const H_RANGES = [['۱ ماه', 22], ['۲ ماه', 44], ['۳ ماه', 66], ['۶ ماه', 130], ['۹ ماه', 195], ['۱ سال', 260], ['۲ سال', 320]]
function HistoryChart({ sym, trades, type, setType, filter, onPick }) {
  const [range, setRange] = useState('۱ ماه')
  const n = H_RANGES.find((r) => r[0] === range)[1]
  const bars = useMemo(() => makeBars(sym, 86400).slice(-n), [sym, n])
  const box = useRef(null); const [W, setW] = useState(480), [H, setH] = useState(500)
  useEffect(() => { const ro = new ResizeObserver(([e]) => { setW(e.contentRect.width); setH(e.contentRect.height) }); ro.observe(box.current); return () => ro.disconnect() }, [])
  const [hover, setHover] = useState(null)
  const [cross, setCross] = useState(null)   // index of the bar under the mouse
  const pl = 8, pr = 52, pt = 14, pb = 34, volH = (H - pt - pb) * .16
  const lo = Math.min(...bars.map((b) => b.low)), hi = Math.max(...bars.map((b) => b.high)), pad = (hi - lo) * .06
  const step = (W - pl - pr) / bars.length, X = (i) => pl + i * step + step / 2
  const Y = (v) => pt + (1 - (v - lo + pad) / (hi - lo + 2 * pad)) * (H - pt - pb - volH - 6)
  const vmax = Math.max(...bars.map((b) => b.volume))
  const idx = (t) => Math.min(bars.length - 1, Math.max(0, bars.length - 1 - t.day))
  const line = bars.map((b, i) => `${i ? 'L' : 'M'}${X(i)},${Y(b.close)}`).join('')
  const ticks = bars.map((_, i) => i).filter((i) => i % Math.ceil(bars.length / 6) === 0)
  const hv = hover != null ? trades[hover] : null
  const ci = hv ? idx(hv) : cross
  const icon = (t) => t === 'line'
    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18" /><path d="m7 15 4-5 3 3 5-6" /></svg>
    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 3v4M7 17v4M17 3v6M17 17v4" /><rect x="5" y="7" width="4" height="10" rx="1" /><rect x="15" y="9" width="4" height="8" rx="1" /></svg>
  return (
    <div className="flex h-full flex-col">
      {/* toolbar under the app bar: filter · chart type · period */}
      <div className="relative z-20 flex shrink-0 items-center gap-2 border-b border-line px-4 py-2.5">
        {filter}
        <div className="seg">{[['line', 'خطی'], ['candle', 'شمعی']].map(([k, t]) => (
          <button key={k} onClick={() => setType(k)} className="seg-item">
            {type === k && <motion.span layoutId="hc-type" className="absolute inset-0 rounded-[10px] bg-brand/15 ring-1 ring-brand/50" />}
            <span className={`relative flex items-center gap-1 ${type === k ? 'font-bold text-brand-light' : ''}`}>{icon(k)}{t}</span>
          </button>
        ))}</div>
        <div className="flex-1" />
        <div className="[&>div>div]:left-0 [&>div>div]:right-auto"><Dropdown value={range} options={H_RANGES.map(([t]) => [t, t])} onChange={setRange} /></div>
      </div>
      <div ref={box} className="relative min-h-0 flex-1" dir="ltr" onMouseLeave={() => setCross(null)}
        onMouseMove={(e) => { const r = box.current.getBoundingClientRect(); const i = Math.floor((e.clientX - r.left - pl) / step); setCross(i >= 0 && i < bars.length ? i : null) }}>
        <svg width={W} height={H} className="absolute inset-0">
          {[0, .25, .5, .75, 1].map((k) => { const v = lo + (hi - lo) * k; return <g key={k}><line x1={pl} x2={W - pr} y1={Y(v)} y2={Y(v)} stroke="rgb(var(--line))" strokeDasharray="3 4" /><text x={W - pr + 6} y={Y(v) + 4} fontSize="10" fill="rgb(var(--muted))">{fa(Math.round(v))}</text></g> })}
          {ticks.map((i) => <g key={i}><line x1={X(i)} x2={X(i)} y1={pt} y2={H - pb} stroke="rgb(var(--line))" strokeDasharray="3 4" opacity=".6" />
            <text x={X(i)} y={H - pb + 16} fontSize="10" textAnchor="end" fill="rgb(var(--muted))" transform={`rotate(-30 ${X(i)} ${H - pb + 16})`}>{new Date(bars[i].time * 1000).toLocaleDateString('fa-IR-u-ca-persian', { year: '2-digit', month: '2-digit', day: '2-digit' })}</text></g>)}
          <line x1={W - pr} x2={W - pr} y1={pt} y2={H - pb} stroke="rgb(var(--muted))" opacity=".5" />
          {bars.map((b, i) => { const h = b.volume / vmax * volH; return <rect key={'v' + i} x={X(i) - step * .32} width={step * .64} y={H - pb - h} height={h} fill={b.close >= b.open ? 'rgb(var(--up))' : 'rgb(var(--down))'} opacity=".55" /> })}
          {type === 'line'
            ? <motion.path key={range} d={line} fill="none" stroke="#3C7CFF" strokeWidth="2.5" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .8 }} />
            : bars.map((b, i) => { const c = b.close >= b.open ? 'rgb(var(--up))' : 'rgb(var(--down))'; return <g key={i}><line x1={X(i)} x2={X(i)} y1={Y(b.high)} y2={Y(b.low)} stroke={c} /><rect x={X(i) - step * .32} width={step * .64} y={Y(Math.max(b.open, b.close))} height={Math.max(1, Math.abs(Y(b.open) - Y(b.close)))} fill={c} /></g> })}
          {ci != null && <g pointerEvents="none">
            <line x1={X(ci)} x2={X(ci)} y1={pt} y2={H - pb} stroke="rgba(240,80,110,.75)" />
            <line x1={pl} x2={W - pr} y1={Y(bars[ci].close)} y2={Y(bars[ci].close)} stroke="rgba(240,80,110,.75)" />
            <rect x={W - pr + 2} y={Y(bars[ci].close) - 9} width={pr - 4} height="18" rx="5" fill="rgb(var(--down))" />
            <text x={W - pr + pr / 2} y={Y(bars[ci].close) + 4} fontSize="10" fontWeight="700" textAnchor="middle" fill="#fff">{fa(Math.round(bars[ci].close))}</text>
          </g>}
          {trades.map((t, k) => { const i = idx(t); if (t.day >= bars.length) return null; const up = t.dP >= 0, x = X(i), y = Y(bars[i].close) + (up ? 14 : -14)
            return <motion.circle key={k} cx={x} cy={y} initial={{ r: 0 }} animate={{ r: hover === k ? 9 : 6 }} fill={up ? 'rgb(var(--up))' : 'rgb(var(--down))'} stroke="rgb(var(--ink))" strokeWidth="2"
              onMouseEnter={() => setHover(k)} onMouseLeave={() => setHover(null)} onClick={() => onPick(t.name)} className="cursor-pointer" /> })}
        </svg>
        <AnimatePresence>{ci != null && (() => { const b = bars[ci], x = X(ci); return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .1 }} style={{ left: x > W / 2 ? x - (hv ? 228 : 150) : x + 14, top: Math.min(H - (hv ? 190 : 150), Math.max(8, Y(b.close) + 14)) }}
            className={`num pointer-events-none absolute z-10 rounded-xl border bg-surface2/95 p-2.5 text-[11px] shadow-2xl backdrop-blur ${hv ? 'w-52 border-brand/40' : 'w-36 border-line'}`} dir="rtl">
            <div className="mb-1 border-b border-line pb-1 text-center font-bold text-brand-light">{new Date(b.time * 1000).toLocaleDateString('fa-IR-u-ca-persian', { year: '2-digit', month: '2-digit', day: '2-digit' })}</div>
            {(type === 'line' || hv ? [['قیمت', b.close], ['حجم', b.volume]] : [['اولین', b.open], ['آخرین', b.close], ['بیشترین', b.high], ['کمترین', b.low], ['حجم', b.volume]]).map(([k, v]) => (
              <div key={k} className="flex justify-between py-0.5"><span className="text-muted">{k}:</span><b>{fa(Math.round(v))}</b></div>
            ))}
            {hv && <div className="mt-1 space-y-1 border-t border-line pt-1.5">
              <b className="block text-[12px] leading-5">{hv.name}</b>
              <div className="flex justify-between"><span className="text-muted">درصد {hv.dP >= 0 ? 'خرید' : 'فروش'}:</span><b className={hv.dP >= 0 ? 'text-up' : 'text-down'} dir="ltr">{hv.dP >= 0 ? '+' : '−'}{fa(Math.abs(hv.dP), 3)}٪</b></div>
              {hv.tag && <div className={`text-[10px] font-bold ${hv.tag === 'خروج کامل' ? 'text-down' : 'text-up'}`}>{hv.tag}</div>}
              <div className="text-[10px] text-muted">برای دیدن سهامدار کلیک کنید</div>
            </div>}
          </motion.div>) })()}</AnimatePresence>
      </div>
    </div>
  )
}
