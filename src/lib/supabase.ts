import { createClient } from "@supabase/supabase-js";

/** supabase-js očekává project root URL — bez /rest/v1 (to si doplní sám). */
function normalizeSupabaseUrl(raw: string | undefined): string {
  const url = (raw ?? "").trim();
  if (!url) {
    throw new Error("Chybí NEXT_PUBLIC_SUPABASE_URL");
  }
  return url.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
}

const supabaseUrl = normalizeSupabaseUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL
);
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseKey) {
  throw new Error("Chybí NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
