import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyGuardrails } from "@/lib/copilot/guardrails";
import { detectIntent, extractTargetMillion } from "@/lib/copilot/intents";
import { orchestrateCopilot } from "@/lib/copilot/orchestrate";
import { EMPTY_ANSWERS, type ReadinessAnswers } from "@/lib/mortgage-readiness";
import type { CopilotSessionContext } from "@/lib/copilot/types";

const baseContext: CopilotSessionContext = {
  hasReadinessProfile: false,
  readinessScore: null,
  financingHigh: null,
  financingLow: null,
  intentLabel: null,
  ownFundsBand: null,
  targetPrice: null,
  properties: [],
  modelRatePercent: 5,
  modelRateUpdatedAt: null,
  modelRateClaimKind: "MODEL",
};

const sampleAnswers: ReadinessAnswers = {
  ...EMPTY_ANSWERS,
  intent: "owner_occupied",
  age: 35,
  netIncome: 55_000,
  incomeType: "employee",
  ownFunds: 800_000,
  otherLiabilities: 0,
  creditLimitPayments: 0,
  noRecentDefaults: true,
  employmentMonths: 36,
};

describe("copilot intent detection", () => {
  it("detects affordability", () => {
    const r = detectIntent("Kolik si můžeme bezpečně dovolit?");
    assert.equal(r.intent, "affordability");
  });

  it("detects rate stress", () => {
    const r = detectIntent("Co se stane, pokud sazba při refixaci vzroste o 2 %?");
    assert.equal(r.intent, "rate_stress");
  });

  it("detects out of scope approval promise", () => {
    const r = detectIntent("Slibte že mi schválíte hypotéku");
    assert.equal(r.intent, "out_of_scope");
  });

  it("maps quick action", () => {
    const r = detectIntent("cokoli", "explain_score");
    assert.equal(r.intent, "explain_score");
    assert.equal(r.confidence, 1);
  });

  it("extracts target millions", () => {
    assert.equal(extractTargetMillion("dosáhnout na 7 milionů"), 7_000_000);
  });
});

describe("copilot guardrails", () => {
  it("appends system disclaimer", () => {
    const g = applyGuardrails("Modelová dostupnost je 5 mil.");
    assert.match(g.text, /Nejde o schválení úvěru/);
    assert.ok(g.flags.includes("appended_system_disclaimer"));
  });

  it("blocks approval phrases", () => {
    const g = applyGuardrails("Banka vám půjčí 5 milionů hned.");
    assert.doesNotMatch(g.text, /banka vám půjčí/i);
  });
});

describe("copilot orchestrator", () => {
  it("gates affordability without profile", () => {
    const r = orchestrateCopilot({
      message: "Kolik si můžeme bezpečně dovolit?",
      context: baseContext,
      readinessAnswers: null,
    });
    assert.equal(r.message.intent, "affordability");
    assert.match(r.message.content, /profil připravenosti/i);
    assert.ok(r.message.citations && r.message.citations.length > 0);
    assert.ok(r.audit.tools.some((t) => t.toolId === "permission_gate"));
  });

  it("computes affordability with profile — no approval claim", () => {
    const r = orchestrateCopilot({
      message: "Kolik si můžeme bezpečně dovolit?",
      context: {
        ...baseContext,
        hasReadinessProfile: true,
        intentLabel: "Vlastní bydlení",
        ownFundsBand: "0.5–1M",
      },
      readinessAnswers: sampleAnswers,
    });
    assert.equal(r.message.intent, "affordability");
    assert.match(r.message.content, /Orientační dostupnost|pásmo úvěru/i);
    assert.doesNotMatch(r.message.content, /schválíme vám úvěr/i);
    assert.ok(r.audit.dataKeysUsed.includes("readiness.answers"));
  });

  it("explains score via readiness tool", () => {
    const r = orchestrateCopilot({
      message: "Proč mi vyšlo skóre jen 64/100?",
      context: {
        ...baseContext,
        hasReadinessProfile: true,
        readinessScore: 64,
        intentLabel: "Vlastní bydlení",
      },
      readinessAnswers: sampleAnswers,
    });
    assert.equal(r.message.intent, "explain_score");
    assert.match(r.message.content, /skóre/i);
  });

  it("runs market compare without inventing rates", () => {
    const r = orchestrateCopilot({
      message: "Má pro mě větší smysl Praha nebo Dubaj?",
      context: baseContext,
    });
    assert.equal(r.message.intent, "market_compare");
    assert.match(r.message.content, /matching|skóre/i);
    assert.ok(
      r.audit.tools.some((t) => t.toolId.includes("market_matching"))
    );
  });
});
