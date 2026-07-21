import type { CurrentRates } from "@/lib/rates";
import { routes } from "@/lib/routes";
import type { CentralAlert } from "@/lib/alert-center/types";
import {
  buildDealTaskAlert,
  buildDocumentExpiryAlert,
  buildFixationAlert,
  buildLtvRateChangeAlert,
  buildPortfolioRiskAlert,
  buildPropertyPriceAlert,
  buildRegulatoryAlert,
} from "@/lib/alert-center/copy";
import { buildFingerprint } from "@/lib/alert-center/dedupe";
import { calculateAnnuityPayment } from "@/lib/calculators";
import { DEMO_DEAL_ROOM_SEEDED } from "@/lib/deal-room/demo";
import type { DealRoomWorkspace } from "@/lib/deal-room/types";
import { DEMO_VAULT_DOCUMENTS } from "@/lib/document-vault/demo";
import { emptyVaultStore } from "@/lib/document-vault/types";
import type { DocumentVaultStore } from "@/lib/document-vault/types";
import { loadFinancialProfile } from "@/lib/financial-passport";
import { buildFinancialPassportDocument } from "@/lib/financial-passport/build";
import type { FinancialPassportDocument } from "@/lib/financial-passport/types";
import type { FinancialProfileAnswers } from "@/lib/financial-passport/types";
import { REGULATORY_CHANGELOG } from "@/lib/market-pulse/regulatory-changelog";
import { analyzeConcentration } from "@/lib/portfolio-os/concentration";
import type { PortfolioPropertyRow } from "@/lib/portfolio-os/types";
import { generateRefinanceAlerts } from "@/lib/refinance-radar/alerts";
import { DEMO_REFINANCE_PROFILE } from "@/lib/refinance-radar/demo";
import type { RefinanceLoanProfile } from "@/lib/refinance-radar/types";
import { monthsUntilFixation } from "@/lib/refinance-radar/calculate";
import { generateWatchAlertCandidates } from "@/lib/watchlist/alerts";
import type { WatchTarget } from "@/lib/watchlist/types";

export type AlertCollectContext = {
  rates: CurrentRates | null;
  previousRatePercent?: number | null;
  watchTargets?: WatchTarget[];
  refinanceProfile?: RefinanceLoanProfile | null;
  vaultStore?: DocumentVaultStore | null;
  dealRoom?: DealRoomWorkspace | null;
  portfolioRows?: PortfolioPropertyRow[];
  financialDoc?: FinancialPassportDocument | null;
  includeDemo?: boolean;
  now?: Date;
};

type ProfileLike = FinancialPassportDocument | FinancialProfileAnswers | null;

function estimateLtv(doc: ProfileLike): number {
  if (!doc) return 80;
  const price =
    "propertyGoals" in doc
      ? doc.propertyGoals.targetPrice ?? 5_000_000
      : doc.targetPrice ?? 5_000_000;
  const equity =
    "assets" in doc ? doc.assets.totalOwnFundsModel : doc.ownFunds ?? 0;
  if (price <= 0) return 80;
  return Math.min(95, Math.max(50, ((price - equity) / price) * 100));
}

function purposeFromDoc(doc: ProfileLike): "owner_occupied" | "investment" {
  if (!doc) return "owner_occupied";
  const intent =
    "propertyGoals" in doc
      ? doc.propertyGoals.purpose
      : doc.intent ?? null;
  return intent === "investment" ? "investment" : "owner_occupied";
}

export function collectRateChangeAlerts(ctx: AlertCollectContext): CentralAlert[] {
  const now = ctx.now ?? new Date();
  const current = ctx.rates?.rateWithInsurance ?? null;
  const previous = ctx.previousRatePercent ?? null;
  if (current == null || previous == null) return [];

  const profileAnswers = loadFinancialProfile();
  const doc = ctx.financialDoc ?? null;
  const alert = buildLtvRateChangeAlert({
    previousRate: previous,
    currentRate: current,
    ltvPercent: estimateLtv(doc ?? profileAnswers),
    purpose: purposeFromDoc(doc ?? profileAnswers),
    action: {
      label: "Přepočítat scénář",
      href: routes.kalkulacky.root,
    },
    fetchedAt: ctx.rates?.updatedAt ?? null,
    now,
  });
  return alert ? [alert] : [];
}

export function collectFixationAlerts(ctx: AlertCollectContext): CentralAlert[] {
  const now = ctx.now ?? new Date();
  const profile = ctx.refinanceProfile ?? DEMO_REFINANCE_PROFILE;
  const marketRate = ctx.rates?.rateWithInsurance ?? null;
  if (!profile.fixationEnd || marketRate == null) return [];

  const monthsLeft = monthsUntilFixation(profile.fixationEnd, now);
  if (monthsLeft == null || monthsLeft > 12) return [];

  const modelPay = Math.round(
    calculateAnnuityPayment(
      profile.loanBalanceCzk,
      marketRate,
      profile.newTermYears
    )
  );

  return [
    buildFixationAlert({
      monthsLeft,
      lender: profile.currentLender,
      currentPaymentCzk: profile.monthlyPaymentCzk,
      modelPaymentCzk: modelPay,
      marketRate,
      loanId: profile.id,
      action: { label: "Radar refinancování", href: routes.refinanceRadar },
      now,
    }),
  ];
}

export function collectWatchlistAlerts(ctx: AlertCollectContext): CentralAlert[] {
  const now = ctx.now ?? new Date();
  const targets = ctx.watchTargets ?? [];
  const profileAnswers = loadFinancialProfile();
  const passportDoc =
    ctx.financialDoc ??
    (profileAnswers
      ? buildFinancialPassportDocument(profileAnswers, ctx.rates?.rateWithInsurance ?? null)
      : null);
  const candidates = generateWatchAlertCandidates({
    targets,
    currentRatePercent: ctx.rates?.rateWithInsurance ?? null,
    doc: passportDoc,
    now,
  });

  const out: CentralAlert[] = [];

  for (const c of candidates) {
    if (c.kind === "price_drop" || c.kind === "price_rise") {
      const t = targets.find((x) => x.id === c.targetId);
      if (t?.priceCzk != null && t.previousPriceCzk != null) {
        out.push(
          buildPropertyPriceAlert({
            label: t.label,
            targetId: t.id,
            previousCzk: t.previousPriceCzk,
            currentCzk: t.priceCzk,
            action: { label: "Sledování", href: routes.sledovani },
            claimKind: c.claimKind,
            now,
          })
        );
      }
    }

    if (c.kind === "similar_listing" || c.kind === "filter_match") {
      out.push({
        id: `ac_match_${c.id}`,
        type: "NEW_PROPERTY_MATCH",
        severity: "notable",
        priority: 3,
        title: c.title,
        reason: c.body,
        action: { label: "Zobrazit shodu", href: c.href ?? routes.sledovani },
        expiresAt: new Date(now.getTime() + 14 * 86_400_000).toISOString(),
        dataSource: {
          module: "Sledované nemovitosti",
          recordId: c.targetId,
          claimKind: c.claimKind,
          status: "LIVE",
          fetchedAt: now.toISOString(),
        },
        whyExplanation: `Shoda vznikla z vašich filtrů sledování nebo propojení nabídek — ne generický marketing.`,
        fingerprint: buildFingerprint("NEW_PROPERTY_MATCH", c.targetId, c.kind),
        createdAt: now.toISOString(),
        readAt: null,
        dismissedAt: null,
      });
    }
  }

  return out;
}

export function collectDocumentAlerts(ctx: AlertCollectContext): CentralAlert[] {
  const now = ctx.now ?? new Date();
  const store =
    ctx.vaultStore ??
    (ctx.includeDemo !== false
      ? { ...emptyVaultStore(), documents: DEMO_VAULT_DOCUMENTS }
      : null);
  if (!store) return [];

  const out: CentralAlert[] = [];
  for (const doc of store.documents) {
    if (!doc.expiresAt) continue;
    const exp = Date.parse(doc.expiresAt);
    if (!Number.isFinite(exp)) continue;
    const daysUntil = Math.ceil((exp - now.getTime()) / 86_400_000);
    if (daysUntil > 30 || daysUntil < 0) continue;

    out.push(
      buildDocumentExpiryAlert({
        documentId: doc.id,
        label: doc.label,
        expiresAt: doc.expiresAt,
        daysUntil,
        action: { label: "Dokumentový trezor", href: routes.documentVault },
        now,
      })
    );
  }
  return out;
}

export function collectRegulatoryAlerts(ctx: AlertCollectContext): CentralAlert[] {
  const now = ctx.now ?? new Date();
  const recent = REGULATORY_CHANGELOG.filter((e) => {
    const age = now.getTime() - Date.parse(e.effectiveDate);
    return age >= 0 && age < 180 * 86_400_000;
  }).slice(0, 3);

  return recent.map((e) =>
    buildRegulatoryAlert({
      entryId: e.id,
      title: e.title,
      summary: e.summary,
      effectiveDate: e.effectiveDate,
      action: { label: "Tržní puls", href: routes.marketPulse },
      now,
    })
  );
}

export function collectDealTaskAlerts(ctx: AlertCollectContext): CentralAlert[] {
  const now = ctx.now ?? new Date();
  const workspace = ctx.dealRoom ?? (ctx.includeDemo !== false ? DEMO_DEAL_ROOM_SEEDED : null);
  if (!workspace) return [];

  return workspace.tasks
    .filter((t) => !t.done)
    .map((t) => {
      const overdue =
        t.dueAt != null && Date.parse(t.dueAt) < now.getTime();
      return buildDealTaskAlert({
        taskId: t.id,
        dealId: workspace.id,
        title: t.title,
        dueAt: t.dueAt,
        overdue,
        action: {
          label: "Transakční místnost",
          href: `${routes.dealRoom}/${workspace.id}`,
        },
        now,
      });
    });
}

export function collectPortfolioAlerts(ctx: AlertCollectContext): CentralAlert[] {
  const rows = ctx.portfolioRows ?? [];
  if (rows.length === 0) return [];

  return analyzeConcentration({ rows, rentCurrencyByTwinId: {} }).map((a) =>
    buildPortfolioRiskAlert({
      alertId: a.id,
      headline: a.headline,
      explanation: a.explanation,
      action: { label: "Správa portfolia", href: routes.portfolio },
    })
  );
}

export function collectRentReviewAlerts(_ctx: AlertCollectContext): CentralAlert[] {
  /** RENT_REVIEW vyžaduje lastRentReviewAt v Portfolio OS — zatím bez pole. */
  return [];
}

export function collectAllAlertCandidates(ctx: AlertCollectContext): CentralAlert[] {
  return [
    ...collectRateChangeAlerts(ctx),
    ...collectWatchlistAlerts(ctx),
    ...collectDocumentAlerts(ctx),
    ...collectRegulatoryAlerts(ctx),
    ...collectDealTaskAlerts(ctx),
    ...collectPortfolioAlerts(ctx),
    ...collectRentReviewAlerts(ctx),
  ];
}

/** Refinance radar milestones as FIXATION type (deduped separately) */
export function collectRefinanceRadarAlerts(ctx: AlertCollectContext): CentralAlert[] {
  const profile = ctx.refinanceProfile ?? DEMO_REFINANCE_PROFILE;
  const { alerts } = generateRefinanceAlerts({
    profile,
    marketRatePercent: ctx.rates?.rateWithInsurance ?? null,
    emittedMilestones: {},
    now: ctx.now,
  });

  return alerts.map((a) => ({
    id: `ac_rr_${a.id}`,
    type: "FIXATION" as const,
    severity: a.milestoneMonths != null && a.milestoneMonths <= 3 ? "critical" : "important",
    priority: (a.milestoneMonths != null && a.milestoneMonths <= 3 ? 1 : 2) as 1 | 2,
    title: a.title,
    reason: a.body,
    action: { label: "Radar refinancování", href: routes.refinanceRadar },
    expiresAt: null,
    dataSource: {
      module: "Hlídač refinancování",
      recordId: profile.id,
      claimKind: a.claimKind,
      status: "LIVE",
      fetchedAt: ctx.now?.toISOString() ?? new Date().toISOString(),
    },
    whyExplanation: `Personalizovaný alert k vaší fixaci a splátce — ne obecné „sazby klesly“.`,
    fingerprint: buildFingerprint("FIXATION", profile.id, `rr_${a.milestoneMonths}`),
    createdAt: a.createdAt,
    readAt: null,
    dismissedAt: null,
  }));
}
