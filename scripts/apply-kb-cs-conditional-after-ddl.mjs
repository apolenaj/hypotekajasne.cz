/**
 * After applying supabase/mortgage_market_nullable_fixation.sql in Supabase SQL Editor,
 * run this to insert the KB product-page conditional 5.19 scenario + link the example.
 *
 * Usage: node scripts/apply-kb-cs-conditional-after-ddl.mjs
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#") || !t.includes("=")) continue;
      const i = t.indexOf("=");
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

function stableUuid(key) {
  const hash = createHash("sha1")
    .update(`hypoteka-jasne:cz-2026-08-09:${key}`)
    .digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

const rateId = (id) => stableUuid(`rate:${id}`);
const evidenceId = (id) => stableUuid(`evidence:${id}`);
const productId = (lender, slug) => stableUuid(`product:${lender}:${slug}`);
const conditionId = (rateRecordId, index) =>
  stableUuid(`condition:${rateRecordId}:${index}`);
const exampleId = (id) => stableUuid(`example:${id}`);

loadEnv();
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
  .trim()
  .replace(/\/rest\/v1\/?$/, "")
  .replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CHECKED = "2026-08-09T00:00:00.000Z";
const EV_KB_PRODUCT = evidenceId("ev-kb-product-page-advertised-from");
const conditionalId = rateId("kb-product-page-advertised-from-5-19");

const conditional = {
  id: conditionalId,
  product_id: productId("komercni-banka", "standard-mortgage"),
  pricing_scenario_key: "product_page_advertised_from_conditional",
  pricing_scenario_label: "Zvýhodněná sazba od",
  financing_purpose: "purchase",
  fixation_months: null,
  ltv_min: null,
  ltv_max: null,
  ltv_min_exclusive: false,
  ltv_max_exclusive: false,
  nominal_interest_rate: 5.19,
  rate_type: "advertised_from",
  valid_from: CHECKED,
  checked_at: CHECKED,
  is_active: true,
  source_evidence_id: EV_KB_PRODUCT,
  notes:
    "Product-page conditional od 5,19%. Fixation and LTV not stated on page — must not personalized-match LTV or replace Oznámení matrix. [manifest:kb-product-page-advertised-from-5-19]",
};

const { error } = await sb
  .from("mortgage_rate_variants")
  .upsert(conditional, { onConflict: "id" });
if (error) {
  console.error("FAILED:", error.message);
  console.error("Apply supabase/mortgage_market_nullable_fixation.sql first.");
  process.exit(1);
}

const conditions = [
  {
    id: conditionId("kb-product-page-advertised-from-5-19", 0),
    rate_variant_id: conditionalId,
    condition_type: "income_domiciliation_required",
    condition_role: "qualifying",
    rate_effect_bp: null,
    description: "Směřování příjmů na účet vedený u KB",
    is_required: true,
    is_optional: false,
    source_evidence_id: EV_KB_PRODUCT,
    is_active: true,
    valid_from: CHECKED,
  },
  {
    id: conditionId("kb-product-page-advertised-from-5-19", 1),
    rate_variant_id: conditionalId,
    condition_type: "life_insurance_required",
    condition_role: "qualifying",
    insurance_kind: "life",
    requirement_mode: "mandatory_for_rate",
    rate_effect_bp: null,
    description: "Rizikové životní pojištění u Komerční pojišťovny, a. s.",
    is_required: true,
    is_optional: false,
    source_evidence_id: EV_KB_PRODUCT,
    is_active: true,
    valid_from: CHECKED,
  },
  {
    id: conditionId("kb-product-page-advertised-from-5-19", 2),
    rate_variant_id: conditionalId,
    condition_type: "property_insurance_required",
    condition_role: "qualifying",
    insurance_kind: "property",
    requirement_mode: "mandatory_for_rate",
    rate_effect_bp: null,
    description: "Pojištění zastavené nemovitosti u Komerční pojišťovny, a. s.",
    is_required: true,
    is_optional: false,
    source_evidence_id: EV_KB_PRODUCT,
    is_active: true,
    valid_from: CHECKED,
  },
  {
    id: conditionId("kb-product-page-advertised-from-5-19", 3),
    rate_variant_id: conditionalId,
    condition_type: "PENB_class_requirement",
    condition_role: "qualifying",
    value_text: "A|B",
    rate_effect_bp: null,
    description: "PENB energetická třída A nebo B k zastavené nemovitosti",
    is_required: true,
    is_optional: false,
    source_evidence_id: EV_KB_PRODUCT,
    is_active: true,
    valid_from: CHECKED,
  },
];

const { error: cErr } = await sb
  .from("mortgage_rate_conditions")
  .upsert(conditions, { onConflict: "id" });
if (cErr) throw new Error(cErr.message);

const { error: exErr } = await sb
  .from("mortgage_representative_examples")
  .update({ rate_variant_id: conditionalId })
  .eq("id", exampleId("kb-product-page-representative-example"));
if (exErr) throw new Error(exErr.message);

console.log("KB conditional 5.19 inserted and example linked.");
