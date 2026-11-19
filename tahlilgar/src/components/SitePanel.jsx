import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Star, Chart, Graph, Activity } from 'react-iconly'
import Candles from './Candles'
import Count, { Change } from './Count'
import { candles, orderBook, fa, SYMBOLS } from '../data/market'

const NAV = ['بازار', 'چارت', 'تحلیل‌ها', 'اخبار', 'دیده‌بان', 'آموزش']
const TF = ['۱ روز', '۱ هفته', '۱ ماه', '۳ ماه', '۱ سال']

export default function SitePanel({ sym, dark, setDark, openOrder }) {
  const [nav, setNav] = useState('چارت')
  const [tf, setTf] = useState('۱ ماه')
  const [type, setType] = useState('candle')
  const [ma, setMa] = useState(true)
  const [info, setInfo] = useState('depth')
  const [fav, setFav] = useState(false)
  const data = useMemo(() => candles(sym, tf), [sym, tf])

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-surface lg:h-full">
      {/* Site header */}
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-line px-5">
        <img src="./logo.png" alt="" className="h-8 w-8 rounded-lg" /><span className="hidden font-bold xl:block">تحلیلگر بورس</span>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <button key={n} onClick={() => setNav(n)} className={`relative px-3 py-2 text-sm transition-colors ${nav === n ? 'font-semibold text-ink' : 'text-muted hover:text-ink'}`}>
              {n}
              {nav === n && <motion.span layoutId="nav-u" className="absolute inset-x-3 -bottom-[11px] h-0.5 rounded-full bg-brand-light" />}
            </button>
          ))}
        </nav>
        <div className="flex-1" />
        <button className="hidden rounded-full border border-line/70 px-4 py-2 text-sm text-muted hover:text-ink sm:block">قیمت‌ها و پلن‌ها</button>
        <button onClick={() => setDark(!dark)} className="icon-btn !h-10 !w-10 overflow-hidden" title="تغییر تم">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={dark ? 'm' : 's'} initial={{ y: 18, opacity: 0, rotate: -90 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ y: -18, opacity: 0, rotate: 90 }}>
              {dark ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>}
            </motion.span>
          </AnimatePresence>
        </button>
        <button className="flex items-center gap-2 rounded-full border border-line/70 py-1 pl-3 pr-1">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-light to-brand-dark text-xs font-bold text-white">ا‌م</span>
          <span className="hidden text-sm font-medium sm:block">احسان مرادی</span>
          <ChevronDown set="light" size={14} primaryColor="currentColor" />
        </button>
      </header>

      <div className="scroll-y min-h-0 flex-1">
      {/* Symbol summary */}
      <AnimatePresence mode="wait">
        <motion.div key={sym.s} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .25 }}
          className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 pt-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-light to-brand-dark font-bold text-white shadow-glow">{sym.s.slice(0, 2)}</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{sym.s}</h1>
                <motion.button whileTap={{ scale: .7 }} onClick={() => setFav(!fav)} className={fav ? 'text-amber-400' : 'text-muted'}><Star set={fav ? 'bold' : 'light'} size={18} primaryColor="currentColor" /></motion.button>
              </div>
              <div className="text-xs text-muted">{sym.n} · {sym.ind}</div>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold"><Count to={sym.p} /></span><span className="text-sm text-muted">ریال</span>
            <Change c={sym.c} />
          </div>
          <div className="flex gap-5 text-sm">
            {[['حجم', sym.vol], ['ارزش بازار', sym.mc], ['P/E', sym.pe ? fa(sym.pe, 1) : '—']].map(([k, v]) => (
              <div key={k}><div className="text-xs text-muted">{k}</div><div className="num font-semibold">{v}</div></div>
            ))}
          </div>
          <div className="mr-auto flex gap-2">
            <motion.button whileTap={{ scale: .94 }} onClick={() => openOrder()} className="rounded-xl bg-gradient-to-l from-brand-light to-brand-dark px-5 py-2.5 text-sm font-bold text-white shadow-glow">معامله</motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Chart toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-5 py-3">
        <div className="flex rounded-xl border border-line/70 bg-surface2/40 p-1">
          {TF.map((t) => (
            <button key={t} onClick={() => setTf(t)} className="relative rounded-lg px-3 py-1.5 text-xs">
              {tf === t && <motion.span layoutId="tf" className="absolute inset-0 rounded-lg bg-brand" />}
              <span className={`relative ${tf === t ? 'font-semibold text-white' : 'text-muted'}`}>{t}</span>
            </button>
          ))}
        </div>
        <div className="flex rounded-xl border border-line/70 bg-surface2/40 p-1">
          {[['candle', 'شمعی', Chart], ['area', 'خطی', Graph]].map(([k, t, I]) => (
            <button key={k} onClick={() => setType(k)} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition-colors ${type === k ? 'bg-surface2 text-ink' : 'text-muted'}`}>
              <I set="light" size={14} primaryColor="currentColor" />{t}
            </button>
          ))}
        </div>
        <button onClick={() => setMa(!ma)} className={`flex items-center gap-1 rounded-xl border px-3 py-2 text-xs transition-colors ${ma ? 'border-amber-400/60 text-amber-400' : 'border-line/70 text-muted'}`}>
          <Activity set="light" size={14} primaryColor="currentColor" /> میانگین متحرک
        </button>
      </div>

      <div className="mx-5 h-[62vh] min-h-[340px] rounded-2xl border border-line/60 bg-bg/40">
        <Candles key={sym.s + tf} data={data} type={type} showMA={ma} />
      </div>

      {/* Info tabs */}
      <div className="px-5 pb-4 pt-3">
        <div className="mb-3 flex gap-1">
          {[['depth', 'عمق بازار'], ['flow', 'حقیقی / حقوقی'], ['fund', 'اطلاعات بنیادی']].map(([k, t]) => (
            <button key={k} onClick={() => setInfo(k)} className={`rounded-full px-4 py-1.5 text-sm transition-colors ${info === k ? 'bg-brand/15 font-semibold text-brand-light' : 'text-muted hover:text-ink'}`}>{t}</button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={info + sym.s} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .2 }} className="overflow-x-auto">
            {info === 'depth' && <Depth p={sym.p} />}
            {info === 'flow' && <Flow c={sym.c} />}
            {info === 'fund' && <Fund sym={sym} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <Extra sym={sym} />
      </div>
    </section>
  )
}

function Depth({ p }) {
  const ob = orderBook(p)
  const mx = Math.max(...ob.flatMap((r) => [r.bq, r.aq]))
  return (
    <table className="w-full min-w-[520px] text-xs num">
      <thead className="text-muted"><tr><th className="py-1 font-normal">تعداد</th><th className="font-normal">حجم خرید</th><th className="font-normal">قیمت خرید</th><th className="font-normal">قیمت فروش</th><th className="font-normal">حجم فروش</th><th className="font-normal">تعداد</th></tr></thead>
      <tbody>
        {ob.map((r, i) => (
          <tr key={i} className="text-center">
            <td className="py-1 text-muted">{fa(r.bn)}</td>
            <td className="relative"><span className="absolute inset-y-0.5 left-0 rounded bg-up/15" style={{ width: `${(r.bq / mx) * 100}%` }} /><span className="relative">{fa(r.bq)}</span></td>
            <td className="font-semibold text-up">{fa(r.bp)}</td>
            <td className="font-semibold text-down">{fa(r.ap)}</td>
            <td className="relative"><span className="absolute inset-y-0.5 right-0 rounded bg-down/15" style={{ width: `${(r.aq / mx) * 100}%` }} /><span className="relative">{fa(r.aq)}</span></td>
            <td className="text-muted">{fa(r.an)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Flow({ c }) {
  const buy = Math.min(85, Math.max(15, 55 + c * 6)), sell = Math.min(85, Math.max(15, 55 - c * 4))
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[['خرید حقیقی', buy, 'bg-up'], ['فروش حقیقی', sell, 'bg-down']].map(([t, v, col]) => (
        <div key={t} className="rounded-2xl bg-surface2/40 p-3">
          <div className="mb-2 flex justify-between text-sm"><span>{t}</span><span className="num font-semibold">{fa(v)}٪</span></div>
          <div className="h-2.5 overflow-hidden rounded-full bg-line"><motion.div initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: .8 }} className={`h-full rounded-full ${col}`} /></div>
          <div className="mt-1.5 text-xs text-muted">حقوقی: <span className="num">{fa(100 - v)}٪</span></div>
        </div>
      ))}
    </div>
  )
}

function Fund({ sym }) {
  const items = [['صنعت', sym.ind], ['ارزش بازار', sym.mc], ['P/E', sym.pe ? fa(sym.pe, 1) : '—'], ['سهام شناور', '۲۴٪'], ['EPS پیش‌بینی', fa(Math.round(sym.p / (sym.pe || 12)))], ['آخرین DPS', fa(Math.round(sym.p * 0.08))]]
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map(([k, v]) => <div key={k} className="rounded-2xl bg-surface2/40 p-3"><div className="text-xs text-muted">{k}</div><div className="num mt-0.5 font-semibold">{v}</div></div>)}
    </div>
  )
}

function Extra({ sym }) {
  const news = [
    [`افزایش ${fa(12)}٪ فروش ماهانه ${sym.s}`, 'کدال · ۲ ساعت پیش'],
    ['ورود ۱٬۲۰۰ میلیارد تومان پول حقیقی به بازار', 'بازار · ۴ ساعت پیش'],
    [`تحلیل تکنیکال ${sym.s}: شکست مقاومت کلیدی`, 'تحلیل‌ها · دیروز'],
    ['نرخ بهره بین بانکی ثابت ماند', 'اقتصاد کلان · دیروز'],
  ]
  const peers = SYMBOLS.filter((x) => x.ind === sym.ind && x.s !== sym.s).concat(SYMBOLS.filter((x) => x.ind !== sym.ind)).slice(0, 4)
  return (
    <div className="grid gap-4 border-t border-line px-5 py-5 xl:grid-cols-2">
      <div>
        <h3 className="mb-3 font-semibold">آخرین اخبار و اطلاعیه‌ها</h3>
        <div className="divide-y divide-line/60">
          {news.map(([t, m]) => (
            <a key={t} href="#" onClick={(e) => e.preventDefault()} className="block py-3 transition-colors hover:text-brand-light">
              <div className="text-sm font-medium">{t}</div><div className="mt-1 text-xs text-muted">{m}</div>
            </a>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-semibold">نمادهای هم‌گروه</h3>
        <div className="grid grid-cols-2 gap-2">
          {peers.map((x) => (
            <div key={x.s} className="rounded-2xl border border-line/60 bg-surface2/40 p-3">
              <div className="flex justify-between"><b>{x.s}</b><Change c={x.c} className="!text-xs" /></div>
              <div className="num mt-1 text-sm text-muted">{fa(x.p)} ریال</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
