import { createClient } from "@supabase/supabase-js";
/** Anonymous client for client-facing pages: can only call the narrow public_* RPCs. */
export const supabasePublic = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
