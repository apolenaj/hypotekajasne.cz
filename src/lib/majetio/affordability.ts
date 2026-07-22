import {
  buildHypotekaFinancingHandoffUrl,
  buildHypotekaReadinessHandoffUrl,
} from "@/lib/majetio/urls";
import type {
  AffordabilityCheckRequest,
  AffordabilityCheckResponse,
  FinancingHandoffRequest,
  FinancingHandoffResponse,
} from "@/lib/majetio/contracts";

const DISCLAIMER =
  "Orientační model Hypotéka Jasně — nejde o schválení bankou ani investiční doporučení.";

/**
 * Vyhodnocení „Mohu si to dovolit?“ proti volitelnému Financial Passport.
 * Bez passportu → insufficient_data + CTA na připravenost.
 */
export function evaluateAffordability(
  req: AffordabilityCheckRequest
): AffordabilityCheckResponse {
  const price = req.priceCzk;
  const safe = req.passport?.safePropertyBudget ?? null;
  const maxLoan = req.passport?.maxEstimatedBankBudget ?? null;
  const equity = req.passport?.ownFunds ?? 0;
  const maxProperty =
    maxLoan != null ? maxLoan + Math.max(0, equity) : null;

  if (safe == null && maxProperty == null) {
    return {
      status: "COMING_SOON",
      verdict: "insufficient_data",
      claimKind: "NEOVERENO",
      summary:
        "Bez Finančního pasu nelze orientačně porovnat. Spusťte Hypoteční připravenost.",
      cta: {
        label: "Spustit Hypoteční připravenost",
        href: buildHypotekaReadinessHandoffUrl({
          llid: req.attribution?.llid,
          ref: req.attribution?.ref,
        }),
      },
      disclaimer: DISCLAIMER,
    };
  }

  let verdict: AffordabilityCheckResponse["verdict"] = "above_budget";
  let claimKind: AffordabilityCheckResponse["claimKind"] = "ODHAD";
  let summary: string;

  if (safe != null && price <= safe) {
    verdict = "within_safe_budget";
    summary = `Cena je v rámci safePropertyBudget (${Math.round(safe).toLocaleString("cs-CZ")} Kč). ODHAD.`;
  } else if (maxProperty != null && price <= maxProperty) {
    verdict = "within_max_estimate";
    summary = `Cena je nad bezpečným rozpočtem, ale v rámci maxEstimatedBankBudget + ownFunds. ODHAD — ne schválení.`;
    claimKind = "MODEL";
  } else {
    verdict = "above_budget";
    summary =
      "Cena je nad orientačním rozpočtem z Finančního pasu. Zvažte jinou nemovitost nebo aktualizaci připravenosti.";
  }

  return {
    status: "COMING_SOON",
    verdict,
    claimKind,
    summary,
    comparedTo: {
      safePropertyBudget: safe,
      maxEstimatedBankBudget: maxLoan,
    },
    cta: {
      label: "Spočítat financování na Hypotéka Jasně",
      href: buildHypotekaFinancingHandoffUrl({
        propertyPriceCzk: price,
        country: req.country,
        purpose: req.passport?.purpose ?? undefined,
        propertyId: req.propertyId,
        attribution: {
          utm_source: req.attribution?.utm_source ?? "majetio",
          utm_campaign: req.attribution?.utm_campaign ?? "affordability",
          llid: req.attribution?.llid,
          ref: req.attribution?.ref,
        },
      }),
    },
    disclaimer: DISCLAIMER,
  };
}

export function buildFinancingHandoff(
  req: FinancingHandoffRequest
): FinancingHandoffResponse {
  const handoffUrl = buildHypotekaFinancingHandoffUrl({
    propertyPriceCzk: req.priceCzk,
    country: req.country,
    purpose: req.purpose,
    propertyId: req.propertyId,
    attribution: {
      utm_source: req.attribution?.utm_source ?? "majetio",
      utm_campaign: req.attribution?.utm_campaign ?? "financing_handoff",
      llid: req.attribution?.llid,
      ref: req.attribution?.ref,
    },
  });

  return {
    status: "BETA",
    handoffUrl,
    safeParamsPassed: [
      "price",
      "country",
      "purpose",
      "listing_ref",
      "utm_*",
      "llid",
      "ref",
    ],
    disclaimer: DISCLAIMER,
  };
}
