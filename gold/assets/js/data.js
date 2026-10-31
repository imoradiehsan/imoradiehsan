/* Reference data: installment gold platforms (Iran).
   Collected Aban 1405 from public articles; values flagged `check:true` conflict between sources
   or come from promotional pages and MUST be confirmed on the platform before publishing.
   null = not found in sources. Amounts in toman. */
window.GOLD_DATA = {
  updated: "آبان ۱۴۰۵",
  platforms: [
    {
      id: "charisma", name: "کاریزما", model: "lock",
      tagline: "طلا (شمش ۲۴ عیار، گواهی سپرده کالایی) تا تسویه آخرین قسط توثیق می‌شود",
      downPct: 40, minAmount: 25000000, maxAmount: 1000000000, periods: [3, 6, 12],
      graceDays: 3, latePenalty: "بدون جریمه نقدی؛ بخشی از طلا فروخته می‌شود",
      defaultRule: "در صورت نپرداختن قسط، پس از ۳ روز مهلت بخشی از طلای توثیقی فروخته و قسط از آن کسر می‌شود",
      sellLocked: true, guarantor: false, feeInfo: null,
      note: "سقف ۱ میلیارد تومان برای هر طرح (طلا یا نقره)؛ برخی صفحات کاریزما «تا ۲ میلیارد» نوشته‌اند. نرخ سود/کارمزد در منابع پیدا نشد. آخرین اطلاعیه‌ی تاریخ‌دار پیدا‌شده فروردین ۱۴۰۵ است و وضعیت پس از بخشنامه‌ی مهر ۱۴۰۵ معلوم نیست.",
      check: ["وضعیت فعلی پس از بخشنامه بانک مرکزی", "سقف (۱ یا ۲ میلیارد)", "نرخ سود/کارمزد", "حداقل خرید (۲۵ میلیون) فقط در یک منبع"],
      sources: [["صفحه خرید قسطی طلا", "https://charisma.ir/installment-gold"], ["آموزش کاریزما", "https://learning.charisma.ir/investment/%D8%B7%D9%84%D8%A7%DB%8C-%D9%82%D8%B3%D8%B7%DB%8C-%D8%A8%D8%AE%D8%B1%DB%8C%D9%85-%DB%8C%D8%A7-%D9%86%D9%87/"]]
    },
    {
      id: "melligold", name: "ملی‌گلد", model: "credit",
      tagline: "اعتبار اقساطی برای خرید طلای آب‌شده، بدون چک و ضامن",
      downPct: null, minAmount: null, maxAmount: 300000000, periods: [6, 12, 18, 24, 36],
      graceDays: 5, latePenalty: "۰٫۵٪ در روز پس از ۵ روز مهلت",
      defaultRule: null, sellLocked: null, guarantor: false, feeInfo: "کارمزد معامله حدود ۰٫۵٪",
      note: "فقط یک خرید قسطی فعال در هر زمان. مرداد ۱۴۰۵ افزایش سقف تا ۱ میلیارد تومان اعلام شده بود. بازپرداخت در یک منبع تا ۱۸ ماه و در منبع دیگر تا ۳۶ ماه ذکر شده.",
      check: ["وضعیت فعلی پس از بخشنامه بانک مرکزی", "سقف اعتبار (۳۰۰، ۴۰۰ میلیون یا ۱ میلیارد در منابع مختلف)", "مدت بازپرداخت", "قفل بودن طلا تا تسویه", "جریمه دیرکرد"],
      sources: [["مقایسه ارزدیجیتال", "https://arzdigital.com/blog/best-installment-gold-buying-sites/"], ["سوالات ملی‌گلد", "https://melligold.com/faq"], ["طرح بدون کارمزد", "https://sanjeshbroker.com/blog/melli-golds-commission-free-gold-installment-purchase-plan"]]
    },
    {
      id: "wallgold", name: "وال‌گلد", model: "credit",
      tagline: "خرید قسطی با پرداخت حق سرویس اولیه",
      downPct: null, minAmount: 10000000, maxAmount: 100000000, periods: [3, 6, 12],
      graceDays: 5, latePenalty: "۰٫۵٪ روزانه از مبلغ قسط (روز ۶ تا ۱۰)",
      defaultRule: "پس از ۱۵ روز تأخیر، خرید قسطی به‌صورت خودکار لغو می‌شود",
      sellLocked: null, guarantor: null, feeInfo: "حق سرویس اولیه؛ ۲۳٪ سالانه در محاسبه دارایی",
      note: "با اعتباردهنده‌هایی مثل تارا و وایب کار می‌کند. در یک منبع: ۳ ماه (۱۰ تا ۳۰ میلیون)، ۶ ماه (۱۰ تا ۶۰ میلیون)، ۱۲ ماه (۱۰ تا ۱۰۰ میلیون). نرخ اعلامی ۲۳٪ سالانه است، اما یک منبع هزینه مؤثر را ۵۰ تا ۱۰۵٪ سالانه برآورد کرده (منبع تکی و کم‌اعتبار). یک بررسی می‌گوید مجوز اتحادیه ندارد.",
      check: ["وضعیت فعلی پس از بخشنامه بانک مرکزی", "مبلغ حق سرویس", "قفل بودن طلا", "سقف هر مدت"],
      sources: [["راهنمای خرید اعتباری طلا", "https://www.eghtesadonline.com/fa/news/2146939/"], ["مقایسه ارزدیجیتال", "https://arzdigital.com/blog/best-installment-gold-buying-sites/"]]
    },
    {
      id: "talasea", name: "طلاسی", model: "bnpl",
      tagline: "خرید با اعتبار شرکت‌های اقساطی (اسنپ‌پی، دیجی‌پی، ازکیوام و…)",
      downPct: null, minAmount: 1000000, maxAmount: 50000000, periods: [],
      graceDays: null, latePenalty: "طبق قرارداد اعتباردهنده",
      defaultRule: null, sellLocked: true, guarantor: null, feeInfo: "کارمزد معامله ۱٪؛ اعتبار دیجی‌پی ۳٫۵٪",
      note: "سقف ۵۰ میلیون تومان برای هر تراکنش. با اعتبار ازکی‌وام: تا قبل از تسویه فقط معامله با همان اعتبار ممکن است و پس از تسویه کامل می‌توان برداشت کرد یا شمش فیزیکی گرفت.",
      check: ["وضعیت فعلی پس از بخشنامه بانک مرکزی", "تعداد اقساط", "قفل بودن طلا (معامله داخل پلتفرم ممکن، برداشت پس از تسویه)"],
      sources: [["معرفی طلاسی", "https://www.rade.ir/gold-platforms/693101-%D8%B7%D9%84%D8%A7%D8%B3%DB%8C/"], ["مقایسه ارزدیجیتال", "https://arzdigital.com/blog/best-installment-gold-buying-sites/"]]
    },
    {
      id: "digipay", name: "دیجی‌پی (طلاین)", model: "bnpl",
      tagline: "خرید اقساطی طلای آب‌شده با اعتبار دیجی‌پی",
      downPct: 25, minAmount: 500000, maxAmount: 200000000, periods: [4],
      graceDays: null, latePenalty: "طبق قرارداد اعتباردهنده",
      defaultRule: null, sellLocked: null, guarantor: null, feeInfo: null,
      note: "اعتبار ۴ قسطه بدون چک و ضامن تا ۴۰ میلیون تومان با احراز هویت؛ وام دیجی‌پی ۱۰ تا ۱۰۰ میلیون بدون پیش‌پرداخت. سقف ۲۰۰ میلیون طلاین مخصوص هر تراکنش است و سقف واقعی هر فرد بر اساس اعتبارسنجی تعیین می‌شود.",
      check: ["وضعیت فعلی پس از بخشنامه بانک مرکزی", "سقف (۴۰ یا ۲۰۰ میلیون)", "تعداد اقساط (منابع هم‌خوان نیستند)", "پیش‌پرداخت (از ۴ قسط برآورد شده)"],
      sources: [["مقایسه ارزدیجیتال", "https://arzdigital.com/blog/best-installment-gold-buying-sites/"], ["معرفی در زومیت", "https://www.zoomit.ir/pr/466003-buy-melted-gold-installments-taline/"]]
    },
    {
      id: "snapppay", name: "اسنپ‌پی", model: "bnpl",
      tagline: "اعتبار خرید اقساطی برای پلتفرم‌های طلا",
      downPct: null, minAmount: null, maxAmount: 50000000, periods: [4],
      graceDays: null, latePenalty: "طبق قرارداد اعتباردهنده",
      defaultRule: null, sellLocked: null, guarantor: false, feeInfo: null,
      note: "اعتبارسنجی بانکی، بدون چک و ضامن، بازپرداخت تا ۴ ماه.",
      check: ["اقساط و کارمزد"],
      sources: [["مقایسه ارزدیجیتال", "https://arzdigital.com/blog/best-installment-gold-buying-sites/"]]
    }
    ,{
      id: "milli", name: "میلی", model: "bnpl",
      tagline: "خرید قسطی طلا با اعتبار ازکی‌وام و تأمین‌کنندگان بانکی",
      downPct: null, minAmount: null, maxAmount: 75000000, periods: [6, 12, 18, 24, 36],
      graceDays: null, latePenalty: "طبق قرارداد اعتباردهنده",
      defaultRule: null, sellLocked: true, guarantor: null, feeInfo: null,
      note: "طلا تا تسویه کامل به‌صورت امانی نگهداری می‌شود (یک منبع). سقف ۷۵ میلیون در ازکی‌وام؛ در جاهای دیگر بدون ضامن و پیش‌پرداخت ذکر شده اما به اعتبارسنجی بستگی دارد.",
      check: ["وضعیت فعلی پس از بخشنامه بانک مرکزی", "سقف", "قفل/امانی بودن", "پیش‌پرداخت"],
      sources: [["مقایسه پرسون", "https://purson.ir/fa/content/1470844/"], ["ازکی‌وام: خرید قسطی طلا", "https://azkivam.com/products/%D8%B7%D9%84%D8%A7/154/"]]
    },
    {
      id: "gallery10", name: "۱۰گلد گالری", model: "lock",
      tagline: "فروشگاه طلا؛ طلای امانی تا تسویه، قیمت بعد از پیش‌پرداخت ثابت می‌شود",
      downPct: 30, minAmount: null, maxAmount: null, periods: [6],
      graceDays: null, latePenalty: null,
      defaultRule: null, sellLocked: true, guarantor: null, feeInfo: null,
      note: "تا ۶ ماه اقساط؛ تحویل طلا پس از تسویه. بعد از پرداخت پیش‌پرداخت قیمت طلا برای خریدار ثابت می‌ماند (فروشگاه فیزیکی، نه پلتفرم آنلاین).",
      check: ["جریمه و شرایط عدم پرداخت", "سقف"],
      sources: [["۱۰گلد گالری", "https://10goldgallery.com/installment-gold/"]]
    },
    {
      id: "technogold", name: "تکنوگلد", model: "credit",
      tagline: "خرید قسطی با سفته الکترونیک (تکنوپی)",
      downPct: null, minAmount: null, maxAmount: null, periods: [18],
      graceDays: null, latePenalty: null,
      defaultRule: null, sellLocked: null, guarantor: null, feeInfo: null,
      note: "تا ۱۸ ماه اقساط با سفته الکترونیک؛ شروع خرید از ۲۰ میلی‌گرم.",
      check: ["همه موارد؛ فقط در یک فهرست آمده"],
      sources: [["مقایسه پرسون", "https://purson.ir/fa/content/1470844/"]]
    },
    {
      id: "zarminex", name: "زرمینکس", model: "credit",
      tagline: "طلای آب‌شده و طلای دیجیتال قسطی",
      downPct: null, minAmount: null, maxAmount: null, periods: [],
      graceDays: null, latePenalty: null,
      defaultRule: null, sellLocked: null, guarantor: null, feeInfo: null,
      note: "فقط نام و ارائه‌ی خرید اقساطی در منابع آمده؛ جزئیات پیدا نشد.",
      check: ["همه موارد"],
      sources: [["مقایسه پرسون", "https://purson.ir/fa/content/1470844/"]]
    },
    {
      id: "hematite", name: "هماتیت‌گلد", model: "bnpl",
      tagline: "خرید قسطی از طریق ازکی‌وام و اعتبار زرین‌پلاس",
      downPct: null, minAmount: null, maxAmount: null, periods: [],
      graceDays: null, latePenalty: "طبق قرارداد اعتباردهنده",
      defaultRule: null, sellLocked: null, guarantor: null, feeInfo: null,
      note: "تنها اشاره‌ی کوتاه در نتایج؛ جزئیات پیدا نشد.",
      check: ["همه موارد"],
      sources: [["صفحه طرح هماتیت‌گلد", "https://hematitegold.com/plan"]]
    },
    {
      id: "dapdap", name: "داپ‌داپ", model: "credit",
      tagline: "خرید طلا تا ۱۰۰ میلیون تومان با یک چک صیادی",
      downPct: null, minAmount: null, maxAmount: 100000000, periods: [],
      graceDays: null, latePenalty: null,
      defaultRule: null, sellLocked: null, guarantor: true, feeInfo: null,
      note: "چک صیادی لازم است.",
      check: ["تعداد اقساط", "سایر شرایط"],
      sources: [["مقایسه پرسون", "https://purson.ir/fa/content/1470844/"]]
    },
    {
      id: "aloghesti", name: "الوقسطی", model: "credit",
      tagline: "خرید اقساطی طلا و زیورآلات با چک صیادی تا ۲۴ ماه",
      downPct: null, minAmount: null, maxAmount: null, periods: [24],
      graceDays: null, latePenalty: null,
      defaultRule: null, sellLocked: null, guarantor: true, feeInfo: null,
      note: "فروشگاه اقساطی، نه پلتفرم طلای آب‌شده.",
      check: ["سقف و پیش‌پرداخت"],
      sources: [["الوقسطی", "https://aloghesti.com/fashion-and-clothing/ornaments/"]]
    }
  ],
  models: {
    lock: "طلا توثیق می‌شود",
    credit: "اعتبار اقساطی",
    bnpl: "اعتبار شرکت ثالث"
  }
};
