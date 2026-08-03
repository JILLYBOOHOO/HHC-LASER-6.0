import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hhc_laser',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function seed() {
  console.log('🌱 Starting Demo Data Seed...');

  const connection = await pool.getConnection();
  
  try {
    // 1. Create Default Admin (Owner)
    const ownerPassword = await bcrypt.hash('Godluvme.5', 10);
    const [ownerResult]: any = await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, 1, 1) ON CONFLICT DO NOTHING`,
      ['infohhcLaser@gmail.com', ownerPassword, 'HHC', 'Owner', '876-555-0001']
    );
    
    // Check if inserted
    const [owner]: any = await connection.query('SELECT id FROM users WHERE email = ?', ['infohhcLaser@gmail.com']);
    if (owner.length > 0) {
      await connection.query('INSERT INTO user_roles (user_id, role) VALUES (?, ?) ON CONFLICT DO NOTHING', [owner[0].id, 'admin']);
    }

    // 1b. Create Developer Admin
    const devPassword = await bcrypt.hash('Godluvme.7', 10);
    const [devResult]: any = await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, 1, 1) ON CONFLICT DO NOTHING`,
      ['kake.101buchanan@gmail.com', devPassword, 'Developer', 'Buchanan', '876-555-0002']
    );
    
    // Check if inserted
    const [dev]: any = await connection.query('SELECT id FROM users WHERE email = ?', ['kake.101buchanan@gmail.com']);
    if (dev.length > 0) {
      await connection.query('INSERT INTO user_roles (user_id, role) VALUES (?, ?) ON CONFLICT DO NOTHING', [dev[0].id, 'admin']);
    }

    // 2. Create Default Specialist
    const empPassword = await bcrypt.hash('Staff@123!', 10);
    const [empResult]: any = await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, 1, 1) ON CONFLICT DO NOTHING`,
      ['staff@hhclaser.com', empPassword, 'Sarah', 'Jenkins', '876-555-1111']
    );

    const [emp]: any = await connection.query('SELECT id FROM users WHERE email = ?', ['staff@hhclaser.com']);
    let empId = 1;
    if (emp.length > 0) {
      empId = emp[0].id;
      await connection.query('INSERT INTO user_roles (user_id, role) VALUES (?, ?) ON CONFLICT DO NOTHING', [empId, 'specialist']);
      
      // Also insert into employees table
      await connection.query(
        `INSERT INTO employees (user_id, title, bio)
         VALUES (?, ?, ?) ON CONFLICT DO NOTHING`,
        [empId, 'Lead Esthetician', 'Dr. Sarah Jenkins is our lead specialist with 10 years experience.']
      );
    }

    // 3. Create Default Customer
    const custPassword = await bcrypt.hash('Customer@123!', 10);
    const [custResult]: any = await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, 1, 1) ON CONFLICT DO NOTHING`,
      ['customer@hhclaser.com', custPassword, 'Olivia', 'Rhoden', '876-555-2222']
    );

    const [cust]: any = await connection.query('SELECT id FROM users WHERE email = ?', ['customer@hhclaser.com']);
    let custId = 1;
    if (cust.length > 0) {
      custId = cust[0].id;
      await connection.query('INSERT INTO user_roles (user_id, role) VALUES (?, ?) ON CONFLICT DO NOTHING', [custId, 'customer']);
    }

    // 4. Create Appointments
    // Get service IDs
    const [services]: any = await connection.query('SELECT id, price_jmd FROM services LIMIT 2');
    if (services.length >= 2) {
      // Future appointment
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      
      await connection.query(
        `INSERT INTO appointments (customer_id, employee_id, location_id, scheduled_date, start_time, end_time, status, subtotal_jmd)
         VALUES (?, ?, 1, ?, '10:00:00', '11:00:00', 'confirmed', ?) ON CONFLICT DO NOTHING`,
        [custId, empId, futureDate.toISOString().split('T')[0], services[0].price_jmd]
      );

      // Past appointment
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      
      await connection.query(
        `INSERT INTO appointments (customer_id, employee_id, location_id, scheduled_date, start_time, end_time, status, subtotal_jmd)
         VALUES (?, ?, 1, ?, '14:00:00', '15:00:00', 'completed', ?) ON CONFLICT DO NOTHING`,
        [custId, empId, pastDate.toISOString().split('T')[0], services[1].price_jmd]
      );
    }

    // 5. Create Products
    const [catResult]: any = await connection.query(
      `INSERT INTO product_categories (name, slug, description) VALUES (?, ?, ?) ON CONFLICT DO NOTHING`,
      ['Skin Supplement', 'skin-supplement', 'Nourishing skincare supplements for glowing skin.']
    );
    const [cat]: any = await connection.query('SELECT id FROM product_categories WHERE slug = ?', ['skin-supplement']);
    
    if (cat.length > 0) {
      const catId = cat[0].id;
      
      await connection.query(
        `INSERT INTO products (category_id, name, slug, description, price_jmd, stock_quantity, image_url, is_featured) VALUES 
         (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING,
         (?, ?, ?, ?, ?, ?, ?, ?),
         (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          catId, 'Lemon Acne Cleanser', 'lemon-acne-cleanser', 'Deep cleansing formula designed to help control oil, remove impurities, and support clearer-looking skin.', 1500.00, 200, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800', 1,
          catId, 'Bikini & Body Cream', 'bikini-body-cream', 'A nourishing treatment designed to improve skin texture, smooth rough areas, and support a more even appearance.', 4500.00, 200, 'https://images.unsplash.com/photo-1608248593859-9d7a229c153b?q=80&w=800', 1,
          catId, 'Coco Bean & Coconut Cleanser & Moisturizer', 'coco-bean-cleanser', 'A luxurious coconut-infused cleanser and moisturizer designed to hydrate, refresh, and leave skin feeling soft and balanced.', 4500.00, 200, 'https://images.unsplash.com/photo-1611078563825-783df98f86f3?q=80&w=800', 1
        ]
      );
    }

    console.log('✅ Demo Data Seeded Successfully!');
    console.log('\n--- Test Accounts ---');
    console.log('Owner/Admin: infohhcLaser@gmail.com / Godluvme.5');
    console.log('Developer: kake.101buchanan@gmail.com / Godluvme.7');
    console.log('Staff: staff@hhclaser.com / Staff@123!');
    console.log('Customer: customer@hhclaser.com / Customer@123!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seed();
