import { executeQuery, executeUpdate } from '../src/config/database';

async function seedProducts() {
  console.log('Seeding products...');

  try {
    // 1. Create product_categories table if it doesn't exist
    await executeUpdate(`
      CREATE TABLE IF NOT EXISTS product_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        image_url VARCHAR(500),
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create products table if it doesn't exist
    await executeUpdate(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        category_id INT REFERENCES product_categories(id),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        price_jmd DECIMAL(10, 2) NOT NULL,
        stock_quantity INT DEFAULT 0,
        image_url VARCHAR(500),
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Insert default category
    let categoryResult = await executeQuery('SELECT id FROM product_categories WHERE slug = ?', ['skincare']);
    let categoryId = categoryResult.length > 0 ? categoryResult[0].id : null;

    if (!categoryId) {
      const insertCat = await executeUpdate(
        'INSERT INTO product_categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)',
        ['Skincare', 'skincare', 'Professional skincare products', 1]
      );
      categoryId = insertCat.insertId;
    }

    // 4. Insert live products
    const liveProducts = [
      {
        name: 'Lemon Wash',
        slug: 'lemon-wash',
        description: 'Lemon Acne Cleanser',
        price_jmd: 1500,
        stock_quantity: 500,
        image_url: 'https://hhclaserco.sfo3.digitaloceanspaces.com/products/8f3cb1bf-03af-42ee-9c68-10a435a9cbb2.webp'
      },
      {
        name: 'Bikini & Body Cream',
        slug: 'bikini-body-cream',
        description: 'A luxurious cream specifically formulated for sensitive areas.',
        price_jmd: 4500,
        stock_quantity: 200,
        image_url: 'https://hhclaserco.sfo3.digitaloceanspaces.com/products/5f4fedb5-d201-4fff-978c-56c54d2d57b3.webp'
      },
      {
        name: 'Coco Bean & Coconut Cleanser & Moisturizer',
        slug: 'coco-bean-coconut-cleanser-moisturizer',
        description: 'SKIN SUPPLEMENT Coco Bean & Coconut Cleanser & Moisturizer for deep hydration.',
        price_jmd: 4500,
        stock_quantity: 200,
        image_url: 'https://hhclaserco.sfo3.digitaloceanspaces.com/products/e59724c7-a244-443e-b6a8-6f297dc95d2d.webp'
      },
      {
        name: 'Toner & Collagen Moisturizer Set',
        slug: 'toner-collagen-moisturizer-set',
        description: 'Best Combination for Clear & Smooth Skin',
        price_jmd: 5000,
        stock_quantity: 200,
        image_url: 'https://hhclaserco.sfo3.digitaloceanspaces.com/products/249cd5fb-a647-49bf-8020-c4a07f3d28a3.webp'
      }
    ];

    for (const p of liveProducts) {
      const existing = await executeQuery('SELECT id FROM products WHERE slug = ?', [p.slug]);
      if (existing.length === 0) {
        await executeUpdate(
          `INSERT INTO products (category_id, name, slug, description, price_jmd, stock_quantity, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [categoryId, p.name, p.slug, p.description, p.price_jmd, p.stock_quantity, p.image_url]
        );
        console.log(`Inserted product: ${p.name}`);
      } else {
        console.log(`Product already exists: ${p.name}`);
      }
    }

    console.log('✅ Products seeding completed!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error seeding products:', err);
    process.exit(1);
  }
}

seedProducts();
