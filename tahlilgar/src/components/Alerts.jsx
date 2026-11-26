import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Notification, TimeCircle, InfoSquare, EditSquare, Delete, Search } from 'react-iconly'
import { SYMBOLS } from '../data/market'
import { Dropdown, Modal } from './SitePanel'
import { Dialog } from './Watchlist'
import { toast } from './Toast'

const ic = (I, s = 18) => <I set="light" size={s} primaryColor="currentColor" />
export const GENERAL = ['از بین رفتن صف خرید', 'از بین رفتن صف فروش', 'حجم معاملات مشکوک', 'حمایت و مقاومت', 'پیام ناظر بازار', 'فیلتر پیام ناظر بازار (ویژه مشترکین)']
export const METRICS = ['قیمت آخرین معامله', 'قیمت پایانی', 'درصد تغییر قیمت', 'حجم معامله', 'تعداد معامله']
export const OPS = ['کوچکتر از', 'مساوی', 'بزرگتر از']
const opts = (a) => a.map((t) => [t, t])
export const describe = (a) => (a.type === 'general' ? a.cond : `${a.metric} ${a.op} ${a.val}`)

function Switch({ on, set, label, msg }) {
  return (
    <button onClick={() => { set(!on); msg && toast(`${msg} ${on ? 'غیرفعال' : 'فعال'} شد`, on ? 'info' : 'ok') }} className="flex items-center gap-2 text-xs text-muted">
      <span className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${on ? 'justify-end bg-brand' : 'justify-start bg-line'}`}><motion.span layout className="h-4 w-4 rounded-full bg-white shadow" /></span>{label}
    </button>
  )
}

/* ---------- root: my alerts ---------- */
export function AlertsHome({ list, setList, add, edit, sym, setSym }) {
  const [ipo, setIpo] = useState(false), [sms, setSms] = useState(false), [del, setDel] = useState(null)
  const pick = (code) => { const x = SYMBOLS.find((y) => y.s === code); if (x) setSym(x) }
  // first alert's symbol is selected by default, so the left panel shows its details
  useEffect(() => { if (list[0]) pick(list[0].s) }, [])
  return (
    <div className="relative flex min-h-full flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4">
        <Switch on={ipo} set={setIpo} label="هشدار عرضه اولیه" msg="هشدار عرضه اولیه" />
        <Switch on={sms} set={setSms} label="هشدار با پیامک" msg="ارسال هشدار با پیامک" />
      </div>
      {list.length ? (
        <div className="flex-1 space-y-2 p-4">
          <AnimatePresence initial={false}>{list.map((a, i) => {
            const n = SYMBOLS.find((x) => x.s === a.s)?.n
            return (
              <motion.div key={a.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }} onClick={() => pick(a.s)}
                className={`relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border p-3 pr-4 transition-colors ${sym?.s === a.s ? 'border-brand/60 bg-brand/10' : 'border-line bg-surface2/30 hover:border-brand/40'}`}>
                <i title={a.type === 'general' ? 'کلی' : 'مقادیر'} className={`absolute inset-y-3 right-0 w-1 rounded-l-full ${a.type === 'general' ? 'bg-up' : 'bg-brand-light'}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm"><b className="text-brand-light">{a.s}</b>{n && <span className="mr-1 text-[11px] text-muted">({n})</span>}</div>
                  <div className="mt-1.5 text-xs">{describe(a)}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); edit(i) }} title="ویرایش" className="btn-icon">{ic(EditSquare, 16)}</button>
                <button onClick={(e) => { e.stopPropagation(); setDel(a.id) }} title="حذف" className="btn-icon hover:!text-down">{ic(Delete, 16)}</button>
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
      <Dialog open={del != null} title="حذف هشدار" text="آیا از حذف هشدار مطمئن هستید؟" okText="حذف" danger onOk={() => { const a = list.find((x) => x.id === del); setList(list.filter((x) => x.id !== del)); setDel(null); toast(`هشدار ${a?.s ?? ''} حذف شد`, 'info') }} onCancel={() => setDel(null)} />
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
  const isEdit = !!init?.id
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
            <div className="space-y-2">
              <span className="text-sm font-bold">شرط هشدار</span>
              {type === 'general' ? <Dropdown full value={cond} options={opts(GENERAL)} onChange={setCond} /> : <Dropdown full value={metric} options={opts(METRICS)} onChange={setMetric} />}
            </div>
            <AnimatePresence initial={false}>{type === 'value' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-start gap-2">
                <div className="w-36 shrink-0"><Dropdown full value={op} options={opts(OPS)} onChange={setOp} /></div>
                <input value={val} onChange={(e) => setVal(e.target.value.replace(/[^\d.۰-۹٫]/g, ''))} inputMode="decimal" placeholder="مقدار را وارد کنید…" className={field + ' num !h-10 flex-1'} />
              </motion.div>
            )}</AnimatePresence>
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 flex gap-2 border-t border-line bg-surface/95 p-4 backdrop-blur">
        <button onClick={onCancel} className="h-11 flex-1 rounded-xl border border-line text-sm font-medium hover:bg-surface2">انصراف</button>
        <motion.button whileTap={{ scale: .97 }} disabled={!ok} onClick={() => { onSave({ id: isEdit ? init.id : Date.now(), s, type, cond, metric, op, val }); toast(isEdit ? `هشدار ${s} ویرایش شد` : `هشدار ${s} ساخته شد`) }}
          className="h-11 flex-1 rounded-xl bg-gradient-to-l from-brand-light to-brand-dark text-sm font-bold text-white shadow-glow disabled:opacity-40 disabled:shadow-none">{isEdit ? 'ویرایش هشدار' : 'ساخت هشدار'}</motion.button>
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
      actions={<motion.button whileTap={{ scale: .97 }} onClick={() => { close(); toast('به تنظیمات اجرای پس‌زمینه دستگاه هدایت می‌شوید', 'info') }} className="h-11 flex-1 rounded-xl bg-gradient-to-l from-brand-light to-brand-dark font-bold text-white shadow-glow">دادن مجوز</motion.button>}>
      <div className="space-y-4 text-sm leading-7">
        <p>در برخی دستگاه‌های اندرویدی، سیستم عامل اجازه کار برنامه در پس‌زمینه را نمی‌دهد و پس از بسته شدن برنامه، هشدارها در زمان مقرر دریافت نمی‌شوند. برای رفع این مشکل باید اجازه اجرا در پس‌زمینه را به تحلیل‌گر بورس بدهید.</p>
        <p className="text-xs text-muted">این تنظیمات در هر برند متفاوت است و معمولاً در بخش‌هایی مانند <span dir="ltr">Battery Optimization</span>، <span dir="ltr">Battery Saver</span> یا <span dir="ltr">Auto Start</span> قرار دارد. با دکمه «دادن مجوز» مستقیم به همان بخش می‌روید.</p>
        <div className="rounded-2xl border border-line bg-surface2/30 p-4">
          <p className="text-xs text-muted">اگر موفق نشدید، سرویس هشدار را روشن کنید تا برنامه پس از بسته شدن هم فعال بماند؛ این کار یک اعلان دائمی بالای صفحه نشان می‌دهد. می‌توانید فقط در ساعات باز بودن بازار روشنش کنید.</p>
          <div className="mt-3 flex justify-center"><Switch on={svc} set={setSvc} label="اجرای سرویس هشدار" msg="سرویس هشدار" /></div>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted">پس از دادن مجوز، برای اطمینان یک هشدار آزمایشی برای خود بفرستید.</p>
          <button onClick={() => { setSent(true); toast('هشدار آزمایشی ارسال شد؛ چند ثانیه دیگر باید اعلان را ببینید', 'info') }} className={`btn mt-3 ${sent ? 'btn-on' : ''}`}>{ic(Notification, 15)}{sent ? 'هشدار آزمایشی ارسال شد' : 'ارسال هشدار آزمایشی'}</button>
        </div>
      </div>
    </Modal>
  )
}

/* ---------- site-panel intro when there are no alerts ---------- */
const EXAMPLES = [
  { s: 'خودرو', type: 'general', cond: 'از بین رفتن صف خرید', t: 'صف خرید خودرو از بین رفت', d: 'قبل از ریزش، زودتر از بقیه باخبر شوید' },
  { s: 'فولاد', type: 'value', metric: 'قیمت آخرین معامله', op: 'بزرگتر از', val: '6500', t: 'قیمت فولاد از ۶٬۵۰۰ گذشت', d: 'شکست مقاومت را از دست ندهید' },
  { s: 'شپنا', type: 'general', cond: 'حجم معاملات مشکوک', t: 'حجم مشکوک در شپنا', d: 'ورود پول هوشمند را رصد کنید' },
]
export function AlertIntro({ create }) {
  return (
    <div className="scroll-y h-full">
      <div className="mx-auto max-w-3xl px-6 py-12 text-center">
        <motion.span initial={{ scale: .8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-brand-light to-brand-dark text-white shadow-glow">{ic(Notification, 36)}</motion.span>
        <h2 className="mt-6 text-2xl font-extrabold">بازار را لحظه‌به‌لحظه نپایید؛ ما خبرتان می‌کنیم</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted">با هشدارها شرطی برای نماد دلخواه تعریف می‌کنید و هر وقت آن اتفاق افتاد، همان لحظه اعلان یا پیامک می‌گیرید؛ از از بین رفتن صف خرید و فروش تا عبور قیمت، حجم یا تعداد معاملات از عددی که خودتان تعیین می‌کنید.</p>
        <motion.button whileHover={{ y: -2 }} whileTap={{ scale: .97 }} onClick={() => create()} className="mt-7 inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-l from-brand-light to-brand-dark px-7 font-bold text-white shadow-glow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>ساخت اولین هشدار
        </motion.button>

        <div className="mt-12 text-right">
          <div className="mb-3 text-sm font-bold">یا با یک کلیک از نمونه‌های آماده شروع کنید</div>
          <div className="grid gap-3 sm:grid-cols-3">
            {EXAMPLES.map((e, i) => (
              <motion.button key={e.s} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 + i * .06 }} whileHover={{ y: -2 }} onClick={() => { const { t, d, ...preset } = e; create(preset) }}
                className="rounded-2xl border border-line bg-surface2/30 p-4 text-right transition-colors hover:border-brand/50">
                <span className={`inline-block rounded-lg px-2 py-0.5 text-[10px] font-bold ${e.type === 'general' ? 'bg-up/15 text-up' : 'bg-brand/15 text-brand-light'}`}>{e.type === 'general' ? 'کلی' : 'مقادیر'}</span>
                <b className="mt-2 block text-sm">{e.t}</b>
                <span className="mt-1 block text-xs text-muted">{e.d}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-3 text-right sm:grid-cols-2">
          <div className="rounded-2xl border border-line p-4"><b className="text-sm">هشدار کلی</b><p className="mt-1 text-xs leading-6 text-muted">رویدادهای آماده مثل از بین رفتن صف، حجم مشکوک، حمایت و مقاومت و پیام ناظر بازار.</p></div>
          <div className="rounded-2xl border border-line p-4"><b className="text-sm">هشدار مقادیر</b><p className="mt-1 text-xs leading-6 text-muted">قیمت، درصد تغییر، حجم یا تعداد معامله را با عدد دلخواه مقایسه کنید؛ کوچکتر، مساوی یا بزرگتر.</p></div>
        </div>
      </div>
    </div>
  )
}
