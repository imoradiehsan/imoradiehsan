/* Folio & Co. — demo catalog data + icon set.
   Covers are generated (see coverHTML in app.js) so the UI ships with no image dependencies. */

const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  heart: '<path d="M12 20s-7.5-4.6-9.3-9.2C1.4 7.4 3.6 4 7 4c2 0 3.3 1 5 3 1.7-2 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8C19.5 15.4 12 20 12 20Z"/>',
  bag: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.2a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 7H6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevDown: '<path d="m6 9 6 6 6-6"/>',
  chevRight: '<path d="m9 6 6 6-6 6"/>',
  chevLeft: '<path d="m15 6-6 6 6 6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" fill="currentColor" stroke="none"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 5v4h4M4 13a8 8 0 0 0 14.9 3M20 19v-4h-4"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  gift: '<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 12h18M12 8S10 3 7.5 4 9 8 12 8Zm0 0s2-5 4.5-4S15 8 12 8Z"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  ai: '<path d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 0 2 2h13"/>',
  bookOpen: '<path d="M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2V5ZM22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7V5Z"/>',
  headphones: '<path d="M3 17v-5a9 9 0 0 1 18 0v5"/><rect x="3" y="14" width="4" height="7" rx="1.5"/><rect x="17" y="14" width="4" height="7" rx="1.5"/>',
  tablet: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M11 18h2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z"/>',
  pin: '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  package: '<path d="m21 8-9-5-9 5v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  quote: '<path d="M9 7H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3v1a3 3 0 0 1-3 3M19 7h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3v1a3 3 0 0 1-3 3" stroke-width="2.2"/>',
  verified: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  thumb: '<path d="M7 10v11H3V10h4Zm0 0 4-7a2 2 0 0 1 2 2v4h6a2 2 0 0 1 2 2.3l-1.3 7.4A2 2 0 0 1 17.7 21H7"/>',
  zoom: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>',
  trendDown: '<path d="m3 7 7 7 4-4 7 7M21 11v6h-6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  // category icons
  feather: '<path d="M20 4c-8 0-14 6-14 14v2"/><path d="M20 4c0 8-5 12-11 12M14 10H8"/>',
  sprout: '<path d="M12 21v-9"/><path d="M12 12C12 7 8 4 3 4c0 5 4 8 9 8ZM12 14c0-4 3-7 9-7 0 4-3 7-9 7Z"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1ZM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
  columns: '<path d="M3 21h18M4 9h16M12 3 3 8h18l-9-5ZM6 9v9M10 9v9M14 9v9M18 9v9"/>',
  atom: '<circle cx="12" cy="12" r="1.5"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>',
  balloon: '<path d="M12 16c3.5 0 6-3 6-7a6 6 0 0 0-12 0c0 4 2.5 7 6 7Z"/><path d="m11 16-1 2h4l-1-2M12 18c0 2-2 2-2 4"/>',
  quill: '<path d="M4 20 14 10M18 3c-6 1-10 6-11 13l3-1c1-2 4-3 5-5 1 0-1-2 0-3 2 0 2-2 3-4Z"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  // socials (simple generic marks)
  socialA: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
  socialB: '<path d="M4 4l16 16M20 4 4 20"/>',
  socialC: '<path d="M14 21v-8h3l.5-3.5H14V7.5c0-1 .4-1.8 1.8-1.8H18V2.6C17.6 2.5 16.4 2.4 15 2.4c-3 0-4.6 1.7-4.6 4.8v2.3H7.5V13h2.9v8"/>',
  socialD: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3V9Z" fill="currentColor"/>',
  socialE: '<circle cx="12" cy="12" r="9"/><path d="M9 17c1-4 2-7 3-10M8 11c0-2.5 2-4 4.2-4 2.3 0 3.8 1.5 3.8 3.6 0 2.6-1.6 4.4-3.6 4.4-.9 0-1.6-.5-1.8-1.2"/>'
};

const CATEGORIES = [
  { slug: 'fiction', name: 'Fiction', icon: 'feather', count: 12480, tint: '#f1e6d3', ink: '#8a5a12' },
  { slug: 'self-development', name: 'Self Development', icon: 'sprout', count: 4210, tint: '#e3f1e8', ink: '#24724a' },
  { slug: 'business', name: 'Business', icon: 'briefcase', count: 5360, tint: '#dfe5f1', ink: '#20345f' },
  { slug: 'psychology', name: 'Psychology', icon: 'brain', count: 2890, tint: '#f3e3ef', ink: '#8a2f6e' },
  { slug: 'history', name: 'History', icon: 'columns', count: 3740, tint: '#f5e7dc', ink: '#9a4a1c' },
  { slug: 'science', name: 'Science', icon: 'atom', count: 3120, tint: '#dff0f3', ink: '#146a7a' },
  { slug: 'children', name: 'Children', icon: 'balloon', count: 6580, tint: '#fdf0cf', ink: '#a2650a' },
  { slug: 'literature', name: 'Literature', icon: 'quill', count: 4470, tint: '#ebe6f5', ink: '#4f3a8a' },
  { slug: 'technology', name: 'Technology', icon: 'cpu', count: 2650, tint: '#e2ecf8', ink: '#1f5aa6' }
];

const AUTHORS = {
  'elena-marsh':   { name: 'Elena Marsh', genre: 'Literary Fiction', books: 14, followers: '182K', palette: ['#e6d5b8', '#8a5a12', '#16274a'], bio: 'Award-winning novelist known for luminous, map-like stories about memory, coastlines and the families who wander them.' },
  'james-calder':  { name: 'James Calder', genre: 'Self Development', books: 6, followers: '410K', palette: ['#dff0e6', '#24724a', '#0f1c36'], bio: 'Behavioral coach and former athlete writing practical, research-backed guides to habits, focus and deliberate living.' },
  'priya-raman':   { name: 'Priya Raman', genre: 'Business & Strategy', books: 5, followers: '96K', palette: ['#dfe5f1', '#20345f', '#e9b75a'], bio: 'Two-time founder and investor who translates startup chaos into calm, repeatable operating principles.' },
  'samuel-okafor': { name: 'Dr. Samuel Okafor', genre: 'Psychology', books: 8, followers: '150K', palette: ['#f3e3ef', '#8a2f6e', '#16274a'], bio: 'Clinical psychologist and lecturer making modern neuroscience warm, readable and genuinely useful.' },
  'marcus-hale':   { name: 'Marcus Hale', genre: 'History', books: 11, followers: '74K', palette: ['#f5e7dc', '#9a4a1c', '#0f1c36'], bio: 'Historian of trade and empire whose sweeping narratives read like the best adventure novels.' },
  'lena-ortiz':    { name: 'Dr. Lena Ortiz', genre: 'Science', books: 4, followers: '121K', palette: ['#dff0f3', '#146a7a', '#0f1c36'], bio: 'Astrophysicist and science communicator bringing the universe down to kitchen-table scale.' },
  'clara-bell':    { name: 'Clara Bell', genre: "Children's Books", books: 22, followers: '58K', palette: ['#fdf0cf', '#a2650a', '#e0692a'], bio: 'Author-illustrator of bedtime favorites about brave, curious and slightly mischievous small creatures.' },
  'isabel-moreau': { name: 'Isabel Moreau', genre: 'Literature', books: 9, followers: '67K', palette: ['#ebe6f5', '#4f3a8a', '#16274a'], bio: 'Poet and novelist whose epistolary works explore distance, music and the letters we never send.' },
  'arjun-mehta':   { name: 'Arjun Mehta', genre: 'Technology', books: 3, followers: '88K', palette: ['#e2ecf8', '#1f5aa6', '#0f1c36'], bio: 'Principal engineer writing clear, humane books about software craft and machine intelligence.' },
  'noah-whitfield':{ name: 'Noah Whitfield', genre: 'Thriller & Fiction', books: 7, followers: '132K', palette: ['#e8e4dc', '#3d4354', '#b87d17'], bio: 'Former journalist turned novelist of atmospheric, globe-trotting mysteries.' },
  'maya-chen':     { name: 'Maya Chen', genre: 'Personal Finance', books: 4, followers: '203K', palette: ['#e3f1e8', '#2f8a5b', '#16274a'], bio: 'Financial educator helping readers build calm, values-first relationships with money.' }
};

/* style: art variant for the generated cover; pal: [background, foreground, accent] */
const BOOKS = [
  { id: 1,  title: 'The Quiet Cartographer', author: 'elena-marsh', cat: 'fiction', price: 18.99, old: 24.99, rating: 4.8, reviews: 2341, lang: 'English', formats: ['Hardcover', 'Paperback', 'eBook', 'Audiobook'], pages: 384, year: 2026, pub: 'Harbor Lane Press', style: 'orb', pal: ['#16274a', '#f8f2e7', '#e9b75a'], kicker: 'A Novel', tags: ['bestseller', 'featured'], blurb: 'When a reclusive mapmaker inherits her grandmother\'s unfinished atlas, she follows its hand-drawn coastlines across three countries — and into a family secret that was never meant to be charted.' },
  { id: 2,  title: 'Atomic Rituals', author: 'james-calder', cat: 'self-development', price: 16.50, old: null, rating: 4.9, reviews: 5812, lang: 'English', formats: ['Hardcover', 'Paperback', 'eBook', 'Audiobook'], pages: 296, year: 2025, pub: 'Northstar Books', style: 'grid', pal: ['#f4efe4', '#16274a', '#e0692a'], kicker: 'Tiny habits, big life', tags: ['bestseller', 'featured'], blurb: 'A practical, science-backed system for designing daily rituals that compound. Small changes, remarkable results — with worksheets you will actually use.' },
  { id: 3,  title: 'The Lean Founder', author: 'priya-raman', cat: 'business', price: 22.00, old: 27.50, rating: 4.6, reviews: 1204, lang: 'English', formats: ['Hardcover', 'eBook', 'Audiobook'], pages: 320, year: 2026, pub: 'Meridian House', style: 'stripes', pal: ['#e9b75a', '#0f1c36', '#0f1c36'], kicker: 'Build calmly', tags: ['featured', 'offer'], blurb: 'How to build a durable company with less capital, fewer meetings and more clarity. The operating manual Priya wished she had on day one.' },
  { id: 4,  title: 'Minds in Motion', author: 'samuel-okafor', cat: 'psychology', price: 19.99, old: null, rating: 4.7, reviews: 987, lang: 'English', formats: ['Paperback', 'eBook', 'Audiobook'], pages: 352, year: 2026, pub: 'Northstar Books', style: 'wave', pal: ['#8a2f6e', '#fdf3fa', '#f2cf85'], kicker: 'The new science of thought', tags: ['featured', 'new'], blurb: 'An illuminating tour of how thoughts form, travel and change — and what that means for how we learn, love and heal.' },
  { id: 5,  title: 'Empires of Salt', author: 'marcus-hale', cat: 'history', price: 24.99, old: 32.00, rating: 4.8, reviews: 1650, lang: 'English', formats: ['Hardcover', 'Paperback', 'eBook'], pages: 512, year: 2025, pub: 'Harbor Lane Press', style: 'arch', pal: ['#9a4a1c', '#fbeee2', '#f2cf85'], kicker: 'A world history', tags: ['bestseller', 'offer'], blurb: 'The humble crystal that built cities, sparked wars and redrew maps. A sweeping, vivid history of the world told through salt.' },
  { id: 6,  title: 'The Hidden Cosmos', author: 'lena-ortiz', cat: 'science', price: 21.00, old: null, rating: 4.9, reviews: 2210, lang: 'English', formats: ['Hardcover', 'eBook', 'Audiobook'], pages: 288, year: 2026, pub: 'Lumen Science', style: 'stars', pal: ['#0a1426', '#ffffff', '#e9b75a'], kicker: 'Dark matter & us', tags: ['bestseller', 'featured', 'new'], blurb: 'Eighty-five percent of the universe is invisible. Dr. Lena Ortiz explains, with wit and wonder, how we know it is there — and why it matters.' },
  { id: 7,  title: 'Pip and the Paper Moon', author: 'clara-bell', cat: 'children', price: 12.99, old: 15.99, rating: 4.9, reviews: 842, lang: 'English', formats: ['Hardcover', 'Paperback'], pages: 40, year: 2026, pub: 'Little Lantern', style: 'moon', pal: ['#1f5aa6', '#fff8e6', '#f2cf85'], kicker: 'Ages 3–7', tags: ['featured', 'new', 'offer'], blurb: 'Pip the mouse cuts a moon from paper so the night will not be lonely. A gentle, glowing bedtime story about bravery and friendship.' },
  { id: 8,  title: 'Letters from Lisbon', author: 'isabel-moreau', cat: 'literature', price: 17.50, old: null, rating: 4.5, reviews: 634, lang: 'English', formats: ['Paperback', 'eBook'], pages: 272, year: 2025, pub: 'Meridian House', style: 'frame', pal: ['#ebe6f5', '#2d2150', '#8a6bd1'], kicker: 'A novel in letters', tags: ['featured'], blurb: 'Forty letters, one summer, and a cellist who never sent a single one. A tender epistolary novel about the space between people.' },
  { id: 9,  title: 'Designing Intelligent Systems', author: 'arjun-mehta', cat: 'technology', price: 39.99, old: 49.99, rating: 4.7, reviews: 512, lang: 'English', formats: ['Paperback', 'eBook'], pages: 448, year: 2026, pub: 'Circuit Press', style: 'circuit', pal: ['#0f1c36', '#e2ecf8', '#5fb3ff'], kicker: '2nd edition', tags: ['featured', 'new', 'offer'], blurb: 'A clear-eyed, hands-on guide to building reliable AI-powered products — from data pipelines to evaluation to responsible deployment.' },
  { id: 10, title: 'The Salt Orchard', author: 'elena-marsh', cat: 'fiction', price: 16.99, old: null, rating: 4.6, reviews: 1480, lang: 'English', formats: ['Paperback', 'eBook', 'Audiobook'], pages: 336, year: 2024, pub: 'Harbor Lane Press', style: 'mountain', pal: ['#2f6a5b', '#f3f7f2', '#f2cf85'], kicker: 'A Novel', tags: ['bestseller'], blurb: 'Two sisters, one failing orchard by the sea, and the summer that decides everything.' },
  { id: 11, title: 'Deep Focus', author: 'james-calder', cat: 'self-development', price: 15.99, old: 19.99, rating: 4.7, reviews: 3120, lang: 'English', formats: ['Paperback', 'eBook', 'Audiobook'], pages: 240, year: 2026, pub: 'Northstar Books', style: 'orb', pal: ['#e0692a', '#fff7ef', '#0f1c36'], kicker: 'Attention is a superpower', tags: ['bestseller', 'new', 'offer'], blurb: 'Reclaim your attention in a world designed to steal it. Seven weekly experiments for calmer, deeper work.' },
  { id: 12, title: 'Numbers That Matter', author: 'priya-raman', cat: 'business', price: 20.00, old: null, rating: 4.4, reviews: 402, lang: 'English', formats: ['Hardcover', 'eBook'], pages: 256, year: 2025, pub: 'Meridian House', style: 'grid', pal: ['#dfe5f1', '#16274a', '#2d4679'], kicker: 'Metrics for humans', tags: [], blurb: 'The handful of metrics that actually predict a healthy business, explained without jargon.' },
  { id: 13, title: 'The Anxious Brain', author: 'samuel-okafor', cat: 'psychology', price: 18.00, old: 22.00, rating: 4.8, reviews: 2760, lang: 'English', formats: ['Paperback', 'eBook', 'Audiobook'], pages: 304, year: 2024, pub: 'Northstar Books', style: 'wave', pal: ['#146a7a', '#eefafc', '#f2cf85'], kicker: 'Understanding worry', tags: ['bestseller', 'offer'], blurb: 'Why worry exists, what it protects, and a compassionate toolkit for turning the volume down.' },
  { id: 14, title: 'Silk Roads Rewritten', author: 'marcus-hale', cat: 'history', price: 26.50, old: null, rating: 4.6, reviews: 719, lang: 'English', formats: ['Hardcover', 'eBook'], pages: 560, year: 2026, pub: 'Harbor Lane Press', style: 'arch', pal: ['#16274a', '#f8f2e7', '#d99a2b'], kicker: 'Trade, ideas & empire', tags: ['new'], blurb: 'A fresh, sweeping history of the routes that connected the ancient world — and the ideas that travelled with the silk.' },
  { id: 15, title: 'A Brief Tour of Time', author: 'lena-ortiz', cat: 'science', price: 14.99, old: 18.99, rating: 4.5, reviews: 1045, lang: 'Spanish', formats: ['Paperback', 'eBook'], pages: 212, year: 2024, pub: 'Lumen Science', style: 'stars', pal: ['#2d2150', '#f5f0ff', '#f2cf85'], kicker: 'Physics for the curious', tags: ['offer'], blurb: 'From sundials to spacetime, a delightfully short tour of the strangest thing in physics: time itself.' },
  { id: 16, title: 'The Dragon Who Loved Books', author: 'clara-bell', cat: 'children', price: 11.50, old: null, rating: 4.9, reviews: 1320, lang: 'English', formats: ['Hardcover', 'Paperback', 'eBook'], pages: 36, year: 2025, pub: 'Little Lantern', style: 'moon', pal: ['#2f8a5b', '#fffbe8', '#f2cf85'], kicker: 'Ages 4–8', tags: ['bestseller'], blurb: 'Ember the dragon wants to read, not roar. A funny, heartwarming celebration of libraries and the courage to be different.' },
  { id: 17, title: 'The Winter Sonata', author: 'isabel-moreau', cat: 'literature', price: 18.50, old: null, rating: 4.3, reviews: 288, lang: 'French', formats: ['Paperback', 'eBook'], pages: 248, year: 2026, pub: 'Meridian House', style: 'frame', pal: ['#f8f2e7', '#16274a', '#9a4a1c'], kicker: 'Roman', tags: ['new'], blurb: 'A pianist returns to her snowbound hometown to finish her late teacher\'s last composition.' },
  { id: 18, title: 'Clean Code Craft', author: 'arjun-mehta', cat: 'technology', price: 34.00, old: null, rating: 4.8, reviews: 1890, lang: 'English', formats: ['Paperback', 'eBook'], pages: 390, year: 2025, pub: 'Circuit Press', style: 'circuit', pal: ['#f2cf85', '#0f1c36', '#0f1c36'], kicker: 'Software as a craft', tags: ['bestseller'], blurb: 'Timeless principles for writing code that teammates love to read — with examples in three languages.' },
  { id: 19, title: 'Midnight in Marrakesh', author: 'noah-whitfield', cat: 'fiction', price: 17.99, old: 21.99, rating: 4.6, reviews: 1575, lang: 'English', formats: ['Hardcover', 'Paperback', 'eBook', 'Audiobook'], pages: 368, year: 2026, pub: 'Northstar Books', style: 'arch', pal: ['#b23a2b', '#fff3e8', '#f2cf85'], kicker: 'A thriller', tags: ['new', 'offer', 'featured'], blurb: 'A stolen manuscript, a masked auction and a city that never quite sleeps. The most atmospheric thriller of the year.' },
  { id: 20, title: 'The Art of Enough', author: 'maya-chen', cat: 'self-development', price: 16.00, old: null, rating: 4.7, reviews: 2088, lang: 'English', formats: ['Paperback', 'eBook', 'Audiobook'], pages: 224, year: 2025, pub: 'Northstar Books', style: 'mountain', pal: ['#e3d3b5', '#16274a', '#2f8a5b'], kicker: 'Live well with less', tags: ['bestseller'], blurb: 'A warm, practical guide to defining "enough" — in money, time and ambition — and finally enjoying it.' },
  { id: 21, title: 'The Glass Garden', author: 'noah-whitfield', cat: 'fiction', price: 15.50, old: null, rating: 4.4, reviews: 690, lang: 'German', formats: ['Paperback', 'eBook'], pages: 312, year: 2024, pub: 'Northstar Books', style: 'stripes', pal: ['#146a7a', '#ecf9fb', '#f2cf85'], kicker: 'A mystery', tags: [], blurb: 'A botanist discovers a message hidden in the glasshouse her mother built — and a disappearance nobody reported.' },
  { id: 22, title: 'Money, Mind & Meaning', author: 'maya-chen', cat: 'business', price: 19.00, old: 23.00, rating: 4.8, reviews: 3304, lang: 'English', formats: ['Hardcover', 'Paperback', 'eBook', 'Audiobook'], pages: 280, year: 2026, pub: 'Meridian House', style: 'orb', pal: ['#2f8a5b', '#f1fbf5', '#f2cf85'], kicker: 'Financial calm', tags: ['bestseller', 'new', 'offer'], blurb: 'Build wealth without anxiety. Maya Chen\'s values-first framework for spending, saving and giving.' },
  { id: 23, title: 'The Last Lighthouse', author: 'elena-marsh', cat: 'fiction', price: 19.50, old: null, rating: 4.7, reviews: 910, lang: 'English', formats: ['Hardcover', 'eBook', 'Audiobook'], pages: 344, year: 2026, pub: 'Harbor Lane Press', style: 'moon', pal: ['#0f1c36', '#f8f2e7', '#e9b75a'], kicker: 'A Novel', tags: ['new'], blurb: 'The keeper of the last working lighthouse on the Atlantic coast receives a letter from a ship that sank forty years ago.' },
  { id: 24, title: 'Data Stories', author: 'arjun-mehta', cat: 'technology', price: 29.00, old: 36.00, rating: 4.5, reviews: 455, lang: 'English', formats: ['Paperback', 'eBook'], pages: 276, year: 2024, pub: 'Circuit Press', style: 'stripes', pal: ['#e2ecf8', '#1f5aa6', '#e0692a'], kicker: 'Charts that persuade', tags: ['offer'], blurb: 'Turn spreadsheets into stories people remember — a practical guide to honest, persuasive data visualization.' }
];

const TESTIMONIALS = [
  { name: 'Hannah Lewis', role: 'Literature student', rating: 5, color: '#8a2f6e', text: 'The recommendations are scarily good. I found three of my favourite books this year from the "Books You May Like" row — and the eBook arrived in seconds.' },
  { name: 'David Kim', role: 'Product manager', rating: 5, color: '#20345f', text: 'Checkout is the fastest I have seen on any bookstore. Two taps, done. The hardcovers arrive beautifully packed, every single time.' },
  { name: 'Amara Nwosu', role: 'Mum of two & book club host', rating: 4, color: '#9a4a1c', text: 'I order our monthly book-club picks here. The children\'s section is wonderfully curated and the reading guides make discussion easy.' }
];

const POSTS = [
  { title: 'Why "The Quiet Cartographer" is the novel of the season', cat: 'Book Review', mins: 6, date: '2026-09-22', excerpt: 'Elena Marsh returns with her most ambitious — and most tender — book yet. Here is why readers cannot put it down.', art: ['var(--primary-700)', 'var(--gold-500)', 'var(--bg-alt)'] },
  { title: 'How to read 50 books a year without rushing', cat: 'Reading Guide', mins: 8, date: '2026-09-15', excerpt: 'Forget speed-reading. Five gentle systems that make more reading feel effortless — tested by our staff.', art: ['var(--secondary-100)', 'var(--secondary-500)', 'var(--primary-900)'] },
  { title: 'In conversation with Priya Raman on building calmly', cat: 'Author Interview', mins: 11, date: '2026-09-04', excerpt: 'The Lean Founder author on burnout, boredom and why the best companies feel a little dull from the inside.', art: ['var(--gold-500)', 'var(--primary-900)', '#fff'] }
];

const REVIEWS = [
  { name: 'Olivia Grant', color: '#20345f', rating: 5, date: '2026-09-12', title: 'Couldn\'t put it down', text: 'Beautifully written and paced perfectly. I finished it in one weekend and immediately started again to catch the details I missed.', helpful: 48 },
  { name: 'Mateo Alvarez', color: '#9a4a1c', rating: 5, date: '2026-08-30', title: 'An instant favourite', text: 'The kind of book you want to press into a friend\'s hands. The hardcover edition is gorgeous too — heavy paper, lovely typography.', helpful: 31 },
  { name: 'Grace Liu', color: '#2f8a5b', rating: 4, date: '2026-08-18', title: 'Slow start, wonderful finish', text: 'The first fifty pages took patience, but the payoff is enormous. The final chapter is one of the best I have read in years.', helpful: 19 }
];

/* ---------- Persian (فارسی) catalog content ---------- */
const DATA_FA = {
  categories: { fiction: 'داستان', 'self-development': 'توسعه فردی', business: 'کسب‌وکار', psychology: 'روان‌شناسی', history: 'تاریخ', science: 'علم', children: 'کودک', literature: 'ادبیات', technology: 'فناوری' },
  authors: {
    'elena-marsh':   { name: 'النا مارش', genre: 'ادبیات داستانی', followers: '۱۸۲ هزار', bio: 'رمان‌نویس برنده جایزه که داستان‌های روشن و نقشه‌وارش درباره حافظه، ساحل‌ها و خانواده‌هایی است که در آن‌ها سرگردان‌اند.' },
    'james-calder':  { name: 'جیمز کالدر', genre: 'توسعه فردی', followers: '۴۱۰ هزار', bio: 'مربی رفتار و ورزشکار سابق که راهنماهای کاربردی و پژوهش‌محور درباره عادت، تمرکز و زندگی آگاهانه می‌نویسد.' },
    'priya-raman':   { name: 'پریا رامان', genre: 'کسب‌وکار و استراتژی', followers: '۹۶ هزار', bio: 'بنیان‌گذار دو استارتاپ و سرمایه‌گذار که آشوب استارتاپ را به اصولی آرام و تکرارپذیر تبدیل می‌کند.' },
    'samuel-okafor': { name: 'دکتر ساموئل اوکافور', genre: 'روان‌شناسی', followers: '۱۵۰ هزار', bio: 'روان‌شناس بالینی و مدرس دانشگاه که علوم اعصاب مدرن را گرم، خواندنی و واقعاً کاربردی می‌کند.' },
    'marcus-hale':   { name: 'مارکوس هیل', genre: 'تاریخ', followers: '۷۴ هزار', bio: 'مورخ تجارت و امپراتوری‌ها که روایت‌های گسترده‌اش مثل بهترین رمان‌های ماجرایی خوانده می‌شوند.' },
    'lena-ortiz':    { name: 'دکتر لنا اورتیز', genre: 'علم', followers: '۱۲۱ هزار', bio: 'اخترفیزیک‌دان و مروج علم که کیهان را به اندازه یک میز آشپزخانه قابل فهم می‌کند.' },
    'clara-bell':    { name: 'کلارا بل', genre: 'کتاب کودک', followers: '۵۸ هزار', bio: 'نویسنده و تصویرگر قصه‌های محبوب شب درباره موجودات کوچک، شجاع، کنجکاو و کمی شیطون.' },
    'isabel-moreau': { name: 'ایزابل مورو', genre: 'ادبیات', followers: '۶۷ هزار', bio: 'شاعر و رمان‌نویسی که آثار نامه‌نگارانه‌اش درباره فاصله، موسیقی و نامه‌هایی است که هرگز فرستاده نمی‌شوند.' },
    'arjun-mehta':   { name: 'آرجون مهتا', genre: 'فناوری', followers: '۸۸ هزار', bio: 'مهندس ارشد نرم‌افزار که کتاب‌های روشن و انسانی درباره مهارت برنامه‌نویسی و هوش ماشینی می‌نویسد.' },
    'noah-whitfield':{ name: 'نوا ویتفیلد', genre: 'معمایی و داستان', followers: '۱۳۲ هزار', bio: 'روزنامه‌نگار سابق و نویسنده رمان‌های معمایی پرحال‌وهوا که در گوشه‌وکنار دنیا می‌گذرند.' },
    'maya-chen':     { name: 'مایا چن', genre: 'مدیریت مالی شخصی', followers: '۲۰۳ هزار', bio: 'آموزگار مالی که به خوانندگان کمک می‌کند رابطه‌ای آرام و ارزش‌محور با پول بسازند.' }
  },
  books: {
    1:  { title: 'نقشه‌نگار خاموش', kicker: 'رمان', pub: 'نشر بندرگاه', blurb: 'نقشه‌نگاری گوشه‌گیر، اطلس ناتمام مادربزرگش را به ارث می‌برد و ردّ ساحل‌های دست‌کشیده آن را در سه کشور دنبال می‌کند؛ تا به رازی خانوادگی می‌رسد که قرار نبود هیچ‌وقت روی نقشه بیاید.' },
    2:  { title: 'عادت‌های اتمی', kicker: 'عادت‌های کوچک، زندگی بزرگ', pub: 'نشر ستاره شمالی', blurb: 'نظامی کاربردی و علمی برای طراحی آیین‌های روزانه‌ای که روی هم انباشته می‌شوند. تغییرهای کوچک، نتیجه‌های چشمگیر؛ همراه با کاربرگ‌هایی که واقعاً از آن‌ها استفاده می‌کنید.' },
    3:  { title: 'بنیان‌گذار چابک', kicker: 'آرام بسازید', pub: 'نشر نصف‌النهار', blurb: 'چطور با سرمایه کمتر، جلسه‌های کمتر و وضوح بیشتر شرکتی ماندگار بسازیم. همان دستورالعملی که پریا آرزو داشت روز اول داشته باشد.' },
    4:  { title: 'ذهن در حرکت', kicker: 'علم تازه اندیشیدن', pub: 'نشر ستاره شمالی', blurb: 'سفری روشنگر به این‌که فکرها چطور شکل می‌گیرند، حرکت می‌کنند و تغییر می‌کنند؛ و این برای یادگیری، عشق و بهبودی ما چه معنایی دارد.' },
    5:  { title: 'امپراتوری‌های نمک', kicker: 'تاریخ جهان', pub: 'نشر بندرگاه', blurb: 'بلوری ساده که شهرها ساخت، جنگ‌ها به راه انداخت و نقشه‌ها را از نو کشید. تاریخ گسترده و زنده جهان، از دریچه نمک.' },
    6:  { title: 'کیهان پنهان', kicker: 'ماده تاریک و ما', pub: 'نشر روشنا', blurb: 'هشتاد و پنج درصد جهان دیده نمی‌شود. دکتر لنا اورتیز با طنز و شگفتی توضیح می‌دهد از کجا می‌دانیم آن‌جاست و چرا اهمیت دارد.' },
    7:  { title: 'پیپ و ماه کاغذی', kicker: 'برای ۳ تا ۷ سال', pub: 'نشر فانوس کوچک', blurb: 'پیپِ موش یک ماه از کاغذ می‌بُرد تا شب تنها نماند. قصه‌ای آرام و درخشان برای خواب، درباره شجاعت و دوستی.' },
    8:  { title: 'نامه‌هایی از لیسبون', kicker: 'رمانی در قالب نامه', pub: 'نشر نصف‌النهار', blurb: 'چهل نامه، یک تابستان و نوازنده ویولن‌سلی که هیچ‌کدام را نفرستاد. رمانی لطیف درباره فاصله میان آدم‌ها.' },
    9:  { title: 'طراحی سامانه‌های هوشمند', kicker: 'ویراست دوم', pub: 'نشر مدار', blurb: 'راهنمایی روشن و عملی برای ساخت محصولات قابل‌اعتماد مبتنی بر هوش مصنوعی؛ از خط لوله داده تا ارزیابی و استقرار مسئولانه.' },
    10: { title: 'باغ نمک', kicker: 'رمان', pub: 'نشر بندرگاه', blurb: 'دو خواهر، یک باغ رو به زوال کنار دریا و تابستانی که همه‌چیز را تعیین می‌کند.' },
    11: { title: 'تمرکز عمیق', kicker: 'توجه یک ابرقدرت است', pub: 'نشر ستاره شمالی', blurb: 'توجه‌تان را در دنیایی که برای دزدیدنش طراحی شده پس بگیرید. هفت آزمایش هفتگی برای کاری آرام‌تر و عمیق‌تر.' },
    12: { title: 'عددهایی که مهم‌اند', kicker: 'شاخص‌ها به زبان آدم', pub: 'نشر نصف‌النهار', blurb: 'چند شاخص انگشت‌شمار که واقعاً سلامت یک کسب‌وکار را پیش‌بینی می‌کنند، بدون اصطلاحات پیچیده.' },
    13: { title: 'مغز مضطرب', kicker: 'شناخت نگرانی', pub: 'نشر ستاره شمالی', blurb: 'چرا نگرانی وجود دارد، از چه چیزی محافظت می‌کند و جعبه‌ابزاری مهربان برای کم کردن صدای آن.' },
    14: { title: 'جاده ابریشم از نو', kicker: 'تجارت، اندیشه و امپراتوری', pub: 'نشر بندرگاه', blurb: 'تاریخی تازه و گسترده از راه‌هایی که جهان باستان را به هم پیوند دادند و اندیشه‌هایی که همراه ابریشم سفر کردند.' },
    15: { title: 'گشتی کوتاه در زمان', kicker: 'فیزیک برای کنجکاوها', pub: 'نشر روشنا', blurb: 'از ساعت آفتابی تا فضازمان؛ گشتی کوتاه و دلنشین در عجیب‌ترین مفهوم فیزیک: خودِ زمان.' },
    16: { title: 'اژدهایی که عاشق کتاب بود', kicker: 'برای ۴ تا ۸ سال', pub: 'نشر فانوس کوچک', blurb: 'اژدهای کوچک، اِمبِر، می‌خواهد کتاب بخواند، نه این‌که غرّش کند. قصه‌ای بامزه و دلگرم‌کننده در ستایش کتابخانه‌ها و شجاعتِ متفاوت بودن.' },
    17: { title: 'سونات زمستان', kicker: 'رمان', pub: 'نشر نصف‌النهار', blurb: 'پیانیستی به زادگاه برف‌گرفته‌اش برمی‌گردد تا آخرین قطعه ناتمام استاد درگذشته‌اش را کامل کند.' },
    18: { title: 'هنر کد تمیز', kicker: 'نرم‌افزار به‌مثابه هنر', pub: 'نشر مدار', blurb: 'اصولی ماندگار برای نوشتن کدی که هم‌تیمی‌ها از خواندنش لذت ببرند؛ با مثال‌هایی به سه زبان برنامه‌نویسی.' },
    19: { title: 'نیمه‌شب در مراکش', kicker: 'رمان معمایی', pub: 'نشر ستاره شمالی', blurb: 'یک دست‌نوشته دزدیده‌شده، یک حراج نقاب‌دار و شهری که هیچ‌وقت کاملاً نمی‌خوابد. پرحال‌وهواترین رمان معمایی سال.' },
    20: { title: 'هنر کافی بودن', kicker: 'با کمتر، بهتر زندگی کنید', pub: 'نشر ستاره شمالی', blurb: 'راهنمایی گرم و کاربردی برای تعریف «کافی» در پول، زمان و جاه‌طلبی؛ و بالاخره لذت بردن از آن.' },
    21: { title: 'باغ شیشه‌ای', kicker: 'رمان معمایی', pub: 'نشر ستاره شمالی', blurb: 'گیاه‌شناسی پیامی پنهان در گلخانه‌ای که مادرش ساخته پیدا می‌کند؛ و ناپدید شدنی که هیچ‌کس گزارشش نکرده بود.' },
    22: { title: 'پول، ذهن و معنا', kicker: 'آرامش مالی', pub: 'نشر نصف‌النهار', blurb: 'بدون اضطراب ثروت بسازید. چارچوب ارزش‌محور مایا چن برای خرج کردن، پس‌انداز و بخشیدن.' },
    23: { title: 'آخرین فانوس دریایی', kicker: 'رمان', pub: 'نشر بندرگاه', blurb: 'نگهبان آخرین فانوس دریایی فعال در ساحل اقیانوس اطلس، نامه‌ای دریافت می‌کند از کشتی‌ای که چهل سال پیش غرق شده است.' },
    24: { title: 'داستان داده‌ها', kicker: 'نمودارهایی که قانع می‌کنند', pub: 'نشر مدار', blurb: 'صفحه‌گسترده‌ها را به داستان‌هایی به‌یادماندنی تبدیل کنید؛ راهنمای عملی مصورسازی داده صادقانه و اثرگذار.' }
  },
  testimonials: [
    { name: 'هانیه لطفی', role: 'دانشجوی ادبیات', text: 'پیشنهادها به طرز عجیبی دقیق‌اند. سه تا از کتاب‌های محبوب امسالم را از بخش «کتاب‌هایی که شاید دوست داشته باشید» پیدا کردم؛ نسخه الکترونیکی هم در چند ثانیه رسید.' },
    { name: 'داوود کریمی', role: 'مدیر محصول', text: 'سریع‌ترین فرایند پرداختی که در یک کتاب‌فروشی دیده‌ام. دو ضربه و تمام. کتاب‌های جلد سخت هم همیشه با بسته‌بندی عالی می‌رسند.' },
    { name: 'آمنه نوروزی', role: 'مادر دو فرزند و گرداننده حلقه کتاب‌خوانی', text: 'کتاب‌های ماهانه حلقه کتاب‌خوانی‌مان را از این‌جا سفارش می‌دهم. بخش کودک فوق‌العاده انتخاب شده و راهنماهای مطالعه بحث را خیلی راحت می‌کنند.' }
  ],
  posts: [
    { title: 'چرا «نقشه‌نگار خاموش» رمان این فصل است', cat: 'نقد کتاب', excerpt: 'النا مارش با بلندپروازانه‌ترین و لطیف‌ترین کتابش برگشته است. دلیل این‌که خوانندگان نمی‌توانند زمینش بگذارند.' },
    { title: 'چطور سالی ۵۰ کتاب بخوانیم، بدون عجله', cat: 'راهنمای مطالعه', excerpt: 'تندخوانی را فراموش کنید. پنج روش آرام که بیشتر خواندن را بی‌زحمت می‌کند؛ آزموده‌شده توسط تیم ما.' },
    { title: 'گفت‌وگو با پریا رامان درباره آرام ساختن', cat: 'گفت‌وگو با نویسنده', excerpt: 'نویسنده «بنیان‌گذار چابک» از فرسودگی، کسالت و این‌که چرا بهترین شرکت‌ها از درون کمی کسل‌کننده به نظر می‌رسند می‌گوید.' }
  ],
  reviews: [
    { name: 'الهام قربانی', title: 'نتوانستم زمینش بگذارم', text: 'نثری زیبا و ریتمی بی‌نقص. در یک آخر هفته تمامش کردم و بلافاصله دوباره شروع کردم تا جزئیاتی را که از دستم رفته بود پیدا کنم.' },
    { name: 'مهدی علوی', title: 'بلافاصله محبوبم شد', text: 'از آن کتاب‌هایی که دلت می‌خواهد به دست دوستت بدهی. نسخه جلد سخت هم فوق‌العاده است؛ کاغذ سنگین و حروف‌چینی دلنشین.' },
    { name: 'گلاره لطیفی', title: 'شروعی آرام، پایانی درخشان', text: 'پنجاه صفحه اول صبر می‌خواست، اما نتیجه‌اش فوق‌العاده است. فصل آخر یکی از بهترین‌هایی است که در این سال‌ها خوانده‌ام.' }
  ]
};
if (typeof LANG !== 'undefined' && LANG === 'fa') {
  CATEGORIES.forEach(c => { c.name = DATA_FA.categories[c.slug] || c.name; });
  Object.entries(DATA_FA.authors).forEach(([k, v]) => Object.assign(AUTHORS[k], v));
  BOOKS.forEach(b => Object.assign(b, DATA_FA.books[b.id]));
  TESTIMONIALS.forEach((x, i) => Object.assign(x, DATA_FA.testimonials[i]));
  POSTS.forEach((x, i) => Object.assign(x, DATA_FA.posts[i]));
  REVIEWS.forEach((x, i) => Object.assign(x, DATA_FA.reviews[i]));
}
