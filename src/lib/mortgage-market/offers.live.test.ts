/**
 * Optional READ-ONLY production smoke for getMortgageOffersFromSupabase.
 * Skips when SUPABASE_SERVICE_ROLE_KEY / URL are not configured.
 * Never writes.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import { getMortgageOffersFromSupabase } from "@/lib/mortgage-market/offers.server";

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

const hasLive =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());

describe("live production mortgage-market offers (READ-ONLY)", () => {
  it("skips when service role env is absent", { skip: hasLive }, () => {
    assert.ok(true);
  });

  it(
    "A–J production selection cases",
    { skip: !hasLive },
    async () => {
      const airPurchase = await getMortgageOffersFromSupabase({
        countryCode: "CZ",
        purpose: "purchase",
        fixationMonths: 36,
        lenderSlug: "air-bank",
      });
      assert.ok(airPurchase);
      assert.deepEqual(
        airPurchase!.offers.map((o) => o.nominalInterestRate).sort(),
        [4.79, 4.89]
      );

      const airRefi = await getMortgageOffersFromSupabase({
        purpose: "refinance",
        fixationMonths: 36,
        lenderSlug: "air-bank",
      });
      assert.deepEqual(
        airRefi!.offers.map((o) => o.nominalInterestRate).sort(),
        [4.69, 4.79]
      );

      const uc75 = await getMortgageOffersFromSupabase({
        lenderSlug: "unicredit",
        fixationMonths: 36,
        ltv: 75,
      });
      assert.deepEqual(
        uc75!.offers.map((o) => o.nominalInterestRate),
        [5.19]
      );

      const uc85 = await getMortgageOffersFromSupabase({
        lenderSlug: "unicredit",
        fixationMonths: 36,
        ltv: 85,
      });
      assert.deepEqual(
        uc85!.offers.map((o) => o.nominalInterestRate),
        [5.69]
      );

      const kb75 = await getMortgageOffersFromSupabase({
        lenderSlug: "komercni-banka",
        fixationMonths: 36,
        ltv: 75,
      });
      assert.deepEqual(
        kb75!.offers.map((o) => o.nominalInterestRate),
        [5.39]
      );

      const kb85 = await getMortgageOffersFromSupabase({
        lenderSlug: "komercni-banka",
        fixationMonths: 36,
        ltv: 85,
      });
      assert.deepEqual(
        kb85!.offers.map((o) => o.nominalInterestRate),
        [5.79]
      );
      assert.ok(!kb85!.offers.some((o) => o.nominalInterestRate === 5.14));

      const moneta = await getMortgageOffersFromSupabase({
        lenderSlug: "moneta",
        fixationMonths: 36,
        ltv: 75,
        includeLtvUnspecified: true,
      });
      assert.equal(moneta!.offers.length, 0);
      assert.ok(
        moneta!.unspecifiedLtvOffers.every(
          (o) => o.ltvScope === "unspecified" && !o.claimsPersonalizedLtvMatch
        )
      );

      const cs = await getMortgageOffersFromSupabase({
        lenderSlug: "ceska-sporitelna",
        fixationMonths: 36,
        ltv: 75,
        includeLtvUnspecified: true,
      });
      assert.equal(cs!.offers.length, 0);
      assert.ok(
        cs!.unspecifiedLtvOffers.some((o) => o.nominalInterestRate === 5.09)
      );
      assert.ok(
        !cs!.unspecifiedLtvOffers.some((o) => o.nominalInterestRate === 4.94)
      );

      const csob = await getMortgageOffersFromSupabase({
        lenderSlug: "csob",
        productSlug: "retail-mortgage",
        fixationMonths: 36,
      });
      assert.equal(csob!.offers.length, 0);
      assert.equal(csob!.usedModelFallback, false);

      const rb = await getMortgageOffersFromSupabase({
        lenderSlug: "raiffeisenbank",
        productSlug: "retail-klasik",
        fixationMonths: 36,
      });
      assert.equal(rb!.offers.length, 0);
      assert.ok(!rb!.offers.some((o) => o.nominalInterestRate === 4.59));
    }
  );
});
