import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const isSupabaseServerConfigured = Boolean(supabaseUrl && serviceRoleKey);

/**
 * Server-side Supabase Client
 * Digunakan secara aman dari Server Action atau Route Handler Next.js
 */
export const supabaseServer = isSupabaseServerConfigured
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
