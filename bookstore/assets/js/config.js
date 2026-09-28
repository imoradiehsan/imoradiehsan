/* ============================================================
   تنظیمات سایت — Site settings (safe to edit)
   ============================================================ */
const SITE_CONFIG = {
  /* قالب رنگی پیش‌فرض برای همه بازدیدکنندگان.
     Default color template for every visitor: teal | crimson | navy | violet | orange | forest */
  defaultTheme: 'teal',

  /* دکمه انتخاب قالب رنگ (گوشه پایین صفحه). بعد از انتخاب قالب نهایی، false کنید.
     Show the floating color-template picker. Set to false once a template is final. */
  showThemeSwitcher: true,

  /* بنرهای اسلایدر صفحه اصلی. برای عوض کردن عکس، فایل جدید را با همان نام در پوشه
     assets/banners آپلود کنید. اندازه پیشنهادی: دسکتاپ ۱۹۲۰×۴۸۰، موبایل ۱۰۸۰×۶۷۵ (اختیاری).
     Home hero banners. Replace an image by uploading a file with the same name to assets/banners.
     Suggested sizes: desktop 1920×480, mobile 1080×675 (optional — omit mobileImage to reuse the desktop one). */
  banners: [
    {
      image: 'assets/banners/banner-1.jpg',
      mobileImage: 'assets/banners/banner-1-mobile.jpg',
      link: 'books.html?collection=offer',
      alt: { fa: 'جشنواره کتاب‌خوانی — تا ۳۰٪ تخفیف', en: 'Reading festival — up to 30% off' }
    },
    {
      image: 'assets/banners/banner-2.jpg',
      mobileImage: 'assets/banners/banner-2-mobile.jpg',
      link: 'books.html?collection=new',
      alt: { fa: 'تازه‌های نشر', en: 'New releases' }
    },
    {
      image: 'assets/banners/banner-3.jpg',
      mobileImage: 'assets/banners/banner-3-mobile.jpg',
      link: 'books.html',
      alt: { fa: 'کتاب الکترونیکی و صوتی — تحویل فوری', en: 'eBooks and audiobooks — instant delivery' }
    }
  ],

  /* فروشگاه — همه مبالغ به تومان. Shop settings — all amounts in Toman. */
  freeShippingThreshold: 1000000, // ارسال رایگان برای سفارش‌های بالای این مبلغ
  shippingStandard: 90000,        // هزینه ارسال عادی
  shippingExpress: 150000,        // هزینه ارسال سریع

  /* هر چند میلی‌ثانیه بنر عوض شود — autoplay interval in ms (0 = off) */
  bannerInterval: 5000
};
