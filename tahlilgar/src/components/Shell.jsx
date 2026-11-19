import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Category, Chart, Message, Wallet, Work, Calendar, Setting, Logout, Search, Notification, Swap, ChevronDown } from 'react-iconly'

const NAV = [
  { I: Home, t: 'داشبورد' }, { I: Category, t: 'بازار' }, { I: Chart, t: 'تحلیل‌ها' },
  { I: Message, t: 'پیام‌ها', dot: true }, { I: Wallet, t: 'پرتفوی' }, { I: Work, t: 'سیگنال‌ها' },
  { I: Calendar, t: 'تقویم مجامع' },
]

export function Sidebar() {
  const [active, setActive] = useState(0)
  return (
    <aside className="card sticky top-4 hidden h-[calc(100vh-2rem)] w-[84px] shrink-0 flex-col items-center !rounded-[32px] !p-3 md:flex">
      <motion.img whileHover={{ rotate: -8, scale: 1.08 }} src="./logo.png" alt="تحلیلگر بورس" className="mt-2 h-11 w-11 rounded-xl" />
      <div className="my-4 h-px w-10 bg-line" />
      <nav className="flex flex-1 flex-col gap-2">
        {NAV.map(({ I, t, dot }, k) => (
          <button key={t} title={t} onClick={() => setActive(k)} className="group relative grid h-12 w-12 place-items-center">
            {active === k && (
              <motion.span layoutId="nav" className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-light to-brand-dark shadow-glow"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
            )}
            <span className={`relative transition-colors ${active === k ? 'text-white' : 'text-muted group-hover:text-ink'}`}>
              <I set={active === k ? 'bold' : 'light'} size={22} primaryColor="currentColor" />
            </span>
            {dot && <span className="absolute left-2.5 top-2.5 h-2 w-2 rounded-full bg-brand-light ring-2 ring-surface" />}
            <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-surface2 px-2.5 py-1 text-xs opacity-0 transition group-hover:opacity-100">{t}</span>
          </button>
        ))}
      </nav>
      <div className="flex flex-col gap-2 text-muted">
        <button className="grid h-12 w-12 place-items-center hover:text-ink"><Setting set="light" size={22} primaryColor="currentColor" /></button>
        <button className="grid h-12 w-12 place-items-center hover:text-down"><Logout set="light" size={22} primaryColor="currentColor" /></button>
      </div>
    </aside>
  )
}

export function Header({ dark, setDark }) {
  const [spin, setSpin] = useState(0)
  const [notif, setNotif] = useState(false)
  return (
    <header className="flex flex-wrap items-center gap-3">
      <label className="card flex h-14 flex-1 items-center gap-3 !rounded-full !py-0 !pl-2 !pr-5 focus-within:border-brand/60 min-w-[240px]">
        <Search set="light" size={20} primaryColor="currentColor" />
        <input placeholder="جستجوی نماد، صنعت یا تحلیل..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
        <kbd className="hidden rounded-full border border-line bg-surface2 px-4 py-2 text-xs text-muted sm:block" dir="ltr">⌘ + K</kbd>
      </label>
      <div className="flex items-center gap-2">
        <motion.button animate={{ rotate: spin }} transition={{ duration: .6 }} onClick={() => setSpin(spin - 360)} className="icon-btn" title="بروزرسانی">
          <Swap set="light" size={20} primaryColor="currentColor" />
        </motion.button>
        <div className="relative">
          <button onClick={() => setNotif(!notif)} className="icon-btn relative" title="اعلان‌ها">
            <Notification set="bold" size={20} primaryColor="currentColor" />
            <span className="absolute left-3 top-3 h-2 w-2 animate-ping rounded-full bg-brand-light" />
            <span className="absolute left-3 top-3 h-2 w-2 rounded-full bg-brand-light" />
          </button>
          <AnimatePresence>
            {notif && (
              <motion.div initial={{ opacity: 0, y: -8, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: .96 }}
                className="card absolute left-0 top-14 z-30 w-72 space-y-3 !p-4 text-sm">
                {['فولاد به حد سود تعیین‌شده رسید', 'مجمع فملی فردا ساعت ۱۰', 'تحلیل جدید: صنعت پالایشی'].map((t) => (
                  <div key={t} className="flex gap-2"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />{t}</div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button onClick={() => setDark(!dark)} className="icon-btn overflow-hidden" title="تغییر تم">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={dark ? 'm' : 's'} initial={{ y: 20, opacity: 0, rotate: -90 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ y: -20, opacity: 0, rotate: 90 }}>
              {dark ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
              )}
            </motion.span>
          </AnimatePresence>
        </button>
        <button className="card flex h-14 items-center gap-3 !rounded-full !py-0 !pl-4 !pr-1.5">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand-light to-brand-dark font-bold text-white">ا‌م</div>
          <div className="hidden text-right leading-tight sm:block">
            <div className="text-sm font-semibold">احسان مرادی</div>
            <div className="text-xs text-muted" dir="ltr">@ehsan_moradi</div>
          </div>
          <ChevronDown set="light" size={16} primaryColor="currentColor" />
        </button>
      </div>
    </header>
  )
}
