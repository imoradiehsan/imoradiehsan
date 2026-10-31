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
      note: "سقف ۱ میلیارد تومان برای هر طرح (طلا یا نقره). نرخ سود/کارمزد در منابع پیدا نشد.",
      check: ["نرخ سود/کارمزد", "حداقل خرید (۲۵ میلیون) فقط در یک منبع"],
      sources: [["صفحه خرید قسطی طلا", "https://charisma.ir/installment-gold"], ["آموزش کاریزما", "https://learning.charisma.ir/investment/%D8%B7%D9%84%D8%A7%DB%8C-%D9%82%D8%B3%D8%B7%DB%8C-%D8%A8%D8%AE%D8%B1%DB%8C%D9%85-%DB%8C%D8%A7-%D9%86%D9%87/"]]
    },
    {
      id: "melligold", name: "ملی‌گلد", model: "credit",
      tagline: "اعتبار اقساطی برای خرید طلای آب‌شده، بدون چک و ضامن",
      downPct: null, minAmount: null, maxAmount: 300000000, periods: [6, 12, 18, 24, 36],
      graceDays: 5, latePenalty: "۰٫۵٪ در روز پس از ۵ روز مهلت",
      defaultRule: null, sellLocked: null, guarantor: false, feeInfo: "کارمزد معامله حدود ۰٫۵٪",
      note: "فقط یک خرید قسطی فعال در هر زمان.",
      check: ["سقف اعتبار (۳۰۰ یا ۴۰۰ میلیون در منابع مختلف)", "قفل بودن طلا تا تسویه", "جریمه دیرکرد"],
      sources: [["مقایسه ارزدیجیتال", "https://arzdigital.com/blog/best-installment-gold-buying-sites/"], ["سوالات ملی‌گلد", "https://melligold.com/faq"], ["طرح بدون کارمزد", "https://sanjeshbroker.com/blog/melli-golds-commission-free-gold-installment-purchase-plan"]]
    },
    {
      id: "wallgold", name: "وال‌گلد", model: "credit",
      tagline: "خرید قسطی با پرداخت حق سرویس اولیه",
      downPct: null, minAmount: null, maxAmount: 100000000, periods: [12],
      graceDays: 5, latePenalty: "۰٫۵٪ روزانه از مبلغ قسط (روز ۶ تا ۱۰)",
      defaultRule: "پس از ۱۵ روز تأخیر، خرید قسطی به‌صورت خودکار لغو می‌شود",
      sellLocked: null, guarantor: null, feeInfo: "حق سرویس اولیه؛ ۲۳٪ سالانه در محاسبه دارایی",
      note: "حداکثر بازپرداخت یک‌ساله.",
      check: ["مبلغ حق سرویس", "قفل بودن طلا"],
      sources: [["راهنمای خرید اعتباری طلا", "https://www.eghtesadonline.com/fa/news/2146939/"], ["مقایسه ارزدیجیتال", "https://arzdigital.com/blog/best-installment-gold-buying-sites/"]]
    },
    {
      id: "talasea", name: "طلاسی", model: "bnpl",
      tagline: "خرید با اعتبار شرکت‌های اقساطی (اسنپ‌پی، دیجی‌پی، ازکیوام و…)",
      downPct: null, minAmount: 1000000, maxAmount: 50000000, periods: [],
      graceDays: null, latePenalty: "طبق قرارداد اعتباردهنده",
      defaultRule: null, sellLocked: null, guarantor: null, feeInfo: "کارمزد معامله ۱٪؛ اعتبار دیجی‌پی ۳٫۵٪",
      note: "سقف ۵۰ میلیون تومان برای هر تراکنش.",
      check: ["تعداد اقساط", "قفل بودن طلا"],
      sources: [["معرفی طلاسی", "https://www.rade.ir/gold-platforms/693101-%D8%B7%D9%84%D8%A7%D8%B3%DB%8C/"], ["مقایسه ارزدیجیتال", "https://arzdigital.com/blog/best-installment-gold-buying-sites/"]]
    },
    {
      id: "digipay", name: "دیجی‌پی (طلاین)", model: "bnpl",
      tagline: "خرید اقساطی طلای آب‌شده با اعتبار دیجی‌پی",
      downPct: 25, minAmount: 500000, maxAmount: 200000000, periods: [4],
      graceDays: null, latePenalty: "طبق قرارداد اعتباردهنده",
      defaultRule: null, sellLocked: null, guarantor: null, feeInfo: null,
      note: "قسط اول هنگام خرید و ۳ قسط بعدی در سه ماه آینده؛ سقف واقعی هر فرد بر اساس اعتبارسنجی است.",
      check: ["تعداد اقساط (منابع هم‌خوان نیستند)", "پیش‌پرداخت (از ۴ قسط برآورد شده)"],
      sources: [["مقایسه ارزدیجیتال", "https://arzdigital.com/blog/best-installment-gold-buying-sites/"], ["معرفی در زومیت", "https://www.zoomit.ir/pr/466003-buy-melted-gold-installments-taline/"]]
    },
    {
      id: "snapppay", name: "اسنپ‌پی", model: "bnpl",
      tagline: "اعتبار خرید اقساطی برای پلتفرم‌های طلا",
      downPct: null, minAmount: null, maxAmount: 50000000, periods: [],
      graceDays: null, latePenalty: "طبق قرارداد اعتباردهنده",
      defaultRule: null, sellLocked: null, guarantor: null, feeInfo: null,
      note: "فقط برای کاربران واجد شرایط.",
      check: ["اقساط و کارمزد"],
      sources: [["مقایسه ارزدیجیتال", "https://arzdigital.com/blog/best-installment-gold-buying-sites/"]]
    }
  ],
  models: {
    lock: "طلا توثیق می‌شود",
    credit: "اعتبار اقساطی",
    bnpl: "اعتبار شرکت ثالث"
  }
};
