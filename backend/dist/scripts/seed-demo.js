"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = promise_1.default.createPool({
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
        const ownerPassword = await bcryptjs_1.default.hash('Godluvme.5', 10);
        const [ownerResult] = await connection.query(`INSERT IGNORE INTO users (email, password_hash, first_name, last_name, phone, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, 1, 1)`, ['infohhcLaser@gmail.com', ownerPassword, 'HHC', 'Owner', '876-555-0001']);
        // Check if inserted
        const [owner] = await connection.query('SELECT id FROM users WHERE email = ?', ['infohhcLaser@gmail.com']);
        if (owner.length > 0) {
            await connection.query('INSERT IGNORE INTO user_roles (user_id, role) VALUES (?, ?)', [owner[0].id, 'admin']);
        }
        // 1b. Create Developer Admin
        const devPassword = await bcryptjs_1.default.hash('Godluvme.7', 10);
        const [devResult] = await connection.query(`INSERT IGNORE INTO users (email, password_hash, first_name, last_name, phone, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, 1, 1)`, ['kake.101buchanan@gmail.com', devPassword, 'Developer', 'Buchanan', '876-555-0002']);
        // Check if inserted
        const [dev] = await connection.query('SELECT id FROM users WHERE email = ?', ['kake.101buchanan@gmail.com']);
        if (dev.length > 0) {
            await connection.query('INSERT IGNORE INTO user_roles (user_id, role) VALUES (?, ?)', [dev[0].id, 'admin']);
        }
        // 2. Create Default Specialist
        const empPassword = await bcryptjs_1.default.hash('Staff@123!', 10);
        const [empResult] = await connection.query(`INSERT IGNORE INTO users (email, password_hash, first_name, last_name, phone, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, 1, 1)`, ['staff@hhclaser.com', empPassword, 'Sarah', 'Jenkins', '876-555-1111']);
        const [emp] = await connection.query('SELECT id FROM users WHERE email = ?', ['staff@hhclaser.com']);
        let empId = 1;
        if (emp.length > 0) {
            empId = emp[0].id;
            await connection.query('INSERT IGNORE INTO user_roles (user_id, role) VALUES (?, ?)', [empId, 'specialist']);
            // Also insert into employees table
            await connection.query(`INSERT IGNORE INTO employees (user_id, title, bio)
         VALUES (?, ?, ?)`, [empId, 'Lead Esthetician', 'Dr. Sarah Jenkins is our lead specialist with 10 years experience.']);
        }
        // 3. Create Default Customer
        const custPassword = await bcryptjs_1.default.hash('Customer@123!', 10);
        const [custResult] = await connection.query(`INSERT IGNORE INTO users (email, password_hash, first_name, last_name, phone, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, 1, 1)`, ['customer@hhclaser.com', custPassword, 'Olivia', 'Rhoden', '876-555-2222']);
        const [cust] = await connection.query('SELECT id FROM users WHERE email = ?', ['customer@hhclaser.com']);
        let custId = 1;
        if (cust.length > 0) {
            custId = cust[0].id;
            await connection.query('INSERT IGNORE INTO user_roles (user_id, role) VALUES (?, ?)', [custId, 'customer']);
        }
        // 4. Create Appointments
        // Get service IDs
        const [services] = await connection.query('SELECT id, price_jmd FROM services LIMIT 2');
        if (services.length >= 2) {
            // Future appointment
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 2);
            await connection.query(`INSERT IGNORE INTO appointments (customer_id, employee_id, location_id, scheduled_date, start_time, end_time, status, subtotal_jmd)
         VALUES (?, ?, 1, ?, '10:00:00', '11:00:00', 'confirmed', ?)`, [custId, empId, futureDate.toISOString().split('T')[0], services[0].price_jmd]);
            // Past appointment
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 5);
            await connection.query(`INSERT IGNORE INTO appointments (customer_id, employee_id, location_id, scheduled_date, start_time, end_time, status, subtotal_jmd)
         VALUES (?, ?, 1, ?, '14:00:00', '15:00:00', 'completed', ?)`, [custId, empId, pastDate.toISOString().split('T')[0], services[1].price_jmd]);
        }
        // 5. Create Products
        const [catResult] = await connection.query(`INSERT IGNORE INTO product_categories (name, slug, description) VALUES (?, ?, ?)`, ['Skin Supplement', 'skin-supplement', 'Nourishing skincare supplements for glowing skin.']);
        const [cat] = await connection.query('SELECT id FROM product_categories WHERE slug = ?', ['skin-supplement']);
        if (cat.length > 0) {
            const catId = cat[0].id;
            await connection.query(`INSERT IGNORE INTO products (category_id, name, slug, description, price_jmd, stock_quantity, image_url, is_featured) VALUES 
         (?, ?, ?, ?, ?, ?, ?, ?),
         (?, ?, ?, ?, ?, ?, ?, ?),
         (?, ?, ?, ?, ?, ?, ?, ?)`, [
                catId, 'Lemon Acne Cleanser', 'lemon-acne-cleanser', 'Deep cleansing formula designed to help control oil, remove impurities, and support clearer-looking skin.', 1500.00, 200, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800', 1,
                catId, 'Bikini & Body Cream', 'bikini-body-cream', 'A nourishing treatment designed to improve skin texture, smooth rough areas, and support a more even appearance.', 4500.00, 200, 'https://images.unsplash.com/photo-1608248593859-9d7a229c153b?q=80&w=800', 1,
                catId, 'Coco Bean & Coconut Cleanser & Moisturizer', 'coco-bean-cleanser', 'A luxurious coconut-infused cleanser and moisturizer designed to hydrate, refresh, and leave skin feeling soft and balanced.', 4500.00, 200, 'https://images.unsplash.com/photo-1611078563825-783df98f86f3?q=80&w=800', 1
            ]);
        }
        console.log('✅ Demo Data Seeded Successfully!');
        console.log('\n--- Test Accounts ---');
        console.log('Owner/Admin: infohhcLaser@gmail.com / Godluvme.5');
        console.log('Developer: kake.101buchanan@gmail.com / Godluvme.7');
        console.log('Staff: staff@hhclaser.com / Staff@123!');
        console.log('Customer: customer@hhclaser.com / Customer@123!');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
    }
    finally {
        connection.release();
        process.exit(0);
    }
}
seed();
//# sourceMappingURL=seed-demo.js.map