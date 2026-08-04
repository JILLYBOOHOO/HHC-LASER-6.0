import { getSupabaseAdmin } from '../src/config/supabase';

async function createUserIfNotExists(email: string, password: string, metadata: Record<string, any> = {}) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    console.error('Error listing Supabase users:', error);
    return;
  }
  const existing = data?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    console.log(`User ${email} already exists (ID: ${existing.id}).`);
    return;
  }
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (createError || !created?.user) {
    console.error(`Failed to create user ${email}:`, createError);
  } else {
    console.log(`Created Supabase user ${email} (ID: ${created.user.id}).`);
  }
}

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase credentials are not set in environment.');
    process.exit(1);
  }

  await createUserIfNotExists(
    process.env.DEVELOPER_EMAIL || '',
    process.env.DEVELOPER_PASSWORD || '',
    { role: 'developer', first_name: 'Dev', last_name: 'User' }
  );
  await createUserIfNotExists(
    process.env.ADMIN_EMAIL || '',
    process.env.ADMIN_PASSWORD || '',
    { role: 'admin', first_name: 'Admin', last_name: 'User' }
  );
  await createUserIfNotExists(
    process.env.STAFF_EMAIL || '',
    process.env.STAFF_PASSWORD || '',
    { role: 'staff', first_name: 'Staff', last_name: 'User' }
  );
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
