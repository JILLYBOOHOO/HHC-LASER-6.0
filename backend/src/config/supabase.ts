import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

export function isSupabaseAuthEnabled(): boolean {
  return Boolean(
    env.SUPABASE_URL &&
    env.SUPABASE_ANON_KEY &&
    env.SUPABASE_SERVICE_ROLE_KEY &&
    env.SUPABASE_JWT_SECRET
  );
}

/** Storage only needs project URL + service role (uploads happen server-side). */
export function isSupabaseStorageEnabled(): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

let adminClient: SupabaseClient | null = null;
let anonClient: SupabaseClient | null = null;

/** Service-role client — server only. Never expose this key to the browser. */
export function getSupabaseAdmin(): SupabaseClient {
  if (!isSupabaseAuthEnabled()) {
    throw new Error('Supabase Auth is not configured. Set SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET.');
  }
  if (!adminClient) {
    adminClient = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClient;
}

/** Anon client — used for password sign-in / refresh session flows on the server. */
export function getSupabaseAnon(): SupabaseClient {
  if (!isSupabaseAuthEnabled()) {
    throw new Error('Supabase Auth is not configured.');
  }
  if (!anonClient) {
    anonClient = createClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return anonClient;
}
