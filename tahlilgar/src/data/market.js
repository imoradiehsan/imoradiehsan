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
