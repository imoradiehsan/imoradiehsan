import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Notification, TimeCircle, InfoSquare, EditSquare, Delete, Search } from 'react-iconly'
import { SYMBOLS } from '../data/market'
import { Dropdown, Modal } from './SitePanel'
import { Dialog } from './Watchlist'

const ic = (I, s = 18) => <I set="light" size={s} primaryColor="currentColor" />
export const GENERAL = ['از بین رفتن صف خرید', 'از بین رفتن صف فروش', 'حجم معاملات مشکوک', 'حمایت و مقاومت', 'پیام ناظر بازار', 'فیلتر پیام ناظر بازار (ویژه مشترکین)']
export const METRICS = ['قیمت آخرین معامله', 'قیمت پایانی', 'درصد تغییر قیمت', 'حجم معامله', 'تعداد معامله']
export const OPS = ['کوچکتر از', 'مساوی', 'بزرگتر از']
const opts = (a) => a.map((t) => [t, t])
export const describe = (a) => (a.type === 'general' ? a.cond : `${a.metric} ${a.op} ${a.val}`)

function Switch({ on, set, label }) {
  return (
    <button onClick={() => set(!on)} className="flex items-center gap-2 text-xs text-muted">
      <span className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${on ? 'justify-end bg-brand' : 'justify-start bg-line'}`}><motion.span layout className="h-4 w-4 rounded-full bg-white shadow" /></span>{label}
    </button>
  )
}

/* ---------- root: my alerts ---------- */
export function AlertsHome({ list, setList, add, edit }) {
  const [ipo, setIpo] = useState(false), [sms, setSms] = useState(false), [del, setDel] = useState(null)
  return (
    <div className="relative flex min-h-full flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4">
        <Switch on={ipo} set={setIpo} label="هشدار عرضه اولیه" />
        <Switch on={sms} set={setSms} label="هشدار با پیامک" />
      </div>
      {list.length ? (
        <div className="flex-1 space-y-2 p-4">
          <AnimatePresence initial={false}>{list.map((a, i) => {
            const n = SYMBOLS.find((x) => x.s === a.s)?.n
            return (
              <motion.div key={a.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }} className="flex items-center gap-3 rounded-2xl border border-line bg-surface2/30 p-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm"><b className="text-brand-light">{a.s}</b>{n && <span className="mr-1 text-[11px] text-muted">({n})</span>}</div>
                  <div className="mt-1.5 flex items-center gap-2 text-xs"><i className={`h-3.5 w-0.5 rounded-full ${a.type === 'general' ? 'bg-up' : 'bg-brand-light'}`} />{describe(a)}</div>
                </div>
                <button onClick={() => edit(i)} title="ویرایش" className="btn-icon">{ic(EditSquare, 16)}</button>
                <button onClick={() => setDel(a.id)} title="حذف" className="btn-icon hover:!text-down">{ic(Delete, 16)}</button>
              </motion.div>
            )
          })}</AnimatePresence>
        </div>
      ) : (
        <div className="grid flex-1 place-items-center p-8 text-center">
          <div>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-brand/10 text-brand-light">{ic(Notification, 30)}</span>
            <p className="mt-4 text-sm text-muted">هنوز هشداری ثبت نکرده‌اید!</p>
          </div>
        </div>
      )}
      <Dialog open={del != null} title="حذف هشدار" text="آیا از حذف هشدار مطمئن هستید؟" okText="حذف" danger onOk={() => { setList(list.filter((a) => a.id !== del)); setDel(null) }} onCancel={() => setDel(null)} />
      <div className="pointer-events-none sticky bottom-0 flex justify-end p-4">
        <motion.button whileHover={{ y: -2 }} whileTap={{ scale: .92 }} onClick={add} title="هشدار جدید" className="pointer-events-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-light to-brand-dark text-white shadow-glow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 16v-5a6 6 0 0 1 9-5.2M18 11v5l2 2H4l2-2" /><path d="M10 20a2 2 0 0 0 4 0M18 3v6M15 6h6" /></svg>
        </motion.button>
      </div>
    </div>
  )
}

/* ---------- new / edit ---------- */
export function AlertForm({ init, onSave, onCancel }) {
  const [s, setS] = useState(init?.s || ''), [q, setQ] = useState(init?.s || ''), [focus, setFocus] = useState(false)
  const [type, setType] = useState(init?.type || 'general')
  const [cond, setCond] = useState(init?.cond || GENERAL[0])
  const [metric, setMetric] = useState(init?.metric || METRICS[0])
  const [op, setOp] = useState(init?.op || OPS[0])
  const [val, setVal] = useState(init?.val || '')
  const hits = SYMBOLS.filter((x) => q && (x.s.includes(q) || x.n.includes(q)))
  const ok = s && (type === 'general' || val)
  const field = 'h-11 w-full rounded-xl border border-line bg-surface2/40 px-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-brand/60'
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 space-y-4 p-4">
        <div className="relative">
          <div className="mb-1.5 text-xs font-bold">نماد</div>
          <label className="relative block">
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">{ic(Search, 16)}</span>
            <input value={q} onChange={(e) => { setQ(e.target.value); setS('') }} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)} placeholder="مثلاً خودرو…" className={field + ' pr-9'} />
          </label>
          <AnimatePresence>{focus && hits.length > 0 && !s && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-2xl">
              {hits.map((x) => <button key={x.s} onMouseDown={() => { setS(x.s); setQ(x.s) }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-right text-sm hover:bg-surface2"><b>{x.s}</b><span className="text-[11px] text-muted">{x.n}</span></button>)}
            </motion.div>
          )}</AnimatePresence>
        </div>
        <div className="rounded-2xl border border-line bg-surface2/25">
          <div className="flex items-center justify-between p-4">
            <span className="text-sm font-bold">نوع هشدار</span>
            <div className="seg">{[['general', 'کلی'], ['value', 'مقادیر']].map(([k, t]) => (
              <button key={k} onClick={() => setType(k)} className="seg-item !px-4">
                {type === k && <motion.span layoutId="al-type" className="absolute inset-0 rounded-[10px] bg-brand/15 ring-1 ring-brand/50" />}
                <span className={`relative ${type === k ? 'font-bold text-brand-light' : ''}`}>{t}</span>
              </button>
            ))}</div>
          </div>
          <div className="space-y-3 border-t border-line p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold">شرط هشدار</span>
              {type === 'general' ? <Dropdown value={cond} options={opts(GENERAL)} onChange={setCond} /> : <Dropdown value={metric} options={opts(METRICS)} onChange={setMetric} />}
            </div>
            <AnimatePresence initial={false}>{type === 'value' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2">
                <Dropdown value={op} options={opts(OPS)} onChange={setOp} />
                <input value={val} onChange={(e) => setVal(e.target.value.replace(/[^\d.۰-۹٫]/g, ''))} inputMode="decimal" placeholder="مقدار را وارد کنید…" className={field + ' num !h-8 flex-1'} />
              </motion.div>
            )}</AnimatePresence>
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 flex gap-2 border-t border-line bg-surface/95 p-4 backdrop-blur">
        <button onClick={onCancel} className="h-11 flex-1 rounded-xl border border-line text-sm font-medium hover:bg-surface2">انصراف</button>
        <motion.button whileTap={{ scale: .97 }} disabled={!ok} onClick={() => onSave({ id: init?.id || Date.now(), s, type, cond, metric, op, val })}
          className="h-11 flex-1 rounded-xl bg-gradient-to-l from-brand-light to-brand-dark text-sm font-bold text-white shadow-glow disabled:opacity-40 disabled:shadow-none">{init ? 'ویرایش هشدار' : 'ساخت هشدار'}</motion.button>
      </div>
    </div>
  )
}

/* ---------- history ---------- */
export function AlertHistory({ items = [] }) {
  return items.length ? (
    <div className="space-y-2 p-4">{items.map((h, i) => (
      <div key={i} className="rounded-2xl border border-line bg-surface2/30 p-3 text-sm"><b className="text-brand-light">{h.s}</b><div className="mt-1 text-xs text-muted">{h.t} · {h.at}</div></div>
    ))}</div>
  ) : (
    <div className="grid min-h-full place-items-center p-8 text-center">
      <div><span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-surface2 text-muted">{ic(TimeCircle, 30)}</span><p className="mt-4 text-sm text-muted">امروز هشداری دریافت نکرده‌اید!</p></div>
    </div>
  )
}

/* ---------- help sheet ---------- */
export function AlertHelp({ open, close }) {
  const [svc, setSvc] = useState(false), [sent, setSent] = useState(false)
  return (
    <Modal open={open} onClose={close} title="راهکار عدم نمایش هشدارها"
      actions={<motion.button whileTap={{ scale: .97 }} onClick={close} className="h-11 flex-1 rounded-xl bg-gradient-to-l from-brand-light to-brand-dark font-bold text-white shadow-glow">دادن مجوز</motion.button>}>
      <div className="space-y-4 text-sm leading-7">
        <p>در برخی دستگاه‌های اندرویدی، سیستم عامل اجازه کار برنامه در پس‌زمینه را نمی‌دهد و پس از بسته شدن برنامه، هشدارها در زمان مقرر دریافت نمی‌شوند. برای رفع این مشکل باید اجازه اجرا در پس‌زمینه را به تحلیل‌گر بورس بدهید.</p>
        <p className="text-xs text-muted">این تنظیمات در هر برند متفاوت است و معمولاً در بخش‌هایی مانند <span dir="ltr">Battery Optimization</span>، <span dir="ltr">Battery Saver</span> یا <span dir="ltr">Auto Start</span> قرار دارد. با دکمه «دادن مجوز» مستقیم به همان بخش می‌روید.</p>
        <div className="rounded-2xl border border-line bg-surface2/30 p-4">
          <p className="text-xs text-muted">اگر موفق نشدید، سرویس هشدار را روشن کنید تا برنامه پس از بسته شدن هم فعال بماند؛ این کار یک اعلان دائمی بالای صفحه نشان می‌دهد. می‌توانید فقط در ساعات باز بودن بازار روشنش کنید.</p>
          <div className="mt-3 flex justify-center"><Switch on={svc} set={setSvc} label="اجرای سرویس هشدار" /></div>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted">پس از دادن مجوز، برای اطمینان یک هشدار آزمایشی برای خود بفرستید.</p>
          <button onClick={() => setSent(true)} className={`btn mt-3 ${sent ? 'btn-on' : ''}`}>{ic(Notification, 15)}{sent ? 'هشدار آزمایشی ارسال شد' : 'ارسال هشدار آزمایشی'}</button>
        </div>
      </div>
    </Modal>
  )
}
