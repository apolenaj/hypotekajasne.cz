/**
 * Phase 6 Wave 1 — commercial SEO regression guards.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  WAVE1_COMMERCIAL_SLUGS,
  isWave1CommercialSlug,
  type CommercialPageIntent,
} from "@/lib/seo/commercial-wave1";
import {
  SEO_LANDINGS,
  getLanding,
  getLandingPath,
  landingBodyWordCount,
} from "@/lib/seo/landings";
import { findStaticPageSeo } from "@/lib/seo/pages";
import { catalogNoIndexPaths } from "@/lib/seo/indexation";
import { buildSitemapBucket } from "@/lib/seo/sitemap-data";

const INTENT_TO_SLUG: Record<CommercialPageIntent, string> = {
  refinance: "refinancovani",
  osvc: "hypoteka-osvc",
  foreign_income: "hypoteka-ze-zahranicniho-prijmu",
  investment: "investicni-hypoteka",
  american: "americka-hypoteka",
};

describe("Phase 6 Wave 1 — commercial canonicals", () => {
  it("has exactly one INDEX commercial winner per Wave 1 intent", () => {
    const byIntent = new Map<CommercialPageIntent, string[]>();
    for (const l of SEO_LANDINGS) {
      if (!l.commercialIntent) continue;
      const list = byIntent.get(l.commercialIntent) ?? [];
      list.push(l.slug);
      byIntent.set(l.commercialIntent, list);
    }
    for (const intent of Object.keys(INTENT_TO_SLUG) as CommercialPageIntent[]) {
      const slugs = byIntent.get(intent) ?? [];
      assert.deepEqual(
        slugs,
        [INTENT_TO_SLUG[intent]],
        `intent ${intent} must have exactly one landing`
      );
      assert.ok(isWave1CommercialSlug(INTENT_TO_SLUG[intent]));
    }
  });

  it("Wave 1 slugs have unique metadata, one H1, sitemap, commercial CTAs", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    const sitemapPaths = new Set(
      buildSitemapBucket("pages").map((e) => new URL(e.url).pathname)
    );

    for (const slug of WAVE1_COMMERCIAL_SLUGS) {
      const landing = getLanding(slug);
      assert.ok(landing, slug);
      assert.ok(landing!.commercialIntent);
      assert.ok(landing!.primaryCta?.href);
      assert.equal(landing!.showLeadCapture, true);
      assert.ok(landing!.quickAnswer?.bullets.length);
      assert.ok(landing!.h1.length > 5);
      assert.ok(!titles.has(landing!.title));
      titles.add(landing!.title);
      assert.ok(!descriptions.has(landing!.description));
      descriptions.add(landing!.description);
      assert.ok(landingBodyWordCount(landing!) >= 400, `${slug} too thin`);

      const path = getLandingPath(slug);
      const seo = findStaticPageSeo(path);
      assert.ok(seo, path);
      assert.notEqual(seo?.noIndex, true);
      assert.ok(sitemapPaths.has(path), `missing sitemap ${path}`);
      assert.equal(catalogNoIndexPaths().includes(path), false);
    }
  });

  it("keeps foreign purchase hub distinct from foreign income commercial page", () => {
    const buyAbroad = getLanding("hypoteka-v-zahranici");
    const foreignIncome = getLanding("hypoteka-ze-zahranicniho-prijmu");
    assert.ok(buyAbroad);
    assert.ok(foreignIncome);
    assert.equal(buyAbroad!.commercialIntent, undefined);
    assert.equal(foreignIncome!.commercialIntent, "foreign_income");
    assert.notEqual(buyAbroad!.h1, foreignIncome!.h1);
  });

  it("does not misuse purchase sazby URL for American mortgage CTA", () => {
    const american = getLanding("americka-hypoteka");
    assert.ok(american);
    const blob = JSON.stringify([
      american!.primaryCta,
      american!.secondaryCta,
      american!.relatedTools,
    ]);
    assert.equal(blob.includes("note=american"), false);
    assert.equal(blob.includes("purpose=purchase"), false);
  });

  it("homepage situation + nav keep Wave 1 commercial paths", async () => {
    const fs = await import("node:fs");
    const src = fs.readFileSync(
      "src/components/home/HomeSituationSelector.tsx",
      "utf8"
    );
    const nav = fs.readFileSync("src/lib/navigation.ts", "utf8");
    assert.match(src, /routes\.temata\}\/refinancovani/);
    assert.match(src, /routes\.temata\}\/investicni-hypoteka/);
    assert.match(src, /routes\.temata\}\/hypoteka-osvc/);
    assert.match(nav, /hypoteka-ze-zahranicniho-prijmu/);
    assert.match(nav, /americka-hypoteka/);
    assert.equal(src.includes("note=american"), false);
    assert.equal(src.includes("intent=osvc"), false);
    assert.equal(src.includes("intent=foreign_income"), false);
  });

  it("moje-moznosti remains noindex", () => {
    const seo = findStaticPageSeo("/moje-moznosti");
    assert.ok(seo?.noIndex);
    assert.equal(catalogNoIndexPaths().includes("/moje-moznosti"), true);
  });

  it("lead metadata intents are safe literals only", () => {
    for (const slug of WAVE1_COMMERCIAL_SLUGS) {
      const intent = getLanding(slug)!.commercialIntent!;
      assert.match(intent, /^(refinance|osvc|foreign_income|investment|american)$/);
    }
  });

  it("does not attribute Wave 1 / SEO landings to Michal as author or reviewer", () => {
    for (const slug of WAVE1_COMMERCIAL_SLUGS) {
      const landing = getLanding(slug);
      assert.ok(landing, slug);
      assert.equal(landing!.authorId, "redakce-hj", slug);
      assert.equal(landing!.reviewerId, undefined, slug);
    }
    for (const l of SEO_LANDINGS) {
      assert.notEqual(l.authorId, "michal-heinzke", l.slug);
      assert.notEqual(l.reviewerId, "michal-heinzke", l.slug);
    }
  });

  it("Wave 1 conversion funnel micro-patch guards", () => {
    const refinance = getLanding("refinancovani")!;
    assert.match(refinance.primaryCta!.href, /purpose=refinance/);
    assert.match(refinance.primaryCta!.label, /refinanc/i);
    assert.equal(refinance.secondaryCta!.href, "#poptavka");

    const osvc = getLanding("hypoteka-osvc")!;
    assert.equal(osvc.primaryCta!.href, "#poptavka");
    assert.match(osvc.primaryCta!.label, /OSVČ|OSVC/i);
    assert.match(osvc.secondaryCta!.href, /intent=osvc/);
    assert.equal(osvc.secondaryCta!.href.includes("osvc_pausal"), false);
    assert.equal(JSON.stringify(osvc).includes("income=osvc_pausal"), false);

    const foreign = getLanding("hypoteka-ze-zahranicniho-prijmu")!;
    assert.equal(foreign.primaryCta!.href, "#poptavka");
    assert.match(foreign.secondaryCta!.href, /intent=foreign_income/);

    const investment = getLanding("investicni-hypoteka")!;
    assert.equal(investment.primaryCta!.href, "#poptavka");
    assert.match(investment.primaryCta!.label, /financov/i);
    assert.match(investment.secondaryCta!.href, /investicni-rentgen/);
    assert.match(investment.secondaryCta!.label, /rentgen/i);

    const american = getLanding("americka-hypoteka")!;
    assert.equal(american.primaryCta!.href, "#poptavka");
    assert.match(american.primaryCta!.label, /americk/i);
    assert.equal(
      JSON.stringify(american).includes("/kalkulacky/hypotecni"),
      false,
      "American landing must not promote generic mortgage calculator"
    );
    assert.match(american.secondaryCta!.href, /#priklady-bank-americka/);

    for (const slug of WAVE1_COMMERCIAL_SLUGS) {
      const l = getLanding(slug)!;
      assert.equal(l.authorId, "redakce-hj");
      assert.ok(l.commercialIntent);
      assert.ok(l.primaryCta?.href);
    }
  });

  it("Wave 1 factual content micro-patch guards", () => {
    const bannedInternal = [
      "verification_pending",
      "IMPORT_READY",
      "pricing_scenario_key",
      "rate_effect_bp",
      "source_evidence_id",
      "normalized",
      "fallback",
    ];
    for (const slug of WAVE1_COMMERCIAL_SLUGS) {
      const blob = JSON.stringify(getLanding(slug));
      for (const term of bannedInternal) {
        assert.equal(
          blob.includes(term),
          false,
          `${slug} must not expose ${term}`
        );
      }
      assert.equal(/\bHOLD\b/.test(blob), false, `${slug} must not expose HOLD`);
    }

    const osvc = getLanding("hypoteka-osvc")!;
    const osvcBlob = JSON.stringify(osvc);
    assert.equal(osvcBlob.includes("neposuzuje fakturovaný obrat"), false);
    assert.match(osvcBlob, /underwriting/i);
    assert.match(osvcBlob, /Příklady zveřejněných požadavků bank/);
    assert.match(osvcBlob, /obratov/i);
    assert.ok(
      osvc.sources.some((s) => s.url?.includes("kb.cz")),
      "OSVC primary KB source"
    );

    const american = getLanding("americka-hypoteka")!;
    const americanBlob = JSON.stringify(american);
    assert.equal(americanBlob.includes("purpose=purchase"), false);
    assert.match(americanBlob, /nejsou sazby americké hypotéky/);
    assert.match(americanBlob, /právě ověřujeme/);
    assert.ok(
      american.sources.some((s) => s.url?.includes("americka-hypoteka")),
      "American primary product source"
    );
    assert.ok(
      american.sources.some((s) => s.url?.includes("unicreditbank.cz")),
      "UniCredit non-purpose rate sheet"
    );

    const investment = getLanding("investicni-hypoteka")!;
    const investBlob = JSON.stringify(investment);
    assert.equal(investBlob.includes("přísněji posuzuje DSTI"), false);
    assert.match(
      investBlob,
      /interní test schopnosti splácet|nájemní příjem započítávat konzervativně/
    );
    assert.match(investBlob, /DSTI.*deaktivovan/i);

    const foreign = getLanding("hypoteka-ze-zahranicniho-prijmu")!;
    const foreignBlob = JSON.stringify(foreign);
    assert.match(
      foreignBlob,
      /Konkrétní doklady se liší podle banky, země, měny a typu příjmu/
    );
    assert.equal(
      foreignBlob.includes("Sjednoťte výpisy za delší období (6–12 měsíců)"),
      false
    );
    assert.match(foreignBlob, /Příklady zveřejněných požadavků bank/);
    assert.ok(
      foreign.sources.some((s) => s.url?.includes("kb.cz")),
      "Foreign-income KB methodology source"
    );
  });
});
