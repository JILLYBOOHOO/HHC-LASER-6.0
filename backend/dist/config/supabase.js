"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupabaseAuthEnabled = isSupabaseAuthEnabled;
exports.isSupabaseStorageEnabled = isSupabaseStorageEnabled;
exports.getSupabaseAdmin = getSupabaseAdmin;
exports.getSupabaseAnon = getSupabaseAnon;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
function isSupabaseAuthEnabled() {
    return Boolean(env_1.env.SUPABASE_URL &&
        env_1.env.SUPABASE_ANON_KEY &&
        env_1.env.SUPABASE_SERVICE_ROLE_KEY &&
        env_1.env.SUPABASE_JWT_SECRET);
}
/** Storage only needs project URL + service role (uploads happen server-side). */
function isSupabaseStorageEnabled() {
    return Boolean(env_1.env.SUPABASE_URL && env_1.env.SUPABASE_SERVICE_ROLE_KEY);
}
let adminClient = null;
let anonClient = null;
/** Service-role client — server only. Never expose this key to the browser. */
function getSupabaseAdmin() {
    if (!isSupabaseAuthEnabled()) {
        throw new Error('Supabase Auth is not configured. Set SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET.');
    }
    if (!adminClient) {
        adminClient = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return adminClient;
}
/** Anon client — used for password sign-in / refresh session flows on the server. */
function getSupabaseAnon() {
    if (!isSupabaseAuthEnabled()) {
        throw new Error('Supabase Auth is not configured.');
    }
    if (!anonClient) {
        anonClient = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return anonClient;
}
//# sourceMappingURL=supabase.js.map