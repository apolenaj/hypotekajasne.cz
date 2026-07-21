/**
 * Cross-country contamination guards — no silent tax/legal term leakage.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countryConfigs, type CountryId } from "@/lib/calculators";
import { COUNTRY_DOSSIERS } from "@/lib/country-dossier";
import {
  assertCurrencyMatrixAligned,
  assertRequiredTaxTermPresent,
  findExclusiveTermContamination,
  JURISDICTION_MATRIX,
} from "@/lib/country-data/jurisdiction-matrix";
import { getBuyVsRentDeepAnalysis } from "@/lib/buy-vs-rent-data";
import { getCountryHubData } from "@/lib/country-hub-data";
import { getPredictionConfig } from "@/lib/prediction-configs";
import { isHistoricalProxyFromCz } from "@/lib/historical-data";

const ALL_IDS = Object.keys(countryConfigs) as CountryId[];

describe("country data — no cross-contamination", () => {
  it("every CountryId has an explicit dossier", () => {
    for (const id of ALL_IDS) {
      assert.ok(COUNTRY_DOSSIERS[id], `missing dossier for ${id}`);
      assert.equal(COUNTRY_DOSSIERS[id].countryId, id);
    }
  });

  it("forbids exclusive jurisdiction terms outside allowed countries", () => {
    const hits = findExclusiveTermContamination();
    assert.deepEqual(
      hits,
      [],
      `Cross-country term leakage:\n${hits
        .map((h) => `- ${h.term} (${h.label}) found in ${h.countryId}`)
        .join("\n")}`
    );
  });

  it("IBI appears only in Spain dossier among EU markets", () => {
    for (const id of ["italy", "croatia", "slovakia"] as CountryId[]) {
      const text = JSON.stringify(COUNTRY_DOSSIERS[id]);
      assert.ok(
        !/\bIBI\b/i.test(text),
        `${id} must not contain Spanish IBI`
      );
    }
    assert.match(JSON.stringify(COUNTRY_DOSSIERS.spain), /\bIBI\b/);
  });

  it("IMU appears in Italy and not in Spain/Slovakia/Croatia dossiers", () => {
    assert.match(JSON.stringify(COUNTRY_DOSSIERS.italy), /\bIMU\b/);
    for (const id of ["spain", "slovakia", "croatia"] as CountryId[]) {
      assert.ok(
        !/\bIMU\b/.test(JSON.stringify(COUNTRY_DOSSIERS[id])),
        `${id} must not contain Italian IMU`
      );
    }
  });

  it("aligns currencies across config and jurisdiction matrix", () => {
    assert.deepEqual(assertCurrencyMatrixAligned(), []);
  });

  it("requires country-specific annual tax terms where known", () => {
    assert.deepEqual(assertRequiredTaxTermPresent(), []);
  });

  it("prediction / hub / buy-vs-rent lookups never fall back to another country", () => {
    for (const id of ALL_IDS) {
      const pred = getPredictionConfig(id);
      assert.ok(pred, id);
      const hub = getCountryHubData(id);
      assert.ok(hub.heroImage, id);
      const deep = getBuyVsRentDeepAnalysis(id);
      assert.ok(deep.title, id);
    }
  });

  it("marks non-CZ historical series as CZ proxy (no fake local history)", () => {
    assert.equal(isHistoricalProxyFromCz("cz"), false);
    for (const id of ALL_IDS.filter((c) => c !== "cz")) {
      assert.equal(
        isHistoricalProxyFromCz(id),
        true,
        `${id} history must be disclosed as CZ proxy`
      );
      assert.equal(JURISDICTION_MATRIX[id].historyIsCzProxy, true);
    }
  });

  it("Dubai dossier mentions DLD; EU dossiers do not", () => {
    assert.match(JSON.stringify(COUNTRY_DOSSIERS.dubai), /DLD|Dubai Land/);
    for (const id of ["spain", "italy", "croatia", "slovakia", "cz"] as CountryId[]) {
      assert.ok(
        !/\bDLD\b/.test(JSON.stringify(COUNTRY_DOSSIERS[id])),
        `${id} must not reference DLD`
      );
    }
  });

  it("ČNB regulatory wording stays on CZ dossier", () => {
    assert.match(JSON.stringify(COUNTRY_DOSSIERS.cz), /ČNB/);
    for (const id of ALL_IDS.filter((c) => c !== "cz")) {
      assert.ok(
        !/ČNB|Česká národní banka/.test(JSON.stringify(COUNTRY_DOSSIERS[id])),
        `${id} must not contain ČNB regulatory text`
      );
    }
  });
});
