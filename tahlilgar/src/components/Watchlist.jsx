// دیده‌بان و پرتفوی: جدول، حالت تابلو، جابجایی ردیف‌ها، چند دیده‌بان، افزودن نماد، تنظیمات
import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { SYMBOLS, fa } from '../data/market'
import { symbolData } from '../data/symbol'
import { useSort, SortHead } from './sort'
import { Modal, Dropdown } from './SitePanel'

const big = (n) => (n >= 1e9 ? fa(n / 1e9, 1) + ' B' : n >= 1e6 ? fa(n / 1e6, 1) + ' M' : n >= 1e3 ? fa(n / 1e3, 1) + ' K' : fa(n))
const sgn = (v, d = 2) => `${v >= 0 ? '+' : '−'}${fa(Math.abs(v), d)}٪`
const Pct = ({ v, d = 2, className = '' }) => <span className={`num ${v >= 0 ? 'text-up' : 'text-down'} ${className}`} dir="ltr">({sgn(v, d)})</span>
const I = {
  move: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" /></svg>,
  gear: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></svg>,
  grip: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 8h14M5 12h14M5 16h14" /></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>,
  edit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4Z" /></svg>,
  trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>,
  star: (on) => <svg width="16" height="16" viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" /></svg>,
  chev: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m15 6-6 6 6 6" /></svg>,
  play: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M10 8.5v7l5.5-3.5Z" fill="currentColor" /></svg>,
  list: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>,
  board: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="18" height="7" rx="2" /></svg>,
  swap: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" /></svg>,
}

// per-symbol numbers the watchlist needs (deterministic sample data)
function rowData(x) {
  const d = symbolData(x)
  const seed = [...x.s].reduce((a, c) => a + c.charCodeAt(0), 0)
  const vol = Number(String(d.stats[0][1]).replace(/[^\d۰-۹٫.]/g, '').replace(/[۰-۹]/g, (c) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace('٫', '.')) * 1e6 || (seed % 200) * 1e6
  const avg = vol * (.6 + (seed % 9) / 10)
  const m1 = (x.spark.at(-1).v - x.spark[0].v) / x.spark[0].v * 100
  const close = Math.round(x.p * (1 - x.c / 300))
  return { ...x, d, vol, avg, m1, close, closeP: (close - d.prev) / d.prev * 100 }
}

function Spark({ data, up }) {
  const vs = data.map((p) => p.v), lo = Math.min(...vs), hi = Math.max(...vs), W = 84, H = 26
  const pts = vs.map((v, i) => [i / (vs.length - 1) * W, H - 2 - (v - lo) / (hi - lo || 1) * (H - 4)])
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join('')
  const col = up ? 'rgb(var(--up))' : 'rgb(var(--down))'
  return (
    <svg width={W} height={H} className="block" style={{ direction: 'ltr' }}>
      <path d={`${line}L${W},${H}L0,${H}Z`} fill={col} opacity=".15" />
      <path d={line} fill="none" stroke={col} strokeWidth="1.5" />
    </svg>
  )
}

function Toggle({ on, set, label }) {
  return (
    <button onClick={() => set(!on)} className="flex items-center gap-2 text-xs text-muted" role="switch" aria-checked={on}>
      {label}
      <span className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${on ? 'justify-end bg-brand' : 'justify-start bg-line'}`}><motion.span layout className="h-4 w-4 rounded-full bg-white shadow" /></span>
    </button>
  )
}

/* ---------------- small centered dialog for name prompts and confirmations ---------------- */
function Dialog({ open, title, text, input, value, setValue, placeholder, okText = 'ذخیره', danger, onOk, onCancel }) {
  return (
    <AnimatePresence>{open && (
      <div className="fixed inset-0 z-[80] grid place-items-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-black/50" />
        <motion.div data-overlay role="alertdialog" aria-label={title} initial={{ scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .92, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className="relative w-full max-w-xs overflow-hidden rounded-2xl border border-line bg-surface text-center shadow-2xl">
          <div className="space-y-3 px-5 pb-4 pt-5">
            <h4 className="font-bold">{title}</h4>
            {text && <p className="text-sm text-muted">{text}</p>}
            {input && <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && value.trim() && onOk()} placeholder={placeholder}
              className="h-11 w-full rounded-xl border border-line bg-surface2/60 px-3 text-sm outline-none focus:border-brand/60" />}
          </div>
          <div className="grid grid-cols-2 border-t border-line text-sm font-semibold">
            <button onClick={onOk} disabled={input && !value.trim()} className={`border-l border-line py-3 transition-colors hover:bg-surface2 disabled:opacity-40 ${danger ? 'text-down' : 'text-brand-light'}`}>{okText}</button>
            <button onClick={onCancel} className="py-3 transition-colors hover:bg-surface2">انصراف</button>
          </div>
        </motion.div>
      </div>
    )}</AnimatePresence>
  )
}

/* ---------------- one table row (with drag handle in reorder mode) ---------------- */
function Row({ r, cols, active, reorder, onPick }) {
  const controls = useDragControls()
  const body = (
    <div onClick={() => !reorder && onPick(r)} style={{ gridTemplateColumns: cols }} className={`grid items-center gap-2 border-b border-line/60 px-3 py-2.5 text-xs transition-colors ${reorder ? 'bg-surface' : 'cursor-pointer hover:bg-surface2/50'} ${active ? 'bg-brand/10' : ''}`}>
      <span className="flex min-w-0 items-center gap-1.5">
        {reorder && <span onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none text-muted active:cursor-grabbing" title="جابجایی">{I.grip}</span>}
        <i className={`h-2 w-2 shrink-0 rounded-sm ${r.c >= 0 ? 'bg-up' : 'bg-down'}`} />
        <b className="truncate text-sm">{r.s}</b>
      </span>
      <span className="num text-center leading-5"><span className="block font-semibold">{fa(r.p)}</span><Pct v={r.c} className="text-[10px]" /></span>
      <span className="num overflow-hidden text-center leading-5 text-muted" dir="ltr"><span className="block text-ink">{big(r.vol)}</span>{big(r.avg)}</span>
      {cols.endsWith('84px') && <span className="flex flex-col items-center"><Spark data={r.spark} up={r.m1 >= 0} /><span className={`num text-[10px] ${r.m1 >= 0 ? 'text-up' : 'text-down'}`} dir="ltr">{sgn(r.m1)}</span></span>}
    </div>
  )
  return reorder
    ? <Reorder.Item value={r.s} dragListener={false} dragControls={controls} className="relative" whileDrag={{ scale: 1.02, boxShadow: '0 12px 30px -10px rgba(0,0,0,.5)', zIndex: 5 }}>{body}</Reorder.Item>
    : body
}

/* ---------------- tablo (board) card ---------------- */
function Board({ r, fav, toggleFav, onPick, active }) {
  const { d } = r, span = d.limHi - d.limLo, pos = (v) => Math.min(100, Math.max(0, (v - d.limLo) / span * 100))
  const b = d.book[0], mx = Math.max(b.bq, b.aq)
  return (
    <motion.div layout onClick={() => onPick(r)} className={`cursor-pointer overflow-hidden rounded-2xl border bg-surface2/25 text-xs transition-colors hover:border-brand/40 ${active ? 'border-brand/50' : 'border-line'}`}>
      <div className="flex items-center gap-2 px-3 pt-3">
        <span className="flex w-16 shrink-0 items-center gap-1.5"><i className={`h-2 w-2 rounded-sm ${r.c >= 0 ? 'bg-up' : 'bg-down'}`} /><b className="truncate text-sm">{r.s}</b></span>
        <div className="min-w-0 flex-1">
          <div className="num flex items-center justify-center gap-1.5"><span className="text-[10px]">▼</span><b className="text-sm">{fa(r.p)}</b><Pct v={r.c} className="text-[10px]" /></div>
          <div className="relative my-1.5 h-1.5 rounded-full bg-line" dir="ltr">
            <span className="absolute inset-y-0 rounded-full bg-down" style={{ left: `${pos(d.low)}%`, width: `${Math.max(0, pos(d.prev) - pos(d.low))}%` }} />
            <span className="absolute inset-y-0 rounded-full bg-up" style={{ left: `${pos(d.prev)}%`, width: `${Math.max(0, pos(d.high) - pos(d.prev))}%` }} />
            <span className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-down" style={{ left: `${pos(d.low)}%` }} />
            <span className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-up" style={{ left: `${pos(d.high)}%` }} />
          </div>
          <div className="num flex items-center justify-center gap-1.5 text-muted"><span className="text-[10px]">▲</span><span className="text-ink">{fa(r.close)}</span><Pct v={r.closeP} className="text-[10px]" /></div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); toggleFav() }} className={fav ? 'text-amber-400' : 'text-muted hover:text-ink'} title="حذف از دیده‌بان">{I.star(fav)}</button>
      </div>
      <div className="num mx-3 mt-2 grid grid-cols-6 items-center gap-1 border-t border-line/60 py-2 text-center text-[11px]">
        <span className="text-muted">{fa(b.bn)}</span>
        <span className="relative"><span className="absolute inset-y-0 right-0 rounded bg-up/20" style={{ width: `${b.bq / mx * 100}%` }} /><span className="relative">{big(b.bq)}</span></span>
        <span className="border-l border-line leading-4"><b>{fa(b.bp)}</b></span>
        <span className="leading-4"><b>{fa(b.ap)}</b></span>
        <span className="relative"><span className="absolute inset-y-0 left-0 rounded bg-down/20" style={{ width: `${b.aq / mx * 100}%` }} /><span className="relative">{big(b.aq)}</span></span>
        <span className="text-muted">{fa(b.an)}</span>
      </div>
      <div className="num flex justify-between bg-brand/5 px-3 py-1.5 text-[11px] text-muted">
        <span>حجم: <b className="text-ink" dir="ltr">{big(r.vol)}</b></span>
        <span className="flex items-center gap-1">مبنا: <b className="text-ink">{fa(1)}</b><i className="grid h-3.5 w-3.5 place-items-center rounded-full bg-brand text-[8px] not-italic text-white">✓</i></span>
        <span>میانگین: <b className="text-ink" dir="ltr">{big(r.avg)}</b></span>
      </div>
    </motion.div>
  )
}

/* ---------------- portfolio ---------------- */
const HOLD = { 'فولاد': [42000, 5810], 'شستا': [120000, 1295], 'خودرو': [60000, 3050], 'فارس': [8000, 10600], 'فملی': [15000, 6600], 'کگل': [20000, 4800], 'وبملت': [50000, 3400], 'شپنا': [6000, 8100], 'خساپا': [30000, 2500], 'رمپنا': [9000, 5900] }
const FEE = 0.00575
function Portfolio({ sym, onPick, items, setItems, reorder, settings }) {
  const [period, setPeriod] = useState('day')     // day | total
  const [unit, setUnit] = useState('pct')         // pct | amt
  const rows = useMemo(() => {
    const r = items.map((s) => SYMBOLS.find((x) => x.s === s)).filter(Boolean).map((x) => {
      const [q, avg] = HOLD[x.s] || [10000, x.p * .9]
      const price = settings.by === 'close' ? Math.round(x.p * (1 - x.c / 300)) : x.p
      const val = q * price * (settings.fee ? 1 - FEE : 1), cost = q * avg
      return { ...x, q, avg, price, val, plAmt: val - cost, pl: (val - cost) / cost * 100, dayAmt: val * x.c / (100 + x.c) }
    })
    const tot = r.reduce((a, x) => a + x.val, 0)
    return r.map((x) => ({ ...x, w: x.val / tot * 100 }))
  }, [items, settings])
  const [sorted, st, toggle] = useSort(rows, { s: (x) => x.s, p: (x) => x.c, pl: (x) => x.pl, w: (x) => x.w })
  const total = rows.reduce((a, x) => a + x.val, 0)
  const dayAmt = rows.reduce((a, x) => a + x.dayAmt, 0), allAmt = rows.reduce((a, x) => a + x.plAmt, 0), cost = rows.reduce((a, x) => a + x.q * x.avg, 0)
  const [amt, pct] = period === 'day' ? [dayAmt, dayAmt / (total - dayAmt) * 100] : [allAmt, allAmt / cost * 100]
  const cols = reorder ? 'grid-cols-[1fr_92px_64px_56px]' : 'grid-cols-[1fr_92px_64px_60px_14px]'
  const amtCell = (a, p, up) => unit === 'amt'
    ? <span className="num text-center leading-5" dir="ltr"><span className={`block font-semibold ${up == null ? '' : up ? 'text-up' : 'text-down'}`}>{big(Math.abs(a))}</span><span className={`text-[10px] ${up == null ? 'text-muted' : up ? 'text-up' : 'text-down'}`}>{up == null ? fa(p, 2) + '٪' : sgn(p)}</span></span>
    : <span className={`num text-center font-semibold ${up == null ? 'text-muted' : up ? 'text-up' : 'text-down'}`} dir="ltr">{up == null ? fa(p, 2) + '٪' : sgn(p)}</span>
  const PRow = ({ x }) => {
    const controls = useDragControls()
    const body = (
      <div onClick={() => !reorder && onPick(x)} className={`grid items-center gap-2 border-b border-line/60 px-3 py-2.5 text-xs transition-colors ${cols} ${reorder ? 'bg-surface' : 'cursor-pointer hover:bg-surface2/50'} ${!reorder && sym.s === x.s ? 'bg-brand/10' : ''}`}>
        <span className="flex items-center gap-1.5">{reorder && <span onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none text-muted">{I.grip}</span>}<i className={`h-2 w-2 rounded-sm ${x.c >= 0 ? 'bg-up' : 'bg-down'}`} /><b className="text-sm">{x.s}</b></span>
        <span className="num text-center leading-5"><span className="block font-semibold">{fa(x.price)}</span><Pct v={x.c} className="text-[10px]" /></span>
        {amtCell(x.plAmt, x.pl, x.pl >= 0)}
        {amtCell(x.val, x.w, null)}
        {!reorder && <span className="text-muted">{I.chev}</span>}
      </div>
    )
    return reorder ? <Reorder.Item value={x.s} dragListener={false} dragControls={controls} whileDrag={{ scale: 1.02, zIndex: 5, boxShadow: '0 12px 30px -10px rgba(0,0,0,.5)' }}>{body}</Reorder.Item> : body
  }
  return (
    <>
      <div className="num flex items-center gap-1 border-b border-line px-3 py-1.5 text-xs text-muted">
        <button onClick={() => setPeriod(period === 'day' ? 'total' : 'day')} title="تغییر بازه بازده" className="flex items-center gap-1 rounded-lg px-1.5 py-1 hover:bg-surface2">
          {period === 'day' ? 'بازده روز' : 'بازده کلی'}: <b className={amt >= 0 ? 'text-up' : 'text-down'} dir="ltr">{amt >= 0 ? '+' : '−'}{big(Math.abs(amt))} ({sgn(pct)})</b><span className="text-muted">{I.chev}</span>
        </button>
        <span className="flex-1" />
        <button onClick={() => setUnit(unit === 'pct' ? 'amt' : 'pct')} title={unit === 'pct' ? 'نمایش مبلغ' : 'نمایش درصد'} className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${unit === 'amt' ? 'bg-brand/15 text-brand-light' : 'text-muted hover:bg-surface2 hover:text-ink'}`}>{I.swap}</button>
        {settings.toolbar}
      </div>
      <div className={`sticky top-0 z-10 grid items-center gap-2 border-b border-line bg-surface2 px-3 py-2 text-[11px] text-muted ${cols}`}>
        <SortHead label="نماد" k="s" s={reorder ? null : st} toggle={reorder ? () => {} : toggle} align="start" /><SortHead label="آخرین قیمت" k="p" s={reorder ? null : st} toggle={reorder ? () => {} : toggle} />
        <SortHead label="سود / زیان" k="pl" s={reorder ? null : st} toggle={reorder ? () => {} : toggle} /><SortHead label="٪ از پرتفوی" k="w" s={reorder ? null : st} toggle={reorder ? () => {} : toggle} />{!reorder && <span />}
      </div>
      {reorder
        ? <Reorder.Group axis="y" values={items} onReorder={setItems}>{items.map((s) => { const x = rows.find((r) => r.s === s); return x && <PRow key={s} x={x} /> })}</Reorder.Group>
        : sorted.map((x) => <PRow key={x.s} x={x} />)}
      {!rows.length && <p className="px-4 py-10 text-center text-sm text-muted">این پرتفوی هنوز نمادی ندارد.</p>}
    </>
  )
}

/* ---------------- main ---------------- */
export default function Watchlist({ sym, setSym, initial = 'watch' }) {
  const [sub, setSub] = useState(initial)
  useEffect(() => setSub(initial), [initial])
  const [lists, setLists] = useState([
    { id: 'd', name: 'دیده‌بان پیش‌فرض', items: SYMBOLS.slice(0, 8).map((x) => x.s), fixed: true },
    { id: 't', name: 'تست', items: ['شستا'] },
  ])
  const [cur, setCur] = useState('d')
  const [plists, setPlists] = useState([{ id: 'p', name: 'پرتفوی پیش‌فرض', items: Object.keys(HOLD), fixed: true }])
  const [pcur, setPcur] = useState('p')
  const [pset, setPset] = useState({ fee: false, by: 'last' })
  const plist = plists.find((l) => l.id === pcur) || plists[0]
  const setPItems = (items) => setPlists((ls) => ls.map((l) => (l.id === plist.id ? { ...l, items } : l)))
  const [board, setBoard] = useState(false)
  const [reorder, setReorder] = useState(false)
  const [toast, setToast] = useState(null)
  const say = (m) => { setToast(m); clearTimeout(say.t); say.t = setTimeout(() => setToast(null), 2600) }
  const [del, setDel] = useState(null)   // symbol waiting for remove confirmation
  const [opts, setOpts] = useState({ chart: true, vol: true })
  const [sheet, setSheet] = useState(null) // 'lists' | 'add' | 'settings'
  const list = lists.find((l) => l.id === cur) || lists[0]
  const rows = useMemo(() => list.items.map((s) => SYMBOLS.find((x) => x.s === s)).filter(Boolean).map(rowData), [list.items])
  const [sorted, st, toggle] = useSort(rows, { s: (r) => r.s, p: (r) => r.c, v: (r) => r.vol, m: (r) => r.m1 })
  const setItems = (items) => setLists((ls) => ls.map((l) => (l.id === list.id ? { ...l, items } : l)))
  const showChart = opts.chart && !reorder
  // inline template: dynamic Tailwind class names would not be generated at build time
  const cols = ['minmax(0,1fr)', '78px', opts.vol ? '70px' : '0px', showChart ? '84px' : null].filter(Boolean).join(' ')
  const startReorder = () => { const on = !reorder; setReorder(on); setBoard(false);  }

  return (
    <div className="flex h-full flex-col">
      {/* sub tabs */}
      <div className="grid shrink-0 grid-cols-2 border-b border-line">
        {[['watch', 'دیده‌بان'], ['port', 'پرتفوی']].map(([k, t]) => (
          <button key={k} onClick={() => { setSub(k); setReorder(false) }} className={`relative py-2.5 text-sm ${sub === k ? 'font-bold text-ink' : 'text-muted hover:text-ink'}`}>
            {t}{sub === k && <motion.span layoutId="wl-sub" className="absolute inset-x-8 -bottom-px h-0.5 rounded-full bg-brand-light" />}
          </button>
        ))}
      </div>

      {sub === 'watch' ? (
        <>
          {/* toolbar: view switch on one side, row tools on the other; reorder mode replaces it with a clear "done" bar */}
          <AnimatePresence mode="wait" initial={false}>
            {reorder ? (
              <motion.div key="re" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex shrink-0 items-center gap-2 border-b border-brand/40 bg-brand/10 px-3 py-2 text-xs">
                <span className="text-brand-light">{I.move}</span><span className="flex-1">ردیف‌ها را با دستگیره بکشید و جابجا کنید</span>
                <button onClick={startReorder} className="btn btn-on !h-7">پایان</button>
              </motion.div>
            ) : (
              <motion.div key="tb" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="flex shrink-0 items-center gap-1 border-b border-line px-3 py-2">
                <div className="seg !h-8">{[[false, 'جدول', I.list], [true, 'تابلو', I.board]].map(([k, t, ic]) => (
                  <button key={t} onClick={() => setBoard(k)} className="seg-item !px-2.5">
                    {board === k && <motion.span layoutId="wl-view" className="absolute inset-0 rounded-[10px] bg-brand/15 ring-1 ring-brand/50" />}
                    <span className={`relative flex items-center gap-1 ${board === k ? 'font-bold text-brand-light' : ''}`}>{ic}{t}</span>
                  </button>
                ))}</div>
                <span className="flex-1" />
                {!board && <button onClick={startReorder} title="جابجایی ردیف‌ها" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-ink">{I.move}</button>}
                <button onClick={() => setSheet('settings')} title="تنظیمات ستون‌ها" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-ink">{I.gear}</button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="scroll-y min-h-0 flex-1">
            {board ? (
              <div className="space-y-2.5 p-3">{sorted.map((r) => <Board key={r.s} r={r} active={sym.s === r.s} onPick={setSym} fav toggleFav={() => setDel(r.s)} />)}</div>
            ) : (
              <>
                <div style={{ gridTemplateColumns: cols }} className="sticky top-0 z-10 grid items-center gap-2 border-b border-line bg-surface2 px-3 py-2 text-[11px] text-muted">
                  <SortHead label="نماد" k="s" s={reorder ? null : st} toggle={reorder ? () => {} : toggle} align="start" />
                  <SortHead label="آخرین قیمت" k="p" s={reorder ? null : st} toggle={reorder ? () => {} : toggle} />
                  {opts.vol ? <SortHead label={<span className="leading-4">حجم معامله<br />م. حجم ۱ ماهه</span>} k="v" s={reorder ? null : st} toggle={reorder ? () => {} : toggle} /> : <span />}
                  {showChart && <SortHead label={<span className="leading-4">نمودار ۱ ماهه<br />(تقویمی)</span>} k="m" s={st} toggle={toggle} />}
                </div>
                {reorder ? (
                  <Reorder.Group axis="y" values={list.items} onReorder={setItems}>
                    {list.items.map((s) => { const r = rows.find((x) => x.s === s); return r && <Row key={s} r={r} cols={cols} reorder active={false} onPick={setSym} /> })}
                  </Reorder.Group>
                ) : sorted.map((r) => <Row key={r.s} r={r} cols={cols} active={sym.s === r.s} onPick={setSym} />)}
              </>
            )}
            {!rows.length && <p className="px-4 py-10 text-center text-sm text-muted">این دیده‌بان هنوز نمادی ندارد.</p>}
            <div className="flex justify-center py-3">
              <button onClick={() => setSheet('add')} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-brand-light hover:bg-brand/10">{I.plus} افزودن نماد</button>
            </div>
          </div>

        </>
      ) : (
        <div className="scroll-y min-h-0 flex-1"><Portfolio sym={sym} onPick={setSym} items={plist.items} setItems={setPItems} reorder={reorder}
          settings={{ ...pset, toolbar: <>
            <button onClick={startReorder} title="جابجایی ردیف‌ها" className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${reorder ? 'bg-brand/15 text-brand-light' : 'text-muted hover:bg-surface2 hover:text-ink'}`}>{I.move}</button>
            <button onClick={() => setSheet('plists')} title="تنظیمات پرتفوی" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-ink">{I.gear}</button>
          </> }} /></div>
      )}

      {/* list switcher (watchlists or portfolios) */}
      <div className="flex shrink-0 items-center gap-2 border-t border-line px-3 py-2">
        <StrategyFab onClick={() => setSheet('strategy')} />
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
        {(sub === 'watch' ? lists : plists).map((l) => (
          <button key={l.id} onClick={() => { (sub === 'watch' ? setCur : setPcur)(l.id); setReorder(false) }} className={`btn ${(sub === 'watch' ? cur : pcur) === l.id ? 'btn-on' : ''}`}>{l.name.replace(/^(دیده‌بان|پرتفوی) /, '')}</button>
        ))}
        </div>
        <button onClick={() => setSheet(sub === 'watch' ? 'lists' : 'plists')} title="مدیریت فهرست‌ها" className="btn-icon shrink-0">{I.plus}</button>
      </div>

      <AnimatePresence>{toast && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
          className="pointer-events-none absolute inset-x-6 bottom-16 z-[90] mx-auto w-fit max-w-full text-center rounded-full bg-surface2 px-4 py-2 text-xs shadow-2xl ring-1 ring-line">
          {toast}
        </motion.div>
      )}</AnimatePresence>

      <ListsSheet open={sheet === 'lists'} close={() => setSheet(null)} lists={lists} setLists={setLists} cur={cur} setCur={setCur} />
      <ListsSheet kind="پرتفوی" open={sheet === 'plists'} close={() => setSheet(null)} lists={plists} setLists={setPlists} cur={pcur} setCur={setPcur}
        extra={<div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={pset.fee} onChange={(e) => setPset({ ...pset, fee: e.target.checked })} className="h-4 w-4 accent-[#2E62FF]" />محاسبه کارمزد فروش</label>
          <span className="flex items-center gap-2 text-muted">ارزش بر حسب:<Dropdown value={pset.by} options={[['last', 'آخرین قیمت'], ['close', 'قیمت پایانی']]} onChange={(v) => setPset({ ...pset, by: v })} /></span>
        </div>} />
      <Dialog open={!!del} title="حذف نماد" text={`آیا از حذف نماد «${del ?? ''}» از «${list.name}» مطمئن هستید؟`} okText="حذف" danger
        onOk={() => { setItems(list.items.filter((x) => x !== del)); say(`نماد ${del} از ${list.name} حذف شد`); setDel(null) }} onCancel={() => setDel(null)} />
      <StrategySheet open={sheet === 'strategy'} close={() => setSheet(null)} target={sub === 'watch' ? list : plist} onRun={(name, n) => say(`استراتژی «${name}» روی ${fa(n)} نماد اجرا شد`)} />
      <AddSheet open={sheet === 'add'} close={() => setSheet(null)} items={list.items} setItems={setItems} name={list.name} say={say} />
      <Modal open={sheet === 'settings'} title="تنظیمات دیده‌بان" onClose={() => setSheet(null)} closeText="تایید" primary>
        <div className="space-y-3">
          {[['vol', 'نمایش ستون حجم معامله'], ['chart', 'نمایش نمودار ۱ ماهه']].map(([k, t]) => (
            <div key={k} className="flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm"><span>{t}</span><Toggle on={opts[k]} set={(v) => setOpts({ ...opts, [k]: v })} label="" /></div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

function ListsSheet({ open, close, lists, setLists, cur, setCur, kind = 'دیده‌بان', extra }) {
  const [move, setMove] = useState(false)
  const [dlg, setDlg] = useState(null)   // { mode: 'new' | 'rename' | 'delete', id }
  const [name, setName] = useState('')
  const ok = () => {
    if (dlg.mode === 'new') { const id = 'l' + Date.now(); setLists([...lists, { id, name: name.trim(), items: [] }]) }
    if (dlg.mode === 'rename') setLists(lists.map((l) => (l.id === dlg.id ? { ...l, name: name.trim() } : l)))
    if (dlg.mode === 'delete') { setLists(lists.filter((l) => l.id !== dlg.id)); if (cur === dlg.id) setCur(lists[0].id) }
    setDlg(null)
  }
  const row = (l) => (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-surface2/30 px-3 py-2.5 text-sm">
      {move && <span className="cursor-grab text-muted">{I.grip}</span>}
      <button disabled={move} onClick={() => { setCur(l.id); close() }} className={`min-w-0 flex-1 text-right ${cur === l.id ? 'font-bold text-brand-light' : ''}`}>{l.name} <span className="num font-normal text-muted">({fa(l.items.length)})</span></button>
      {!l.fixed && !move && <>
        <button onClick={() => { setName(l.name); setDlg({ mode: 'rename', id: l.id }) }} title="تغییر نام" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-ink">{I.edit}</button>
        <button onClick={() => setDlg({ mode: 'delete', id: l.id })} title="حذف" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-down/15 hover:text-down">{I.trash}</button>
      </>}
    </div>
  )
  return (
    <Modal open={open} title={kind === 'پرتفوی' ? 'پرتفوی‌ها' : 'دیده‌بان‌ها'} onClose={() => { setMove(false); close() }}
      actions={<>
        <button onClick={() => setMove(!move)} className={`h-11 rounded-xl border px-4 text-sm font-semibold ${move ? 'border-brand/60 text-brand-light' : 'border-line text-muted hover:text-ink'}`}>{move ? 'پایان جابجایی' : 'جابجایی'}</button>
        <motion.button whileTap={{ scale: .97 }} onClick={() => { setName(''); setDlg({ mode: 'new' }) }} className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-l from-brand-light to-brand-dark font-bold text-white shadow-glow">{I.plus} {kind === 'پرتفوی' ? 'افزودن پرتفوی' : 'ساخت دیده‌بان جدید'}</motion.button>
      </>}>
      {move
        ? <Reorder.Group axis="y" values={lists} onReorder={setLists} className="space-y-2">{lists.map((l) => <Reorder.Item key={l.id} value={l}>{row(l)}</Reorder.Item>)}</Reorder.Group>
        : <div className="space-y-2">{lists.map((l) => <div key={l.id}>{row(l)}</div>)}</div>}
      {extra}
      <Dialog open={!!dlg && dlg.mode !== 'delete'} title={`نام ${kind}`} input value={name} setValue={setName} placeholder={`نام ${kind} را وارد کنید...`} onOk={ok} onCancel={() => setDlg(null)} />
      <Dialog open={dlg?.mode === 'delete'} title={`حذف ${kind}`} text={`آیا از حذف ${kind} «${lists.find((l) => l.id === dlg?.id)?.name ?? ''}» مطمئن هستید؟`} okText="حذف" danger onOk={ok} onCancel={() => setDlg(null)} />
    </Modal>
  )
}

function AddSheet({ open, close, items, setItems, name, say }) {
  const [q, setQ] = useState('')
  const found = SYMBOLS.filter((x) => x.s.includes(q) || x.n.includes(q))
  return (
    <Modal open={open} title={`افزودن نماد به «${name}»`} onClose={close} closeText="تایید" primary>
      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی نماد..." className="mb-3 h-11 w-full rounded-xl border border-line bg-surface2/50 px-4 text-sm outline-none focus:border-brand/60" />
      <div className="space-y-1">
        {found.map((x) => { const on = items.includes(x.s); return (
          <button key={x.s} onClick={() => { setItems(on ? items.filter((s) => s !== x.s) : [...items, x.s]); say(on ? `نماد ${x.s} از ${name} حذف شد` : `نماد ${x.s} به ${name} اضافه شد`) }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-sm hover:bg-surface2">
            <span className={`grid h-5 w-5 place-items-center rounded-md border text-[11px] ${on ? 'border-brand bg-brand text-white' : 'border-line'}`}>{on && '✓'}</span>
            <b>{x.s}</b><span className="truncate text-xs text-muted">{x.n}</span>
          </button>) })}
      </div>
    </Modal>
  )
}

// extended button: shows its label for 3s, then shrinks to an icon; hover or focus shows the label again
function StrategyFab({ onClick }) {
  const [wide, setWide] = useState(true), [hover, setHover] = useState(false)
  useEffect(() => { const t = setTimeout(() => setWide(false), 3000); return () => clearTimeout(t) }, [])
  const open = wide || hover
  return (
    <motion.button layout onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}
      aria-label="اجرای استراتژی" title="اجرای استراتژی"
      className="flex h-9 shrink-0 items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-l from-brand-light to-brand-dark px-2 text-sm font-bold text-white shadow-glow" transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
      {I.play}
      <AnimatePresence initial={false}>{open && <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="whitespace-nowrap pl-1">اجرای استراتژی</motion.span>}</AnimatePresence>
    </motion.button>
  )
}

const STRATS = [
  ['breakout', 'شکست مقاومت', 'نمادهایی که امروز از مقاومت ۲۰ روزه عبور کرده‌اند'],
  ['money', 'ورود پول حقیقی', 'ورود پول حقیقی سنگین در سه روز اخیر'],
  ['rsi', 'اشباع فروش (RSI زیر ۳۰)', 'نمادهای نزدیک کف با احتمال برگشت'],
  ['volume', 'حجم مشکوک', 'حجم امروز بیش از دو برابر میانگین ماهانه'],
]
function StrategySheet({ open, close, target, onRun }) {
  const [pick, setPick] = useState('breakout')
  const cur = STRATS.find((x) => x[0] === pick)
  return (
    <Modal open={open} title="اجرای استراتژی" onClose={close}
      actions={<motion.button whileTap={{ scale: .97 }} onClick={() => { onRun(cur[1], target.items.length); close() }} className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-l from-brand-light to-brand-dark font-bold text-white shadow-glow">{I.play} اجرا روی «{target.name}» ({fa(target.items.length)} نماد)</motion.button>}>
      <div className="space-y-2">
        {STRATS.map(([k, t, d]) => (
          <button key={k} onClick={() => setPick(k)} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-right transition-colors ${pick === k ? 'border-brand/60 bg-brand/10' : 'border-line hover:border-brand/30'}`}>
            <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${pick === k ? 'border-brand' : 'border-line'}`}>{pick === k && <i className="h-1.5 w-1.5 rounded-full bg-brand" />}</span>
            <span><b className="block text-sm">{t}</b><span className="text-xs text-muted">{d}</span></span>
          </button>
        ))}
      </div>
    </Modal>
  )
}
