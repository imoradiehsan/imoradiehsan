/*
 * ================== تنظیمات لندینگ قسطا ==================
 * هر چیزی که ممکن است بدون تغییر کد عوض شود اینجاست.
 * (در فاز بعد می‌تواند از CMS خوانده شود؛ ساختار همین می‌ماند.)
 */
window.GHESTA = {
  /* آدرس وب‌اپ — همهٔ CTAهای ورود به اینجا می‌روند. پارامترهای UTM خودکار اضافه می‌شوند. */
  webappUrl: "https://app.ghesta.ir",
  loginPath: "/login",
  merchantSignupUrl: "https://app.ghesta.ir/merchant/signup",
  warAdvisoryUrl: "war-advisory.html", // در انتشار: /war-advisory

  /* deep link هر سرویس در وب‌اپ (مسیر نسبی به webappUrl) */
  services: {
    card2card: "/services/card-to-card",
    sheba: "/services/sheba",
    bills: "/services/bills",
    topup: "/services/topup",
    insurance: "/services/insurance",
    credit: "/services/credit-report",
    gold: "/services/gold",
    all: "/services",
    bnpl: "/services/bnpl",
    loan: "/services/loan",
    docs: "/services/documents",
    investAdvice: "/advisory/investment",
    insuranceAdvice: "/advisory/insurance",
    savingAdvice: "/advisory/saving",
    warAdvice: "/advisory/war",
    club: "/club",
    referral: "/club/referral"
  },

  /* محاسبه‌گر اقساط — نرخ را اینجا تنظیم کنید (نرخ نمونه است) */
  calculator: {
    minAmount: 5000000,       // تومان
    maxAmount: 200000000,     // تومان
    step: 1000000,
    defaultAmount: 30000000,
    months: [3, 6, 12, 18, 24],
    defaultMonths: 12,
    monthlyRate: 0.0275,      // نرخ ماهانه (۰٫۰۲۷۵ یعنی ۲٫۷۵٪) — «نمونه»
    calcPath: "/credit/inquiry" // استعلام سقف واقعی؛ amount و months به آدرس اضافه می‌شوند
  },

  /* APIها — اگر null باشد عددی نمایش داده نمی‌شود (طبق PRD) */
  api: {
    goldPrice: null,  // مثال: "https://api.ghesta.ir/v1/gold/price"  → { price: 7350000, change: 0.8 }
    cashback: null    // مثال: "https://api.ghesta.ir/v1/merchants/cashback" → [{ name, category, percent }]
  },

  /* نشان‌های اعتماد — فقط مواردی را نگه دارید که مجوز واقعی دارند و لینک استعلام رسمی را بگذارید */
  trustBadges: [
    { name: "نماد اعتماد الکترونیکی", sub: "اینماد", href: "#" /* لینک استعلام اختصاصی اینماد */, logo: "" },
    { name: "بانک مرکزی", sub: "مجوز فعالیت", href: "#", logo: "" },
    { name: "شاپرک", sub: "پرداخت امن", href: "https://www.shaparak.ir/", logo: "" },
    { name: "رتبه‌بندی اعتباری ایران", sub: "ICS", href: "#", logo: "" }
  ],

  /*
   * ===== بنرهای هیرو =====
   * اسلاید اول همیشه هیروی اصلی قسطا (تیتر + موکاپ داشبورد) است.
   * بنرهای زیر بعد از آن نمایش داده می‌شوند. هر تعداد خواستید اضافه/حذف کنید.
   *
   *  image       : تصویر بنر (WebP/AVIF/PNG/SVG) — پیشنهاد ۱۲۰۰×۸۰۰ برای سمت چپ هیرو
   *  mobileImage : (اختیاری) تصویر موبایل
   *  fullImage   : true اگر بنر آماده و تمام‌عرض است (متن روی خود تصویر) — پیشنهاد ۲۴۰۰×۹۰۰
   *  eyebrow, title, text : متن‌ها (برای fullImage لازم نیست)
   *  cta         : { label, href, track } — اگر href با "app:" شروع شود به وب‌اپ می‌رود، مثلاً "app:/services/gold"
   *  tone        : رنگ زمینه: "blue" | "gold" | "green"
   */
  heroBanners: [
    {
      image: "assets/banners/gold.svg",
      tone: "gold",
      eyebrow: "طلای دیجیتال",
      title: "پس‌اندازت را <mark>طلایی</mark> کن",
      text: "با هر مبلغی طلای دیجیتال بخر، نگه دار یا به طلای آب‌شده تبدیل کن.",
      cta: { label: "خرید طلا در قسطا", href: "app:/services/gold", track: "hero_banner_gold" }
    },
    {
      image: "assets/banners/bnpl.svg",
      tone: "blue",
      eyebrow: "خرید اقساطی",
      title: "الان بخر، <mark>قسطی</mark> پرداخت کن",
      text: "از فروشگاه‌های آنلاین و حضوری پذیرندهٔ قسطا خرید کن و هزینه را در چند قسط بپرداز.",
      cta: { label: "شروع خرید اقساطی", href: "app:/services/bnpl", track: "hero_banner_bnpl" }
    }
  ],
  heroInterval: 7000 // میلی‌ثانیه
};
