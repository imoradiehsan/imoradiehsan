/* ورق — کتاب‌های نمونه
   هر کتاب فهرستی از «بلوک» است؛ موقع باز شدن، بلوک‌ها بر اساس اندازه صفحه و فونت، خودکار صفحه‌بندی می‌شوند.
   بلوک‌ها: h (تیتر) · p (پاراگراف) · quote (شعر/نقل‌قول) · sep (جداکننده) · img (تصویر) · video (ویدئو)
   تصویر می‌تواند آدرس (src) یا SVG درون‌خطی (svg) باشد. ویدئوها از نمونه‌های آزاد گوگل استفاده می‌کنند. */

const ART = {
  dunes: `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sk1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1055"/><stop offset=".6" stop-color="#7a3ea1"/><stop offset="1" stop-color="#f6b26b"/></linearGradient></defs><rect width="800" height="500" fill="url(#sk1)"/><circle cx="600" cy="300" r="70" fill="#ffd89b"/><path d="M0 380C150 300 250 420 400 360S650 300 800 380V500H0Z" fill="#5b2a86"/><path d="M0 430C200 360 350 470 520 410S700 380 800 440V500H0Z" fill="#3a1a5e"/><path d="M0 470C180 420 400 500 600 450S760 440 800 470V500H0Z" fill="#23103a"/></svg>`,
  forest: `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sk2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9b6ff"/><stop offset="1" stop-color="#f3eeff"/></linearGradient></defs><rect width="800" height="500" fill="url(#sk2)"/><g fill="#6d4bb3"><path d="M80 500V300l-50 0 70-110 70 110h-50v200z"/><path d="M230 500V260l-60 0 90-150 90 150h-60v240z" fill="#5a3a9c"/><path d="M420 500V320l-45 0 65-100 65 100h-45v180z"/><path d="M600 500V240l-70 0 100-160 100 160h-70v260z" fill="#4b2d8a"/><path d="M740 500V330l-40 0 55-90 55 90h-40v170z"/></g><rect y="470" width="800" height="30" fill="#3f2a6b"/><circle cx="150" cy="90" r="40" fill="#fff" opacity=".9"/></svg>`,
  sea: `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sk3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbd1ff"/><stop offset="1" stop-color="#8e6cf0"/></linearGradient></defs><rect width="800" height="500" fill="url(#sk3)"/><circle cx="400" cy="250" r="110" fill="#fff4c2"/><rect y="250" width="800" height="250" fill="#4e2a9e"/><g fill="none" stroke="#b9a3ff" stroke-width="6" stroke-linecap="round"><path d="M40 320q40-20 80 0t80 0 80 0 80 0 80 0 80 0 80 0 80 0"/><path d="M0 380q40-20 80 0t80 0 80 0 80 0 80 0 80 0 80 0 80 0 80 0"/><path d="M60 440q40-20 80 0t80 0 80 0 80 0 80 0 80 0 80 0 80 0"/></g><path d="M330 250l70-90 70 90z" fill="#2d1660"/></svg>`,
  city: `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="500" fill="#1d0f3a"/><g fill="#5d3fb0"><rect x="40" y="220" width="90" height="280"/><rect x="150" y="140" width="70" height="360"/><rect x="240" y="260" width="120" height="240"/><rect x="380" y="90" width="80" height="410"/><rect x="480" y="200" width="100" height="300"/><rect x="600" y="160" width="60" height="340"/><rect x="680" y="240" width="100" height="260"/></g><g fill="#ffd89b">${Array.from({ length: 60 }, (_, i) => `<rect x="${50 + (i * 97) % 720}" y="${110 + (i * 53) % 360}" width="8" height="12" opacity="${0.4 + (i % 5) / 8}"/>`).join('')}</g><circle cx="700" cy="70" r="30" fill="#f6e7ff"/></svg>`,
  mountain: `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sk4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b0b3b"/><stop offset="1" stop-color="#8d5cf6"/></linearGradient></defs><rect width="800" height="500" fill="url(#sk4)"/><g fill="#fff">${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 193) % 800}" cy="${(i * 71) % 220}" r="${1 + i % 3}" opacity=".8"/>`).join('')}</g><path d="M0 500L200 200l120 140 140-220 160 260 180-120V500z" fill="#3b2275"/><path d="M0 500l140-150 120 90 150-170 170 190 220-110V500z" fill="#271651"/><path d="M320 120l60 90h-120z" fill="#fff" opacity=".9"/></svg>`,
  lamp: `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="500" fill="#2a1452"/><circle cx="400" cy="230" r="170" fill="#ffd89b" opacity=".15"/><circle cx="400" cy="230" r="110" fill="#ffd89b" opacity=".2"/><rect x="380" y="260" width="40" height="160" rx="8" fill="#7b57c7"/><path d="M300 270h200l-40-120H340z" fill="#b89cff"/><rect x="330" y="420" width="140" height="20" rx="10" fill="#5a3a9c"/><g fill="#3d2578"><rect x="60" y="300" width="160" height="26" rx="4"/><rect x="70" y="330" width="140" height="26" rx="4"/><rect x="580" y="300" width="160" height="26" rx="4"/><rect x="590" y="330" width="140" height="26" rx="4"/></g></svg>`
};
const svgData = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);

const BOOKS = [
  {
    id: 'bagh-jadooyi', lang: 'fa', narration: 'assets/audio/bagh-jadooyi', title: 'باغ جادویی', subtitle: 'رمان نوجوان', author: 'مجید شفیعی',
    cover: 'assets/covers/bagh-jadooyi.webp', color: '#0f5f66', color2: '#5fd3d8', kind: ['text', 'audio'], minutes: 4,
    blurb: 'رمانی نوجوانانه درباره باغی که اسرار خانواده‌ای را در خود پنهان کرده است. (پیش‌نمایش)',
    blocks: [
      { t: 'h', text: 'درباره این کتاب' },
      { t: 'p', text: '«باغ جادویی» نوشته مجید شفیعی از مجموعه «رمان نوجوان» است. این نسخه، پیش‌نمایشی برای آزمایش کتاب‌خوان است؛ متن کامل کتاب با اجازه ناشر به آن افزوده می‌شود.' },
      { t: 'p', text: 'داستان در باغی قدیمی می‌گذرد که درختانش انگار حرف می‌زنند و پیرمردی که از لابه‌لای تنه‌های خمیده بیرون می‌آید، رازی را با خود دارد که سال‌ها کسی سراغش نرفته است. نوجوانی که به این باغ راه پیدا می‌کند، باید بین ترس و کنجکاوی یکی را انتخاب کند.' },
      { t: 'h', text: 'چگونه بخوانیم', small: true },
      { t: 'p', text: 'با انگشت از گوشه پایین صفحه بگیرید و بکشید تا ورق بخورد. ضربه روی حاشیه چپ، صفحه بعد و حاشیه راست، صفحه قبل را می‌آورد. اندازه متن و حالت شب از نوار پایین قابل تغییر است.' },
      { t: 'sep' },
      { t: 'p', text: 'این‌جا پایان پیش‌نمایش است. برای افزودن متن کامل، بلوک‌های کتاب را در فایل books.js وارد کنید.' }
    ]
  },
  {
    id: 'abriha', lang: 'fa', narration: 'assets/audio/abriha', title: 'ابری‌ها', subtitle: 'رمان نوجوان', author: 'محمدرضا یوسفی',
    cover: 'assets/covers/abriha.webp', color: '#4c6b3c', color2: '#b7d6f2', kind: ['text', 'video', 'audio'], minutes: 4,
    blurb: 'ماجرای پسرکی با کلاه خلبانی و دوربین دوچشمی که از نردبانی بالای ابرها می‌رود. (پیش‌نمایش)',
    blocks: [
      { t: 'h', text: 'درباره این کتاب' },
      { t: 'p', text: '«ابری‌ها» نوشته محمدرضا یوسفی از مجموعه «رمان نوجوان» است. این نسخه، پیش‌نمایشی برای آزمایش کتاب‌خوان است؛ متن کامل کتاب با اجازه ناشر به آن افزوده می‌شود.' },
      { t: 'p', text: 'پسرکی با کلاه آبی خلبانی، عینک گرد و دوربین دوچشمی، از نردبانی چوبی بالا می‌رود که سرش در ابرها گم شده است. آن بالا، شهری از ابر منتظر اوست؛ شهری که قوانین خودش را دارد و هر که به آن برسد، دیگر همان آدم قبلی نیست.' },
      { t: 'quote', text: 'ابرها را نمی‌شود نگه داشت؛\nفقط می‌شود با آن‌ها رفت.' },
      { t: 'video', full: true, src: 'assets/video/abriha-clip.mp4', poster: 'assets/video/abriha-clip.jpg', caption: 'شبی که همه‌چیز شروع شد' },
      { t: 'p', text: 'آن شب، پسرک تا دیروقت بیدار ماند و به سقف نگاه کرد. از پشت پنجره، ابرها آرام می‌گذشتند و انگار یکی از آن‌ها ایستاده بود و او را صدا می‌زد.' },
      { t: 'break' },
      { t: 'img', src: 'assets/video/abriha-frame.jpg', caption: 'اتاق پسرک، نیمه‌شب' },
      { t: 'p', text: 'اتاق ساکت بود. چراغ خواب کوچک، نور زردی روی میز می‌انداخت و خرگوش پارچه‌ای گوشه اتاق، انگار نگهبان شب بود. پسرک پتو را تا زیر چانه بالا کشید و گوش داد.' },
      { t: 'break' },
      { t: 'video', src: 'assets/video/abriha-short.mp4', poster: 'assets/video/abriha-frame.jpg', caption: 'صدایی از پشت پنجره' },
      { t: 'p', text: 'صدا دوباره آمد؛ آرام، مثل وزش باد لای پرده. پسرک از تخت پایین آمد، کلاه آبی خلبانی‌اش را برداشت و به طرف پنجره رفت. ابر هنوز آن‌جا بود و منتظرش مانده بود.' },
      { t: 'sep' },
      { t: 'p', text: 'این‌جا پایان پیش‌نمایش است. برای افزودن متن کامل، بلوک‌های کتاب را در فایل books.js وارد کنید.' }
    ]
  },
  {
    id: 'witcher-1', lang: 'fa', narration: 'assets/audio/witcher-1', title: 'ویچر ۱: آخرین آرزو', subtitle: 'حماسه ویچر', author: 'آنجی سپکوفسکی · ترجمه سینا طاووسی مسرور',
    cover: 'assets/covers/witcher-1.webp', color: '#1c2a33', color2: '#7fa6b8', kind: ['text', 'audio'], minutes: 4,
    blurb: 'نخستین کتاب حماسه ویچر: گرالت از ریویا، شکارچی هیولاها، و آرزویی که همه‌چیز را عوض می‌کند. (پیش‌نمایش)',
    blocks: [
      { t: 'h', text: 'درباره این کتاب' },
      { t: 'p', text: '«آخرین آرزو» نخستین کتاب از حماسه «ویچر» نوشته آنجی سپکوفسکی، نویسنده لهستانی، با ترجمه سینا طاووسی مسرور است. این نسخه، پیش‌نمایشی برای آزمایش کتاب‌خوان است؛ متن کامل کتاب با اجازه ناشر به آن افزوده می‌شود.' },
      { t: 'p', text: 'گرالت از ریویا یک ویچر است: شکارچی هیولا که از کودکی با جهش‌ها و معجون‌ها برای این کار ساخته شده. اما در دنیایی که انسان‌ها گاهی از هیولاها بدترند، مرز میان خوب و بد همیشه روشن نیست. مجموعه داستان‌های این کتاب، گرالت را از شهری به شهر دیگر می‌برد تا به آخرین آرزویی برسد که زندگی‌اش را دگرگون می‌کند.' },
      { t: 'h', text: 'فصل‌ها', small: true },
      { t: 'p', text: 'صدای عقل · ویچر · ذره‌ای حقیقت · شرّ کمتر · مسئله قیمت · لبه دنیا · آخرین آرزو.' },
      { t: 'sep' },
      { t: 'p', text: 'این‌جا پایان پیش‌نمایش است. برای افزودن متن کامل، بلوک‌های کتاب را در فایل books.js وارد کنید.' }
    ]
  },
  {
    id: 'anne-shirley', lang: 'fa', narration: 'assets/audio/anne-shirley', title: 'آنی شرلی در گرین گیبلز', subtitle: 'کتاب اول', author: 'ال. ام. مونتگمری · ترجمه سارا قدیانی',
    cover: 'assets/covers/anne-shirley.webp', color: '#1b7a3e', color2: '#f2d98a', kind: ['text', 'audio'], minutes: 5,
    blurb: 'دختری مو قرمز و پرحرف که به اشتباه به مزرعه گرین گیبلز می‌رسد و زندگی همه را عوض می‌کند. (پیش‌نمایش)',
    blocks: [
      { t: 'h', text: 'درباره این کتاب' },
      { t: 'p', text: '«آنی شرلی در گرین گیبلز» نوشته لوسی ماد مونتگمری (۱۹۰۸) با ترجمه سارا قدیانی، نخستین کتاب از ماجراهای آنی است. این نسخه، پیش‌نمایشی برای آزمایش کتاب‌خوان است؛ متن کامل ترجمه با اجازه ناشر به آن افزوده می‌شود.' },
      { t: 'h', text: 'آغاز داستان', small: true },
      { t: 'p', text: 'ماتیو و ماریلا کاتبرت، خواهر و برادری میان‌سال در مزرعه گرین گیبلز، تصمیم گرفته‌اند پسری یتیم را به فرزندی بگیرند تا در کار مزرعه کمکشان باشد. اما قطار، به جای پسر، دختری یازده‌ساله با موهای قرمز و بافته، کلاه حصیری و دهانی که یک لحظه بسته نمی‌شود برایشان می‌آورد: آنی شرلی.' },
      { t: 'p', text: 'آنی که در یتیم‌خانه خیال‌پردازی را تنها دارایی‌اش می‌دانسته، در همان راهِ ایستگاه تا مزرعه، نام‌هایی تازه برای درختان و جاده می‌گذارد و ماتیوِ کم‌حرف را پیش از رسیدن به خانه، شیفته خود می‌کند. حالا ماریلا باید تصمیم بگیرد: دختر را برگرداند، یا به این اشتباه، فرصتی بدهد.' },
      { t: 'quote', text: 'فردا روز تازه‌ای است\nکه هنوز هیچ اشتباهی در آن نشده.' },
      { t: 'sep' },
      { t: 'p', text: 'این‌جا پایان پیش‌نمایش است. برای افزودن متن کامل، بلوک‌های کتاب را در فایل books.js وارد کنید.' }
    ]
  },
  {
    id: 'golestan', lang: 'fa', title: 'گلستان', subtitle: 'گزیده‌ای از دیباچه و باب اول', author: 'سعدی شیرازی',
    color: '#5b2a86', color2: '#c084fc', kind: ['text'], minutes: 12,
    blurb: 'نثر مسجّع سعدی با حکایت‌هایی کوتاه درباره عدل و دانایی. متن خالص، برای تجربه ورق‌زدنِ واقعی.',
    blocks: [
      { t: 'h', text: 'دیباچه' },
      { t: 'p', text: 'منّت خدای را عزّ و جلّ که طاعتش موجب قربت است و به شکر اندرش مزید نعمت. هر نفسی که فرو می‌رود ممدّ حیات است و چون بر می‌آید مفرّح ذات؛ پس در هر نفسی دو نعمت موجود است و بر هر نعمتی شکری واجب.' },
      { t: 'quote', text: 'از دست و زبان که برآید\nکز عهده شکرش به در آید' },
      { t: 'p', text: 'باران رحمت بی‌حسابش همه را رسیده و خوان نعمت بی‌دریغش همه جا کشیده. پرده ناموس بندگان به گناه فاحش ندرد و وظیفه روزی به خطای منکر نبرد.' },
      { t: 'quote', text: 'ای کریمی که از خزانه غیب\nگبر و ترسا وظیفه‌خور داری\nدوستان را کجا کنی محروم\nتو که با دشمن این نظر داری' },
      { t: 'p', text: 'فرّاش باد صبا را گفته تا فرش زمرّدین بگسترد و دایه ابر بهاری را فرموده تا بنات نبات در مهد زمین بپرورد. درختان را به خلعت نوروزی قبای سبز ورق در بر گرفته و اطفال شاخ را به قدوم موسم ربیع کلاه شکوفه بر سر نهاده. عصاره نالی به قدرت او شهد فایق شده و تخم خرمایی به تربیتش نخل باسق گشته.' },
      { t: 'quote', text: 'ابر و باد و مه و خورشید و فلک در کارند\nتا تو نانی به کف آری و به غفلت نخوری\nهمه از بهر تو سرگشته و فرمان‌بردار\nشرط انصاف نباشد که تو فرمان نبری' },
      { t: 'sep' },
      { t: 'h', text: 'در سبب تألیف کتاب' },
      { t: 'p', text: 'یک شب تأمّل ایّام گذشته می‌کردم و بر عمر تلف‌کرده تأسّف می‌خوردم و سنگ سراچه دل به الماس آب دیده می‌سفتم و این بیت‌ها مناسب حال خود می‌گفتم:' },
      { t: 'quote', text: 'هر دم از عمر می‌رود نفسی\nچون نگه می‌کنم نمانده بسی\nای که پنجاه رفت و در خوابی\nمگر این پنج روز دریابی' },
      { t: 'p', text: 'بعد از تأمّل این معنی مصلحت آن دیدم که در نشیمن عزلت نشینم و دامن از صحبت فراهم چینم و دفتر از گفته‌های پریشان بشویم و من بعد پریشان نگویم. تا یکی از دوستان که در کجاوه انیس من بودی و در حجره جلیس، به رسم قدیم از در درآمد. چندان که نشاط ملاعبت کرد و بساط مداعبت گسترد، جوابش نگفتم و سر از زانوی تعبّد برنگرفتم.' },
      { t: 'p', text: 'رنجیده نگه کرد و گفت: اکنونت که امکان گفتار هست بگوی به لطف و کرم، که فردا چون پیک اجل در رسد به حکم ضرورت زبان از گفتار درکشی. گفتم: این روزها به تأمّل گذشته و حرام است سخن گفتن. گفت: چه نشسته‌ای که فصل بهار است و درختان شکوفه برآورده‌اند؛ بیا تا به تماشا رویم. بامدادان که خاطر بازآمدن بر رای نشستن غالب آمد، دیدمش دامنی گل و ریحان و سنبل و ضیمران فراهم آورده و قصد رجوع کرده. گفتم: گل بستان را چنان که دانی بقایی و عهد گلستان را وفایی نباشد و حکما گفته‌اند هر چه نپاید دلبستگی را نشاید.' },
      { t: 'p', text: 'گفت: طریق چیست؟ گفتم: برای نزهت ناظران و فسحت حاضران کتاب گلستانی توانم تصنیف کردن که باد خزان را بر ورق او دست تطاول نباشد و گردش زمان عیش ربیعش را به طیش خریف مبدّل نکند.' },
      { t: 'quote', text: 'به چه کار آیدت ز گل طبقی\nاز گلستان من ببر ورقی\nگل همین پنج روز و شش باشد\nوین گلستان همیشه خوش باشد' },
      { t: 'sep' },
      { t: 'h', text: 'باب اول — در سیرت پادشاهان' },
      { t: 'h', text: 'حکایت اول', small: true },
      { t: 'p', text: 'پادشاهی را شنیدم به کشتن اسیری اشارت کرد. بیچاره در آن حالت نومیدی ملک را دشنام دادن گرفت و سقط گفتن، که گفته‌اند هر که دست از جان بشوید هر چه در دل دارد بگوید.' },
      { t: 'quote', text: 'وقت ضرورت چو نماند گریز\nدست بگیرد سر شمشیر تیز' },
      { t: 'p', text: 'ملک پرسید: چه می‌گوید؟ یکی از وزرای نیک‌محضر گفت: ای خداوند، همی‌گوید «والکاظمین الغیظ والعافین عن النّاس». ملک را رحمت آمد و از سر خون او درگذشت. وزیر دیگر که ضدّ او بود گفت: ابنای جنس ما را نشاید در حضرت پادشاهان جز به راستی سخن گفتن؛ این، ملک را دشنام داد و ناسزا گفت. ملک روی از این سخن درهم آورد و گفت: آن دروغ وی پسندیده‌تر آمد مرا زین راست که تو گفتی، که روی آن در مصلحتی بود و بنای این بر خبثی؛ و خردمندان گفته‌اند دروغی مصلحت‌آمیز به که راستی فتنه‌انگیز.' },
      { t: 'quote', text: 'هر که شاه آن کند که او گوید\nحیف باشد که جز نکو گوید' },
      { t: 'h', text: 'حکایت دوم', small: true },
      { t: 'p', text: 'یکی از ملوک خراسان محمود سبکتگین را به خواب چنان دید که جمله وجود او ریخته بود و خاک شده، مگر چشمان او که همچنان در چشم‌خانه همی‌گردید و نظر می‌کرد. سایر حکما از تأویل این فرو ماندند، مگر درویشی که به جای آورد و گفت: هنوز نگران است که ملکش با دگران است.' },
      { t: 'quote', text: 'بس نامور به زیر زمین دفن کرده‌اند\nکز هستیش به روی زمین بر نشان نماند\nوان پیر لاشه را که سپردند زیر گل\nخاکش چنان بخورد کز او استخوان نماند' },
      { t: 'h', text: 'حکایت دهم', small: true },
      { t: 'p', text: 'یکی از ملوک بی‌انصاف پارسایی را پرسید: از عبادت‌ها کدام فاضل‌تر است؟ گفت: تو را خواب نیمروز، تا در آن یک نفس خلق را نیازاری.' },
      { t: 'quote', text: 'ظالمی را خفته دیدم نیم‌روز\nگفتم این فتنه‌ست خوابش برده به\nوان که خوابش بهتر از بیداری است\nآن چنان بد زندگانی مرده به' },
      { t: 'sep' },
      { t: 'h', text: 'بنی‌آدم' },
      { t: 'quote', text: 'بنی‌آدم اعضای یکدیگرند\nکه در آفرینش ز یک گوهرند\nچو عضوی به درد آورد روزگار\nدگر عضوها را نماند قرار\nتو کز محنت دیگران بی‌غمی\nنشاید که نامت نهند آدمی' },
      { t: 'p', text: 'این سه بیت از حکایت دهم باب اول گلستان، شناخته‌شده‌ترین سطرهای سعدی در جهان است و نمونه‌ای از این که چگونه یک حکایت کوتاه می‌تواند حامل اندیشه‌ای بزرگ باشد.' }
    ]
  },
  {
    id: 'colors', lang: 'fa', title: 'سفر به سرزمین رنگ‌ها', subtitle: 'سفرنامه‌ای مصوّر', author: 'نگار بهمنی',
    color: '#7c3aed', color2: '#f0abfc', kind: ['text', 'image'], minutes: 9,
    blurb: 'یک سفرنامه کوتاه با تصویرهای تمام‌صفحه: کویر، جنگل، دریا، شهر و کوهستان؛ هر فصل با یک تصویر آغاز می‌شود.',
    blocks: [
      { t: 'h', text: 'پیش از سفر' },
      { t: 'p', text: 'هر سفری از یک تصویر شروع می‌شود؛ تصویری که مدت‌ها پیش در ذهن نشسته و حالا می‌خواهد واقعی شود. سفر من از عکس کهنه‌ای شروع شد: تپه‌های شنی در نور غروب، با رنگ‌هایی که باور نمی‌کردم واقعی باشند. تصمیم گرفتم به جای جست‌وجوی مکان‌ها، به دنبال رنگ‌ها بروم.' },
      { t: 'p', text: 'این کتاب، یادداشت‌های همان سفر است: پنج منزل و پنج رنگ. هر فصل با یک تصویر آغاز می‌شود و با یادداشتی کوتاه تمام می‌شود. ورق بزنید.' },
      { t: 'img', svg: ART.dunes, caption: 'منزل اول — بنفشِ کویر، دقایقی بعد از غروب' },
      { t: 'h', text: 'منزل اول: کویر' },
      { t: 'p', text: 'کویر در روز یک رنگ است و در غروب هزار رنگ. وقتی خورشید پایین می‌رود، شن‌ها اول طلایی می‌شوند، بعد نارنجی، بعد صورتی، و دست آخر بنفشی که انگار از زیر زمین بالا می‌آید. راهنمای محلی می‌گفت این بنفش را «رنگ سکوت» می‌نامند، چون درست در همان دقایقی می‌آید که باد می‌خوابد.' },
      { t: 'p', text: 'شب روی شن‌ها خوابیدیم. آسمان آن‌قدر پرستاره بود که سایه می‌انداخت. صبح، شبنم روی سطح شن‌ها نقش‌های ریزی گذاشته بود که با اولین نور ناپدید شدند.' },
      { t: 'img', svg: ART.forest, caption: 'منزل دوم — جنگل یاسی در مه صبحگاهی' },
      { t: 'h', text: 'منزل دوم: جنگل' },
      { t: 'p', text: 'در جنگل، رنگ‌ها لایه‌لایه‌اند. زیر سایه درختان، سبز تیره؛ بالاتر، جایی که نور از لابه‌لای برگ‌ها می‌گذرد، سبز روشن؛ و در مه صبح، همه‌چیز به یاسی کم‌رنگی می‌رسد که مرز زمین و آسمان را پاک می‌کند. در این مه، صداها هم نرم می‌شوند.' },
      { t: 'p', text: 'پیرمردی که در حاشیه جنگل زنبور نگه می‌داشت، گفت عسل بهاره‌اش رنگ همین مه است: روشن و کمی بنفش. باور نکردم تا وقتی که شیشه‌اش را جلوی نور گرفت.' },
      { t: 'img', svg: ART.sea, caption: 'منزل سوم — ماه بر آب، ساحل جنوبی' },
      { t: 'h', text: 'منزل سوم: دریا' },
      { t: 'p', text: 'دریا رنگ آسمان را قرض می‌گیرد و با خودش عوض می‌کند. در طلوع، صورتی و نقره‌ای؛ در ظهر، آبیِ سیر؛ و شبِ مهتابی، بنفشی که با هر موج تکان می‌خورد. بادبان قایق‌های ماهیگیری در تاریکی مثل مثلث‌های سیاه بر این بنفش می‌نشستند.' },
      { t: 'p', text: 'روی اسکله، بچه‌ها با چراغ‌قوه در آب می‌گشتند و ماهی‌های کوچک را به نور می‌کشاندند. گفتند اسم این بازی «ماه‌گیری» است.' },
      { t: 'img', svg: ART.city, caption: 'منزل چهارم — شهر در نیمه‌شب' },
      { t: 'h', text: 'منزل چهارم: شهر' },
      { t: 'p', text: 'شهر شب رنگ خودش را دارد: بنفشِ لامپ‌ها بر دیوارهای تاریک، و زرد گرم پنجره‌هایی که هنوز بیدارند. از پشت‌بام هتل، شهر به نقشه‌ای از نقطه‌های نورانی تبدیل می‌شد که با هر دقیقه کم و زیاد می‌شد.' },
      { t: 'p', text: 'ساعت سه، نانوایی سر کوچه روشن شد و بوی نان تمام خیابان را گرفت. فهمیدم شهر هم مثل کویر، ساعتِ سکوت دارد؛ فقط کوتاه‌تر.' },
      { t: 'img', svg: ART.mountain, caption: 'منزل پنجم — قله برفی زیر آسمان پرستاره' },
      { t: 'h', text: 'منزل پنجم: کوهستان' },
      { t: 'p', text: 'آخرین منزل، بلندترین بود. در ارتفاع، رنگ‌ها ساده می‌شوند: سفید برف، سیاه سنگ، و آسمانی که از آبی به بنفش و از بنفش به سیاهِ پرستاره می‌رسد. شب، سرما آن‌قدر خالص بود که انگار صدا هم یخ می‌زد.' },
      { t: 'p', text: 'صبح، وقتی اولین نور به قله خورد، فهمیدم که دنبال چه آمده بودم: نه یک رنگ، بلکه لحظه‌ای که یک رنگ به رنگ دیگر تبدیل می‌شود. همان لحظه‌ای که ورق می‌خورد.' },
      { t: 'sep' },
      { t: 'img', svg: ART.lamp, caption: 'بازگشت — چراغ مطالعه، و دفتری که باید نوشته می‌شد' },
      { t: 'p', text: 'حالا این دفتر را زیر چراغ بنفش اتاقم می‌نویسم. اگر این صفحه‌ها را ورق زده‌اید، شما هم بخشی از این سفر بوده‌اید.' }
    ]
  },
  {
    id: 'nature', lang: 'fa', title: 'کارگاه تصویر متحرک', subtitle: 'متن، تصویر و ویدئو در یک کتاب', author: 'انتشارات ورق',
    color: '#4c1d95', color2: '#a78bfa', kind: ['text', 'image', 'video'], minutes: 7,
    blurb: 'کتابی چندرسانه‌ای: هر فصل یک ویدئوی کوتاه دارد که درون صفحه پخش می‌شود. نشان می‌دهد ورق‌خوردن با ویدئو و تصویر هم کار می‌کند.',
    blocks: [
      { t: 'h', text: 'چرا ویدئو در کتاب؟' },
      { t: 'p', text: 'بعضی چیزها را نمی‌شود نوشت؛ باید دید. یک حرکت، یک لبخند، یک پرواز. این کتاب آزمایشی است برای این که ببینیم کتاب کاغذی و ویدئو چگونه کنار هم می‌نشینند: شما ورق می‌زنید، صفحه‌ای با ویدئو باز می‌شود، دکمه پخش را می‌زنید و وقتی تمام شد، باز ورق می‌زنید.' },
      { t: 'p', text: 'ویدئوهای این کتاب، نمونه‌های آزاد و شناخته‌شده‌ای هستند که برای آزمایش پخش‌کننده‌ها استفاده می‌شوند. برای پخش، به اینترنت نیاز دارید.' },
      { t: 'video', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', poster: svgData(ART.forest), caption: 'فصل اول — «خرگوش بزرگ» (Big Buck Bunny)، انیمیشن آزاد بنیاد بلندر' },
      { t: 'h', text: 'فصل اول: بیداری' },
      { t: 'p', text: 'انیمیشن «خرگوش بزرگ» با صبحی آرام در جنگل شروع می‌شود. خرگوشی تنومند از لانه بیرون می‌آید، به آفتاب نگاه می‌کند، پروانه‌ای را دنبال می‌کند، و زندگی ساده‌اش با ورود سه جونده موذی به هم می‌ریزد. این فیلم در سال ۲۰۰۸ با نرم‌افزار آزاد بلندر ساخته شد و منبع آن برای همه در دسترس است.' },
      { t: 'p', text: 'به رنگ‌های فیلم دقت کنید: سبزهای گرم و نور نرم صبح؛ همان چیزی که در فصل دوم کتاب «سفر به سرزمین رنگ‌ها» درباره‌اش خواندیم.' },
      { t: 'video', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', poster: svgData(ART.city), caption: 'فصل دوم — «رؤیای فیل‌ها» (Elephants Dream)، نخستین فیلم آزاد بلندر' },
      { t: 'h', text: 'فصل دوم: ماشین' },
      { t: 'p', text: '«رؤیای فیل‌ها» داستان دو شخصیت است که در ماشینی عظیم و بی‌پایان زندگی می‌کنند. یکی از آن‌ها همه‌چیز را توضیح می‌دهد و دیگری فقط می‌خواهد ببیند. فیلم عمداً مبهم است و هر بیننده آن را جور دیگری تفسیر می‌کند.' },
      { t: 'p', text: 'نکته فنی: ویدئوها درون صفحه کتاب جا می‌گیرند و وقتی ورق می‌زنید، متوقف می‌شوند تا صدایشان در صفحه بعدی ادامه پیدا نکند.' },
      { t: 'img', svg: ART.lamp, caption: 'تصویر ثابت هم می‌تواند کنار ویدئو بنشیند' },
      { t: 'h', text: 'فصل سوم: هم‌نشینی' },
      { t: 'p', text: 'در این صفحه، تصویر و متن با هم‌اند. در صفحه بعد، ویدئویی کوتاه‌تر می‌بینید. مهم این است که تجربه ورق‌زدن در همه این صفحه‌ها یکسان بماند: با انگشت از گوشه صفحه بگیرید و بکشید، یا روی حاشیه صفحه ضربه بزنید.' },
      { t: 'video', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', poster: svgData(ART.mountain), caption: 'فصل چهارم — نمونه کوتاه (۱۵ ثانیه)' },
      { t: 'h', text: 'فصل چهارم: پایان کارگاه' },
      { t: 'p', text: 'اگر تا این‌جا آمده‌اید، سه نوع صفحه را دیده‌اید: متن خالص، متن با تصویر، و متن با ویدئو. همه با همان حرکت ساده انگشت ورق خوردند. حالا به کتابخانه برگردید و کتاب بعدی را باز کنید.' }
    ]
  },
  {
    id: 'aesop', lang: 'en', title: 'Aesop’s Fables', subtitle: 'Five short fables', author: 'Aesop',
    color: '#312e81', color2: '#c7d2fe', kind: ['text'], minutes: 6,
    blurb: 'کتاب انگلیسی، چپ‌به‌راست: ورق‌ها از سمت راست باز می‌شوند. پنج افسانه کوتاه ازوپ.',
    blocks: [
      { t: 'h', text: 'The Fox and the Grapes' },
      { t: 'p', text: 'One hot summer’s day a Fox was strolling through an orchard till he came to a bunch of grapes just ripening on a vine which had been trained over a lofty branch. “Just the thing to quench my thirst,” said he. Drawing back a few paces, he took a run and a jump, and just missed the bunch. Turning round again with a One, Two, Three, he jumped up, but with no greater success.' },
      { t: 'p', text: 'Again and again he tried after the tempting morsel, but at last had to give it up, and walked away with his nose in the air, saying: “I am sure they are sour.”' },
      { t: 'quote', text: 'It is easy to despise what you cannot get.' },
      { t: 'h', text: 'The Hare and the Tortoise' },
      { t: 'p', text: 'The Hare was once boasting of his speed before the other animals. “I have never yet been beaten,” said he, “when I put forth my full speed. I challenge any one here to race with me.” The Tortoise said quietly, “I accept your challenge.” “That is a good joke,” said the Hare; “I could dance round you all the way.” “Keep your boasting till you’ve beaten,” answered the Tortoise. “Shall we race?”' },
      { t: 'p', text: 'So a course was fixed and a start was made. The Hare darted almost out of sight at once, but soon stopped and, to show his contempt for the Tortoise, lay down to have a nap. The Tortoise plodded on and plodded on, and when the Hare awoke from his nap, he saw the Tortoise just near the winning-post and could not run up in time to save the race.' },
      { t: 'quote', text: 'Plodding wins the race.' },
      { t: 'h', text: 'The Lion and the Mouse' },
      { t: 'p', text: 'Once when a Lion was asleep a little Mouse began running up and down upon him; this soon wakened the Lion, who placed his huge paw upon him, and opened his big jaws to swallow him. “Pardon, O King,” cried the little Mouse: “forgive me this time, I shall never forget it: who knows but what I may be able to do you a turn some of these days?” The Lion was so tickled at the idea of the Mouse being able to help him, that he lifted up his paw and let him go.' },
      { t: 'p', text: 'Some time after the Lion was caught in a trap, and the hunters, who desired to carry him alive to the King, tied him to a tree while they went in search of a waggon to carry him on. Just then the little Mouse happened to pass by, and seeing the sad plight in which the Lion was, went up to him and soon gnawed away the ropes that bound the King of the Beasts. “Was I not right?” said the little Mouse.' },
      { t: 'quote', text: 'Little friends may prove great friends.' },
      { t: 'h', text: 'The North Wind and the Sun' },
      { t: 'p', text: 'The Wind and the Sun were disputing which was the stronger. Suddenly they saw a traveller coming down the road, and the Sun said: “I see a way to decide our dispute. Whichever of us can cause that traveller to take off his cloak shall be regarded as the stronger. You begin.” So the Sun retired behind a cloud, and the Wind began to blow as hard as it could upon the traveller. But the harder he blew the more closely did the traveller wrap his cloak round him, till at last the Wind had to give up in despair.' },
      { t: 'p', text: 'Then the Sun came out and shone in all his glory upon the traveller, who soon found it too hot to walk with his cloak on.' },
      { t: 'quote', text: 'Kindness effects more than severity.' },
      { t: 'h', text: 'The Boy Who Cried Wolf' },
      { t: 'p', text: 'There was once a young Shepherd Boy who tended his sheep at the foot of a mountain near a dark forest. It was rather lonely for him all day, so he thought upon a plan by which he could get a little company and some excitement. He rushed down towards the village calling out “Wolf, Wolf,” and the villagers came out to meet him, and some of them stopped with him for a considerable time. This pleased the boy so much that a few days afterwards he tried the same trick, and again the villagers came to his help.' },
      { t: 'p', text: 'But shortly after this a Wolf actually did come out from the forest, and began to worry the sheep, and the boy of course cried out “Wolf, Wolf,” still louder than before. But this time the villagers, who had been fooled twice before, thought the boy was again deceiving them, and nobody stirred to come to his help. So the Wolf made a good meal off the boy’s flock.' },
      { t: 'quote', text: 'A liar will not be believed, even when he speaks the truth.' }
    ]
  }
];
