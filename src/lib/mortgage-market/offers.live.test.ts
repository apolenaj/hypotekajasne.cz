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
      assert.equal(airPurchase!.offers.length, 2);
      assert.ok(
        airPurchase!.offers.every(
          (o) =>
            typeof o.nominalInterestRate === "number" &&
            o.nominalInterestRate > 3 &&
            o.nominalInterestRate < 8
        )
      );

      const airRefi = await getMortgageOffersFromSupabase({
        purpose: "refinance",
        fixationMonths: 36,
        lenderSlug: "air-bank",
      });
      assert.equal(airRefi!.offers.length, 2);
      assert.ok(
        airRefi!.offers.every((o) => o.financingPurpose === "refinance")
      );

      const uc75 = await getMortgageOffersFromSupabase({
        lenderSlug: "unicredit",
        fixationMonths: 36,
        ltv: 75,
      });
      assert.equal(uc75!.offers.length, 1);
      assert.ok(typeof uc75!.offers[0]!.nominalInterestRate === "number");

      const uc85 = await getMortgageOffersFromSupabase({
        lenderSlug: "unicredit",
        fixationMonths: 36,
        ltv: 85,
      });
      assert.equal(uc85!.offers.length, 1);
      assert.ok(
        uc85!.offers[0]!.nominalInterestRate !== uc75!.offers[0]!.nominalInterestRate
      );

      const kb75 = await getMortgageOffersFromSupabase({
        lenderSlug: "komercni-banka",
        fixationMonths: 36,
        ltv: 75,
      });
      assert.equal(kb75!.offers.length, 1);

      const kb85 = await getMortgageOffersFromSupabase({
        lenderSlug: "komercni-banka",
        fixationMonths: 36,
        ltv: 85,
      });
      assert.equal(kb85!.offers.length, 1);
      assert.ok(
        kb85!.offers[0]!.nominalInterestRate !== kb75!.offers[0]!.nominalInterestRate
      );
      assert.ok(
        !kb85!.offers.some(
          (o) =>
            o.nominalInterestRate === 5.39 || o.nominalInterestRate === 5.79
        )
      );

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
        cs!.unspecifiedLtvOffers.some(
          (o) => typeof o.nominalInterestRate === "number"
        )
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
