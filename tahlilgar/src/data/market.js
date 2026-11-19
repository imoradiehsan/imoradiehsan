// داده‌های نمونه (واقعی‌نما) — بدون بک‌اند
export const fa = (n, d = 0) =>
  Number(n).toLocaleString('fa-IR', { minimumFractionDigits: d, maximumFractionDigits: d })

function rng(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

const MONTHS = ['مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

function series(points, start, vol, seed) {
  const r = rng(seed)
  let v = start
  return Array.from({ length: points }, (_, i) => {
    v = v * (1 + (r() - 0.47) * vol)
    return { i, v: Math.round(v) }
  })
}

const label = (i, n) => MONTHS[Math.min(5, Math.floor((i / n) * 6))]
const day = (i) => `${fa((i % 30) + 1)} ${label(i, 180)} ۱۴۰۳`

export const RANGES = {
  '۱ ساله': series(240, 2050000, 0.022, 7).map((p, i) => ({ ...p, m: label(i, 240), d: day(i) })),
  '۶ ماهه': series(180, 2350000, 0.02, 11).map((p, i) => ({ ...p, m: label(i, 180), d: day(i) })),
  '۳ ماهه': series(90, 2600000, 0.018, 3).map((p, i) => ({ ...p, m: label(i, 90), d: day(i) })),
  '۱ ماهه': series(30, 2750000, 0.015, 5).map((p, i) => ({ ...p, m: label(i, 30), d: day(i) })),
}

export const tradeValue = [
  { m: 'مهر', v: 98 }, { m: 'آبان', v: 124 }, { m: 'آذر', v: 141 },
  { m: 'دی', v: 139 }, { m: 'بهمن', v: 187 }, { m: 'اسفند', v: 152 },
]

export const watchlist = [
  { s: 'فولاد', n: 'فولاد مبارکه اصفهان', p: 6420, c: 2.84, vol: '۱۴۲ م' },
  { s: 'فملی', n: 'ملی صنایع مس ایران', p: 7180, c: 1.42, vol: '۹۸ م' },
  { s: 'خودرو', n: 'ایران خودرو', p: 2864, c: -3.12, vol: '۳۱۰ م' },
  { s: 'شپنا', n: 'پالایش نفت اصفهان', p: 8950, c: 0.67, vol: '۵۴ م' },
  { s: 'وبملت', n: 'بانک ملت', p: 3210, c: -1.08, vol: '۱۸۷ م' },
  { s: 'شستا', n: 'سرمایه‌گذاری تأمین اجتماعی', p: 1478, c: 4.21, vol: '۲۶۵ م' },
].map((x, k) => ({ ...x, spark: series(20, 100, 0.04, k + 21).map((p) => ({ ...p, v: p.v * (x.c > 0 ? 1 + p.i / 300 : 1 - p.i / 300) })) }))

export const portfolios = [
  { broker: 'کارگزاری مفید', code: '۱۲۴۵۸', value: 1284500000, c: 3.52 },
  { broker: 'کارگزاری آگاه', code: '۸۸۰۱۲', value: 314000000, c: -0.84 },
  { broker: 'کارگزاری فارابی', code: '۵۰۳۷۷', value: 61500000, c: 1.1 },
]

export const trades = [
  { s: 'فولاد', t: 'خرید', q: 12000, at: '۲۸ اسفند، ۱۰:۲۴', amt: 77040000 },
  { s: 'خودرو', t: 'فروش', q: 30000, at: '۲۷ اسفند، ۰۹:۱۲', amt: 85920000 },
  { s: 'شستا', t: 'خرید', q: 50000, at: '۲۶ اسفند، ۱۱:۴۵', amt: 73900000 },
]

// ---- داده‌های چارت شمعی برای هر نماد ----
export const SYMBOLS = [
  { s: 'فولاد', n: 'فولاد مبارکه اصفهان', p: 6420, c: 2.84, ind: 'فلزات اساسی', pe: 6.8, mc: '۱۹۲ همت' },
  { s: 'فملی', n: 'ملی صنایع مس ایران', p: 7180, c: 1.42, ind: 'فلزات اساسی', pe: 7.9, mc: '۲۸۷ همت' },
  { s: 'خودرو', n: 'ایران خودرو', p: 2864, c: -3.12, ind: 'خودرو و قطعات', pe: 0, mc: '۸۶ همت' },
  { s: 'شپنا', n: 'پالایش نفت اصفهان', p: 8950, c: 0.67, ind: 'فراورده‌های نفتی', pe: 9.4, mc: '۲۲۴ همت' },
  { s: 'وبملت', n: 'بانک ملت', p: 3210, c: -1.08, ind: 'بانک‌ها', pe: 5.1, mc: '۲۰۱ همت' },
  { s: 'شستا', n: 'سرمایه‌گذاری تأمین اجتماعی', p: 1478, c: 4.21, ind: 'سرمایه‌گذاری‌ها', pe: 8.2, mc: '۳۴۷ همت' },
  { s: 'خساپا', n: 'سایپا', p: 2105, c: -2.4, ind: 'خودرو و قطعات', pe: 0, mc: '۷۱ همت' },
  { s: 'فارس', n: 'صنایع پتروشیمی خلیج فارس', p: 11240, c: 0.35, ind: 'شیمیایی', pe: 7.2, mc: '۴۹۵ همت' },
  { s: 'کگل', n: 'معدنی و صنعتی گل‌گهر', p: 4370, c: 1.95, ind: 'کانه‌های فلزی', pe: 5.9, mc: '۱۳۹ همت' },
  { s: 'رمپنا', n: 'گروه مپنا', p: 5630, c: -0.52, ind: 'خدمات فنی', pe: 10.3, mc: '۱۱۲ همت' },
].map((x, k) => ({ ...x, vol: fa(40 + ((k * 37) % 260)) + ' م', spark: series(20, 100, 0.04, k + 21).map((p) => ({ ...p, v: p.v * (x.c > 0 ? 1 + p.i / 300 : 1 - p.i / 300) })) }))

export function candles(sym, tf) {
  const n = { '۱ روز': 60, '۱ هفته': 90, '۱ ماه': 120, '۳ ماه': 140, '۱ سال': 160 }[tf] || 90
  const seed = sym.s.length * 131 + n
  const r = rng(seed)
  let c = sym.p / (1 + sym.c / 100) * (0.75 + r() * 0.2)
  const out = []
  for (let i = 0; i < n; i++) {
    const drift = (sym.p - c) / (n - i) / c
    const o = c
    c = o * (1 + drift + (r() - 0.5) * 0.045)
    if (i === n - 1) c = sym.p
    const h = Math.max(o, c) * (1 + r() * 0.015), l = Math.min(o, c) * (1 - r() * 0.015)
    out.push({ i, o, h, l, c, v: Math.round(20 + r() * 80) })
  }
  out.forEach((d, i) => { const w = out.slice(Math.max(0, i - 19), i + 1); d.ma = w.reduce((a, b) => a + b.c, 0) / w.length })
  return out
}

export function orderBook(p) {
  const r = rng(Math.round(p))
  return Array.from({ length: 5 }, (_, i) => ({
    bp: Math.round(p * (1 - (i + 1) * 0.002)), bq: Math.round(r() * 900 + 50) * 1000, bn: Math.round(r() * 60 + 3),
    ap: Math.round(p * (1 + (i + 1) * 0.002)), aq: Math.round(r() * 900 + 50) * 1000, an: Math.round(r() * 60 + 3),
  }))
}
