import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPortfolioOs } from "@/lib/portfolio-os/build";
import { buildAdvisorExportCsv } from "@/lib/portfolio-os/export";
import { DEMO_PORTFOLIO_TWINS } from "@/lib/portfolio-os/demo";
import { PORTFOLIO_OS_FEATURE_STATUS } from "@/lib/portfolio-os/types";

describe("Portfolio OS", () => {
  it("aggregates demo portfolio summary", () => {
    const r = buildPortfolioOs({
      twins: DEMO_PORTFOLIO_TWINS,
      currentMarketRatePercent: 5.2,
      liquidityReserveCzk: 450_000,
    });
    assert.equal(r.properties.length, 4);
    assert.ok((r.summary.totalPropertyValue.value as number) > 0);
    assert.ok((r.summary.totalDebt.value as number) > 0);
    assert.ok(r.summary.portfolioLtv.value != null);
    assert.ok((r.summary.monthlyGrossRent.value as number) > 0);
  });

  it("emits concentration alerts in user-facing format", () => {
    const r = buildPortfolioOs({
      twins: DEMO_PORTFOLIO_TWINS,
      currentMarketRatePercent: 5,
    });
    const city = r.concentrationAlerts.find((a) => a.dimension === "city");
    assert.ok(city);
    assert.match(city!.headline, /% portfolia je v jednom městě/);

    const refix = r.concentrationAlerts.find((a) => a.dimension === "refixation");
    assert.ok(refix);
    assert.match(refix!.headline, /% dluhu refixuje/);

    const eur = r.concentrationAlerts.find((a) => a.dimension === "currency_income");
    assert.ok(eur);
    assert.match(eur!.headline, /EUR/);
  });

  it("runs all stress scenarios", () => {
    const r = buildPortfolioOs({
      twins: DEMO_PORTFOLIO_TWINS,
      currentMarketRatePercent: 5,
    });
    assert.equal(r.stressTests.length, 6);
    assert.ok(r.stressTests.some((s) => s.id === "combined_recession"));
  });

  it("recommendations avoid direct sell advice", () => {
    const r = buildPortfolioOs({
      twins: DEMO_PORTFOLIO_TWINS,
      currentMarketRatePercent: 5,
    });
    for (const rec of r.recommendations) {
      assert.match(rec.disclaimer, /ne.*prodej|pokyn/i);
      assert.ok(rec.scenarios.length >= 1);
      assert.ok(!/prodejte tuto nemovitost/i.test(rec.headline));
    }
  });

  it("explainable recommendations use scenario A/B/C pattern", () => {
    const r = buildPortfolioOs({
      twins: DEMO_PORTFOLIO_TWINS,
      currentMarketRatePercent: 5,
    });
    const withScenarios = r.recommendations.filter((x) =>
      x.scenarios.some((s) => /Scénář [ABC]/i.test(s.label))
    );
    assert.ok(withScenarios.length > 0);
  });

  it("advisor export includes summary and methodology", () => {
    const r = buildPortfolioOs({
      twins: DEMO_PORTFOLIO_TWINS,
      currentMarketRatePercent: 5,
      liquidityReserveCzk: 100_000,
    });
    const csv = buildAdvisorExportCsv(r);
    assert.match(csv, /Moje portfolio/);
    assert.match(csv, /ZÁTĚŽOVÉ TESTY/);
    assert.match(csv, /METODIKA/);
    assert.match(csv, /Hodnota nemovitostí/);
  });

  it("feature status is BETA", () => {
    assert.equal(PORTFOLIO_OS_FEATURE_STATUS, "BETA");
  });
});
