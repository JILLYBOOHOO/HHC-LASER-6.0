const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

// Create all required tables
db.exec(`
  CREATE TABLE IF NOT EXISTS service_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    short_description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price_jmd REAL NOT NULL,
    price_usd REAL DEFAULT NULL,
    deposit_required INTEGER NOT NULL DEFAULT 0,
    deposit_amount_jmd REAL DEFAULT NULL,
    requires_consultation INTEGER NOT NULL DEFAULT 0,
    preparation_notes TEXT DEFAULT NULL,
    aftercare_notes TEXT DEFAULT NULL,
    thumbnail_url TEXT DEFAULT NULL,
    is_featured INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES service_categories(id)
  );
`);

// Clear existing services data for a fresh seed
db.exec('DELETE FROM services; DELETE FROM service_categories;');
db.exec("DELETE FROM sqlite_sequence WHERE name='services' OR name='service_categories'");

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Laser Hair Removal', slug: 'laser-hair-removal', description: 'Advanced laser technology to reduce unwanted hair for all skin types.', sort_order: 1 },
  { name: 'Skin Rejuvenation', slug: 'skin-rejuvenation', description: 'Treatments for hyperpigmentation, dark spots, acne, and skin aging.', sort_order: 2 },
  { name: 'Body Contouring & Sculpting', slug: 'body-contouring', description: 'Non-surgical body sculpting, fat reduction and cellulite treatment.', sort_order: 3 },
  { name: 'Relaxation & Recovery', slug: 'relaxation-recovery', description: 'Luxury massages and recovery treatments.', sort_order: 4 },
  { name: 'Hair Restoration', slug: 'hair-restoration', description: 'Advanced treatments for hair thinning, alopecia and bald spots.', sort_order: 5 },
  { name: 'Wellness & Medical Aesthetics', slug: 'wellness', description: 'IV therapy, weight loss consultations, and wellness treatments.', sort_order: 6 },
  { name: 'Cosmetic Injectables', slug: 'cosmetic-injectables', description: 'Botox and dermal filler consultations.', sort_order: 7 },
];

const insertCat = db.prepare('INSERT INTO service_categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)');
for (const c of CATEGORIES) {
  insertCat.run(c.name, c.slug, c.description, c.sort_order);
}

// Helper to get category ID
const getCatId = (slug) => db.prepare('SELECT id FROM service_categories WHERE slug = ?').get(slug)?.id;

// ─── SERVICES ─────────────────────────────────────────────────────────────────
// Image reference: Unsplash curated for each treatment type
const LASER_IMG = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80';
const SKIN_IMG  = 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80';
const BODY_IMG  = 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80';
const HAIR_IMG  = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80';
const WELL_IMG  = 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80';
const INJECTIMG = 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=800&q=80';
const RELAX_IMG = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80';

const SERVICES = [
  // ─── LASER HAIR REMOVAL ───────────────────────────────────────────────────
  { cat: 'laser-hair-removal', name: 'Abdomen', duration: 10, price: 14000, feat: 1,
    desc: 'Laser hair removal using concentrated light technology to reduce unwanted hair, ingrown razor bumps and dark spots on the abdomen area.' },
  { cat: 'laser-hair-removal', name: 'Full Abdomen', duration: 15, price: 18000, feat: 0,
    desc: 'Full abdomen laser hair removal for comprehensive hair reduction.' },
  { cat: 'laser-hair-removal', name: 'Full Abdomen and Chest', duration: 25, price: 22000, feat: 0,
    desc: 'Combined laser treatment covering the full abdomen and chest area.' },
  { cat: 'laser-hair-removal', name: 'Full Back', duration: 35, price: 24000, feat: 0,
    desc: 'Complete full back laser hair removal treatment.' },
  { cat: 'laser-hair-removal', name: 'Lower Back', duration: 15, price: 14000, feat: 0,
    desc: 'Targeted laser hair removal for the lower back area.' },
  { cat: 'laser-hair-removal', name: 'Upper Back', duration: 15, price: 18000, feat: 0,
    desc: 'Targeted laser hair removal for the upper back area.' },
  { cat: 'laser-hair-removal', name: 'Full Chest', duration: 15, price: 16000, feat: 0,
    desc: 'Full chest laser hair removal treatment.' },
  { cat: 'laser-hair-removal', name: 'Mid-Chest', duration: 10, price: 12000, feat: 0,
    desc: 'Mid-chest laser hair removal for a smooth, hair-free appearance.' },
  { cat: 'laser-hair-removal', name: 'Arms and Shoulders', duration: 25, price: 20000, feat: 0,
    desc: 'Laser hair removal covering the full arms and shoulders.' },
  { cat: 'laser-hair-removal', name: 'Armpits', duration: 10, price: 12000, feat: 0,
    desc: 'Quick and effective laser hair removal for the underarm area.' },
  { cat: 'laser-hair-removal', name: 'Fingers and Toes', duration: 10, price: 12000, feat: 0,
    desc: 'Precise laser hair removal for fingers and toes.' },
  { cat: 'laser-hair-removal', name: 'Bikini Line', duration: 10, price: 12000, feat: 0,
    desc: 'Laser hair removal along the bikini line for a clean, defined look.' },
  { cat: 'laser-hair-removal', name: 'Brazilian Only', duration: 10, price: 12000, feat: 0,
    desc: 'Full Brazilian laser hair removal treatment.' },
  { cat: 'laser-hair-removal', name: 'Full Pubic + Armpits', duration: 10, price: 14000, feat: 0,
    desc: 'Combined treatment covering the full pubic area and armpits.' },
  { cat: 'laser-hair-removal', name: 'Pubic, Armpit and Brazilian Special', duration: 10, price: 16000, feat: 0,
    desc: 'Special combo package covering pubic area, armpits, and full Brazilian.' },
  { cat: 'laser-hair-removal', name: 'Chin Only', duration: 10, price: 10000, feat: 0,
    desc: 'Precise laser hair removal targeting the chin area.' },
  { cat: 'laser-hair-removal', name: 'Chin and Neck', duration: 10, price: 12000, feat: 0,
    desc: 'Laser hair removal covering the chin and neck area.' },
  { cat: 'laser-hair-removal', name: 'Jawline and Neck', duration: 10, price: 12000, feat: 0,
    desc: 'Precise laser hair removal along the jawline and neck.' },
  { cat: 'laser-hair-removal', name: 'Inner Thigh', duration: 10, price: 14000, feat: 0,
    desc: 'Laser hair removal targeting the inner thigh area.' },
  { cat: 'laser-hair-removal', name: 'Posterior Thighs', duration: 15, price: 18000, feat: 0,
    desc: 'Laser hair removal for the back of the thighs.' },
  { cat: 'laser-hair-removal', name: 'Posterior Thighs and Bottom', duration: 25, price: 20000, feat: 0,
    desc: 'Comprehensive laser treatment covering posterior thighs and buttocks.' },
  { cat: 'laser-hair-removal', name: 'Full Thighs', duration: 25, price: 22000, feat: 0,
    desc: 'Complete laser hair removal for the full thigh area.' },
  { cat: 'laser-hair-removal', name: 'Lower Legs', duration: 25, price: 18000, feat: 0,
    desc: 'Laser hair removal for the lower legs (knee to ankle).' },
  { cat: 'laser-hair-removal', name: 'Full Legs', duration: 55, price: 26000, feat: 0,
    desc: 'Complete full leg laser hair removal from hip to ankle.' },
  { cat: 'laser-hair-removal', name: 'Full Bottom', duration: 10, price: 16000, feat: 0,
    desc: 'Full buttocks laser hair removal treatment.' },

  // ─── SKIN REJUVENATION ────────────────────────────────────────────────────
  { cat: 'skin-rejuvenation', name: 'Skin Resurfacing', duration: 25, price: 14000, feat: 1,
    desc: 'Advanced laser skin resurfacing treatment designed to improve hyperpigmentation, dark spots, enlarged pores, acne scars, wrinkles, and fine lines. Treatment areas include Face, Back, Inner Thighs, Bottom, Legs, Arms, Chest. Consultation required.' },
  { cat: 'skin-rejuvenation', name: 'Acne / Dark Spots', duration: 25, price: 12000, feat: 1,
    desc: 'Treatment for hormonal acne, blackheads, whiteheads, pustules, milia, and dark pigmentation. Skin resurfacing may be included as part of the treatment.' },
  { cat: 'skin-rejuvenation', name: 'Chemical Peel', duration: 50, price: 28000, feat: 1,
    desc: 'Medical-grade chemical peel that improves skin texture, reduces fine lines, wrinkles, acne scars, dark spots and controls oil production for a brighter complexion.' },
  { cat: 'skin-rejuvenation', name: 'Microdermabrasion', duration: 30, price: 12000, feat: 0,
    desc: 'Gentle exfoliation treatment that removes dead skin cells, reduces fine lines and improves skin texture and tone.' },
  { cat: 'skin-rejuvenation', name: 'Photorejuvenation', duration: 25, price: 12000, feat: 0,
    desc: 'Intense pulsed light (IPL) treatment to address sun damage, redness, and uneven pigmentation for a more youthful appearance.' },
  { cat: 'skin-rejuvenation', name: 'Enlarged Pores', duration: 30, price: 14000, feat: 0,
    desc: 'Targeted treatment to minimize the appearance of enlarged pores for smoother, more refined skin texture.' },
  { cat: 'skin-rejuvenation', name: 'Dark Circles', duration: 15, price: 5000, feat: 0,
    desc: 'Specialized treatment to reduce dark circles and puffiness around the eyes for a more refreshed appearance.' },
  { cat: 'skin-rejuvenation', name: 'Stretch Marks', duration: 45, price: 16000, feat: 0,
    desc: 'Including Collagen Stimulating Laser, Microneedling, Alchemy RF, Radiofrequency and Growth Factors to stimulate collagen production and visibly improve stretch marks.' },
  { cat: 'skin-rejuvenation', name: 'Scars', duration: 20, price: 15000, feat: 0,
    desc: 'Reducing the appearance of scars caused by acne, injuries, burns, surgery and more using a combination of laser and advanced treatments. A consultation is necessary to determine treatment frequency.' },
  { cat: 'skin-rejuvenation', name: 'Keloid Consultation', duration: 15, price: 5000, feat: 0,
    desc: 'Consultation to assess and plan a personalized treatment for keloid scars. A follow-up treatment plan will be provided.' },
  { cat: 'skin-rejuvenation', name: 'Skin Tightening', duration: 10, price: 5000, feat: 0,
    desc: 'HIFU (High-Intensity Focused Ultrasound) for the reduction of sagging and stressed skin. Consultation necessary to determine the treatment area.' },
  { cat: 'skin-rejuvenation', name: 'Skin Tags', duration: 10, price: 5000, feat: 0,
    desc: 'A consultation is necessary to determine treatment frequency and suitability for skin tag removal.' },
  { cat: 'skin-rejuvenation', name: 'Tattoo Removal', duration: 10, price: 5000, feat: 0,
    desc: 'A consultation is necessary to determine treatment frequency for laser tattoo removal based on ink color, depth, and skin type.' },
  { cat: 'skin-rejuvenation', name: 'Pseudofolliculitis', duration: 10, price: 12000, feat: 0,
    desc: 'Inflammation of hair follicles caused by ingrown hairs and razor bumps. Treatment reduces inflammation, redness, and prevents future occurrences.' },
  { cat: 'skin-rejuvenation', name: 'Cellulite Treatment', duration: 10, price: 5000, feat: 0,
    desc: 'Let us reduce the appearance of cellulite through a combination of treatments, diet and exercise recommendations for smoother-looking skin.' },

  // ─── BODY CONTOURING & SCULPTING ─────────────────────────────────────────
  { cat: 'body-contouring', name: 'Wood Therapy', duration: 45, price: 9000, feat: 1,
    desc: 'Improves circulation, reduces cellulite appearance, supports lymphatic drainage, and helps reduce fat deposits using specialized wooden instruments.' },
  { cat: 'body-contouring', name: 'Heat Shock Body / Skin Detox', duration: 25, price: 9000, feat: 0,
    desc: 'Supports metabolism balance, detox goals, weight-loss support and skin treatments through controlled thermal therapy.' },
  { cat: 'body-contouring', name: 'Fat Reduction', duration: 45, price: 40000, feat: 0,
    desc: 'Advanced non-surgical fat reduction treatment to contour and sculpt specific body areas.' },
  { cat: 'body-contouring', name: 'Non-Surgical BBL Consultation', duration: 15, price: 5000, feat: 0,
    desc: 'Consultation for our non-surgical Brazilian Butt Lift treatment plan using body contouring technology.' },
  { cat: 'body-contouring', name: 'Lymphatic Drainage', duration: 55, price: 9000, feat: 0,
    desc: 'Manual lymphatic drainage massage to support the immune system, reduce swelling, and improve overall wellness.' },

  // ─── RELAXATION & RECOVERY ────────────────────────────────────────────────
  { cat: 'relaxation-recovery', name: 'Head & Body Massage / Head Spa', duration: 45, price: 19000, feat: 1,
    desc: 'Luxury relaxation combining a soothing head spa treatment with a full body massage for ultimate relaxation and recovery.' },

  // ─── HAIR RESTORATION ─────────────────────────────────────────────────────
  { cat: 'hair-restoration', name: 'Hair Restoration', duration: 45, price: 29000, feat: 1,
    desc: 'Comprehensive treatment for Alopecia, hair thinning, and bald spots using advanced laser and platelet-rich therapy techniques.' },
  { cat: 'hair-restoration', name: 'Microneedling PRP', duration: 40, price: 29000, feat: 0,
    desc: 'Platelet-Rich Plasma combined with microneedling to stimulate natural hair growth and strengthen hair follicles.' },
  { cat: 'hair-restoration', name: 'PRF Plasma Treatment', duration: 40, price: 29000, feat: 0,
    desc: 'Platelet-Rich Fibrin treatment to rejuvenate hair follicles and promote thicker, healthier hair growth.' },

  // ─── WELLNESS & MEDICAL AESTHETICS ───────────────────────────────────────
  { cat: 'wellness', name: 'IV Therapy', duration: 20, price: 23000, feat: 1,
    desc: 'Intravenous therapy including Vitamin B, Vitamin C, NAD, and Glutathione for enhanced wellness, energy, and skin brightening.' },
  { cat: 'wellness', name: 'Vital Shots', duration: 15, price: 9000, feat: 0,
    desc: 'Targeted vitamin and mineral injections to boost energy, immunity, and overall health.' },
  { cat: 'wellness', name: 'Semaglutide Consultation', duration: 15, price: 5000, feat: 0,
    desc: 'Semiject (anti-obesity medication) consultation. A consultation is necessary to determine treatment plan and suitability.' },
  { cat: 'wellness', name: 'Weight Loss Consultation', duration: 10, price: 5000, feat: 1,
    desc: 'Using consultation or assessment to determine the best approach to recommend and tailor a personalized weight management plan.' },

  // ─── COSMETIC INJECTABLES ─────────────────────────────────────────────────
  { cat: 'cosmetic-injectables', name: 'Botox Consultation', duration: 20, price: 10000, feat: 1,
    desc: 'Consultation for wrinkle reduction using Botox, as well as treatment for excessive sweating (hyperhidrosis) and chronic migraine management.' },
  { cat: 'cosmetic-injectables', name: 'Dermal Fillers Consultation', duration: 20, price: 10000, feat: 1,
    desc: 'Consultation for adding volume and improving facial and body contours using dermal fillers for a natural, youthful appearance.' },
];

// Map category slug to image
const CAT_IMAGES = {
  'laser-hair-removal': LASER_IMG,
  'skin-rejuvenation': SKIN_IMG,
  'body-contouring': BODY_IMG,
  'relaxation-recovery': RELAX_IMG,
  'hair-restoration': HAIR_IMG,
  'wellness': WELL_IMG,
  'cosmetic-injectables': INJECTIMG,
};

const insertSvc = db.prepare(`
  INSERT INTO services (category_id, name, slug, description, short_description, duration_minutes, price_jmd, thumbnail_url, is_featured, is_active, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
`);

let order = 0;
for (const s of SERVICES) {
  const catId = getCatId(s.cat);
  if (!catId) { console.log('No category for', s.cat); continue; }
  const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const img = CAT_IMAGES[s.cat] || LASER_IMG;
  const shortDesc = s.desc.substring(0, 250);
  insertSvc.run(catId, s.name, slug, s.desc, shortDesc, s.duration, s.price, img, s.feat ? 1 : 0, ++order);
}

const count = db.prepare('SELECT COUNT(*) as c FROM services').get();
const cats  = db.prepare('SELECT COUNT(*) as c FROM service_categories').get();
console.log(`\n✅ Seeded ${cats.c} categories and ${count.c} services successfully!`);
console.log('\nCategories:');
db.prepare('SELECT name, slug FROM service_categories ORDER BY sort_order').all().forEach(c => console.log(' -', c.name));
console.log('\nSample services:');
db.prepare('SELECT s.name, sc.name as category, s.duration_minutes, s.price_jmd FROM services s JOIN service_categories sc ON sc.id = s.category_id LIMIT 10').all().forEach(s => {
  console.log(` - ${s.name} | ${s.category} | ${s.duration_minutes} min | JMD ${s.price_jmd.toLocaleString()}`);
});
