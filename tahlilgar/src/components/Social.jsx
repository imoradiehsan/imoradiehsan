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
  { u: 'مسعود_جزایری', label: 'مسعود جزایری', slides: [['معامله درست، صبر، سود منطقی', '#1e3a8a'], ['حد ضرر رو هیچ‌وقت جابه‌جا نکنید', '#0f766e']], t: '۳ ساعت پیش' },
  { u: 'امواج_الیوت', label: 'امواج الیوت', slides: [['موج ۳ در جریانه؛ هدف بعدی بالای سقف قبلی', '#7c2d12'], ['اصلاح ABC تمام شد؟ نظرتون رو بنویسید', '#581c87'], ['شاخص کل: حمایت ۲٬۸۵۰٬۰۰۰', '#1e40af']], t: '۲۰ ساعت پیش' },
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

function StoryViewer({ story, onClose, onNext }) {
  const [i, setI] = useState(0)
  const [msg, setMsg] = useState('')
  useEffect(() => { setI(0) }, [story])
  useEffect(() => {
    if (!story) return
    const t = setTimeout(() => (i < story.slides.length - 1 ? setI(i + 1) : onNext()), 5000)
    return () => clearTimeout(t)
  }, [i, story])
  return (
    <AnimatePresence>{story && (
      <motion.div data-overlay className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: .9 }} animate={{ scale: 1 }} exit={{ scale: .9 }} className="relative flex h-[min(92vh,760px)] w-[min(94vw,420px)] flex-col overflow-hidden rounded-3xl bg-surface shadow-2xl">
          <div className="absolute inset-x-3 top-3 z-10 flex gap-1">
            {story.slides.map((_, k) => (
              <span key={k} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                <motion.span key={`${story.u}-${i}-${k}`} className="block h-full bg-white" initial={{ width: k < i ? '100%' : 0 }} animate={{ width: k <= i ? '100%' : 0 }} transition={{ duration: k === i ? 5 : 0, ease: 'linear' }} />
              </span>
            ))}
          </div>
          <div className="absolute inset-x-3 top-6 z-10 flex items-center gap-2 text-white">
            <Avatar name={story.u} size={34} /><div className="flex-1 leading-tight"><b className="block text-sm">{story.label}</b><span className="text-[11px] opacity-80">{story.t}</span></div>
            <button title="گزارش" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15">{Ico.flag}</button>
            <button onClick={onClose} aria-label="بستن" className="grid h-8 w-8 place-items-center rounded-full text-xl hover:bg-white/15">×</button>
          </div>
          <div className="relative flex-1" style={{ background: `linear-gradient(160deg, ${story.slides[i][1]}, #0b1022)` }}>
            <button aria-label="قبلی" className="absolute inset-y-0 right-0 w-1/3" onClick={() => setI(Math.max(0, i - 1))} />
            <button aria-label="بعدی" className="absolute inset-y-0 left-0 w-2/3" onClick={() => (i < story.slides.length - 1 ? setI(i + 1) : onNext())} />
            <AnimatePresence mode="wait"><motion.p key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-2xl font-extrabold leading-relaxed text-white">{story.slides[i][0]}</motion.p></AnimatePresence>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); setMsg('') }} className="flex items-center gap-2 border-t border-line p-3">
            <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="ارسال پیام" className="h-10 flex-1 rounded-full bg-surface2 px-4 text-sm outline-none" />
            <button disabled={!msg.trim()} className="grid h-10 w-10 place-items-center rounded-full bg-brand text-white disabled:opacity-40">{Ico.send}</button>
          </form>
        </motion.div>
      </motion.div>
    )}</AnimatePresence>
  )
}

export default function Opinions({ sym }) {
  const ME = 'احسان_مرادی'
  const [tab, setTab] = useState('latest')
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
    const s = { u: ME, label: 'استوری شما', t: 'همین حالا', slides: [[{ photo: 'استوری عکس شما', poll: `${sym.s} فردا مثبت یا منفی؟`, q: `سؤالتون درباره ${sym.s} رو بپرسید` }[type], '#1d4ed8']] }
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
      <div className="grid grid-cols-3 border-b border-line">
        {[['latest', 'آخرین نظرات'], ['best', 'نظرات برگزیده'], ['analysis', 'تحلیل']].map(([k, t]) => (
          <button key={k} onClick={() => setTab(k)} className={`relative py-3 text-sm ${tab === k ? 'font-bold text-brand-light' : 'text-muted hover:text-ink'}`}>
            {t}{tab === k && <motion.span layoutId="op-tab" className="absolute inset-x-6 -bottom-px h-0.5 rounded-full bg-brand-light" />}
          </button>
        ))}
      </div>
      <div className="space-y-3 p-5">
        <AnimatePresence initial={false}>{list.map((p) => <Post key={p.id} p={p} me={ME} toggle={toggle} onMenu={(p, rect) => setMenu({ p, rect })} />)}</AnimatePresence>
        {!list.length && <p className="py-12 text-center text-sm text-muted">هنوز موردی ثبت نشده است.</p>}
      </div>
      {/* compose */}
      <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: .92 }} onClick={() => { setDraft({ t: '', kind: tab === 'analysis' ? 'تحلیل' : 'نظر' }); setSheet('write') }} aria-label="نوشتن نظر"
        className="sticky bottom-4 left-4 z-20 float-left -mt-14 ml-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-light to-brand-dark text-white shadow-glow">{Ico.pen}</motion.button>

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

      <StoryViewer story={view != null ? stories[view] : null} onClose={() => setView(null)} onNext={nextStory} />
      <AnimatePresence>{toast && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="pointer-events-none fixed bottom-8 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-surface2 px-4 py-2 text-xs shadow-2xl ring-1 ring-line">{toast}</motion.div>
      )}</AnimatePresence>
    </div>
  )
}
