/**
 * Server-only boundary for privileged mortgage-rate reads.
 * Import from API routes / server components only — never from Client Components.
 */

import { createClient } from "@supabase/supabase-js";
import {
  createSupabaseMortgageRateReader,
  getMortgageRate,
  type GetMortgageRateInput,
  type MortgageRateResult,
} from "@/lib/rates/mortgageRateService";

function createServiceRoleClient() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  url = url.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Resolve rate via service-role Supabase (or MODEL fallback if unavailable). */
export async function getMortgageRateFromSupabase(
  input: GetMortgageRateInput = {}
): Promise<MortgageRateResult> {
  const client = createServiceRoleClient();
  const reader = client ? createSupabaseMortgageRateReader(client) : null;
  return getMortgageRate(reader, input);
}
