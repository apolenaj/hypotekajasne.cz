import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CZ_MARKET_SERIES,
  getSeriesById,
  seriesChange,
  validateMarketSeries,
} from "./cz-market-series";

describe("cz-market-series", () => {
  it("passes structural validation", () => {
    assert.deepEqual(validateMarketSeries(CZ_MARKET_SERIES), []);
  });

  it("has sorted unique years and no zero placeholders", () => {
    for (const series of CZ_MARKET_SERIES) {
      const years = series.points.map((p) => p.year);
      assert.deepEqual(
        years,
        [...years].sort((a, b) => a - b)
      );
      assert.equal(new Set(years).size, years.length);
      for (const point of series.points) {
        assert.notEqual(point.value, 0);
        assert.equal(Number.isFinite(point.value), true);
      }
    }
  });

  it("matches FARMY.CZ 2025 agricultural average (Kč/ha → Kč/m²)", () => {
    const series = getSeriesById("farmy-agri-avg-cz");
    assert.ok(series);
    const p2025 = series.points.find((p) => p.year === 2025);
    assert.equal(p2025?.value, 37.3); // 372_550 / 10_000
    const p2008 = series.points.find((p) => p.year === 2008);
    assert.equal(p2008?.value, 8.7); // 86_673 / 10_000
    assert.equal(series.points.length, 18);
  });

  it("computes percent change for prices and pp for vacancy", () => {
    const agri = getSeriesById("farmy-agri-avg-cz")!;
    const change = seriesChange(agri, 2008, 2025);
    assert.equal(change?.kind, "pct");
    assert.ok(change && change.value > 300);

    const vacancy = getSeriesById("prf-office-vacancy-prague")!;
    const pp = seriesChange(vacancy, 2022, 2025);
    assert.deepEqual(pp, { kind: "pp", value: -1.8 });
  });

  it("keeps EUR rents without CZK conversion", () => {
    const rent = getSeriesById("prf-office-prime-rent-prague")!;
    assert.equal(rent.unit, "eur_per_m2_month");
    assert.equal(
      rent.points.every((p) => p.value < 50),
      true
    );
  });
});
