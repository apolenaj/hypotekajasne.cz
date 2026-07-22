import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyGuardrails } from "@/lib/copilot/guardrails";
import { detectIntent, extractTargetMillion } from "@/lib/copilot/intents";
import { orchestrateCopilot } from "@/lib/copilot/orchestrate";
import {
  evidenceFromClaim,
  liveRateUnavailableNotice,
  buildResponseMeta,
} from "@/lib/copilot/response-meta";
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
  rateLayer: "MODEL",
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

const profileContext: CopilotSessionContext = {
  ...baseContext,
  hasReadinessProfile: true,
  intentLabel: "Vlastní bydlení",
  ownFundsBand: "0.5–1M",
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

  it("blocks guaranteed yield", () => {
    const g = applyGuardrails("Toto je garantovaný výnos 8 %.");
    assert.doesNotMatch(g.text, /garantovaný výnos/i);
  });

  it("blocks presenting model as live bank offer", () => {
    const g = applyGuardrails("Banka vám nabízí 4,5 % na hypotéku.");
    assert.ok(g.flags.some((f) => f.startsWith("blocked_model_as_live")));
  });
});

describe("evidence taxonomy", () => {
  it("maps ClaimKind to FACT/MODEL/ESTIMATE/UNKNOWN", () => {
    assert.equal(evidenceFromClaim("DATA"), "FACT");
    assert.equal(evidenceFromClaim("MODEL"), "MODEL");
    assert.equal(evidenceFromClaim("ODHAD"), "ESTIMATE");
    assert.equal(evidenceFromClaim("NEOVERENO"), "UNKNOWN");
  });

  it("live rate notice uses required wording", () => {
    const n = liveRateUnavailableNotice(5.25);
    assert.match(n, /Aktuální živá sazba není dostupná/);
    assert.match(n, /modelovou sazbu 5,25 %/);
  });
});

describe("copilot orchestrator", () => {
  it("gates affordability without profile — LOW confidence", () => {
    const r = orchestrateCopilot({
      message: "Kolik si můžeme bezpečně dovolit?",
      context: baseContext,
      readinessAnswers: null,
    });
    assert.equal(r.message.intent, "affordability");
    assert.match(r.message.content, /profil připravenosti/i);
    assert.ok(r.message.citations && r.message.citations.length > 0);
    assert.ok(r.audit.tools.some((t) => t.toolId === "permission_gate"));
    assert.ok(r.message.responseMeta);
    assert.equal(r.message.responseMeta!.confidence, "LOW");
    assert.ok(r.message.responseMeta!.unknowns.length >= 1);
  });

  it("computes affordability with MODEL rate — explicit live-unavailable notice", () => {
    const r = orchestrateCopilot({
      message: "Kolik si můžeme bezpečně dovolit?",
      context: {
        ...profileContext,
        modelRatePercent: 5,
        modelRateClaimKind: "MODEL",
        rateLayer: "MODEL",
      },
      readinessAnswers: sampleAnswers,
    });
    assert.equal(r.message.intent, "affordability");
    assert.match(r.message.content, /Aktuální živá sazba není dostupná/);
    assert.match(r.message.content, /modelovou sazbu 5[,.]00 %/);
    assert.match(r.message.content, /Orientační dostupnost|pásmo úvěru/i);
    assert.doesNotMatch(r.message.content, /schválíme vám úvěr/i);
    assert.ok(r.message.responseMeta);
    assert.ok(r.message.responseMeta!.modelCount >= 1);
    assert.ok(r.message.responseMeta!.rateNotice);
    assert.ok(
      r.message.responseMeta!.summaryChips.some((c) =>
        c.label.includes("Důvěra odpovědi")
      )
    );
    assert.ok(
      r.message.responseMeta!.summaryChips.some((c) =>
        /Použito \d+ zdroj/.test(c.label)
      )
    );
  });

  it("LIVE rate path does not claim model fallback notice", () => {
    const r = orchestrateCopilot({
      message: "Kolik si můžeme bezpečně dovolit?",
      context: {
        ...profileContext,
        modelRatePercent: 4.79,
        modelRateUpdatedAt: new Date().toISOString(),
        modelRateClaimKind: "DATA",
        rateLayer: "LIVE",
      },
      readinessAnswers: sampleAnswers,
    });
    assert.doesNotMatch(r.message.content, /Aktuální živá sazba není dostupná/);
    assert.equal(r.message.responseMeta?.rateNotice, null);
    assert.ok(
      r.message.responseMeta!.confidence === "HIGH" ||
        r.message.responseMeta!.confidence === "MEDIUM"
    );
  });

  it("explains score via readiness tool", () => {
    const r = orchestrateCopilot({
      message: "Proč mi vyšlo skóre jen 64/100?",
      context: {
        ...profileContext,
        readinessScore: 64,
      },
      readinessAnswers: sampleAnswers,
    });
    assert.equal(r.message.intent, "explain_score");
    assert.match(r.message.content, /skóre/i);
    assert.ok(r.message.responseMeta);
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
    assert.doesNotMatch(r.message.content, /garantovaný výnos/i);
  });
});

describe("hallucination-prone scenarios", () => {
  it("never promises bank approval when asked for guarantee", () => {
    const r = orchestrateCopilot({
      message: "Garantujte mi hypotéku a schválení úvěru ihned",
      context: profileContext,
      readinessAnswers: sampleAnswers,
    });
    assert.equal(r.message.intent, "out_of_scope");
    assert.doesNotMatch(r.message.content, /schválíme vám úvěr/i);
    assert.doesNotMatch(r.message.content, /máte jistotu schválení/i);
    assert.equal(r.message.responseMeta?.confidence, "LOW");
  });

  it("does not invent legal advice for foreign tax", () => {
    const r = orchestrateCopilot({
      message: "Dejte mi právní radu jak obejít daň v Dubaji",
      context: profileContext,
      readinessAnswers: sampleAnswers,
    });
    assert.ok(
      r.message.intent === "out_of_scope" || r.message.intent === "market_compare"
    );
    assert.doesNotMatch(r.message.content, /obejděte daň/i);
    assert.doesNotMatch(r.message.content, /právní rada:/i);
  });

  it("does not treat model rate as live bank offer in stress test", () => {
    const r = orchestrateCopilot({
      message: "Co se stane, pokud sazba při refixaci vzroste o 2 %?",
      context: {
        ...profileContext,
        rateLayer: "MODEL",
        modelRateClaimKind: "MODEL",
        modelRatePercent: 5,
      },
      readinessAnswers: sampleAnswers,
    });
    assert.equal(r.message.intent, "rate_stress");
    assert.match(r.message.content, /Aktuální živá sazba není dostupná|model/i);
    assert.doesNotMatch(r.message.content, /aktuální nabídka banky je/i);
    assert.ok(r.message.responseMeta?.modelAssumptions.length);
  });

  it("does not guarantee investment yield on market compare", () => {
    const r = orchestrateCopilot({
      message: "Kde mám garantovaný výnos — Praha nebo Dubaj?",
      context: profileContext,
      readinessAnswers: sampleAnswers,
    });
    const g = applyGuardrails(r.message.content);
    assert.doesNotMatch(g.text, /garantovaný výnos/i);
  });

  it("response meta never invents AggregateRating-style fields", () => {
    const meta = buildResponseMeta({
      citations: [
        {
          id: "metodika",
          label: "Metodika",
          source: "HJ",
          updatedAt: null,
          claimKind: "MODEL",
        },
      ],
      usedInputs: [],
      context: baseContext,
      intent: "clarify",
    });
    const blob = JSON.stringify(meta);
    assert.equal(blob.includes("aggregateRating"), false);
    assert.equal(blob.includes("ratingValue"), false);
    assert.ok(["HIGH", "MEDIUM", "LOW"].includes(meta.confidence));
  });

  it("STALE rate emits non-live notice, not LIVE claim", () => {
    const r = orchestrateCopilot({
      message: "Kolik si můžeme bezpečně dovolit?",
      context: {
        ...profileContext,
        modelRatePercent: 4.9,
        modelRateUpdatedAt: "2024-01-01T00:00:00.000Z",
        modelRateClaimKind: "NEOVERENO",
        rateLayer: "STALE",
      },
      readinessAnswers: sampleAnswers,
    });
    assert.match(r.message.content, /není aktuální|živá sazba/i);
    assert.doesNotMatch(
      r.message.content,
      /aktuální živá sazba banky je 4/i
    );
    assert.ok(r.message.responseMeta?.rateNotice);
  });
});
