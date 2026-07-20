import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { templatesForPropertyType } from "@/lib/due-diligence/checklists";
import {
  buildChecklistItems,
  buildDueDiligenceModel,
  buildSummary,
  buildExpertEscalation,
} from "@/lib/due-diligence/build";
import { DEMO_DD_INPUT } from "@/lib/due-diligence/demo";
import {
  assertNotGreenFromUnknown,
  defaultDueDiligenceInput,
} from "@/lib/due-diligence/types";

describe("personalized checklists", () => {
  it("apartment includes SVJ items", () => {
    const t = templatesForPropertyType("apartment");
    assert.ok(t.some((i) => i.category === "SVJ_HOA"));
  });

  it("land includes land_use_plan not apartment-only svj", () => {
    const t = templatesForPropertyType("land");
    assert.ok(t.some((i) => i.id === "land_use_plan"));
    assert.ok(!t.some((i) => i.id === "svj_statutes"));
  });

  it("off_plan includes developer items", () => {
    const t = templatesForPropertyType("off_plan");
    assert.ok(t.some((i) => i.category === "DEVELOPER"));
  });

  it("foreign_property includes foreign ownership rules", () => {
    const t = templatesForPropertyType("foreign_property");
    assert.ok(t.some((i) => i.id === "foreign_ownership_rules"));
  });
});

describe("traffic light — unknown is not green", () => {
  it("defaults all items to GREY without overrides", () => {
    const items = buildChecklistItems(
      defaultDueDiligenceInput({ propertyType: "apartment" })
    );
    assert.ok(items.length > 0);
    assert.ok(items.every((i) => i.status === "GREY"));
  });

  it("cannot set GREEN without evidence", () => {
    const result = assertNotGreenFromUnknown("GREY", "GREEN", false);
    assert.equal(result, "GREY");
  });

  it("GREEN requires evidence and source in build", () => {
    const items = buildChecklistItems(
      defaultDueDiligenceInput({
        propertyType: "apartment",
        itemOverrides: {
          legal_clean_title: { status: "GREEN", evidence: "LV OK", source: "cuzk" },
        },
      })
    );
    const legal = items.find((i) => i.id === "legal_clean_title")!;
    assert.equal(legal.status, "GREEN");
  });

  it("GREEN without source stays GREY", () => {
    const items = buildChecklistItems(
      defaultDueDiligenceInput({
        propertyType: "apartment",
        itemOverrides: {
          legal_clean_title: { status: "GREEN", evidence: "LV OK" },
        },
      })
    );
    const legal = items.find((i) => i.id === "legal_clean_title")!;
    assert.equal(legal.status, "GREY");
  });
});

describe("summary", () => {
  it("builds Czech summary line for demo", () => {
    const model = buildDueDiligenceModel(DEMO_DD_INPUT);
    assert.ok(model.summary.verifiedCount >= 2);
    assert.ok(model.summary.checkRequiredCount >= 1);
    assert.ok(model.summary.materialIssueCount >= 1);
    assert.ok(model.summary.summaryLine.includes("ověřen"));
  });
});

describe("expert escalation", () => {
  it("recommends escalation when RED items exist", () => {
    const model = buildDueDiligenceModel(DEMO_DD_INPUT);
    assert.equal(model.escalation.recommended, true);
    assert.equal(model.escalation.urgency, "high");
  });

  it("recommends escalation for all-grey checklist", () => {
    const items = buildChecklistItems(
      defaultDueDiligenceInput({ propertyType: "house" })
    );
    const summary = buildSummary(items);
    const esc = buildExpertEscalation(items, summary);
    assert.equal(esc.recommended, true);
  });
});
