// نظرات نماد: استوری‌ها، تب‌های آخرین/برگزیده/تحلیل، کارت نظر با لایک/دیس‌لایک، منو، گزارش، نوشتن نظر
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fa } from '../data/market'
import { Modal } from './SitePanel'

const COLORS = ['#2E62FF', '#14B8A6', '#F59E0B', '#A855F7', '#EC4899', '#22C55E', '#0EA5E9']
const Avatar = ({ name, size = 40, ring }) => (
  <span className="grid shrink-0 place-items-center rounded-full font-bold text-white" style={{ width: size, height: size, fontSize: size * .38, background: COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length], boxShadow: ring ? '0 0 0 2px rgb(var(--surface)), 0 0 0 4px #3C7CFF' : undefined }}>
    {name.replace(/[_\d]/g, '').slice(0, 1).toUpperCase()}
  </span>
)
const Ico = {
  eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>,
  up: (f) => <svg width="18" height="18" viewBox="0 0 24 24" fill={f ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M7 10v11H3V10h4Zm0 0 4-8a3 3 0 0 1 3 3v4h6a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.6 21H7" /></svg>,
  chat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /></svg>,
  more: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>,
  user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="3" width="16" height="18" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M7 18c1-2.5 3-3.5 5-3.5s4 1 5 3.5" /></svg>,
  copy: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></svg>,
  share: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6" /></svg>,
  flag: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 18v-6a6 6 0 0 1 12 0v6M4 18h16M12 3v2M4.5 6.5l1.4 1.4M19.5 6.5l-1.4 1.4" /></svg>,
  pen: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4Z" /></svg>,
  cam: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>,
  poll: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 20h16M6 16V9M11 16V5M16 16v-4" /></svg>,
  q: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /><path d="M10 9.5a2 2 0 1 1 2.6 1.9c-.4.2-.6.5-.6 1V13M12 16h.01" /></svg>,
  live: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="2" /><path d="M8 8a5.6 5.6 0 0 0 0 8M16 8a5.6 5.6 0 0 1 0 8M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" /></svg>,
  send: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 11 21 3l-8 18-2-8-8-2Z" /></svg>,
}

function seedPosts(sym) {
  const p = sym.p, f = (k) => fa(Math.round(p * k))
  return [
    { id: 1, u: 'xjaeden', d: '۰۵/۰۶/۱۵', t: `فردا بعد از مثبت باز شدن ${sym.s} فروشنده باشید و سیو سود کنید، بوی سیگنال فروش میاد.`, v: 323, up: 0, dn: 0, c: 0, kind: 'نظر' },
    { id: 2, u: 'Warren_Investor', d: '۰۵/۰۶/۰۴', t: `مدیر صندوقی که در ${sym.s} سهامداره کارش رو بلده؛ از شاگردان قدیمی بازار سرمایه است و کار درست انجام میده.`, v: 307, up: 4, dn: 1, c: 0, kind: 'نظر', best: true },
    { id: 3, u: 'mohammadasgari', d: '۰۵/۰۴/۰۱', edited: true, t: `چهار سهامدار عمده ۳۱ خرداد با هم خروج زدن، حدود ۱۲ میلیون برگ سهم.`, v: 582, up: 0, dn: 0, c: 2, kind: 'نظر' },
    { id: 4, u: 'فراستا', d: '۰۴/۱۰/۲۸', t: 'بخر که موقعشه', v: 966, up: 1, dn: 0, c: 0, kind: 'نظر' },
    { id: 5, u: 'SMT95', d: '۰۵/۰۴/۱۷', t: `سلام و عرض ادب\nحمایت مهم ${f(.95)} الی ${f(.93)}\nدر صورت واکنش مثبت و تثبیت، هدف اول ${f(1.12)}\nحد ضرر ${f(.86)} رعایت گردد.\nموفق و پرسود باشید.`, v: 1900, up: 1, dn: 0, c: 0, kind: 'تحلیل', chart: true, best: true },
    { id: 6, u: 'mohammadasgari', d: '۰۴/۱۰/۲۸', t: `دو سه مرتبه به سقف حمله کرده و نتونسته از مقاومت ${f(1.04)} عبور کنه؛ خرید در صورت شکست و عبور از مقاومت با حجم مناسب.`, v: 2500, up: 3, dn: 0, c: 0, kind: 'تحلیل' },
  ]
}
const STORIES = [
  { u: 'مسعود_جزایری', label: 'مسعود جزایری', slides: [['معامله درست، صبر، سود منطقی', '#1e3a8a'], ['کد به کد زاگرس خوب بود؛ اصلاحش هم انجام شده.', '#1f2f3f', { q: 'بسیار کم ریسکه', o: [['موافقم', 89], ['مخالفم', 11]] }], ['حد ضرر رو هیچ‌وقت جابه‌جا نکنید', '#0f766e']], t: '۳ ساعت پیش' },
  { u: 'امواج_الیوت', label: 'امواج الیوت', slides: [['موج ۳ در جریانه؛ هدف بعدی بالای سقف قبلی', '#7c2d12'], ['اصلاح ABC تمام شد؟', '#581c87', { q: 'نظر شما؟', o: [['بله، تمام شد', 62], ['هنوز نه', 38]] }], ['شاخص کل: حمایت ۲٬۸۵۰٬۰۰۰', '#1e40af']], t: '۲۰ ساعت پیش' },
  { u: 'تحلیلگر_ارشد', label: 'تحلیلگر ارشد', slides: [['ورود پول حقیقی امروز: +۱٬۲۰۰ میلیارد', '#065f46']], t: 'دیروز' },
]

function MiniChart() {
  const pts = [40, 46, 43, 52, 49, 58, 55, 66, 61, 74, 70, 82], W = 300, H = 120
  const line = pts.map((v, i) => `${i ? 'L' : 'M'}${i / (pts.length - 1) * W},${H - v}`).join('')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-2 h-36 w-full max-w-md rounded-xl border border-line bg-surface2/40" style={{ direction: 'ltr' }}>
      {[30, 60, 90].map((y) => <line key={y} x1="0" x2={W} y1={y} y2={y} stroke="rgb(var(--line))" strokeDasharray="3 4" />)}
      <line x1="0" x2={W} y1={H - 52} y2={H - 52} stroke="rgb(var(--up))" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <line x1="0" x2={W} y1={H - 80} y2={H - 80} stroke="rgb(var(--down))" strokeWidth="1.5" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />
      <path d={line} fill="none" stroke="#3C7CFF" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function Post({ p, me, onMenu, toggle }) {
  const [open, setOpen] = useState(false)
  const long = p.t.length > 140 || p.t.split('\n').length > 4
  return (
    <motion.article layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-line bg-surface2/25 p-4">
      <div className="flex items-start gap-3">
        <Avatar name={p.u} />
        <div className="min-w-0 flex-1">
          <b className="block truncate text-right"><bdi>{p.u}</bdi></b>
          <span className="num text-xs text-muted">{p.edited ? 'ویرایش شده: ' : ''}{p.d}</span>
        </div>
        {p.u !== me && <motion.button whileTap={{ scale: .94 }} onClick={() => toggle(p.id, 'follow')} className={`btn !h-8 !px-4 ${p.follow ? 'btn-on' : ''}`}>{p.follow ? 'دنبال‌شده' : 'دنبال'}</motion.button>}
      </div>
      <p className={`mt-3 whitespace-pre-line text-sm leading-7 ${!open && long ? 'line-clamp-4' : ''}`}>{p.t}</p>
      {long && <button onClick={() => setOpen(!open)} className="text-xs text-brand-light hover:underline">{open ? 'کمتر' : 'ادامه…'}</button>}
      {p.chart && <MiniChart />}
      <div className="num mt-2 flex items-center gap-1 text-[11px] text-brand-light">{Ico.eye}{p.v >= 1000 ? fa(p.v / 1000, 1) + ' k' : fa(p.v)}</div>
      <div className="mt-2 flex items-center gap-5 border-t border-line/60 pt-3 text-xs text-muted">
        <motion.button whileTap={{ scale: 1.25 }} onClick={() => toggle(p.id, 'liked')} className={`flex items-center gap-1 ${p.liked ? 'text-up' : 'hover:text-ink'}`}>{Ico.up(p.liked)}<span className="num">{fa(p.up + (p.liked ? 1 : 0))}</span></motion.button>
        {p.kind === 'نظر' && <motion.button whileTap={{ scale: 1.25 }} onClick={() => toggle(p.id, 'disliked')} className={`flex items-center gap-1 ${p.disliked ? 'text-down' : 'hover:text-ink'}`}><span className="rotate-180">{Ico.up(p.disliked)}</span><span className="num">{fa(p.dn + (p.disliked ? 1 : 0))}</span></motion.button>}
        <button className="flex items-center gap-1 hover:text-ink">{Ico.chat}{p.c > 0 && <span className="num">{fa(p.c)}</span>}</button>
        <span className="flex-1" />
        <button onClick={(e) => onMenu(p, e.currentTarget.getBoundingClientRect())} aria-label="گزینه‌ها" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-surface2 hover:text-ink">{Ico.more}</button>
      </div>
    </motion.article>
  )
}

// carousel story viewer: active story in the middle, neighbours as dimmed previews; RTL so the next story sits on the left
function Preview({ st, onClick }) {
  return (
    <button onClick={onClick}
      className="relative hidden h-[min(56vh,440px)] w-48 shrink-0 overflow-hidden rounded-2xl opacity-60 transition-opacity hover:opacity-90 lg:block" style={{ background: `linear-gradient(160deg, ${st.slides[0][1]}, #0b1022)` }}>
      <p className="absolute inset-x-3 top-6 line-clamp-3 text-center text-xs font-bold text-white/70">{st.slides[0][0]}</p>
      <span className="absolute inset-0 grid place-content-center justify-items-center gap-1 bg-black/45 text-white">
        <span className="rounded-full bg-gradient-to-tr from-brand-dark via-brand-light to-cyan-400 p-[3px]"><span className="block rounded-full border-2 border-black"><Avatar name={st.u} size={64} /></span></span>
        <b className="text-sm">{st.label}</b><span className="text-xs opacity-80">{st.t}</span>
      </span>
    </button>)
}

const REASONS = ['استفاده از الفاظ و کلمات نامناسب', 'محتوای نامربوط به بازار', 'انتشار شماره، لینک یا آی‌دی', 'توهین به فرد، گروه، اقوام و …', 'دلایل دیگر']
// poll sticker inside a story slide: tap to vote, then bars fill with the results and your choice is marked
function StoryPoll({ poll, vote, setVote }) {
  const voted = vote != null
  const res = poll.o.map(([t, pct], k) => { const bump = voted ? (k === vote ? 1 : 0) : 0; return [t, pct + bump] })
  const total = res.reduce((a, [, v]) => a + v, 0)
  return (
    <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} className="absolute inset-x-4 bottom-4 z-[2] space-y-2 rounded-2xl bg-black/55 p-3 text-white backdrop-blur">
      <p className="text-center text-sm font-bold">{poll.q}</p>
      {res.map(([t, v], k) => { const pct = Math.round(v / total * 100), mine = vote === k; return (
        <button key={t} disabled={voted} onClick={() => setVote(k)} className="relative flex h-10 w-full items-center justify-between overflow-hidden rounded-xl bg-white/15 px-3 text-sm transition-colors enabled:hover:bg-white/25">
          {voted && <motion.span initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: .6, ease: 'easeOut' }} className={`absolute inset-y-0 right-0 rounded-xl ${mine ? 'bg-brand' : 'bg-white/25'}`} />}
          <span className="relative font-semibold">{t}</span>
          {voted && <span className="num relative flex items-center gap-1.5 text-xs">{mine && <span className="rounded bg-white/25 px-1.5">شما</span>}{fa(pct)}٪</span>}
        </button>) })}
    </div>
  )
}

function StoryViewer({ stories, idx, setIdx, onClose, say }) {
  const [votes, setVotes] = useState({})
  const [report, setReport] = useState(false)
  const [i, setI] = useState(0), [prog, setProg] = useState(0)
  const [paused, setPaused] = useState(false), [muted, setMuted] = useState(true), [liked, setLiked] = useState(false)
  const [msg, setMsg] = useState('')
  const story = idx != null ? stories[idx] : null
  useEffect(() => { setI(0); setProg(0); setLiked(false); setReport(false) }, [idx])
  useEffect(() => { setProg(0) }, [i])
  const next = () => (i < story.slides.length - 1 ? setI(i + 1) : idx < stories.length - 1 ? setIdx(idx + 1) : onClose())
  const prev = () => (i > 0 ? setI(i - 1) : idx > 0 && setIdx(idx - 1))
  useEffect(() => {
    if (!story || paused) return
    const t = setInterval(() => setProg((p) => (p >= 1 ? 1 : p + 0.02)), 100)   // 5s per slide
    return () => clearInterval(t)
  }, [story, paused, i])
  useEffect(() => { if (prog >= 1) next() }, [prog])
  useEffect(() => {
    if (!story) return
    const k = (e) => { if (e.key === 'ArrowLeft') next(); if (e.key === 'ArrowRight') prev(); if (e.key === ' ') { e.preventDefault(); setPaused((x) => !x) } }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  })
  const btn = 'grid h-9 w-9 place-items-center rounded-full text-white hover:bg-white/15'
  return (
    <AnimatePresence>{story && (
      <motion.div data-overlay className="fixed inset-0 z-[70] flex items-center justify-center gap-6 bg-[#0b0d14]/95 px-6 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <button onClick={onClose} aria-label="بستن" className="absolute left-5 top-5 grid h-10 w-10 place-items-center rounded-full text-2xl text-white hover:bg-white/10">×</button>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-4 overflow-hidden">{[idx - 2, idx - 1].filter((k) => k >= 0).map((k) => <Preview key={stories[k].u} st={stories[k]} onClick={() => setIdx(k)} />)}</div>
        {idx > 0 ? <button onClick={prev} aria-label="قبلی" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="m9 6 6 6-6 6" /></svg></button> : <span className="w-9" />}

        <motion.div key={story.u} initial={{ scale: .94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative flex h-[min(94vh,820px)] w-[min(94vw,440px)] shrink-0 flex-col overflow-hidden rounded-2xl bg-black shadow-2xl">
          <div className="absolute inset-x-3 top-3 z-10 flex gap-1" dir="ltr">
            {story.slides.map((_, k) => <span key={k} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30"><span className="block h-full bg-white" style={{ width: `${k < i ? 100 : k === i ? prog * 100 : 0}%` }} /></span>)}
          </div>
          <div className="absolute inset-x-3 top-6 z-10 flex items-center gap-2 text-white">
            <Avatar name={story.u} size={34} /><b className="text-sm">{story.label}</b><span className="text-xs opacity-70">{story.t}</span>
            <span className="flex-1" />
            <button onClick={() => setMuted(!muted)} title={muted ? 'صدا' : 'بی‌صدا'} className={btn}>{muted
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H3v6h3l5 4V5ZM22 9l-6 6M16 9l6 6" /></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H3v6h3l5 4V5ZM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></svg>}</button>
            <button onClick={() => setPaused(!paused)} title={paused ? 'پخش' : 'توقف'} className={btn}>{paused
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8Z" /></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>}</button>
            <button onClick={() => { setPaused(true); setReport(true) }} title="گزارش استوری" aria-label="گزارش استوری" className={btn}>{Ico.flag}</button>
          </div>
          <div className="relative flex-1" style={{ background: `linear-gradient(160deg, ${story.slides[i][1]}, #05070f)` }} onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)}>
            <button aria-label="قبلی" className="absolute inset-y-0 right-0 z-[1] w-1/3" onClick={prev} />
            <button aria-label="بعدی" className="absolute inset-y-0 left-0 z-[1] w-2/3" onClick={next} />
            <AnimatePresence mode="wait"><motion.p key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-3xl font-extrabold leading-relaxed text-white">{story.slides[i][0]}</motion.p></AnimatePresence>
            {story.slides[i][2] && <StoryPoll poll={story.slides[i][2]} vote={votes[`${story.u}-${i}`]} setVote={(k) => { setVotes({ ...votes, [`${story.u}-${i}`]: k }); say('رأی شما ثبت شد') }} />}
          </div>
          <AnimatePresence>{report && (
            <motion.div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setReport(false); setPaused(false) }}>
              <motion.div onClick={(e) => e.stopPropagation()} initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} className="m-3 space-y-2">
                <div className="overflow-hidden rounded-2xl bg-surface">
                  <h4 className="border-b border-line py-3 text-center text-sm font-bold">گزارش استوری {story.label}</h4>
                  {REASONS.map((r) => <button key={r} onClick={() => { setReport(false); setPaused(false); say('گزارش شما ثبت شد؛ متشکریم') }} className="block w-full border-b border-line/60 py-3.5 text-center text-sm last:border-0 hover:bg-surface2">{r}</button>)}
                </div>
                <button onClick={() => { setReport(false); setPaused(false) }} className="w-full rounded-2xl bg-surface py-3.5 font-semibold hover:bg-surface2">بستن</button>
              </motion.div>
            </motion.div>
          )}</AnimatePresence>
          <form onSubmit={(e) => { e.preventDefault(); if (msg.trim()) { say(`پیام برای ${story.label} ارسال شد`); setMsg('') } }} className="flex items-center gap-2 bg-black p-3">
            <input value={msg} onChange={(e) => setMsg(e.target.value)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} placeholder={`پاسخ به ${story.label}…`} className="h-11 flex-1 rounded-full border border-white/40 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/60 focus:border-white" />
            <motion.button type="button" whileTap={{ scale: 1.3 }} onClick={() => setLiked(!liked)} aria-label="پسندیدن" className={`grid h-10 w-10 place-items-center ${liked ? 'text-down' : 'text-white'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11Z" /></svg></motion.button>
            <button aria-label="ارسال" className="grid h-10 w-10 place-items-center text-white"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M3 11 21 3l-8 18-2-8-8-2Z" /></svg></button>
          </form>
        </motion.div>

        {idx < stories.length - 1 ? <button onClick={() => setIdx(idx + 1)} aria-label="بعدی" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="m15 6-6 6 6 6" /></svg></button> : <span className="w-9" />}
        <div className="flex min-w-0 flex-1 items-center justify-start gap-4 overflow-hidden">{[idx + 1, idx + 2].filter((k) => k < stories.length).map((k) => <Preview key={stories[k].u} st={stories[k]} onClick={() => setIdx(k)} />)}</div>
      </motion.div>
    )}</AnimatePresence>
  )
}

const TABS = [['latest', 'آخرین نظرات'], ['best', 'نظرات برگزیده'], ['analysis', 'تحلیل']]
export default function Opinions({ sym }) {
  const ME = 'احسان_مرادی'
  const [tab, setTab] = useState('latest')
  // keep the latest/featured/analysis tabs floating right under the symbol's sticky tab bar
  const tabsRef = useRef(null), [barH, setBarH] = useState(0), [stuck, setStuck] = useState(false), [fabHidden, setFabHidden] = useState(false)
  useEffect(() => {
    const sc = tabsRef.current?.closest('.scroll-y'); if (!sc) return
    let last = sc.scrollTop
    // pinned pill when the tabs have scrolled away; compose button hides while scrolling down and returns on scroll up
    const on = () => {
      setStuck(tabsRef.current.getBoundingClientRect().bottom <= sc.getBoundingClientRect().top + barH + 1)
      const y = sc.scrollTop; if (Math.abs(y - last) > 6) { setFabHidden(y > last && y > 80); last = y }
    }
    on(); sc.addEventListener('scroll', on, { passive: true }); return () => sc.removeEventListener('scroll', on)
  }, [barH])
  useEffect(() => { const bar = document.querySelector('[data-symtabs]'); if (!bar) return; const m = () => setBarH(bar.offsetHeight); m(); const ro = new ResizeObserver(m); ro.observe(bar); return () => ro.disconnect() }, [])
  const pick = (k) => { setTab(k); const sc = tabsRef.current?.closest('.scroll-y'); if (sc && stuck) tabsRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' }) }
  const [posts, setPosts] = useState(() => seedPosts(sym))
  useEffect(() => setPosts(seedPosts(sym)), [sym])
  const [stories, setStories] = useState(STORIES)
  const [seen, setSeen] = useState([])
  const [view, setView] = useState(null)
  const [menu, setMenu] = useState(null)       // { p, rect }
  const [sheet, setSheet] = useState(null)     // 'report' | 'story' | 'write'
  const [toast, setToast] = useState(null)
  const [draft, setDraft] = useState({ t: '', kind: 'نظر' })
  const say = (m) => { setToast(m); clearTimeout(say.t); say.t = setTimeout(() => setToast(null), 2400) }
  const toggle = (id, k) => setPosts((ps) => ps.map((p) => (p.id !== id ? p : k === 'liked' ? { ...p, liked: !p.liked, disliked: false } : k === 'disliked' ? { ...p, disliked: !p.disliked, liked: false } : { ...p, [k]: !p[k] })))
  const list = posts.filter((p) => (tab === 'latest' ? p.kind === 'نظر' : tab === 'best' ? p.best : p.kind === 'تحلیل'))
  const openStory = (k) => { setView(k); setSeen((s) => [...new Set([...s, stories[k].u])]) }
  const nextStory = () => (view < stories.length - 1 ? openStory(view + 1) : setView(null))
  const addStory = (type) => {
    setSheet(null)
    if (type === 'live') return say('پخش زنده به‌زودی فعال می‌شود')
    const s = { u: ME, label: 'استوری شما', t: 'همین حالا', slides: [[{ photo: 'استوری عکس شما', poll: `${sym.s} فردا مثبت یا منفی؟`, q: `سؤالتون درباره ${sym.s} رو بپرسید` }[type], '#1d4ed8', type === 'poll' ? { q: `${sym.s} فردا…`, o: [['مثبت', 50], ['منفی', 50]] } : undefined]] }
    setStories((st) => [s, ...st.filter((x) => x.u !== ME)]); say('استوری شما منتشر شد')
  }
  const mine = stories.find((s) => s.u === ME)

  return (
    <div className="relative -mx-5 -mt-5">
      {/* stories */}
      <div className="flex gap-4 overflow-x-auto border-b border-line px-5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button onClick={() => (mine ? openStory(stories.indexOf(mine)) : setSheet('story'))} className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-[11px]">
          <span className="relative"><Avatar name="احسان" size={56} ring={!!mine} />
            <span onClick={(e) => { e.stopPropagation(); setSheet('story') }} className="absolute -bottom-0.5 -left-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-surface bg-brand text-sm font-bold leading-none text-white">+</span></span>
          استوری شما
        </button>
        {stories.filter((s) => s.u !== ME).map((s) => (
          <button key={s.u} onClick={() => openStory(stories.indexOf(s))} className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-[11px]">
            <span className={`rounded-full p-[2.5px] ${seen.includes(s.u) ? 'bg-line' : 'bg-gradient-to-tr from-brand-dark via-brand-light to-cyan-400'}`}><span className="block rounded-full border-2 border-surface"><Avatar name={s.u} size={50} /></span></span>
            <span className="w-full truncate">{s.label}</span>
          </button>
        ))}
      </div>
      {/* tabs */}
      {/* in-flow underline tabs */}
      <div ref={tabsRef} className="grid grid-cols-3 border-b border-line">
        {TABS.map(([k, t]) => (
          <button key={k} onClick={() => pick(k)} className={`relative py-3 text-sm ${tab === k ? 'font-bold text-brand-light' : 'text-muted hover:text-ink'}`}>
            {t}{tab === k && <motion.span layoutId="op-tab" className="absolute inset-x-6 -bottom-px h-0.5 rounded-full bg-brand-light" />}
          </button>
        ))}
      </div>
      {/* once those tabs have scrolled away, a blurred pill slides down from the top and stays */}
      <div style={{ top: barH }} className="pointer-events-none sticky z-10 h-0">
        <AnimatePresence>{stuck && (
          <motion.div initial={{ y: -64, opacity: 0 }} animate={{ y: 10, opacity: 1 }} exit={{ y: -64, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 34 }} className="flex justify-center">
            <div className="pointer-events-auto grid grid-cols-3 gap-1 rounded-full bg-surface2/55 p-1 shadow-[0_10px_30px_-8px_rgba(0,0,0,.6)] ring-1 ring-white/10 backdrop-blur-xl">
              {TABS.map(([k, t]) => (
                <button key={k} onClick={() => pick(k)} className={`relative whitespace-nowrap rounded-full px-5 py-1.5 text-sm transition-colors ${tab === k ? 'font-bold text-white' : 'text-muted hover:text-ink'}`}>
                  {tab === k && <motion.span layoutId="op-pill" className="absolute inset-0 rounded-full bg-gradient-to-l from-brand-light to-brand-dark shadow-glow" />}
                  <span className="relative">{t}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}</AnimatePresence>
      </div>
      <div className="space-y-3 p-5">
        <AnimatePresence initial={false}>{list.map((p) => <Post key={p.id} p={p} me={ME} toggle={toggle} onMenu={(p, rect) => setMenu({ p, rect })} />)}</AnimatePresence>
        {!list.length && <p className="py-12 text-center text-sm text-muted">هنوز موردی ثبت نشده است.</p>}
      </div>
      {/* compose */}
      <div className="pointer-events-none sticky bottom-0 z-20 h-0">
        <motion.button animate={{ y: fabHidden ? 120 : 0, opacity: fabHidden ? 0 : 1 }} transition={{ type: 'spring', stiffness: 420, damping: 32 }} whileHover={{ scale: 1.06 }} whileTap={{ scale: .92 }}
          onClick={() => { setDraft({ t: '', kind: tab === 'analysis' ? 'تحلیل' : 'نظر' }); setSheet('write') }} aria-label="نوشتن نظر"
          className="pointer-events-auto absolute bottom-5 left-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-light to-brand-dark text-white shadow-glow">{Ico.pen}</motion.button>
      </div>

      {/* post menu */}
      <AnimatePresence>{menu && (
        <div className="fixed inset-0 z-[65]" onClick={() => setMenu(null)}>
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .92 }} transition={{ duration: .14 }}
            style={{ top: Math.min(innerHeight - 220, menu.rect.bottom + 6), left: Math.max(8, menu.rect.left) }} className="fixed w-48 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
            {[['profile', 'پروفایل', Ico.user], ['copy', 'کپی', Ico.copy], ['share', 'اشتراک', Ico.share], ['report', 'گزارش', Ico.flag]].map(([k, t, ic]) => (
              <button key={k} onClick={() => {
                const p = menu.p; setMenu(null)
                if (k === 'copy') navigator.clipboard?.writeText(p.t).then(() => say('متن کپی شد'), () => say('کپی انجام نشد'))
                if (k === 'share') say('لینک نظر کپی شد')
                if (k === 'profile') say(`پروفایل ${p.u}`)
                if (k === 'report') setSheet('report')
              }} className={`flex w-full items-center justify-between border-b border-line/60 px-4 py-3 text-sm last:border-0 hover:bg-surface2 ${k === 'report' ? 'text-down' : ''}`}>{t}{ic}</button>
            ))}
          </motion.div>
        </div>
      )}</AnimatePresence>

      <Modal open={sheet === 'report'} title="گزارش نظر" onClose={() => setSheet(null)}>
        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {['استفاده از الفاظ و کلمات نامناسب', 'نظر نامربوط به سهم', 'انتشار شماره، لینک یا آی‌دی', 'توهین به فرد، گروه، اقوام و …', 'دلایل دیگر'].map((r) => (
            <button key={r} onClick={() => { setSheet(null); say('گزارش شما ثبت شد؛ متشکریم') }} className="block w-full px-4 py-3.5 text-center text-sm hover:bg-surface2">{r}</button>
          ))}
        </div>
      </Modal>
      <Modal open={sheet === 'story'} title="استوری جدید" onClose={() => setSheet(null)}>
        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {[['photo', 'استوری عکس', Ico.cam], ['poll', 'استوری نظرسنجی', Ico.poll], ['q', 'استوری سوال', Ico.q], ['live', 'پخش زنده', Ico.live]].map(([k, t, ic]) => (
            <button key={k} onClick={() => addStory(k)} className={`flex w-full items-center justify-between px-4 py-3.5 text-sm hover:bg-surface2 ${k === 'live' ? 'text-down' : ''}`}>{t}{ic}</button>
          ))}
        </div>
      </Modal>
      <Modal open={sheet === 'write'} title={`نوشتن ${draft.kind} درباره ${sym.s}`} onClose={() => setSheet(null)}
        actions={<motion.button whileTap={{ scale: .97 }} disabled={!draft.t.trim()} onClick={() => {
          setPosts((ps) => [{ id: Date.now(), u: ME, d: 'همین حالا', t: draft.t.trim(), v: 0, up: 0, dn: 0, c: 0, kind: draft.kind }, ...ps]); setTab(draft.kind === 'تحلیل' ? 'analysis' : 'latest'); setSheet(null); say('منتشر شد')
        }} className="h-11 flex-1 rounded-xl bg-gradient-to-l from-brand-light to-brand-dark font-bold text-white shadow-glow disabled:opacity-40">انتشار</motion.button>}>
        <div className="mb-3 flex gap-2">{['نظر', 'تحلیل'].map((k) => <button key={k} onClick={() => setDraft({ ...draft, kind: k })} className={`btn ${draft.kind === k ? 'btn-on' : ''}`}>{k}</button>)}</div>
        <textarea autoFocus rows={5} value={draft.t} onChange={(e) => setDraft({ ...draft, t: e.target.value })} placeholder={draft.kind === 'تحلیل' ? 'حمایت، مقاومت، هدف و حد ضرر را بنویسید…' : 'نظرت درباره این نماد…'}
          className="w-full resize-none rounded-xl border border-line bg-surface2/50 p-3 text-sm leading-7 outline-none focus:border-brand/60" />
      </Modal>

      <StoryViewer stories={stories} idx={view} setIdx={openStory} onClose={() => setView(null)} say={say} />
      <AnimatePresence>{toast && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="pointer-events-none fixed bottom-8 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-surface2 px-4 py-2 text-xs shadow-2xl ring-1 ring-line">{toast}</motion.div>
      )}</AnimatePresence>
    </div>
  )
}
