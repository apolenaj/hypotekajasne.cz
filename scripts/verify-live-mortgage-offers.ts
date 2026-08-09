/**
 * READ-ONLY production smoke for Phase 2 Step 2.4.
 * Prints cases A–J. Never inserts/updates/deletes.
 *
 * Usage: npm run verify:live-mortgage-offers
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { getMortgageOffersFromSupabase } from "../src/lib/mortgage-market/offers.server";
import { getCz20260809Catalog } from "../src/lib/mortgage-market/catalog-from-manifest";
import { getMortgageOffers } from "../src/lib/mortgage-market/offers";

function loadEnvLocal() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] == null || process.env[key] === "") {
        process.env[key] = value;
      }
    }
  }
}

loadEnvLocal();

function summarize(
  label: string,
  offers: Array<{
    nominalInterestRate: number;
    pricingScenarioKey: string;
    ltvScope: string;
    claimsPersonalizedLtvMatch: boolean;
    financingPurpose?: string | null;
  }>,
  extra?: string
) {
  const rates = offers
    .map(
      (o) =>
        `${o.nominalInterestRate}% [${o.pricingScenarioKey}] ltvScope=${o.ltvScope} personalized=${o.claimsPersonalizedLtvMatch}${
          o.financingPurpose ? ` purpose=${o.financingPurpose}` : ""
        }`
    )
    .join("; ");
  console.log(`${label}: ${rates || "(no matching verified offers)"}${extra ? ` | ${extra}` : ""}`);
}

async function main() {
  const hasLive =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());

  if (!hasLive) {
    console.log(
      "WARN: no Supabase service-role env — reporting production-mirror catalog results (IMPORT_READY manifest)."
    );
    const catalog = getCz20260809Catalog();
    const nowMs = Date.parse("2026-08-09T12:00:00.000Z");
    const q = <T extends Record<string, unknown>>(partial: T) =>
      getMortgageOffers(catalog, { ...partial, nowMs });

    summarize(
      "Air purchase 36m",
      q({ purpose: "purchase", fixationMonths: 36, lenderSlug: "air-bank" }).offers
    );
    summarize(
      "Air refinance 36m",
      q({ purpose: "refinance", fixationMonths: 36, lenderSlug: "air-bank" }).offers
    );
    summarize(
      "UniCredit 36m LTV75",
      q({ lenderSlug: "unicredit", fixationMonths: 36, ltv: 75 }).offers
    );
    summarize(
      "UniCredit 36m LTV85",
      q({ lenderSlug: "unicredit", fixationMonths: 36, ltv: 85 }).offers
    );
    summarize(
      "KB 36m LTV75",
      q({ lenderSlug: "komercni-banka", fixationMonths: 36, ltv: 75 }).offers
    );
    summarize(
      "KB 36m LTV85",
      q({ lenderSlug: "komercni-banka", fixationMonths: 36, ltv: 85 }).offers
    );
    const moneta = q({
      lenderSlug: "moneta",
      fixationMonths: 36,
      ltv: 75,
      includeLtvUnspecified: true,
    });
    summarize("MONETA 36m LTV75 (personalized)", moneta.offers);
    summarize(
      "MONETA 36m LTV75 (unspecified bucket)",
      moneta.unspecifiedLtvOffers
    );
    const cs = q({
      lenderSlug: "ceska-sporitelna",
      fixationMonths: 36,
      ltv: 75,
      includeLtvUnspecified: true,
    });
    summarize("CS 36m LTV75 (personalized)", cs.offers);
    summarize("CS 36m LTV75 (unspecified bucket)", cs.unspecifiedLtvOffers);
    const csob = q({
      lenderSlug: "csob",
      productSlug: "retail-mortgage",
      fixationMonths: 36,
    });
    summarize(
      "CSOB retail",
      csob.offers,
      csob.lenderAvailability.map((a) => a.message).join(" / ")
    );
    const rb = q({
      lenderSlug: "raiffeisenbank",
      productSlug: "retail-klasik",
      fixationMonths: 36,
    });
    summarize(
      "RB Klasik",
      rb.offers,
      rb.lenderAvailability.map((a) => a.message).join(" / ")
    );
    return;
  }

  console.log("LIVE READ-ONLY production Supabase catalog:");

  const airPurchase = await getMortgageOffersFromSupabase({
    purpose: "purchase",
    fixationMonths: 36,
    lenderSlug: "air-bank",
  });
  summarize("Air purchase 36m", airPurchase!.offers);

  const airRefi = await getMortgageOffersFromSupabase({
    purpose: "refinance",
    fixationMonths: 36,
    lenderSlug: "air-bank",
  });
  summarize("Air refinance 36m", airRefi!.offers);

  const uc75 = await getMortgageOffersFromSupabase({
    lenderSlug: "unicredit",
    fixationMonths: 36,
    ltv: 75,
  });
  summarize("UniCredit 36m LTV75", uc75!.offers);

  const uc85 = await getMortgageOffersFromSupabase({
    lenderSlug: "unicredit",
    fixationMonths: 36,
    ltv: 85,
  });
  summarize("UniCredit 36m LTV85", uc85!.offers);

  const kb75 = await getMortgageOffersFromSupabase({
    lenderSlug: "komercni-banka",
    fixationMonths: 36,
    ltv: 75,
  });
  summarize("KB 36m LTV75", kb75!.offers);

  const kb85 = await getMortgageOffersFromSupabase({
    lenderSlug: "komercni-banka",
    fixationMonths: 36,
    ltv: 85,
  });
  summarize("KB 36m LTV85", kb85!.offers);

  const moneta = await getMortgageOffersFromSupabase({
    lenderSlug: "moneta",
    fixationMonths: 36,
    ltv: 75,
    includeLtvUnspecified: true,
  });
  summarize("MONETA 36m LTV75 (personalized)", moneta!.offers);
  summarize(
    "MONETA 36m LTV75 (unspecified bucket)",
    moneta!.unspecifiedLtvOffers
  );

  const cs = await getMortgageOffersFromSupabase({
    lenderSlug: "ceska-sporitelna",
    fixationMonths: 36,
    ltv: 75,
    includeLtvUnspecified: true,
  });
  summarize("CS 36m LTV75 (personalized)", cs!.offers);
  summarize("CS 36m LTV75 (unspecified bucket)", cs!.unspecifiedLtvOffers);

  const csob = await getMortgageOffersFromSupabase({
    lenderSlug: "csob",
    productSlug: "retail-mortgage",
    fixationMonths: 36,
  });
  summarize(
    "CSOB retail",
    csob!.offers,
    csob!.lenderAvailability.map((a) => a.message).join(" / ")
  );

  const rb = await getMortgageOffersFromSupabase({
    lenderSlug: "raiffeisenbank",
    productSlug: "retail-klasik",
    fixationMonths: 36,
  });
  summarize(
    "RB Klasik",
    rb!.offers,
    rb!.lenderAvailability.map((a) => a.message).join(" / ")
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
