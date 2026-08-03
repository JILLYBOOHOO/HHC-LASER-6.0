-- Phase 2: link public.users to Supabase Auth (auth.users.id is UUID)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS auth_uid UUID UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_auth_uid ON users (auth_uid);

-- password_hash is optional when the user authenticates via Supabase Auth
ALTER TABLE users
  ALTER COLUMN password_hash DROP NOT NULL;
