/**
 * FactClaim catalog tests — PROMPT 3.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { getCountryDossier } from "@/lib/country-dossier";
import { getCountryInfoData } from "@/lib/country-info-data";
import {
  FACT_CLAIMS,
  FORBIDDEN_FACT_PHRASES,
  listFactClaims,
  requireFactClaim,
} from "@/lib/sources/fact-claims";
import { CLAIM_JURISDICTIONS } from "@/lib/sources/fact-claims-jurisdictions";
import { formatFactClaimValue } from "@/lib/sources/fact-claims-display";
import {
  factClaimToSourceEvidence,
  formatValidityPeriod,
} from "@/lib/sources/source-evidence";

const ROOT = join(process.cwd(), "src");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(p);
    }
  }
  return out;
}

describe("FactClaim catalog", () => {
  it("acquisition tax claim states abolished in 2020, not 2016 buyer shift", () => {
    const tax = requireFactClaim("cz.tax.acquisition.abolished_2020");
    assert.equal(tax.status, "VERIFIED");
    assert.match(tax.claim, /zrušena v roce 2020/i);
    assert.ok(tax.sourceUrl?.includes("financnisprava"));
    assert.ok(!/2016/.test(tax.claim));
  });

  it("cadastre vklad fee is exact 2000 Kč with verifiedAt", () => {
    const fee = requireFactClaim("cz.cadastre.vklad_fee");
    assert.equal(fee.status, "VERIFIED");
    assert.equal(fee.value, 2000);
    assert.ok(fee.verifiedAt);
    assert.ok(fee.sourceUrl?.includes("cuzk"));
    assert.match(formatFactClaimValue(fee), /2[\s\u00a0]?000\s*Kč/);
  });

  it("VERIFIED claims require http(s) primary sourceUrl", () => {
    for (const c of FACT_CLAIMS) {
      if (c.status !== "VERIFIED") continue;
      assert.ok(
        c.sourceUrl && /^https?:\/\//.test(c.sourceUrl),
        `${c.id} VERIFIED without URL`
      );
      assert.ok(
        c.sourceType !== "model" && c.sourceType !== "market_practice",
        `${c.id} VERIFIED with weak sourceType`
      );
    }
  });
});

describe("CZ surfaces use FactClaim layer", () => {
  it("dossier cost lines use 2020 abolition and 2000 Kč fee", () => {
    const dossier = getCountryDossier("cz");
    const costs = dossier.sections.find((s) => s.id === "transaction_costs");
    assert.ok(costs && costs.kind === "costs");
    if (costs.kind !== "costs") return;
    const blob = costs.lines.map((l) => `${l.label} ${l.range}`).join(" | ");
    assert.match(blob, /zrušena \(2020\)/i);
    assert.match(blob, /2[\s\u00a0]?000/);
    assert.ok(!blob.includes("2016"));
    assert.ok(!blob.includes("stovky až tisíce"));
  });

  it("country info CZ taxes link to FactClaim ids", () => {
    const info = getCountryInfoData("Česká republika");
    assert.ok(info);
    assert.ok(info!.taxes.every((t) => t.factClaimId));
    assert.ok(
      info!.taxes.some((t) => t.factClaimId === "cz.tax.acquisition.abolished_2020")
    );
  });
});

describe("forbidden incorrect fact phrases", () => {
  it("no known wrong phrases in src (except this test file)", () => {
    for (const f of walk(ROOT)) {
      if (f.includes("fact-claims.test")) continue;
      if (f.includes("fact-claims.ts") && f.endsWith("fact-claims.ts")) {
        // allow listing in FORBIDDEN_FACT_PHRASES constant
        continue;
      }
      const text = readFileSync(f, "utf8");
      for (const phrase of FORBIDDEN_FACT_PHRASES) {
        assert.ok(
          !text.includes(phrase),
          `Forbidden phrase "${phrase}" in ${f}`
        );
      }
    }
  });
});

describe("PROMPT 12 — claim-level sourcing all jurisdictions", () => {
  it("covers CZ + SK + HR + IT + ES + UAE + SA + Bali", () => {
    for (const j of CLAIM_JURISDICTIONS) {
      const claims = listFactClaims({ jurisdiction: j });
      assert.ok(
        claims.length >= 1,
        `missing FactClaims for jurisdiction ${j}`
      );
    }
  });

  it("never marks foreign tax rates VERIFIED without https URL", () => {
    for (const c of FACT_CLAIMS) {
      if (c.jurisdiction === "cz") continue;
      if (c.status === "VERIFIED") {
        assert.ok(
          c.sourceUrl && /^https:\/\//.test(c.sourceUrl),
          `${c.id} foreign VERIFIED without https`
        );
      }
    }
  });

  it("foreign editorial tax claims are NEEDS_UPDATE or UNVERIFIED or MODEL", () => {
    const foreignTax = FACT_CLAIMS.filter(
      (c) => c.jurisdiction !== "cz" && c.topic === "tax"
    );
    assert.ok(foreignTax.length >= 8);
    for (const c of foreignTax) {
      assert.ok(
        c.status === "NEEDS_UPDATE" ||
          c.status === "UNVERIFIED" ||
          c.status === "MODEL" ||
          c.status === "ESTIMATE",
        `${c.id} unexpected status ${c.status}`
      );
    }
  });

  it("SourceEvidence maps all required fields", () => {
    const fee = requireFactClaim("cz.cadastre.vklad_fee");
    const ev = factClaimToSourceEvidence(fee);
    assert.equal(ev.statement, fee.claim);
    assert.ok(ev.value);
    assert.equal(ev.jurisdiction, "cz");
    assert.ok(ev.sourceName);
    assert.ok(ev.sourceUrl?.startsWith("https://"));
    assert.ok(ev.verifiedAt);
    assert.equal(ev.status, "VERIFIED");
    assert.match(formatValidityPeriod(ev.validFrom, ev.validTo), /./);
  });

  it("all country-info tax rows link to FactClaim ids", () => {
    const names = [
      "Česká republika",
      "SAE (Dubaj)",
      "Španělsko",
      "Bali (Indonésie)",
      "Chorvatsko",
      "Itálie",
      "Slovensko",
      "Saúdská Arábie",
    ];
    for (const name of names) {
      const info = getCountryInfoData(name);
      assert.ok(info, `missing country info ${name}`);
      assert.ok(
        info!.taxes.every((t) => t.factClaimId),
        `${name} tax without factClaimId`
      );
      for (const t of info!.taxes) {
        assert.ok(requireFactClaim(t.factClaimId!));
      }
    }
  });

  it("SourceEvidenceDrawer component exists", () => {
    const src = readFileSync(
      join(ROOT, "components/trust/SourceEvidenceDrawer.tsx"),
      "utf8"
    );
    assert.ok(src.includes("SourceEvidenceDrawer"));
    assert.ok(src.includes("Tvrzení"));
    assert.ok(src.includes("Jurisdikce"));
    assert.ok(src.includes("Konkrétní URL"));
    assert.ok(src.includes("Datum ověření"));
    assert.ok(src.includes("Platnost"));
    assert.ok(src.includes("aria-modal"));
  });
});
