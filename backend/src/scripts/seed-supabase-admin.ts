/**
 * Creates (or upgrades) an admin user in Supabase Auth + public.users.
 * Usage: npx ts-node src/scripts/seed-supabase-admin.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

const email = process.env.SEED_ADMIN_EMAIL || 'admin@hhclaser.com';
const password = process.env.SEED_ADMIN_PASSWORD || 'AdminLaser876!';
const firstName = 'HHC';
const lastName = 'Admin';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!databaseUrl || !supabaseUrl || !serviceKey) {
    throw new Error('DATABASE_URL, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY are required.');
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  // Create or find Auth user
  let authUid: string | undefined;
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  });

  if (createError) {
    const listed = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const match = listed.data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!match) throw createError;
    authUid = match.id;
    await supabase.auth.admin.updateUserById(authUid, { password, email_confirm: true });
    console.log('Updated existing Supabase Auth user password.');
  } else {
    authUid = created.user!.id;
    console.log('Created Supabase Auth user.');
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  let userId: number;

  if (existing.rows.length) {
    userId = existing.rows[0].id;
    await pool.query(
      `UPDATE users
       SET auth_uid = $1, first_name = $2, last_name = $3, is_active = TRUE, email_verified = TRUE
       WHERE id = $4`,
      [authUid, firstName, lastName, userId]
    );
  } else {
    const inserted = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, auth_uid, authentication_method, is_active, email_verified)
       VALUES ($1, NULL, $2, $3, $4, $5, 'Email Password', TRUE, TRUE)
       RETURNING id`,
      [email.toLowerCase(), firstName, lastName, '876-555-0001', authUid]
    );
    userId = inserted.rows[0].id;
  }

  // Grant admin + owner roles
  for (const role of ['admin', 'owner'] as const) {
    await pool.query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, role]
    );
  }

  console.log('✅ Admin ready');
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Roles:    admin, owner`);

  await pool.end();
}

main().catch(async (err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
