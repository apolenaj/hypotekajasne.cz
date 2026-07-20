import { calculateAnnuityPayment } from "@/lib/calculators";
import { routes } from "@/lib/routes";
import type {
  WatchAlert,
  WatchTarget,
} from "@/lib/watchlist/types";
import type { FinancialPassportDocument } from "@/lib/financial-passport/types";
import { evaluateAffordability } from "@/lib/majetio/affordability";
import { toMajetioHandoff } from "@/lib/financial-passport/handoff";

function alertId(targetId: string, kind: string, salt: string): string {
  return `wa_${targetId}_${kind}_${salt}`.replace(/\W/g, "_").slice(0, 64);
}

function fmtCzk(n: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(n);
}

function daysBetween(fromIso: string, to: Date): number | null {
  const t = Date.parse(fromIso);
  if (!Number.isFinite(t)) return null;
  return Math.max(0, Math.floor((to.getTime() - t) / 86_400_000));
}

export type WatchAlertContext = {
  targets: WatchTarget[];
  /** Current model mortgage rate % — null if unavailable */
  currentRatePercent: number | null;
  doc: FinancialPassportDocument | null;
  now?: Date;
};

/**
 * Generate candidate alerts ONLY from available observations.
 * Never invent similar listings, Majetio inventory, or yields without values.
 */
export function generateWatchAlertCandidates(
  ctx: WatchAlertContext
): WatchAlert[] {
  const now = ctx.now ?? new Date();
  const out: WatchAlert[] = [];
  const handoff = ctx.doc ? toMajetioHandoff(ctx.doc) : null;

  for (const t of ctx.targets) {
    // --- Price change (requires previous + current) ---
    if (
      t.priceCzk != null &&
      t.previousPriceCzk != null &&
      t.previousPriceCzk > 0 &&
      t.priceCzk !== t.previousPriceCzk
    ) {
      const delta = t.priceCzk - t.previousPriceCzk;
      const abs = Math.abs(delta);
      if (abs >= 50_000) {
        const drop = delta < 0;
        out.push({
          id: alertId(t.id, drop ? "price_drop" : "price_rise", String(t.priceCzk)),
          targetId: t.id,
          kind: drop ? "price_drop" : "price_rise",
          title: drop
            ? `Cena klesla o ${fmtCzk(abs)}.`
            : `Cena vzrostla o ${fmtCzk(abs)}.`,
          body: `„${t.label}“: ${fmtCzk(t.previousPriceCzk)} → ${fmtCzk(t.priceCzk)}.`,
          createdAt: now.toISOString(),
          claimKind: t.sourceClaim,
          magnitude: abs,
          href: t.majetioUrl ?? routes.sledovani,
          severity: drop && abs >= 200_000 ? "important" : "notable",
        });
      }
    }

    // --- Listing age: ONLY if listingPublishedAt known (Majetio) ---
    if (t.listingPublishedAt) {
      const age = daysBetween(t.listingPublishedAt, now);
      if (age != null && age >= 60) {
        out.push({
          id: alertId(t.id, "listing_age", String(age)),
          targetId: t.id,
          kind: "listing_age",
          title: `Nemovitost je v nabídce ${age} dní.`,
          body: `Podle data publikace z Majetio („${t.label}“).`,
          createdAt: now.toISOString(),
          claimKind: "DATA",
          magnitude: age,
          href: t.majetioUrl,
          severity: age >= 90 ? "notable" : "info",
        });
      }
    }

    // --- Availability change to sold/reserved ---
    if (t.availability === "sold" || t.availability === "reserved") {
      out.push({
        id: alertId(t.id, "availability", t.availability),
        targetId: t.id,
        kind: "availability",
        title:
          t.availability === "sold"
            ? `„${t.label}“ už není dostupná (prodáno).`
            : `„${t.label}“ je rezervovaná.`,
        body: "Status z poslední známé synchronizace — neověřujeme inventář bez Majetio feedu.",
        createdAt: now.toISOString(),
        claimKind: t.majetioListingId ? "DATA" : "ODHAD",
        magnitude: null,
        href: t.majetioUrl,
        severity: "important",
      });
    }

    // --- Yield change (both values required) ---
    if (
      t.estimatedYieldPct != null &&
      t.previousYieldPct != null &&
      Math.abs(t.estimatedYieldPct - t.previousYieldPct) >= 0.3
    ) {
      const from = t.previousYieldPct;
      const to = t.estimatedYieldPct;
      const verb = to < from ? "klesl" : "vzrostl";
      out.push({
        id: alertId(t.id, "yield_change", `${from}_${to}`),
        targetId: t.id,
        kind: "yield_change",
        title: `Výnos po aktualizaci ${verb} z ${from.toFixed(1)} % na ${to.toFixed(1)} %.`,
        body: `„${t.label}“ — hodnota jen pokud ji dodal Majetio / váš vstup (ne inventovaný yield).`,
        createdAt: now.toISOString(),
        claimKind: t.sourceClaim === "DATA" ? "DATA" : "MODEL",
        magnitude: Math.abs(to - from),
        href: routes.investicniRentgen,
        severity: "notable",
      });
    }

    // --- Affordability vs passport ---
    if (handoff && t.kind === "property" && t.priceCzk != null) {
      const aff = evaluateAffordability({
        propertyId: t.id,
        priceCzk: t.priceCzk,
        passport: handoff,
        country: t.city ?? undefined,
      });
      if (aff.verdict === "above_budget") {
        out.push({
          id: alertId(t.id, "affordability", "over"),
          targetId: t.id,
          kind: "affordability",
          title: `„${t.label}“ je nad modelovým rozpočtem.`,
          body: aff.summary,
          createdAt: now.toISOString(),
          claimKind: aff.claimKind,
          magnitude: null,
          href: routes.financniPas,
          severity: "notable",
        });
      }
    }

    // --- Rate → payment change (needs lastObservedRate + current + price) ---
    if (
      t.kind === "property" &&
      t.priceCzk != null &&
      t.lastObservedRatePercent != null &&
      ctx.currentRatePercent != null &&
      Math.abs(ctx.currentRatePercent - t.lastObservedRatePercent) >= 0.15
    ) {
      const equity = ctx.doc?.assets.totalOwnFundsModel ?? 0;
      const loan = Math.max(0, t.priceCzk - equity);
      if (loan > 100_000) {
        const term = 30;
        const oldPay = calculateAnnuityPayment(
          loan,
          t.lastObservedRatePercent,
          term
        );
        const newPay = calculateAnnuityPayment(
          loan,
          ctx.currentRatePercent,
          term
        );
        const delta = Math.round(newPay - oldPay);
        if (Math.abs(delta) >= 500) {
          const down = delta < 0;
          out.push({
            id: alertId(
              t.id,
              "rate_payment_change",
              String(ctx.currentRatePercent)
            ),
            targetId: t.id,
            kind: "rate_payment_change",
            title: down
              ? `Při nové sazbě se měsíční splátka snížila o ${fmtCzk(Math.abs(delta))}.`
              : `Při nové sazbě se měsíční splátka zvýšila o ${fmtCzk(Math.abs(delta))}.`,
            body: `Modelová anuita na úvěru ${fmtCzk(loan)}: ${t.lastObservedRatePercent.toFixed(2)} % → ${ctx.currentRatePercent.toFixed(2)} % (MODEL, ne nabídka banky).`,
            createdAt: now.toISOString(),
            claimKind: "MODEL",
            magnitude: Math.abs(delta),
            href: routes.kalkulacky.root,
            severity: Math.abs(delta) >= 1500 ? "important" : "notable",
          });
        }
      }
    }

    // --- Filter criteria: property score below min (only if score known) ---
    if (
      t.minScore != null &&
      t.score != null &&
      t.score < t.minScore
    ) {
      out.push({
        id: alertId(t.id, "new_risk", `score_${t.score}`),
        targetId: t.id,
        kind: "new_risk",
        title: `Skóre ${t.score} kleslo pod váš práh ${t.minScore}.`,
        body: `„${t.label}“ — skóre jen pokud je doložené (ne inventované).`,
        createdAt: now.toISOString(),
        claimKind: "MODEL",
        magnitude: t.minScore - t.score,
        href: routes.investicniRentgen,
        severity: "notable",
      });
    }

    // similar_listing intentionally NOT generated without Majetio payload
  }

  return out;
}

/**
 * After emitting rate alerts, stamp current rate onto property targets.
 */
export function stampObservedRates(
  targets: WatchTarget[],
  currentRatePercent: number | null,
  now: Date = new Date()
): WatchTarget[] {
  if (currentRatePercent == null) return targets;
  return targets.map((t) =>
    t.kind === "property"
      ? {
          ...t,
          lastObservedRatePercent: currentRatePercent,
          lastObservedAt: now.toISOString(),
        }
      : t
  );
}
