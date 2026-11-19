// داده‌های نمونه صفحه نماد (قطعی برای هر نماد)
import { fa, orderBook, SYMBOLS } from './market'

function rnd(s) { let x = [...s].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 2147483647; return () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646 }
const short = (n) => n >= 1e12 ? fa(n / 1e12, 1) + ' همت' : n >= 1e9 ? fa(n / 1e9, 1) + ' میلیارد' : n >= 1e6 ? fa(n / 1e6, 1) + ' م' : n >= 1e3 ? fa(n / 1e3, 1) + ' هزار' : fa(n)

export function symbolData(x) {
  const r = rnd(x.s)
  const prev = Math.round(x.p / (1 + x.c / 100))
  const low = Math.round(Math.min(x.p, prev) * (1 - r() * 0.02)), high = Math.round(Math.max(x.p, prev) * (1 + r() * 0.015))
  const vol = Math.round((40 + r() * 200) * 1e6)
  return {
    market: x.ind === 'بانک‌ها' || r() > .4 ? 'بورس' : 'فرابورس',
    prev, low, high, open: Math.round(prev * (1 + (r() - .5) * .01)),
    limLo: Math.round(prev * 0.97), limHi: Math.round(prev * 1.03),
    stats: [['حجم معاملات', short(vol)], ['تعداد معاملات', fa(Math.round(1500 + r() * 6000))], ['ارزش معاملات', short(vol * x.p)], ['حجم مبنا', short(Math.round(r() * 3e6) + 1)], ['میانگین حجم ۱ ماهه', short(Math.round(vol * (0.8 + r())))]],
    book: orderBook(x.p),
    real: { buyPct: Math.round(45 + x.c * 5 + r() * 10), sellPct: Math.round(55 - x.c * 4 + r() * 10), power: +(0.6 + r() * 1.4 + x.c / 10).toFixed(2), money: Math.round((x.c * 40 + (r() - .4) * 80)) },
    fundamentals: [['EPS', fa(Math.round(x.p / (x.pe || 12)))], ['P/E', x.pe ? fa(x.pe, 2) : '—'], ['P/E گروه', fa(6 + r() * 5, 2)], ['P/S', fa(0.8 + r() * 3, 2)], ['P/NAV', fa(0.6 + r() * 1.5, 2)], ['سهام شناور', fa(Math.round(15 + r() * 25)) + '٪'], ['تعداد سهام', short(Math.round((2 + r() * 90) * 1e9))], ['ارزش بازار', x.mc]],
    levels: [['مقاومت ۳', 1.12], ['مقاومت ۲', 1.075], ['مقاومت ۱', 1.03], ['قیمت فعلی', 1], ['حمایت ۱', 0.965], ['حمایت ۲', 0.93], ['حمایت ۳', 0.88]].map(([t, k], i) => ({ t, p: Math.round(x.p * k * (1 + (r() - .5) * .01)), str: Math.round(40 + r() * 60), cur: k === 1 })),
    holders: [['سازمان تأمین اجتماعی', 18 + r() * 10], ['صندوق بازنشستگی کشوری', 8 + r() * 6], ['شرکت سرمایه‌گذاری غدیر', 5 + r() * 5], ['بانک صادرات ایران', 2 + r() * 4], ['صندوق تثبیت بازار سرمایه', 1 + r() * 3]].map(([n, p]) => ({ n, p: +p.toFixed(2), d: Math.round((r() - .5) * 4e6) })),
    big: Array.from({ length: 6 }, (_, i) => ({ t: `${fa(9 + Math.floor(i / 2))}:${fa(10 + i * 7)}`, side: r() > .5 ? 'خرید' : 'فروش', q: Math.round((1 + r() * 9) * 1e6), p: Math.round(x.p * (1 + (r() - .5) * .02)) })),
    history: Array.from({ length: 7 }, (_, i) => { const c = (r() - .45) * 6; return { d: `${fa(24 - i)} مهر`, p: Math.round(x.p * (1 - i * 0.008 + (r() - .5) * .02)), c, v: short(Math.round((30 + r() * 200) * 1e6)) } }),
    news: [
      [`${x.s}: گزارش فعالیت ماهانه دوره ۱ ماهه منتهی به ۱۴۰۵/۰۶/۳۱`, 'کدال', 'اطلاعیه', '۲ ساعت پیش'],
      [`افزایش ${fa(Math.round(8 + r() * 20))}٪ درآمد عملیاتی ${x.s} نسبت به ماه قبل`, 'تحلیلگر بورس', 'خبر', '۵ ساعت پیش'],
      [`زمان برگزاری مجمع عمومی عادی سالانه ${x.s}`, 'کدال', 'اطلاعیه', 'دیروز'],
      [`پیام ناظر بازار درباره نماد ${x.s}`, 'پیام ناظر', 'ناظر', '۲ روز پیش'],
      [`صنعت ${x.ind} در هفته گذشته؛ ورود پول حقیقی`, 'تحلیلگر بورس', 'تحلیل', '۳ روز پیش'],
    ],
    opinions: [
      ['علی رضایی', 'تکنیکال', 'صعودی', `${x.s} بعد از شکست مقاومت ${fa(Math.round(x.p * .98))} و پولبک موفق، تارگت بعدی ${fa(Math.round(x.p * 1.08))} است.`, 42],
      ['مریم احمدی', 'بنیادی', 'خنثی', `با P/E فعلی ${x.s} نسبت به گروه ارزان نیست؛ منتظر گزارش فصلی بمانیم.`, 17],
      ['حسین کریمی', 'تکنیکال', x.c >= 0 ? 'صعودی' : 'نزولی', `واگرایی در RSI روزانه دیده می‌شود؛ حد ضرر زیر ${fa(Math.round(x.p * .95))}.`, 29],
    ],
    tech: { osc: [Math.round(r() * 4), Math.round(2 + r() * 5), Math.round(r() * 5)], ma: [Math.round(r() * 5), Math.round(r() * 3), Math.round(4 + r() * 10)] },
    peers: SYMBOLS.filter((y) => y.s !== x.s).sort((a, b) => (b.ind === x.ind) - (a.ind === x.ind)).slice(0, 5),
  }
}
