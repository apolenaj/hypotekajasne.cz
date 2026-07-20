import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildGlobalFinancingMap } from "@/lib/global-financing/build";
import { buildFinancingRoutes } from "@/lib/global-financing/build-routes";
import { DEMO_CZ_RESIDENT_SPAIN } from "@/lib/global-financing/demo";
import {
  findPartnerSlot,
  PARTNER_NOT_INTEGRATED_MESSAGE,
} from "@/lib/global-financing/partners";
import { defaultRouterInput } from "@/lib/global-financing/types";

describe("buildFinancingRoutes — CZ resident → Spain", () => {
  it("returns multiple routes without a single winner", () => {
    const routes = buildFinancingRoutes(DEMO_CZ_RESIDENT_SPAIN);
    assert.ok(routes.length >= 3, `Expected >= 3 routes, got ${routes.length}`);
    const letters = routes.map((r) => r.routeLetter);
    assert.ok(letters.includes("A"));
    assert.ok(letters.includes("B"));
  });

  it("includes Spanish non-resident mortgage as Route A", () => {
    const routes = buildFinancingRoutes(DEMO_CZ_RESIDENT_SPAIN);
    const local = routes.find((r) => r.pathType === "LOCAL_MORTGAGE");
    assert.ok(local);
    assert.ok(local!.label.toLowerCase().includes("nerezident") || local!.label.includes("Lokální"));
    assert.equal(local!.requiredEquityPercent, 30);
    assert.equal(local!.calculable, false);
  });

  it("includes Czech equity-backed route when collateral in CZ", () => {
    const routes = buildFinancingRoutes(DEMO_CZ_RESIDENT_SPAIN);
    const equity = routes.find((r) => r.pathType === "CZECH_EQUITY_LOAN");
    assert.ok(equity);
    assert.equal(equity!.availabilityStatus, "AVAILABLE_INDIVIDUALLY");
  });

  it("excludes Czech equity without CZ collateral", () => {
    const input = defaultRouterInput({
      ...DEMO_CZ_RESIDENT_SPAIN,
      collateral: "none",
    });
    const routes = buildFinancingRoutes(input);
    assert.ok(!routes.some((r) => r.pathType === "CZECH_EQUITY_LOAN"));
  });

  it("shows combination when partial cash + CZ collateral", () => {
    const routes = buildFinancingRoutes(DEMO_CZ_RESIDENT_SPAIN);
    assert.ok(routes.some((r) => r.pathType === "COMBINATION"));
  });

  it("never marks foreign local mortgage as calculable", () => {
    const routes = buildFinancingRoutes(DEMO_CZ_RESIDENT_SPAIN);
    const local = routes.find((r) => r.pathType === "LOCAL_MORTGAGE");
    assert.equal(local!.calculable, false);
    assert.ok(local!.calculationNote);
  });
});

describe("partner architecture", () => {
  it("Spain local mortgage has NOT_INTEGRATED partner", () => {
    const slot = findPartnerSlot({
      propertyCountry: "spain",
      pathType: "LOCAL_MORTGAGE",
    });
    assert.ok(slot);
    assert.equal(slot!.integrationStatus, "NOT_INTEGRATED");
    assert.equal(slot!.marketplaceReady, true);
  });

  it("partner message matches spec", () => {
    assert.ok(PARTNER_NOT_INTEGRATED_MESSAGE.includes("partner zatím není integrován"));
  });
});

describe("buildGlobalFinancingMap", () => {
  it("builds visual map nodes and edges", () => {
    const map = buildGlobalFinancingMap(DEMO_CZ_RESIDENT_SPAIN);
    assert.equal(map.noSingleRecommendation, true);
    assert.ok(map.nodes.some((n) => n.type === "origin"));
    assert.ok(map.nodes.some((n) => n.type === "destination"));
    assert.ok(map.nodes.filter((n) => n.type === "route").length >= 3);
    assert.ok(map.edges.length >= 3);
    assert.ok(map.methodology.length > 0);
  });
});

describe("Italy — no local mortgage in data", () => {
  it("shows UNAVAILABLE or only equity/cash", () => {
    const input = defaultRouterInput({
      propertyCountry: "italy",
      collateral: "none",
    });
    const routes = buildFinancingRoutes(input);
    assert.ok(!routes.some((r) => r.pathType === "LOCAL_MORTGAGE" && r.calculable));
    assert.ok(
      routes.some((r) => r.pathType === "UNAVAILABLE") ||
        routes.every((r) => ["CASH", "CZECH_EQUITY_LOAN"].includes(r.pathType) === false || r.pathType === "CASH")
    );
  });
});

describe("Dubai — developer plan separate from local mortgage", () => {
  it("includes both developer and non-resident routes", () => {
    const input = defaultRouterInput({
      propertyCountry: "dubai",
      collateral: "cz_property",
      purchasePrice: 2_000_000,
      ownFunds: 800_000,
    });
    const routes = buildFinancingRoutes(input);
    assert.ok(routes.some((r) => r.pathType === "DEVELOPER_PAYMENT_PLAN"));
    assert.ok(routes.some((r) => r.pathType === "LOCAL_MORTGAGE"));
  });
});
