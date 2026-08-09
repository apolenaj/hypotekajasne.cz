/**
 * Phase 2 MVP — owner weekly update workflow (NO admin UI yet).
 * Updates happen in Supabase → Table Editor.
 *
 * Do NOT automate this in Phase 2 Step 1.
 */

export const MORTGAGE_RATE_WEEKLY_UPDATE_WORKFLOW = [
  "1. Externally verify the orientational / reference market rate (bank sheets, aggregator, etc.).",
  "2. In Supabase → Table Editor → public.mortgage_rates, find the current ACTIVE row matching country/purpose/fixation/LTV band/rate_kind.",
  "3. Soft-close history: set is_active = false and valid_to = NOW() (do not delete; do not edit rate in place).",
  "4. Insert a NEW row with the same identity keys, new rate, is_active = true, valid_from = NOW(), checked_at = actual verification timestamp.",
  "5. Verify exactly ONE active row exists for that identity (partial unique index enforces this).",
  "6. Optionally hit GET /api/rates/mortgage?... and confirm freshness + rate.",
] as const;

export const MORTGAGE_RATE_ADMIN_RULES = [
  "Never invent unverified production rates.",
  "Never use rate_kind guaranteed/offer.",
  "Never overwrite historical rows — supersede only.",
  "Investment slots may stay empty until verified.",
] as const;
