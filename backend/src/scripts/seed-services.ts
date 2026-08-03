import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hhc_laser',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const CATEGORIES = [
  { name: 'Laser Hair Removal', slug: 'laser-hair-removal', description: 'Advanced laser technology to reduce unwanted hair.' },
  { name: 'Skin Rejuvenation', slug: 'skin-rejuvenation', description: 'Treatments for hyperpigmentation, dark spots, and aging.' },
  { name: 'Body Contouring & Sculpting', slug: 'body-contouring', description: 'Non-surgical body sculpting and fat reduction.' },
  { name: 'Relaxation & Recovery', slug: 'relaxation-recovery', description: 'Luxury relaxation and massages.' },
  { name: 'Hair Restoration', slug: 'hair-restoration', description: 'Treatments for hair thinning and alopecia.' },
  { name: 'Wellness & Medical Aesthetics', slug: 'wellness', description: 'IV therapy, weight loss, and wellness.' },
  { name: 'Cosmetic Injectables', slug: 'cosmetic-injectables', description: 'Botox and dermal fillers consultations.' }
];

const SERVICES = [
  // --- Laser Hair Removal ---
  { cat: 'laser-hair-removal', name: 'Abdomen', duration: 10, price: 14000, desc: 'Laser hair removal using concentrated light technology to reduce unwanted hair, ingrown razor bumps and dark spots.', feat: 1 },
  { cat: 'laser-hair-removal', name: 'Full Abdomen', duration: 15, price: 18000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Full Abdomen and Chest', duration: 25, price: 22000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Full Back', duration: 35, price: 24000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Lower Back', duration: 15, price: 14000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Upper Back', duration: 15, price: 18000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Full Chest', duration: 15, price: 16000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Mid-Chest', duration: 10, price: 12000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Arms and Shoulders', duration: 25, price: 20000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Armpits', duration: 10, price: 12000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Fingers and Toes', duration: 10, price: 12000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Bikini Line', duration: 10, price: 12000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Brazilian Only', duration: 10, price: 12000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Full Pubic + Armpits', duration: 10, price: 14000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Pubic, Armpit and Brazilian Special', duration: 10, price: 16000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Chin Only', duration: 10, price: 10000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Chin and Neck', duration: 10, price: 12000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Jawline and Neck', duration: 10, price: 12000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Inner Thigh', duration: 10, price: 14000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Posterior Thighs', duration: 15, price: 18000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Posterior Thighs and Bottom', duration: 25, price: 20000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Full Thighs', duration: 25, price: 22000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Lower Legs', duration: 25, price: 18000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Full Legs', duration: 55, price: 26000, desc: '', feat: 0 },
  { cat: 'laser-hair-removal', name: 'Full Bottom', duration: 10, price: 16000, desc: '', feat: 0 },

  // --- Skin Rejuvenation & Laser Treatments ---
  { cat: 'skin-rejuvenation', name: 'Skin Resurfacing', duration: 25, price: 14000, desc: 'Advanced laser skin resurfacing treatment designed to improve hyperpigmentation, dark spots, enlarged pores, acne scars, wrinkles, and fine lines. Treatment areas: Face, Back, Inner Thighs, Bottom, Legs, Arms, Chest. Consultation required.', feat: 1 },
  { cat: 'skin-rejuvenation', name: 'Acne / Dark Spots', duration: 25, price: 12000, desc: 'Treatment for hormonal acne, blackheads, whiteheads, pustules, milia, and dark pigmentation. Skin resurfacing may be included.', feat: 1 },
  { cat: 'skin-rejuvenation', name: 'Chemical Peel', duration: 50, price: 28000, desc: 'Improves skin texture, reduces fine lines, wrinkles, acne scars, dark spots and controls oil production.', feat: 1 },
  { cat: 'skin-rejuvenation', name: 'Microdermabrasion', duration: 30, price: 12000, desc: '', feat: 0 },
  { cat: 'skin-rejuvenation', name: 'Photorejuvenation', duration: 25, price: 12000, desc: '', feat: 0 },
  { cat: 'skin-rejuvenation', name: 'Enlarged Pores', duration: 30, price: 14000, desc: '', feat: 0 },
  { cat: 'skin-rejuvenation', name: 'Dark Circles', duration: 15, price: 5000, desc: '', feat: 0 },
  { cat: 'skin-rejuvenation', name: 'Stretch Marks', duration: 45, price: 16000, desc: 'Uses laser technology, radiofrequency and growth factors to stimulate collagen production and improve stretch marks.', feat: 0 },
  { cat: 'skin-rejuvenation', name: 'Scars', duration: 20, price: 15000, desc: '', feat: 0 },
  { cat: 'skin-rejuvenation', name: 'Keloid Consultation', duration: 15, price: 5000, desc: '', feat: 0 },
  { cat: 'skin-rejuvenation', name: 'Skin Tightening', duration: 10, price: 5000, desc: '', feat: 0 },
  { cat: 'skin-rejuvenation', name: 'Skin Tags', duration: 10, price: 5000, desc: '', feat: 0 },
  { cat: 'skin-rejuvenation', name: 'Tattoo Removal', duration: 10, price: 5000, desc: '', feat: 0 },

  // --- Body Contouring & Sculpting ---
  { cat: 'body-contouring', name: 'Wood Therapy', duration: 45, price: 9000, desc: 'Improves circulation, reduces cellulite appearance, supports lymphatic drainage and helps reduce fat deposits.', feat: 1 },
  { cat: 'body-contouring', name: 'Heat Shock Body / Skin Detox', duration: 25, price: 9000, desc: 'Supports metabolism balance, detox goals, weight-loss support and skin treatments.', feat: 0 },
  { cat: 'body-contouring', name: 'Fat Reduction', duration: 45, price: 40000, desc: '', feat: 0 },
  { cat: 'body-contouring', name: 'Non-Surgical BBL Consultation', duration: 15, price: 5000, desc: '', feat: 0 },
  { cat: 'body-contouring', name: 'Cellulite Treatment', duration: 10, price: 5000, desc: '', feat: 0 },
  { cat: 'body-contouring', name: 'Lymphatic Drainage', duration: 55, price: 9000, desc: '', feat: 0 },

  // --- Relaxation & Recovery ---
  { cat: 'relaxation-recovery', name: 'Head & Body Massage / Head Spa', duration: 45, price: 19000, desc: 'Luxury relaxation head spa combined with body massage.', feat: 1 },

  // --- Hair Restoration ---
  { cat: 'hair-restoration', name: 'Hair Restoration', duration: 45, price: 29000, desc: 'Treatment for Alopecia, Hair thinning, and Bald spots.', feat: 1 },
  { cat: 'hair-restoration', name: 'Microneedling PRP', duration: 40, price: 29000, desc: '', feat: 0 },
  { cat: 'hair-restoration', name: 'PRF Plasma Treatment', duration: 40, price: 29000, desc: '', feat: 0 },

  // --- Wellness & Medical Aesthetics ---
  { cat: 'wellness', name: 'IV Therapy', duration: 20, price: 23000, desc: 'Includes Vitamin B, Vitamin C, NAD, Glutathione.', feat: 1 },
  { cat: 'wellness', name: 'Vital Shots', duration: 15, price: 9000, desc: '', feat: 0 },
  { cat: 'wellness', name: 'Semaglutide Consultation', duration: 15, price: 5000, desc: '', feat: 0 },
  { cat: 'wellness', name: 'Weight Loss Consultation', duration: 10, price: 5000, desc: '', feat: 1 },

  // --- Cosmetic Injectables ---
  { cat: 'cosmetic-injectables', name: 'Botox Consultation', duration: 20, price: 10000, desc: 'Consultation for wrinkle reduction, excessive sweating and chronic migraine treatment.', feat: 1 },
  { cat: 'cosmetic-injectables', name: 'Dermal Fillers Consultation', duration: 20, price: 10000, desc: 'Consultation for adding volume and improving facial/body appearance.', feat: 1 }
];

async function seedServices() {
  console.log('🌱 Starting Services Data Seed...');

  const connection = await pool.getConnection();
  
  try {
    // 1. Insert Categories
    for (const cat of CATEGORIES) {
      await connection.query(
        `INSERT INTO service_categories (name, slug, description) VALUES (?, ?, ?) ON CONFLICT DO NOTHING`,
        [cat.name, cat.slug, cat.description]
      );
    }
    console.log(`✅ Seeded ${CATEGORIES.length} Categories.`);

    // 2. Insert Services
    let count = 0;
    for (const s of SERVICES) {
      const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const [catRows]: any = await connection.query('SELECT id FROM service_categories WHERE slug = ?', [s.cat]);
      
      if (catRows.length > 0) {
        const catId = catRows[0].id;
        // Use a generic placeholder image based on category
        const img = `https://source.unsplash.com/800x600/?spa,${s.cat.replace('-', ',')}`;

        await connection.query(
          `INSERT INTO services 
           (category_id, name, slug, description, short_description, duration_minutes, price_jmd, thumbnail_url, is_featured, is_active) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1) ON CONFLICT DO NOTHING`,
          [catId, s.name, slug, s.desc, s.desc.substring(0, 150), s.duration, s.price, img, s.feat]
        );
        count++;
      }
    }
    console.log(`✅ Seeded ${count} Services.`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seedServices();
