/**
 * Trust Center / Metodika 2.0 — PROMPT 13.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { statusBadgeLabel } from "@/lib/data/display";
import {
  PUBLIC_STATUS_MEANINGS,
  PUBLIC_STATUS_ORDER,
} from "@/lib/data/public-methodology";
import { NUMBER_PIPELINE_STEPS } from "@/lib/trust/number-pipeline";
import { listPublicChangelog } from "@/lib/trust/public-changelog";
import { dossierEditorialLegalReviewText } from "@/lib/country-dossier/shared";

const ROOT = join(process.cwd(), "src");

describe("PROMPT 13 — public status taxonomy", () => {
  it("exposes all seven public status codes", () => {
    assert.deepEqual(
      PUBLIC_STATUS_ORDER.map((s) => PUBLIC_STATUS_MEANINGS[s].code),
      [
        "Aktuální data",
        "Ověřeno",
        "Model",
        "Odhad",
        "Neověřeno",
        "Aktualizujeme",
        "Partner",
      ]
    );
  });

  it("maps STALE → Aktualizujeme and PARTNER_QUOTE → Partner (Czech UI)", () => {
    assert.equal(statusBadgeLabel("STALE"), "Aktualizujeme");
    assert.equal(statusBadgeLabel("PARTNER_QUOTE"), "Partner");
  });

  it("each status has a short Czech explanation", () => {
    for (const s of PUBLIC_STATUS_ORDER) {
      assert.ok(PUBLIC_STATUS_MEANINGS[s].description.length > 40, s);
    }
  });
});

describe("PROMPT 13 — number pipeline + changelog", () => {
  it("defines Zdroj → … → Zobrazení klientovi", () => {
    assert.equal(NUMBER_PIPELINE_STEPS[0].title, "Zdroj");
    assert.equal(
      NUMBER_PIPELINE_STEPS[NUMBER_PIPELINE_STEPS.length - 1].title,
      "Zobrazení klientovi"
    );
    assert.equal(NUMBER_PIPELINE_STEPS.length, 5);
  });

  it("changelog has only dated real entries (no empty fake history)", () => {
    const rows = listPublicChangelog();
    assert.ok(rows.length >= 3);
    for (const row of rows) {
      assert.match(row.date, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(row.summary.length > 20);
    }
  });
});

describe("PROMPT 13 — legal wording", () => {
  it("dossier uses clean legal-sources update wording", () => {
    const text = dossierEditorialLegalReviewText("ČR");
    assert.match(text, /Poslední aktualizace právních zdrojů/i);
    assert.ok(!/redakční kontrola/i.test(text));
    assert.ok(!/právní review/i.test(text));
  });

  it("metodika page fixes financial abbreviations grammar", () => {
    const src = readFileSync(join(ROOT, "app/metodika/page.tsx"), "utf8");
    assert.ok(src.includes("běžné finanční zkratky"));
    assert.ok(!src.includes("běžné finančních zkratky"));
    assert.ok(src.includes("Jak vzniká číslo, které vidíte"));
    assert.ok(src.includes("Co jsme aktualizovali"));
  });
});
