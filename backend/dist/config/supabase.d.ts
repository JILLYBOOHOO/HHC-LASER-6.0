import { SupabaseClient } from '@supabase/supabase-js';
export declare function isSupabaseAuthEnabled(): boolean;
/** Storage only needs project URL + service role (uploads happen server-side). */
export declare function isSupabaseStorageEnabled(): boolean;
/** Service-role client — server only. Never expose this key to the browser. */
export declare function getSupabaseAdmin(): SupabaseClient;
/** Anon client — used for password sign-in / refresh session flows on the server. */
export declare function getSupabaseAnon(): SupabaseClient;
//# sourceMappingURL=supabase.d.ts.map