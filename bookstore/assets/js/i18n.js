/* Saba & Bahar Publishing — language layer (English / فارسی).
   Loaded in <head> so <html lang/dir> is correct before first paint.
   - t(key, vars): UI strings used by JS (STR.en is the fallback).
   - [data-i18n="key"] elements: static page text; English lives in the HTML, Persian in STR.fa.
   - [data-i18n-attr="attr:key;attr:key"]: translated attributes (placeholder, aria-label…). */

const LANGS = {
  fa: { dir: 'rtl', locale: 'fa-IR', label: 'فارسی', short: 'فا' },
  en: { dir: 'ltr', locale: 'en-US', label: 'English', short: 'EN' }
};
const DEFAULT_LANG = 'fa';
const LANG = (() => {
  let l = new URLSearchParams(location.search).get('lang');
  try { if (LANGS[l]) localStorage.setItem('folio.lang', l); else l = localStorage.getItem('folio.lang'); } catch { /* storage blocked */ }
  return LANGS[l] ? l : DEFAULT_LANG;
})();
const LOC = LANGS[LANG].locale;
const IS_RTL = LANGS[LANG].dir === 'rtl';
document.documentElement.lang = LANG;
document.documentElement.dir = LANGS[LANG].dir;
setTimeout(() => document.documentElement.classList.add('i18n-ready'), 1500); // never leave the page hidden

function setLang(l) {
  try { localStorage.setItem('folio.lang', l); } catch { }
  const u = new URL(location.href); u.searchParams.delete('lang'); location.href = u.toString();
}

/* ---------- Formatting ---------- */
const fmtNum = n => Number(n).toLocaleString(LOC);
const money = n => new Intl.NumberFormat(LOC, { style: 'currency', currency: 'USD' }).format(n);
const moneyInt = n => new Intl.NumberFormat(LOC, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const pad2 = n => Number(n).toLocaleString(LOC, { minimumIntegerDigits: 2 });
const fmtDate = iso => new Date(iso + 'T12:00:00').toLocaleDateString(LOC, { year: 'numeric', month: 'short', day: 'numeric' });
const fmtRating = r => Number(r).toLocaleString(LOC, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function t(key, vars) {
  let s = STR[LANG]?.[key] ?? STR.en[key];
  if (s == null) { console.warn('[i18n] missing key', key); return key; }
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => vars[k] == null ? '' : (typeof vars[k] === 'number' ? fmtNum(vars[k]) : vars[k]));
  return s;
}

function applyI18n(root = document) {
  if (LANG !== 'en') {
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const v = STR[LANG][el.dataset.i18n];
      if (v != null) el.innerHTML = v; else console.warn('[i18n] missing static key', el.dataset.i18n);
    });
  }
  root.querySelectorAll('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(pair => {
    const [attr, key] = pair.split(':').map(x => x.trim()); const v = STR[LANG][key];
    if (v != null) el.setAttribute(attr, v.replace(/<[^>]+>/g, '')); else if (LANG !== 'en') console.warn('[i18n] missing attr key', key);
  }));
  document.documentElement.classList.add('i18n-ready');
}

const STR = {
  en: {
    'skip': 'Skip to content', 'brand.aria': 'Saba & Bahar Publishing — home', 'brand.name': 'Saba & Bahar Publishing',
    'lang.switch': 'Change language', 'lang.to': 'فارسی',
    'announce.ship': 'Free shipping on orders over <strong>{amt}</strong>', 'announce.ebooks': ' · eBooks delivered instantly',
    'announce.track': 'Track order', 'announce.help': 'Help center', 'announce.gift': 'Gift cards',
    'nav.home': 'Home', 'nav.books': 'Books', 'nav.categories': 'Categories', 'nav.best': 'Best Sellers', 'nav.new': 'New Arrivals', 'nav.offers': 'Offers', 'nav.blog': 'Blog', 'nav.ds': 'Design System',
    'nav.primary': 'Primary', 'nav.instant': 'Instant eBooks', 'nav.returns': '30-day returns',
    'hdr.menu': 'Open menu', 'hdr.closeMenu': 'Close menu', 'hdr.search': 'Search', 'hdr.account': 'Account menu', 'hdr.wishlist': 'Wishlist', 'hdr.cart': 'Shopping cart', 'hdr.login': 'Login / Register',
    'menu.profile': 'My profile', 'menu.orders': 'Orders', 'menu.wishlist': 'Wishlist', 'menu.prefs': 'Reading preferences', 'menu.signin': 'Sign in / Register',
    'drawer.title': 'Menu', 'drawer.account': 'Account', 'drawer.cart': 'Cart', 'drawer.login': 'Login', 'drawer.register': 'Create account',
    'search.label': 'Search books, authors, categories', 'search.ph': 'Search books, authors, categories…', 'search.trending': 'Trending searches',
    'search.books': 'Books', 'search.authors': 'Authors', 'search.cats': 'Categories', 'search.nBooks': '{n} books', 'search.authorMeta': '{n} books · {g}',
    'search.none': 'No matches for “{q}”. Press Enter to search the full catalogue.',
    'search.trend': 'Atomic Rituals|Elena Marsh|Psychology|The Hidden Cosmos',
    'foot.about': 'Saba & Bahar Publishing publishes for children, teens and young adults, with a focus on philosophy, social sciences, law, parenting, psychology and literature.',
    'foot.social': 'Social media', 'foot.service': 'Customer Service', 'foot.info': 'Information', 'foot.cats': 'Categories', 'foot.contact': 'Get in touch',
    'foot.contactUs': 'Contact us', 'foot.faq': 'FAQ', 'foot.shipping': 'Shipping', 'foot.returns': 'Returns', 'foot.track': 'Track order',
    'foot.aboutUs': 'About us', 'foot.privacy': 'Privacy Policy', 'foot.terms': 'Terms & Conditions', 'foot.a11y': 'Accessibility', 'foot.ds': 'Design system',
    'foot.kids': "Children's books", 'foot.allCats': 'All categories', 'foot.whatsapp': 'WhatsApp', 'foot.telegram': 'Telegram', 'foot.instagram': 'Instagram',
    'foot.copy': '© 2026 Saba & Bahar Publishing. All rights reserved.', 'pay.aria': 'Accepted payment methods',
    'cover.aria': 'Cover of {t} by {a}', 'rating.sr': 'Rated {r} out of 5 from {n} reviews',
    'badge.new': 'New', 'badge.best': 'Bestseller', 'badge.no1': '#1 Bestseller', 'badge.newWeek': 'New this week', 'badge.default': 'Default',
    'card.wishAdd': 'Add to wishlist', 'card.wishRemove': 'Remove from wishlist', 'card.quick': 'Quick view', 'card.match': '{p}% match', 'card.addAria': 'Add {t} to cart',
    'qv.by': 'by', 'qv.save': 'You save {x}', 'qv.meta': '{p} pages · {l} · {f}', 'qv.add': 'Add to cart', 'qv.details': 'View full details', 'close': 'Close',
    'auth.welcome': 'Welcome back', 'auth.create': 'Create your account', 'auth.desc': 'Sign in for faster checkout, order tracking and personalised picks.',
    'auth.login': 'Login', 'auth.register': 'Register', 'auth.name': 'Full name', 'auth.namePh': 'Jane Reader', 'auth.email': 'Email', 'auth.pass': 'Password',
    'auth.signin': 'Sign in', 'auth.createBtn': 'Create account', 'auth.or': 'or continue with', 'auth.google': 'Google', 'auth.passkey': 'Passkey', 'auth.done': 'Signed in — welcome back, Jane!',
    'toast.added': '<strong>{t}</strong> added to cart', 'toast.viewCart': 'View cart', 'toast.saved': 'Saved <strong>{t}</strong> to wishlist', 'toast.wishlist': 'Wishlist',
    'toast.unsaved': 'Removed from wishlist', 'nl.ok': "You're on the list! Check your inbox for 10% off.",
    'fmt.Hardcover': 'Hardcover', 'fmt.Paperback': 'Paperback', 'fmt.eBook': 'eBook', 'fmt.Audiobook': 'Audiobook',
    'fmtnote.ship': 'Ships in 24h', 'fmtnote.ebook': 'Instant download', 'fmtnote.audio': 'Stream or download',
    'lang.English': 'English', 'lang.Spanish': 'Spanish', 'lang.French': 'French', 'lang.German': 'German',
    'crumb.home': 'Home', 'crumb.books': 'Books', 'crumb.aria': 'Breadcrumb',
    'prev': 'Previous', 'next': 'Next',
    'theme.open': 'Color templates', 'theme.title': 'Color template', 'theme.desc': 'Tap a template to preview the whole site in it. Your pick is remembered on this device.',
    'theme.note': 'Active: <strong>{name}</strong> ({id}). To make it permanent for all visitors, set <code>defaultTheme</code> in <code>assets/js/config.js</code> to this id.',
    'banner.aria': 'Featured offers', 'banner.go': 'Go to slide {n}',
    /* home */
    'home.floatBest': 'Bestseller of the week', 'home.buyNow': 'Buy now', 'home.preview': 'Preview', 'home.add': 'Add', 'home.byAuthor': 'by {a}',
    'home.viewBooks': 'View books', 'home.booksLbl': 'Books', 'home.readers': 'Readers', 'home.verified': 'Verified buyer · {r}', 'home.readMin': '{n} min read', 'home.readArticle': 'Read article',
    'reco.purchases': 'Because you bought', 'reco.interests': 'Because you love psychology & science —', 'reco.categories': 'From your favourite categories, like',
    'tabs.all': 'All',
    /* listing */
    'list.bestT': 'Best Sellers', 'list.bestS': 'The books everyone is talking about, updated daily.',
    'list.newT': 'New Arrivals', 'list.newS': 'Fresh from the press — the newest additions to our shelves.',
    'list.offerT': 'Special Offers', 'list.offerS': 'Summer Reading Festival — up to 30% off selected titles.',
    'list.catS': 'Explore {n} titles in {c}.', 'list.qT': 'Results for “{q}”', 'list.qS': 'Refine with filters to find exactly what you want.',
    'list.allT': 'All Books', 'list.allS': 'Browse our full catalogue of physical books, eBooks and audiobooks.',
    'list.andUp': '&amp; up', 'list.any': 'Any rating', 'list.showing': 'Showing <strong>{a}–{b}</strong> of <strong>{n}</strong> books',
    'list.emptyT': 'No books match those filters', 'list.emptyP': 'Try removing a filter or widening the price range — there is a great read in here somewhere.', 'list.clear': 'Clear all filters', 'list.clearAll': 'Clear all',
    'list.starsUp': '{r}★ & up', 'list.prevPage': 'Previous page', 'list.nextPage': 'Next page', 'title.suffix': ' — Saba & Bahar Publishing',
    /* product */
    'pdp.back': 'Back cover', 'pdp.front': 'Front cover', 'pdp.first': 'First page', 'pdp.contents': 'Contents', 'pdp.quote': '“Unforgettable.”',
    'pdp.chapter': 'Chapter One', 'pdp.sample': 'The morning it began, the light came in sideways, the way it only does at the edge of the sea, and every object in the room seemed to be waiting for someone to name it.', 'pdp.sample2': 'She had not meant to stay. Nobody ever does.',
    'pdp.toc': 'Prologue|The First Map|Tidelines|A Borrowed Compass|North of Nowhere|The Last Page',
    'pdp.zoom': 'Zoom cover', 'pdp.readers': '{n} readers', 'pdp.reviews': '{n} reviews', 'pdp.format': 'Format', 'pdp.qty': 'Quantity', 'pdp.dec': 'Decrease quantity', 'pdp.inc': 'Increase quantity',
    'pdp.add': 'Add to cart', 'pdp.buy': 'Buy now', 'pdp.instock': 'In stock — ships within 24 hours', 'pdp.digital': '{n} after purchase',
    'pdp.a1': 'Free shipping over {amt}', 'pdp.a2': '30-day easy returns', 'pdp.a3': 'Secure checkout', 'pdp.a4': 'Free gift wrapping',
    'pdp.addedQty': '{q} × <strong>{t}</strong> ({f}) added',
    'pdp.about': 'About this book', 'pdp.praise': 'Praised by critics and readers alike, <em>{t}</em> is the kind of book that stays with you long after the final page — perfect for book clubs, gifting, and quiet evenings.',
    'spec.author': 'Author', 'spec.pub': 'Publisher', 'spec.year': 'Published', 'spec.pages': 'Pages', 'spec.lang': 'Language', 'spec.formats': 'Formats', 'spec.isbn': 'ISBN-13', 'spec.dim': 'Dimensions', 'spec.dimV': '6.1 × 9.2 × 1.2 in',
    'pdp.authorMeta': '{g} · {b} books · {f} readers', 'pdp.authorMore': 'Their work has been translated into more than twenty languages and featured on bestseller lists worldwide.',
    'pdp.allBy': 'All books by {a}', 'pdp.follow': 'Follow author', 'pdp.basedOn': 'Based on {n} reviews', 'pdp.top': 'Top reviews', 'pdp.write': 'Write a review',
    'pdp.verified': 'Verified purchase · {d}', 'pdp.helpful': 'Helpful?', 'pdp.stars': '{n} ★',
    /* cart */
    'cart.emptyT': 'Your cart is empty', 'cart.emptyP': 'Looks like you haven’t added anything yet. Let’s find your next favourite book.', 'cart.browse': 'Browse books',
    'cart.items': 'Cart items', 'cart.product': 'Product', 'cart.qty': 'Quantity', 'cart.total': 'Total', 'cart.save': 'Save for later', 'cart.remove': 'Remove',
    'cart.qtyFor': 'Quantity for {t}', 'cart.dec': 'Decrease', 'cart.inc': 'Increase', 'cart.each': '{p} each', 'cart.continue': 'Continue shopping', 'cart.clear': 'Clear cart',
    'cart.summary': 'Order summary', 'cart.away': "You're <strong>{x}</strong> away from free shipping", 'cart.unlocked': "You've unlocked <strong>free shipping!</strong>",
    'cart.promoPh': 'Discount code', 'cart.apply': 'Apply', 'cart.removeCode': 'Remove', 'cart.try': 'Try <strong>READ10</strong>, <strong>SUMMER30</strong> or <strong>FREESHIP</strong>',
    'cart.checkout': 'Proceed to checkout', 'cart.secure': 'Secure SSL checkout · 30-day returns', 'cart.removed': 'Removed <strong>{t}</strong>', 'cart.savedLater': 'Saved for later',
    'cart.badCode': 'That code isn’t valid. Check spelling and try again.', 'cart.codeOk': 'Code <strong>{c}</strong> applied',
    'sum.subtotal': 'Subtotal ({n} items)', 'sum.discount': 'Discount ({c})', 'sum.shipping': 'Shipping', 'sum.digital': 'Digital — free', 'sum.free': 'Free', 'sum.tax': 'Estimated tax', 'sum.total': 'Total',
    'promo.READ10': '10% off your order', 'promo.SUMMER30': '30% off Summer Festival titles', 'promo.FREESHIP': 'Free express shipping',
    /* checkout */
    'co.emptyT': 'Nothing to check out', 'co.emptyP': 'Your cart is empty — add a book or two and come back.', 'co.yourOrder': 'Your order', 'co.secure': 'Payments are encrypted and secure',
    'co.contact': 'Contact', 'co.shipTo': 'Ship to', 'co.payment': 'Payment', 'co.edit': 'Edit', 'co.express': 'Express (1–2 days)', 'co.standard': 'Standard (3–5 days)',
    'co.cardEnd': 'Card ending in {n}', 'co.paypal': 'PayPal', 'co.wallet': 'Apple Pay / Google Pay',
    'co.thanks': 'Thank you — your order is confirmed!', 'co.receipt': "We've emailed a receipt for <strong>{x}</strong> to {e}.", 'co.digitalReady': 'Your eBooks and audiobooks are ready in your library now.',
    'co.tracking': "We'll send tracking as soon as your parcel ships.", 'co.library': 'Open my library', 'co.continue': 'Continue shopping',
    /* account */
    'acc.hello': 'Hello, Jane 👋', 'acc.gold': 'Gold member', 'acc.orders': 'Orders', 'acc.read': 'Books read in 2026', 'acc.points': 'Reward points', 'acc.goal': 'Reading goal',
    'acc.profileInfo': 'Profile information', 'acc.first': 'First name', 'acc.last': 'Last name', 'acc.email': 'Email', 'acc.phone': 'Phone', 'acc.bday': 'Birthday <span class="muted">(for a birthday treat)</span>',
    'acc.plang': 'Preferred language', 'acc.saveBtn': 'Save changes', 'acc.pass': 'Change password', 'acc.saved': 'Profile saved', 'acc.firstV': 'Jane', 'acc.lastV': 'Reader',
    'acc.history': 'Order history', 'acc.filterOrders': 'Filter orders', 'acc.last6': 'Last 6 months', 'acc.order': 'Order', 'acc.placed': 'Placed', 'acc.total': 'Total', 'acc.details': 'View details', 'acc.again': 'Buy again', 'acc.track': 'Track package',
    'status.processing': 'Processing', 'status.transit': 'In transit', 'status.delivered': 'Delivered',
    'acc.wishlist': 'Wishlist', 'acc.openWish': 'Open full wishlist', 'acc.noSavedT': 'No saved books yet', 'acc.noSavedP': 'Tap the heart on any book to save it here.', 'acc.discover': 'Discover books',
    'acc.addresses': 'Saved addresses', 'acc.home': 'Home', 'acc.office': 'Office', 'acc.addr1': 'Jane Reader<br>21 Paper Lane, Apt 4B<br>Boston, MA 02116<br>United States', 'acc.addr2': 'Jane Reader<br>100 Summer Street, Floor 12<br>Boston, MA 02110<br>United States',
    'acc.edit': 'Edit', 'acc.remove': 'Remove', 'acc.setDefault': 'Set as default', 'acc.addAddr': 'Add new address',
    'acc.payments': 'Payment methods', 'acc.holder': 'Card holder', 'acc.expires': 'Expires', 'acc.holderV': 'JANE READER', 'acc.addPay': 'Add payment method', 'acc.wallets': 'Digital wallets',
    'acc.disconnect': 'Disconnect', 'acc.walletsOn': 'Available at checkout on supported devices', 'acc.enableW': 'Enable wallets',
    'acc.prefs': 'Reading preferences', 'acc.powers': 'Powers your “Books You May Like” picks', 'acc.favCats': 'Favourite categories', 'acc.favCatsP': 'Choose as many as you like.',
    'acc.formats': 'Preferred formats', 'acc.langs': 'Reading languages', 'acc.goalT': 'Yearly reading goal', 'acc.goalUnit': 'books in 2026', 'acc.perYear': 'Books per year', 'acc.notif': 'Notifications',
    'acc.n1': 'New releases from followed authors', 'acc.n1d': 'Be first to know', 'acc.n2': 'Price drops on wishlist items', 'acc.n2d': 'We’ll email when a saved book goes on sale', 'acc.n3': 'Weekly personalised picks', 'acc.n3d': 'Curated every Friday',
    /* wishlist */
    'wish.count': '{n} saved books', 'wish.count1': '1 saved book', 'wish.drop': 'Price dropped {p}%', 'wish.instant': 'Instant delivery', 'wish.stock': 'In stock',
    'wish.move': 'Move to cart', 'wish.remove': 'Remove', 'wish.removeAria': 'Remove {t} from wishlist', 'wish.emptyT': 'Your wishlist is empty',
    'wish.emptyP': 'Save books you love by tapping the heart icon. They’ll wait for you here — and we’ll tell you when prices drop.', 'wish.moved': 'Moved <strong>{t}</strong> to cart',
    'wish.movedAll': 'Moved {n} books to cart', 'wish.copied': 'Wishlist link copied',
    /* design system */
    'ds.toast': 'This is a toast notification', 'ds.action': 'Action',
    'ds.gPrimary': 'Primary — Teal', 'ds.gSecondary': 'Secondary — Green', 'ds.gSurface': 'Background & surfaces', 'ds.gAccent': 'Accent — Yellow', 'ds.gNeutral': 'Text, neutrals & semantic'
  },

  fa: {
    'skip': 'رفتن به محتوای اصلی', 'brand.aria': 'صفحه اصلی انتشارات صبا و بهار', 'brand.name': 'انتشارات صبا و بهار',
    'lang.switch': 'تغییر زبان', 'lang.to': 'English',
    'announce.ship': 'ارسال رایگان برای سفارش‌های بالای <strong>{amt}</strong>', 'announce.ebooks': ' · تحویل فوری کتاب‌های الکترونیکی',
    'announce.track': 'پیگیری سفارش', 'announce.help': 'مرکز پشتیبانی', 'announce.gift': 'کارت هدیه',
    'nav.home': 'خانه', 'nav.books': 'کتاب‌ها', 'nav.categories': 'دسته‌بندی‌ها', 'nav.best': 'پرفروش‌ها', 'nav.new': 'تازه‌ها', 'nav.offers': 'تخفیف‌ها', 'nav.blog': 'مجله', 'nav.ds': 'سیستم طراحی',
    'nav.primary': 'منوی اصلی', 'nav.instant': 'کتاب الکترونیکی فوری', 'nav.returns': '۳۰ روز ضمانت بازگشت',
    'hdr.menu': 'باز کردن منو', 'hdr.closeMenu': 'بستن منو', 'hdr.search': 'جستجو', 'hdr.account': 'منوی حساب کاربری', 'hdr.wishlist': 'علاقه‌مندی‌ها', 'hdr.cart': 'سبد خرید', 'hdr.login': 'ورود / ثبت‌نام',
    'menu.profile': 'پروفایل من', 'menu.orders': 'سفارش‌ها', 'menu.wishlist': 'علاقه‌مندی‌ها', 'menu.prefs': 'سلیقه مطالعه', 'menu.signin': 'ورود / ثبت‌نام',
    'drawer.title': 'منو', 'drawer.account': 'حساب', 'drawer.cart': 'سبد خرید', 'drawer.login': 'ورود', 'drawer.register': 'ساخت حساب کاربری',
    'search.label': 'جستجوی کتاب، نویسنده، دسته‌بندی', 'search.ph': 'جستجوی کتاب، نویسنده یا دسته‌بندی…', 'search.trending': 'جستجوهای پرطرفدار',
    'search.books': 'کتاب‌ها', 'search.authors': 'نویسندگان', 'search.cats': 'دسته‌بندی‌ها', 'search.nBooks': '{n} کتاب', 'search.authorMeta': '{n} کتاب · {g}',
    'search.none': 'نتیجه‌ای برای «{q}» پیدا نشد. برای جستجو در کل فروشگاه Enter بزنید.',
    'search.trend': 'عادت‌های اتمی|النا مارش|روان‌شناسی|کیهان پنهان',
    'foot.about': 'نشر صبا و بهار در زمینه پرورش نسل کودک، نوجوان و جوان فعالیت می‌کند؛ با تمرکز بر فلسفه، علوم اجتماعی، حقوق، پرورش، روان‌شناسی و ادبیات.',
    'foot.social': 'شبکه‌های اجتماعی', 'foot.service': 'خدمات مشتریان', 'foot.info': 'اطلاعات', 'foot.cats': 'دسته‌بندی‌ها', 'foot.contact': 'تماس با ما',
    'foot.contactUs': 'ارتباط با ما', 'foot.faq': 'سؤالات متداول', 'foot.shipping': 'شیوه ارسال', 'foot.returns': 'بازگشت کالا', 'foot.track': 'پیگیری سفارش',
    'foot.aboutUs': 'درباره ما', 'foot.privacy': 'حریم خصوصی', 'foot.terms': 'قوانین و مقررات', 'foot.a11y': 'دسترس‌پذیری', 'foot.ds': 'سیستم طراحی',
    'foot.kids': 'کتاب کودک', 'foot.allCats': 'همه دسته‌بندی‌ها', 'foot.whatsapp': 'واتس‌اپ', 'foot.telegram': 'تلگرام', 'foot.instagram': 'اینستاگرام',
    'foot.copy': '© ۱۴۰۵ انتشارات صبا و بهار. همه حقوق محفوظ است.', 'pay.aria': 'روش‌های پرداخت',
    'cover.aria': 'جلد کتاب {t} اثر {a}', 'rating.sr': 'امتیاز {r} از ۵ بر اساس {n} نظر',
    'badge.new': 'جدید', 'badge.best': 'پرفروش', 'badge.no1': 'پرفروش شماره ۱', 'badge.newWeek': 'تازه این هفته', 'badge.default': 'پیش‌فرض',
    'card.wishAdd': 'افزودن به علاقه‌مندی‌ها', 'card.wishRemove': 'حذف از علاقه‌مندی‌ها', 'card.quick': 'نگاه سریع', 'card.match': '{p}٪ هم‌خوانی', 'card.addAria': 'افزودن {t} به سبد خرید',
    'qv.by': 'اثر', 'qv.save': '{x} صرفه‌جویی', 'qv.meta': '{p} صفحه · {l} · {f}', 'qv.add': 'افزودن به سبد', 'qv.details': 'مشاهده جزئیات کامل', 'close': 'بستن',
    'auth.welcome': 'خوش برگشتید', 'auth.create': 'ساخت حساب کاربری', 'auth.desc': 'وارد شوید تا سریع‌تر خرید کنید، سفارش‌ها را پیگیری کنید و پیشنهادهای شخصی بگیرید.',
    'auth.login': 'ورود', 'auth.register': 'ثبت‌نام', 'auth.name': 'نام و نام خانوادگی', 'auth.namePh': 'سارا کتاب‌دوست', 'auth.email': 'ایمیل', 'auth.pass': 'رمز عبور',
    'auth.signin': 'ورود', 'auth.createBtn': 'ساخت حساب', 'auth.or': 'یا ادامه با', 'auth.google': 'گوگل', 'auth.passkey': 'کلید عبور', 'auth.done': 'وارد شدید؛ خوش آمدید سارا!',
    'toast.added': '<strong>{t}</strong> به سبد خرید اضافه شد', 'toast.viewCart': 'مشاهده سبد', 'toast.saved': '<strong>{t}</strong> به علاقه‌مندی‌ها اضافه شد', 'toast.wishlist': 'علاقه‌مندی‌ها',
    'toast.unsaved': 'از علاقه‌مندی‌ها حذف شد', 'nl.ok': 'عضو خبرنامه شدید! کد ۱۰٪ تخفیف در ایمیلتان است.',
    'fmt.Hardcover': 'جلد سخت', 'fmt.Paperback': 'جلد نرم', 'fmt.eBook': 'الکترونیکی', 'fmt.Audiobook': 'کتاب صوتی',
    'fmtnote.ship': 'ارسال ظرف ۲۴ ساعت', 'fmtnote.ebook': 'دانلود فوری', 'fmtnote.audio': 'پخش آنلاین یا دانلود',
    'lang.English': 'انگلیسی', 'lang.Spanish': 'اسپانیایی', 'lang.French': 'فرانسوی', 'lang.German': 'آلمانی',
    'crumb.home': 'خانه', 'crumb.books': 'کتاب‌ها', 'crumb.aria': 'مسیر صفحه',
    'prev': 'قبلی', 'next': 'بعدی',
    'theme.open': 'قالب‌های رنگی', 'theme.title': 'قالب رنگی', 'theme.desc': 'روی هر قالب بزنید تا کل سایت با آن رنگ‌ها نمایش داده شود. انتخاب شما روی همین دستگاه ذخیره می‌شود.',
    'theme.note': 'قالب فعال: <strong>{name}</strong> ({id}). برای ثابت کردن آن برای همه بازدیدکنندگان، در فایل <code>assets/js/config.js</code> مقدار <code>defaultTheme</code> را همین نام بگذارید.',
    'banner.aria': 'پیشنهادهای ویژه', 'banner.go': 'رفتن به بنر {n}',
    'home.floatBest': 'پرفروش این هفته', 'home.buyNow': 'خرید', 'home.preview': 'پیش‌نمایش', 'home.add': 'افزودن', 'home.byAuthor': 'اثر {a}',
    'home.viewBooks': 'مشاهده کتاب‌ها', 'home.booksLbl': 'کتاب', 'home.readers': 'خواننده', 'home.verified': 'خریدار تأییدشده · {r}', 'home.readMin': '{n} دقیقه مطالعه', 'home.readArticle': 'خواندن مقاله',
    'reco.purchases': 'چون این کتاب را خریدید:', 'reco.interests': 'چون روان‌شناسی و علم را دوست دارید:', 'reco.categories': 'از دسته‌های محبوب شما، مثل',
    'tabs.all': 'همه',
    'list.bestT': 'پرفروش‌ها', 'list.bestS': 'کتاب‌هایی که همه درباره‌شان حرف می‌زنند؛ هر روز به‌روز می‌شود.',
    'list.newT': 'تازه‌ها', 'list.newS': 'تازه از چاپخانه؛ جدیدترین کتاب‌های قفسه‌های ما.',
    'list.offerT': 'تخفیف‌های ویژه', 'list.offerS': 'جشنواره کتاب‌خوانی تابستان؛ تا ۳۰٪ تخفیف روی کتاب‌های منتخب.',
    'list.catS': 'بیش از {n} عنوان در دسته {c}.', 'list.qT': 'نتایج «{q}»', 'list.qS': 'با فیلترها دقیقاً همان چیزی را که می‌خواهید پیدا کنید.',
    'list.allT': 'همه کتاب‌ها', 'list.allS': 'کل فهرست کتاب‌های چاپی، الکترونیکی و صوتی ما را مرور کنید.',
    'list.andUp': 'و بالاتر', 'list.any': 'همه امتیازها', 'list.showing': 'نمایش <strong>{a} تا {b}</strong> از <strong>{n}</strong> کتاب',
    'list.emptyT': 'کتابی با این فیلترها پیدا نشد', 'list.emptyP': 'یکی از فیلترها را بردارید یا بازه قیمت را بازتر کنید؛ حتماً کتاب خوبی این‌جا هست.', 'list.clear': 'حذف همه فیلترها', 'list.clearAll': 'حذف همه',
    'list.starsUp': '{r} ستاره و بالاتر', 'list.prevPage': 'صفحه قبل', 'list.nextPage': 'صفحه بعد', 'title.suffix': ' — انتشارات صبا و بهار',
    'pdp.back': 'پشت جلد', 'pdp.front': 'روی جلد', 'pdp.first': 'صفحه اول', 'pdp.contents': 'فهرست', 'pdp.quote': '«فراموش‌نشدنی.»',
    'pdp.chapter': 'فصل یکم', 'pdp.sample': 'صبح آن روز، نور از پهلو به اتاق می‌تابید؛ همان‌طور که فقط در لبه دریا می‌تابد، و هر چیزی در اتاق انگار منتظر بود کسی اسمش را صدا بزند.', 'pdp.sample2': 'قصد ماندن نداشت. هیچ‌کس ندارد.',
    'pdp.toc': 'پیش‌درآمد|نخستین نقشه|خط جزر و مد|قطب‌نمای امانتی|شمالِ ناکجا|آخرین صفحه',
    'pdp.zoom': 'بزرگ‌نمایی جلد', 'pdp.readers': '{n} خواننده', 'pdp.reviews': '{n} نظر', 'pdp.format': 'نوع نسخه', 'pdp.qty': 'تعداد', 'pdp.dec': 'کم کردن تعداد', 'pdp.inc': 'زیاد کردن تعداد',
    'pdp.add': 'افزودن به سبد', 'pdp.buy': 'خرید فوری', 'pdp.instock': 'موجود — ارسال ظرف ۲۴ ساعت', 'pdp.digital': '{n} بلافاصله پس از خرید',
    'pdp.a1': 'ارسال رایگان بالای {amt}', 'pdp.a2': '۳۰ روز ضمانت بازگشت', 'pdp.a3': 'پرداخت امن', 'pdp.a4': 'کادوپیچ رایگان',
    'pdp.addedQty': '{q} × <strong>{t}</strong> ({f}) اضافه شد',
    'pdp.about': 'درباره این کتاب', 'pdp.praise': '<em>{t}</em> که هم منتقدان و هم خوانندگان آن را ستوده‌اند، از آن کتاب‌هایی است که بعد از صفحه آخر هم با شما می‌ماند؛ مناسب کتاب‌خوانی گروهی، هدیه و شب‌های آرام.',
    'spec.author': 'نویسنده', 'spec.pub': 'ناشر', 'spec.year': 'سال انتشار', 'spec.pages': 'تعداد صفحات', 'spec.lang': 'زبان', 'spec.formats': 'نسخه‌ها', 'spec.isbn': 'شابک', 'spec.dim': 'ابعاد', 'spec.dimV': '۱۵٫۵ × ۲۳ × ۳ سانتی‌متر',
    'pdp.authorMeta': '{g} · {b} کتاب · {f} خواننده', 'pdp.authorMore': 'آثار این نویسنده به بیش از بیست زبان ترجمه شده و در فهرست پرفروش‌های جهان قرار گرفته است.',
    'pdp.allBy': 'همه کتاب‌های {a}', 'pdp.follow': 'دنبال کردن نویسنده', 'pdp.basedOn': 'بر اساس {n} نظر', 'pdp.top': 'برترین نظرها', 'pdp.write': 'نوشتن نظر',
    'pdp.verified': 'خرید تأییدشده · {d}', 'pdp.helpful': 'مفید بود؟', 'pdp.stars': '{n} ★',
    'cart.emptyT': 'سبد خرید شما خالی است', 'cart.emptyP': 'هنوز چیزی اضافه نکرده‌اید. بیایید کتاب محبوب بعدی‌تان را پیدا کنیم.', 'cart.browse': 'مرور کتاب‌ها',
    'cart.items': 'اقلام سبد', 'cart.product': 'محصول', 'cart.qty': 'تعداد', 'cart.total': 'جمع', 'cart.save': 'ذخیره برای بعد', 'cart.remove': 'حذف',
    'cart.qtyFor': 'تعداد {t}', 'cart.dec': 'کم کردن', 'cart.inc': 'زیاد کردن', 'cart.each': 'هر عدد {p}', 'cart.continue': 'ادامه خرید', 'cart.clear': 'خالی کردن سبد',
    'cart.summary': 'خلاصه سفارش', 'cart.away': 'فقط <strong>{x}</strong> تا ارسال رایگان فاصله دارید', 'cart.unlocked': 'ارسال شما <strong>رایگان شد!</strong>',
    'cart.promoPh': 'کد تخفیف', 'cart.apply': 'اعمال', 'cart.removeCode': 'حذف', 'cart.try': 'این کدها را امتحان کنید: <strong>READ10</strong>، <strong>SUMMER30</strong> یا <strong>FREESHIP</strong>',
    'cart.checkout': 'ادامه و پرداخت', 'cart.secure': 'پرداخت امن SSL · ۳۰ روز ضمانت بازگشت', 'cart.removed': '<strong>{t}</strong> حذف شد', 'cart.savedLater': 'برای بعد ذخیره شد',
    'cart.badCode': 'این کد معتبر نیست. املای آن را بررسی کنید و دوباره امتحان کنید.', 'cart.codeOk': 'کد <strong>{c}</strong> اعمال شد',
    'sum.subtotal': 'جمع جزء ({n} کالا)', 'sum.discount': 'تخفیف ({c})', 'sum.shipping': 'هزینه ارسال', 'sum.digital': 'دیجیتال — رایگان', 'sum.free': 'رایگان', 'sum.tax': 'مالیات تخمینی', 'sum.total': 'مبلغ نهایی',
    'promo.READ10': '۱۰٪ تخفیف روی کل سفارش', 'promo.SUMMER30': '۳۰٪ تخفیف کتاب‌های جشنواره تابستان', 'promo.FREESHIP': 'ارسال سریع رایگان',
    'co.emptyT': 'سفارشی برای پرداخت وجود ندارد', 'co.emptyP': 'سبد خریدتان خالی است؛ یکی دو کتاب اضافه کنید و برگردید.', 'co.yourOrder': 'سفارش شما', 'co.secure': 'پرداخت‌ها رمزنگاری‌شده و امن هستند',
    'co.contact': 'اطلاعات تماس', 'co.shipTo': 'ارسال به', 'co.payment': 'پرداخت', 'co.edit': 'ویرایش', 'co.express': 'ارسال سریع (۱ تا ۲ روز)', 'co.standard': 'ارسال عادی (۳ تا ۵ روز)',
    'co.cardEnd': 'کارت با پایان {n}', 'co.paypal': 'پی‌پال', 'co.wallet': 'اپل‌پی / گوگل‌پی',
    'co.thanks': 'ممنونیم؛ سفارش شما ثبت شد!', 'co.receipt': 'رسید پرداخت <strong>{x}</strong> به {e} ایمیل شد.', 'co.digitalReady': 'کتاب‌های الکترونیکی و صوتی‌تان همین حالا در کتابخانه شما آماده است.',
    'co.tracking': 'به‌محض ارسال مرسوله، کد رهگیری برایتان می‌فرستیم.', 'co.library': 'باز کردن کتابخانه من', 'co.continue': 'ادامه خرید',
    'acc.hello': 'سلام سارا 👋', 'acc.gold': 'عضو طلایی', 'acc.orders': 'سفارش‌ها', 'acc.read': 'کتاب‌های خوانده‌شده ۱۴۰۵', 'acc.points': 'امتیاز باشگاه', 'acc.goal': 'هدف مطالعه',
    'acc.profileInfo': 'اطلاعات پروفایل', 'acc.first': 'نام', 'acc.last': 'نام خانوادگی', 'acc.email': 'ایمیل', 'acc.phone': 'تلفن', 'acc.bday': 'تاریخ تولد <span class="muted">(برای هدیه تولد)</span>',
    'acc.plang': 'زبان ترجیحی', 'acc.saveBtn': 'ذخیره تغییرات', 'acc.pass': 'تغییر رمز عبور', 'acc.saved': 'پروفایل ذخیره شد', 'acc.firstV': 'سارا', 'acc.lastV': 'کتاب‌دوست',
    'acc.history': 'تاریخچه سفارش‌ها', 'acc.filterOrders': 'فیلتر سفارش‌ها', 'acc.last6': '۶ ماه اخیر', 'acc.order': 'سفارش', 'acc.placed': 'تاریخ ثبت', 'acc.total': 'مبلغ', 'acc.details': 'جزئیات', 'acc.again': 'خرید دوباره', 'acc.track': 'رهگیری مرسوله',
    'status.processing': 'در حال پردازش', 'status.transit': 'در مسیر', 'status.delivered': 'تحویل شده',
    'acc.wishlist': 'علاقه‌مندی‌ها', 'acc.openWish': 'مشاهده همه علاقه‌مندی‌ها', 'acc.noSavedT': 'هنوز کتابی ذخیره نکرده‌اید', 'acc.noSavedP': 'روی قلب هر کتاب بزنید تا این‌جا ذخیره شود.', 'acc.discover': 'کشف کتاب‌ها',
    'acc.addresses': 'آدرس‌های ذخیره‌شده', 'acc.home': 'خانه', 'acc.office': 'محل کار', 'acc.addr1': 'سارا کتاب‌دوست<br>تهران، خیابان ولیعصر، کوچه کتاب، پلاک ۲۱، واحد ۴<br>کد پستی ۱۵۹۶۷۴۳۱۱۱', 'acc.addr2': 'سارا کتاب‌دوست<br>تهران، میدان ونک، برج نور، طبقه ۱۲<br>کد پستی ۱۹۹۴۸۳۴۵۶۷',
    'acc.edit': 'ویرایش', 'acc.remove': 'حذف', 'acc.setDefault': 'انتخاب به‌عنوان پیش‌فرض', 'acc.addAddr': 'افزودن آدرس جدید',
    'acc.payments': 'روش‌های پرداخت', 'acc.holder': 'دارنده کارت', 'acc.expires': 'انقضا', 'acc.holderV': 'SARA KETABDOOST', 'acc.addPay': 'افزودن روش پرداخت', 'acc.wallets': 'کیف پول‌های دیجیتال',
    'acc.disconnect': 'قطع اتصال', 'acc.walletsOn': 'در دستگاه‌های پشتیبانی‌شده هنگام پرداخت فعال است', 'acc.enableW': 'فعال‌سازی کیف پول',
    'acc.prefs': 'سلیقه مطالعه', 'acc.powers': 'پیشنهادهای «کتاب‌هایی که شاید دوست داشته باشید» از این‌جا ساخته می‌شود', 'acc.favCats': 'دسته‌های محبوب', 'acc.favCatsP': 'هر تعداد که دوست دارید انتخاب کنید.',
    'acc.formats': 'نسخه‌های ترجیحی', 'acc.langs': 'زبان‌های مطالعه', 'acc.goalT': 'هدف مطالعه سالانه', 'acc.goalUnit': 'کتاب در سال ۱۴۰۵', 'acc.perYear': 'کتاب در سال', 'acc.notif': 'اعلان‌ها',
    'acc.n1': 'کتاب‌های تازه نویسندگان دنبال‌شده', 'acc.n1d': 'اولین نفری باشید که باخبر می‌شود', 'acc.n2': 'کاهش قیمت علاقه‌مندی‌ها', 'acc.n2d': 'وقتی کتابی که ذخیره کرده‌اید تخفیف بخورد ایمیل می‌زنیم', 'acc.n3': 'پیشنهادهای شخصی هفتگی', 'acc.n3d': 'هر جمعه انتخاب می‌شود',
    'wish.count': '{n} کتاب ذخیره‌شده', 'wish.count1': '۱ کتاب ذخیره‌شده', 'wish.drop': '{p}٪ کاهش قیمت', 'wish.instant': 'تحویل فوری', 'wish.stock': 'موجود',
    'wish.move': 'انتقال به سبد', 'wish.remove': 'حذف', 'wish.removeAria': 'حذف {t} از علاقه‌مندی‌ها', 'wish.emptyT': 'فهرست علاقه‌مندی‌ها خالی است',
    'wish.emptyP': 'با زدن روی آیکون قلب، کتاب‌های محبوبتان را ذخیره کنید. این‌جا منتظرتان می‌مانند و وقتی قیمتشان کم شد خبرتان می‌کنیم.', 'wish.moved': '<strong>{t}</strong> به سبد منتقل شد',
    'wish.movedAll': '{n} کتاب به سبد منتقل شد', 'wish.copied': 'لینک فهرست کپی شد',
    'ds.toast': 'این یک اعلان کوتاه است', 'ds.action': 'اقدام',
    'ds.gPrimary': 'رنگ اصلی — سبزآبی', 'ds.gSecondary': 'رنگ دوم — سبز', 'ds.gSurface': 'پس‌زمینه و سطوح', 'ds.gAccent': 'رنگ تأکیدی — زرد', 'ds.gNeutral': 'متن، خنثی‌ها و رنگ‌های معنایی'
  }
};
