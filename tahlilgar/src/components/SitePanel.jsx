import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Star, Notification, EditSquare, Search, TwoUsers, Discovery, Category, InfoCircle, Graph, TimeCircle, People, Work, Chart, Paper, Activity, Chat, Show } from 'react-iconly'
import TVChart from './TVChart'
import SymbolDetails from './SymbolDetails'
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
        <Card title="دفتر سفارش" actions={<><Pill on={rows} onClick={() => setRows(!rows)}>☰ ردیف‌های عرضه و تقاضا</Pill><Pill on={cum} onClick={() => setCum(!cum)}>{ico(Show, 14)} نمودار تجمعی</Pill></>}>
          <OrderBook d={d} prev={d.prev} rows={rows} cum={cum} />
        </Card>
        <div className="space-y-4">
          <Card title="دامنه قیمت امروز"><Range sym={sym} d={d} /></Card>
          <Card title="اطلاعات بنیادی" actions={['TSETMC', 'پیام ناظر', 'کدال'].map((t) => <a key={t} href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-1 rounded-lg bg-brand/15 px-2.5 py-1 text-xs font-semibold text-brand-light hover:bg-brand/25">↗ {t}</a>)}>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line/60">
              {d.fundamentals.map(([k, v]) => <div key={k} className="flex justify-between bg-surface px-3 py-2.5 text-sm"><dt className="text-muted">{k}</dt><dd className="num font-bold">{v}</dd></div>)}
            </dl>
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
      <div><h3 className="mb-3 font-bold">عملکرد مالی</h3><SymbolDetails sym={sym} /></div>
    </>
  )
}

function OrderBook({ d, prev, rows, cum }) {
  const book = rows ? d.book : d.book.slice(0, 3)
  let cb = 0, ca = 0
  const data = book.map((r) => ({ ...r, cb: (cb += r.bq), ca: (ca += r.aq) }))
  const mx = Math.max(...data.flatMap((r) => cum ? [r.cb, r.ca] : [r.bq, r.aq]))
  const pc = (p) => ((p - prev) / prev) * 100
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[480px] grid-cols-2 text-center text-sm font-bold"><div className="border-b-2 border-up pb-2 text-up">تقاضا</div><div className="border-b-2 border-down pb-2 text-down">عرضه</div></div>
      <table className="num w-full min-w-[480px] text-center text-xs">
        <thead className="text-muted"><tr>{['تعداد', 'حجم', 'قیمت', 'قیمت', 'حجم', 'تعداد'].map((h, i) => <th key={i} className="py-2.5 font-normal">{h}</th>)}</tr></thead>
        <tbody>
          {data.map((r, i) => (
            <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * .04 }} className="border-t border-line/40">
              <td className="py-2">{fa(r.bn)}</td>
              <td className="relative"><motion.span initial={{ width: 0 }} animate={{ width: `${((cum ? r.cb : r.bq) / mx) * 100}%` }} className="absolute inset-y-1 right-0 rounded bg-up/20" /><span className="relative">{fa(r.bq / 1000, 1)} هزار</span></td>
              <td><b>{fa(r.bp)}</b><div className="text-[10px] text-up">{fa(pc(r.bp), 2)}٪</div></td>
              <td><b>{fa(r.ap)}</b><div className="text-[10px] text-down">{fa(pc(r.ap), 2)}٪</div></td>
              <td className="relative"><motion.span initial={{ width: 0 }} animate={{ width: `${((cum ? r.ca : r.aq) / mx) * 100}%` }} className="absolute inset-y-1 left-0 rounded bg-down/20" /><span className="relative">{fa(r.aq / 1000, 1)} هزار</span></td>
              <td>{fa(r.an)}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 border-t border-dashed border-line pt-2 text-center text-[11px] text-muted">جمع سفارش‌ها</div>
      <div className="num mt-2 grid min-w-[480px] grid-cols-2 overflow-hidden rounded-xl text-sm font-bold">
        <div className="flex justify-between bg-up/10 px-4 py-2.5 text-up"><span>{fa(data.reduce((a, r) => a + r.bn, 0))}</span><span>{fa(data.at(-1).cb)}</span></div>
        <div className="flex justify-between bg-down/10 px-4 py-2.5 text-down"><span>{fa(data.at(-1).ca)}</span><span>{fa(data.reduce((a, r) => a + r.an, 0))}</span></div>
      </div>
    </div>
  )
}

function Range({ sym, d }) {
  const span = d.limHi - d.limLo, pos = (v) => ((v - d.limLo) / span) * 100
  return (
    <div className="flex items-stretch gap-3">
      <div className="flex w-5 flex-col items-center"><span className="w-1.5 flex-1 rounded-full bg-up" /><span className="mt-1 [writing-mode:vertical-rl] text-[10px] text-muted">کندل صعودی</span></div>
      <div className="flex-1 py-2">
        <div className="num flex justify-between text-xs text-muted"><span>{fa(d.limHi)}</span><span>دیروز {fa(d.prev)}</span><span>{fa(d.limLo)}</span></div>
        <div className="relative my-4 h-2 rounded-full bg-surface2" dir="ltr">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pos(d.high) - pos(d.low)}%` }} transition={{ duration: .8 }} style={{ left: `${pos(d.low)}%` }} className="absolute h-full rounded-full bg-gradient-to-r from-down via-amber-400 to-up" />
          <span className="absolute -top-1 h-4 w-0.5 bg-muted" style={{ left: `${pos(d.prev)}%` }} />
          <motion.span initial={{ left: '50%' }} animate={{ left: `${pos(sym.p)}%` }} transition={{ type: 'spring', stiffness: 120 }} className="absolute -top-1.5 h-5 w-5 -translate-x-1/2 rounded-full border-4 border-surface bg-brand shadow-glow" />
        </div>
        <div className="num flex justify-between text-xs">
          <span>بیشترین <b className="text-up">{fa(d.high)}</b></span><span>آخرین <b>{fa(sym.p)}</b></span><span>کمترین <b className="text-down">{fa(d.low)}</b></span>
        </div>
      </div>
      <div className="flex w-5 flex-col items-center"><span className="w-1.5 flex-1 rounded-full bg-surface2"><span className="block h-1/2 rounded-full bg-brand" /></span><span className="mt-1 [writing-mode:vertical-rl] text-[10px] text-muted">۵۰٪ حجم مبنا</span></div>
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
