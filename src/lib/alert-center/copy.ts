import { getRecommendedMaxLtv } from "@/lib/cnb-limits";
import type { MortgagePurpose } from "@/lib/cnb-limits";
import {
  buildFingerprint,
  ltvScopeKey,
  rateChangeKey,
} from "@/lib/alert-center/dedupe";
import type { AlertAction, CentralAlert } from "@/lib/alert-center/types";

function fmtPct(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

function fmtPpb(delta: number): string {
  const abs = Math.abs(delta * 100);
  const dir = delta < 0 ? "snížila" : "zvýšila";
  return `${dir} o ${abs.toFixed(2).replace(".", ",")} p.b.`;
}

/** Specific rate alert — never generic „Sazby klesly“. */
export function buildLtvRateChangeAlert(input: {
  previousRate: number;
  currentRate: number;
  ltvPercent: number;
  purpose: MortgagePurpose;
  action: AlertAction;
  fetchedAt: string | null;
  now?: Date;
}): CentralAlert | null {
  const delta = input.currentRate - input.previousRate;
  if (Math.abs(delta) < 0.05) return null;

  const now = input.now ?? new Date();
  const maxLtv = getRecommendedMaxLtv(input.purpose);
  const ltvLabel =
    input.ltvPercent <= maxLtv
      ? `LTV do ${Math.round(input.ltvPercent)} %`
      : `LTV ${Math.round(input.ltvPercent)} % (nad doporučených ${maxLtv} %)`;

  const down = delta < 0;
  const expiresAt = new Date(now.getTime() + 14 * 86_400_000).toISOString();

  return {
    id: `ac_rate_${rateChangeKey(input.previousRate, input.currentRate)}_${ltvScopeKey(input.ltvPercent)}`,
    type: "RATE_CHANGE",
    severity: Math.abs(delta) >= 0.25 ? "important" : "notable",
    priority: down ? 2 : 3,
    title: `Referenční sazba u profilu ${ltvLabel} ${fmtPpb(delta)}`,
    reason: `Agregovaná sazba s pojištěním: ${fmtPct(input.previousRate)} % → ${fmtPct(input.currentRate)} % (LIVE bank_rates).`,
    action: input.action,
    expiresAt,
    dataSource: {
      module: "src/lib/rates.ts + supabase:bank_rates",
      recordId: "rate.cz.market.aggregate",
      claimKind: "DATA",
      status: "LIVE",
      fetchedAt: input.fetchedAt,
    },
    whyExplanation: `Sledujeme změnu referenční sazby v pásmu odpovídajícím vašemu modelovému LTV (~${Math.round(input.ltvPercent)} %) a záměru ${input.purpose === "investment" ? "investice" : "vlastní bydlení"}. Alert není individuální nabídka banky.`,
    fingerprint: buildFingerprint(
      "RATE_CHANGE",
      ltvScopeKey(input.ltvPercent),
      rateChangeKey(input.previousRate, input.currentRate)
    ),
    createdAt: now.toISOString(),
    readAt: null,
    dismissedAt: null,
  };
}

export function buildFixationAlert(input: {
  monthsLeft: number;
  lender: string;
  currentPaymentCzk: number;
  modelPaymentCzk: number;
  marketRate: number;
  loanId: string;
  action: AlertAction;
  now?: Date;
}): CentralAlert {
  const now = input.now ?? new Date();
  const fmt = (n: number) =>
    new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
      maximumFractionDigits: 0,
    }).format(n);

  return {
    id: `ac_fix_m${input.monthsLeft}_${input.loanId}`,
    type: "FIXATION",
    severity: input.monthsLeft <= 3 ? "critical" : "important",
    priority: input.monthsLeft <= 3 ? 1 : 2,
    title: `${input.monthsLeft} ${input.monthsLeft === 1 ? "měsíc" : input.monthsLeft < 5 ? "měsíce" : "měsíců"} do konce fixace u ${input.lender || "vaší banky"}`,
    reason: `Při referenční sazbě ${input.marketRate.toFixed(2).replace(".", ",")} % by modelová splátka mohla být ${fmt(input.modelPaymentCzk)} (nyní ${fmt(input.currentPaymentCzk)}).`,
    action: input.action,
    expiresAt: new Date(now.getTime() + input.monthsLeft * 30 * 86_400_000).toISOString(),
    dataSource: {
      module: "src/lib/refinance-radar/alerts.ts",
      recordId: input.loanId,
      claimKind: "MODEL",
      status: "LIVE",
      fetchedAt: now.toISOString(),
    },
    whyExplanation: `Máte uložený profil hypotéky s datem fixace. Alert je personalizovaný k vaší splátce — ne generické „sazby klesly“.`,
    fingerprint: buildFingerprint("FIXATION", input.loanId, `m${input.monthsLeft}`),
    createdAt: now.toISOString(),
    readAt: null,
    dismissedAt: null,
  };
}

export function buildPropertyPriceAlert(input: {
  label: string;
  targetId: string;
  previousCzk: number;
  currentCzk: number;
  action: AlertAction;
  claimKind: CentralAlert["dataSource"]["claimKind"];
  now?: Date;
}): CentralAlert {
  const now = input.now ?? new Date();
  const delta = input.currentCzk - input.previousCzk;
  const drop = delta < 0;
  const abs = Math.abs(delta);
  const fmt = (n: number) =>
    new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
      maximumFractionDigits: 0,
    }).format(n);

  return {
    id: `ac_price_${input.targetId}_${input.currentCzk}`,
    type: "PROPERTY_PRICE_CHANGE",
    severity: drop && abs >= 200_000 ? "important" : "notable",
    priority: drop ? 2 : 3,
    title: drop
      ? `„${input.label}“ — cena klesla o ${fmt(abs)}`
      : `„${input.label}“ — cena vzrostla o ${fmt(abs)}`,
    reason: `${fmt(input.previousCzk)} → ${fmt(input.currentCzk)} (pozorovaná cena ze sledování).`,
    action: input.action,
    expiresAt: new Date(now.getTime() + 7 * 86_400_000).toISOString(),
    dataSource: {
      module: "src/lib/watchlist/alerts.ts",
      recordId: input.targetId,
      claimKind: input.claimKind,
      status: input.claimKind === "DATA" ? "LIVE" : "MODELLED",
      fetchedAt: now.toISOString(),
    },
    whyExplanation: `Sledujete tuto nemovitost ve watchlistu a zaznamenali jsme změnu pozorované ceny ≥ 50 000 Kč.`,
    fingerprint: buildFingerprint(
      "PROPERTY_PRICE_CHANGE",
      input.targetId,
      `price_${input.currentCzk}`
    ),
    createdAt: now.toISOString(),
    readAt: null,
    dismissedAt: null,
  };
}

export function buildDocumentExpiryAlert(input: {
  documentId: string;
  label: string;
  expiresAt: string;
  daysUntil: number;
  action: AlertAction;
  now?: Date;
}): CentralAlert {
  const now = input.now ?? new Date();
  const urgent = input.daysUntil <= 7;

  return {
    id: `ac_doc_exp_${input.documentId}`,
    type: "DOCUMENT_EXPIRY",
    severity: urgent ? "critical" : "important",
    priority: urgent ? 1 : 2,
    title: urgent
      ? `„${input.label}“ expiruje za ${input.daysUntil} ${input.daysUntil === 1 ? "den" : input.daysUntil < 5 ? "dny" : "dní"}`
      : `„${input.label}“ brzy expiruje (${input.daysUntil} dní)`,
    reason: `Datum platnosti: ${new Date(input.expiresAt).toLocaleDateString("cs-CZ")}.`,
    action: input.action,
    expiresAt: input.expiresAt,
    dataSource: {
      module: "src/lib/document-vault/extraction.ts",
      recordId: input.documentId,
      claimKind: "DATA",
      status: "VERIFIED",
      fetchedAt: now.toISOString(),
    },
    whyExplanation: `Dokument je ve vašem Document Vault s vyplněnou expirací. AI extrakce nebo ruční zadání — ne právní závěr o platnosti.`,
    fingerprint: buildFingerprint(
      "DOCUMENT_EXPIRY",
      input.documentId,
      input.expiresAt.slice(0, 10)
    ),
    createdAt: now.toISOString(),
    readAt: null,
    dismissedAt: null,
  };
}

export function buildRegulatoryAlert(input: {
  entryId: string;
  title: string;
  summary: string;
  effectiveDate: string;
  action: AlertAction;
  now?: Date;
}): CentralAlert {
  const now = input.now ?? new Date();

  return {
    id: `ac_reg_${input.entryId}`,
    type: "REGULATORY_CHANGE",
    severity: "important",
    priority: 2,
    title: input.title,
    reason: input.summary,
    action: input.action,
    expiresAt: new Date(Date.parse(input.effectiveDate) + 180 * 86_400_000).toISOString(),
    dataSource: {
      module: "src/lib/market-pulse/regulatory-changelog.ts",
      recordId: input.entryId,
      claimKind: "DATA",
      status: "VERIFIED",
      fetchedAt: now.toISOString(),
    },
    whyExplanation: `Sledujete trh CZ / máte aktivní hypoteční profil — regulační změna může ovlivnit LTV/DTI rámec. Editorial + VERIFIED ČNB záznamy.`,
    fingerprint: buildFingerprint("REGULATORY_CHANGE", "cz", input.entryId),
    createdAt: now.toISOString(),
    readAt: null,
    dismissedAt: null,
  };
}

export function buildDealTaskAlert(input: {
  taskId: string;
  dealId: string;
  title: string;
  dueAt: string | null;
  overdue: boolean;
  action: AlertAction;
  now?: Date;
}): CentralAlert {
  const now = input.now ?? new Date();

  return {
    id: `ac_deal_${input.dealId}_${input.taskId}`,
    type: "DEAL_TASK",
    severity: input.overdue ? "critical" : "notable",
    priority: input.overdue ? 1 : 3,
    title: input.overdue
      ? `Úkol po termínu: ${input.title}`
      : `Úkol v Deal Room: ${input.title}`,
    reason: input.dueAt
      ? `Termín: ${new Date(input.dueAt).toLocaleDateString("cs-CZ")}.`
      : "Otevřený úkol ve workspace transakce.",
    action: input.action,
    expiresAt: input.dueAt,
    dataSource: {
      module: "src/lib/deal-room/types.ts",
      recordId: `${input.dealId}:${input.taskId}`,
      claimKind: "DATA",
      status: "LIVE",
      fetchedAt: now.toISOString(),
    },
    whyExplanation: `Máte aktivní Deal Room — úkol je přiřazen vaší transakci, ne obecná notifikace.`,
    fingerprint: buildFingerprint("DEAL_TASK", input.dealId, input.taskId),
    createdAt: now.toISOString(),
    readAt: null,
    dismissedAt: null,
  };
}

export function buildPortfolioRiskAlert(input: {
  alertId: string;
  headline: string;
  explanation: string;
  action: AlertAction;
  now?: Date;
}): CentralAlert {
  const now = input.now ?? new Date();

  return {
    id: `ac_portfolio_${input.alertId}`,
    type: "PORTFOLIO_RISK",
    severity: "important",
    priority: 2,
    title: input.headline,
    reason: input.explanation,
    action: input.action,
    expiresAt: new Date(now.getTime() + 30 * 86_400_000).toISOString(),
    dataSource: {
      module: "src/lib/portfolio-os/concentration.ts",
      recordId: input.alertId,
      claimKind: "MODEL",
      status: "MODELLED",
      fetchedAt: now.toISOString(),
    },
    whyExplanation: `Máte nemovitosti v Portfolio OS — koncentrace nebo riziko vypočteno z vašich zadaných hodnot (MODEL).`,
    fingerprint: buildFingerprint("PORTFOLIO_RISK", "portfolio", input.alertId),
    createdAt: now.toISOString(),
    readAt: null,
    dismissedAt: null,
  };
}
