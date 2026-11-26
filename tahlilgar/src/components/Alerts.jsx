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
            <motion.button layoutId="al-add" whileHover={{ y: -2 }} whileTap={{ scale: .92 }} onClick={add} title="هشدار جدید" className="mx-auto mt-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-light to-brand-dark text-white shadow-glow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 16v-5a6 6 0 0 1 9-5.2M18 11v5l2 2H4l2-2" /><path d="M10 20a2 2 0 0 0 4 0M18 3v6M15 6h6" /></svg>
            </motion.button>
          </div>
        </div>
      )}
      <Dialog open={del != null} title="حذف هشدار" text="آیا از حذف هشدار مطمئن هستید؟" okText="حذف" danger onOk={() => { const a = list.find((x) => x.id === del); setList(list.filter((x) => x.id !== del)); setDel(null); toast(`هشدار ${a?.s ?? ''} حذف شد`, 'info') }} onCancel={() => setDel(null)} />
      {list.length > 0 && (
      <div className="pointer-events-none sticky bottom-0 flex justify-end p-4">
        <motion.button layoutId="al-add" whileHover={{ y: -2 }} whileTap={{ scale: .92 }} onClick={add} title="هشدار جدید" className="pointer-events-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-light to-brand-dark text-white shadow-glow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 16v-5a6 6 0 0 1 9-5.2M18 11v5l2 2H4l2-2" /><path d="M10 20a2 2 0 0 0 4 0M18 3v6M15 6h6" /></svg>
        </motion.button>
      </div>
      )}
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
  // three clear steps instead of a wall of text: grant → test → (optional) keep-alive service
  const [perm, setPerm] = useState(false), [sent, setSent] = useState(false), [svc, setSvc] = useState(false), [more, setMore] = useState(false)
  const Check = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
  const step = (n, done, title, desc, action) => (
    <div className={`flex items-center gap-3 rounded-2xl border p-3.5 transition-colors ${done ? 'border-up/40 bg-up/5' : 'border-line bg-surface2/30'}`}>
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors ${done ? 'bg-up text-white' : 'bg-surface2 text-muted'}`}>{done ? Check : n}</span>
      <span className="min-w-0 flex-1"><b className="block text-sm">{title}</b><span className="text-xs text-muted">{desc}</span></span>
      {action}
    </div>
  )
  return (
    <Modal open={open} onClose={close} title="هشدارها به دستم نمی‌رسد"
      actions={<button onClick={close} className="h-11 flex-1 rounded-xl border border-line text-sm font-medium hover:bg-surface2">متوجه شدم</button>}>
      <p className="mb-4 text-sm leading-7 text-muted">بعضی گوشی‌ها برنامه‌های بسته‌شده را متوقف می‌کنند. این سه قدم را انجام دهید:</p>
      <div className="space-y-2.5">
        {step('۱', perm, 'اجازه اجرا در پس‌زمینه', 'برنامه بعد از بسته شدن هم هشدار بفرستد',
          <button onClick={() => { setPerm(true); toast('به تنظیمات اجرای پس‌زمینه دستگاه هدایت می‌شوید', 'info') }} className={`btn shrink-0 ${perm ? '' : 'btn-on'}`}>{perm ? 'دوباره' : 'دادن مجوز'}</button>)}
        {step('۲', sent, 'ارسال هشدار آزمایشی', 'مطمئن شوید اعلان روی گوشی می‌رسد',
          <button onClick={() => { setSent(true); toast('هشدار آزمایشی ارسال شد', 'ok') }} className="btn shrink-0">{sent ? 'ارسال دوباره' : 'ارسال'}</button>)}
        {step('۳', svc, 'سرویس هشدار دائمی', 'اختیاری؛ فقط اگر باز هم هشدار نرسید',
          <button onClick={() => { setSvc(!svc); toast(`سرویس هشدار ${svc ? 'غیرفعال' : 'فعال'} شد`, svc ? 'info' : 'ok') }} aria-label="اجرای سرویس هشدار" className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${svc ? 'justify-end bg-up' : 'justify-start bg-line'}`}><motion.span layout className="h-5 w-5 rounded-full bg-white shadow" /></button>)}
      </div>
      <button onClick={() => setMore(!more)} className="mt-4 flex items-center gap-1 text-xs text-brand-light">
        جزئیات بیشتر
        <motion.svg animate={{ rotate: more ? 180 : 0 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></motion.svg>
      </button>
      <AnimatePresence initial={false}>{more && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          <ul className="mt-2 list-disc space-y-1.5 pr-5 text-xs leading-6 text-muted">
            <li>این تنظیم در هر برند جای متفاوتی دارد؛ معمولاً در <span dir="ltr">Battery Optimization</span>، <span dir="ltr">Battery Saver</span> یا <span dir="ltr">Auto Start</span>.</li>
            <li>سرویس دائمی یک اعلان ثابت بالای صفحه نشان می‌دهد؛ می‌توانید فقط در ساعات باز بودن بازار روشنش کنید.</li>
          </ul>
        </motion.div>
      )}</AnimatePresence>
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
  // landing-style hero that always fits the panel (no scroll): copy + CTA on one side, a live demo on the other
  const fade = (d) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: .5, ease: [.2, .8, .2, 1] } })
  return (
    <div className="relative h-full overflow-hidden">
      {/* soft animated backdrop */}
      <motion.div aria-hidden className="pointer-events-none absolute -left-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-brand/20 blur-3xl" animate={{ x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div aria-hidden className="pointer-events-none absolute -bottom-40 right-0 h-[24rem] w-[24rem] rounded-full bg-up/10 blur-3xl" animate={{ x: [0, -30, 0], y: [0, -20, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[.06] [background-image:linear-gradient(rgb(var(--ink))_1px,transparent_1px),linear-gradient(90deg,rgb(var(--ink))_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

      <div className="relative mx-auto grid h-full max-w-6xl items-center gap-10 px-8 lg:grid-cols-[1.05fr_1fr]">
        {/* copy */}
        <div>
          <motion.span {...fade(0)} className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-bold text-brand-light">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-light opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-brand-light" /></span>
            هشدار هوشمند بازار
          </motion.span>
          <motion.h2 {...fade(.08)} className="mt-5 text-4xl font-black leading-[1.35]">بازار را لحظه‌به‌لحظه نپایید؛<br /><span className="bg-gradient-to-l from-brand-light to-up bg-clip-text text-transparent">ما خبرتان می‌کنیم</span></motion.h2>
          <motion.p {...fade(.16)} className="mt-4 max-w-lg text-sm leading-8 text-muted">برای هر نماد شرط دلخواهتان را بسازید؛ از بین رفتن صف، عبور قیمت از یک عدد یا حجم مشکوک. همان لحظه‌ای که اتفاق بیفتد، اعلان یا پیامک می‌گیرید.</motion.p>
          <motion.div {...fade(.24)} className="mt-7 flex flex-wrap items-center gap-3">
            <motion.button whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: .97 }} onClick={() => create()} className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-l from-brand-light to-brand-dark px-7 font-bold text-white shadow-glow">
              ساخت اولین هشدار
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
            </motion.button>
            <span className="text-xs text-muted">کمتر از ۱۰ ثانیه</span>
          </motion.div>
          <motion.div {...fade(.32)} className="mt-8">
            <div className="mb-2.5 text-xs text-muted">یا با یک کلیک از نمونه‌ها شروع کنید</div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((e, i) => (
                <motion.button key={e.s} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .4 + i * .07 }} whileHover={{ y: -2 }} onClick={() => { const { t, d, ...preset } = e; create(preset) }}
                  className="flex items-center gap-2 rounded-xl border border-line bg-surface2/40 px-3 py-2 text-xs transition-colors hover:border-brand/50 hover:bg-brand/10">
                  <i className={`h-2 w-2 rounded-full ${e.type === 'general' ? 'bg-up' : 'bg-brand-light'}`} />{e.t}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* live demo */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .2, duration: .6 }} className="relative hidden lg:block">
          <div className="rounded-3xl border border-line bg-surface2/50 p-5 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-xs font-extrabold text-brand-dark">فو</span><span><b className="block text-sm">فولاد</b><span className="text-[11px] text-muted">فولاد مبارکه اصفهان</span></span></span>
              <span className="rounded-lg bg-up/15 px-2 py-1 text-xs font-bold text-up">▲ ۲٫۸۴٪</span>
            </div>
            <div className="relative mt-4">
            <motion.span className="absolute z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-up ring-4 ring-up/25" style={{ left: '83.75%', top: '31.67%' }} initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }} transition={{ delay: 1.75, duration: .5, repeat: Infinity, repeatDelay: 3.5 }} />
            <span className="absolute left-0 top-[18px] z-10 rounded-md bg-brand px-2 py-0.5 text-[10px] font-bold text-white shadow">هدف ۶٬۵۰۰</span>
            <svg viewBox="0 0 320 120" preserveAspectRatio="none" className="h-36 w-full overflow-visible">
              <defs><linearGradient id="ai-g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="rgb(var(--up))" stopOpacity=".35" /><stop offset="1" stopColor="rgb(var(--up))" stopOpacity="0" /></linearGradient></defs>
              <line x1="0" x2="320" y1="38" y2="38" stroke="#3C7CFF" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" opacity=".8" />
              <motion.path d="M0 100 L40 92 L80 96 L120 78 L160 82 L200 60 L240 52 L280 30 L320 22 L320 120 L0 120 Z" fill="url(#ai-g)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: .8 }} />
              <motion.path d="M0 100 L40 92 L80 96 L120 78 L160 82 L200 60 L240 52 L280 30 L320 22" fill="none" stroke="rgb(var(--up))" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: .5, duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2.4 }} />
              
            </svg>
            </div>
          </div>
          {/* notification popping in when the line crosses the target */}
          <motion.div initial={{ opacity: 0, y: 20, scale: .95 }} animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -6], scale: [.95, 1, 1, .98] }} transition={{ delay: 1.8, duration: 3.4, times: [0, .12, .85, 1], repeat: Infinity, repeatDelay: .6 }}
            className="absolute -bottom-8 -left-6 flex w-72 items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-2xl">
            <motion.span animate={{ rotate: [0, -14, 12, -8, 0] }} transition={{ delay: 2, duration: .6, repeat: Infinity, repeatDelay: 3.4 }} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-light to-brand-dark text-white">{ic(Notification, 20)}</motion.span>
            <span className="min-w-0 text-right"><b className="block text-sm">قیمت فولاد از ۶٬۵۰۰ گذشت</b><span className="text-[11px] text-muted">همین حالا · تحلیل‌گر بورس</span></span>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, y: [0, -6, 0] }} transition={{ opacity: { delay: .9 }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
            className="absolute -right-4 -top-6 flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-xl">
            <i className="h-2 w-2 rounded-full bg-up" />صف خرید خودرو از بین رفت
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
