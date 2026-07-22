/**
 * Investiční rentgen — produkční konfigurace premium vrstvy.
 * SLA a aktivita produktu jen z env — žádné hardcoded sliby dodání.
 */

import { isPaidAnalysisCommerciallyAvailable } from "@/lib/legal/operator";
import {
  PROPERTY_ANALYSIS_PRICING,
  type PropertyAnalysisPricing,
} from "@/lib/property-rentgen/pricing";

export type RentgenPremiumStatus = "preparing" | "active";

export type RentgenPremiumConfig = {
  status: RentgenPremiumStatus;
  statusLabel: string;
  commerciallyActive: boolean;
  checkoutMode: "interest_only" | "checkout";
  productName: string;
  priceCzk: number;
  /** Co zákazník reálně dostane — jen když active; jinak plánovaný rozsah */
  deliverables: string[];
  deliverySla: {
    configured: boolean;
    label: string | null;
    note: string;
  };
  isNot: string[];
};

function envInt(key: string): number | null {
  if (typeof process === "undefined") return null;
  const raw = process.env[key]?.trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

function envLabel(key: string): string | null {
  if (typeof process === "undefined") return null;
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : null;
}

const PREMIUM_DELIVERABLES: string[] = [
  "Executive summary a property overview z vašich vstupů",
  "Srovnání s modelovým trhem (kde máme referenční data)",
  "Analýza ceny / m² a rental model",
  "Cash-flow a financing scénáře (automatizovaný model)",
  "Stress test sazby a neobsazenosti",
  "Likviditní riziko lokality (orientační)",
  "Právní / dokumentační checklist otázek — ne právní posudek",
  "Red flags a data quality sekce",
  "Final decision framework — orientace, ne investiční doporučení",
  "Elektronický report (PDF / export podle aktivní verze produktu)",
];

function buildDeliverySla(active: boolean): RentgenPremiumConfig["deliverySla"] {
  const labelOverride = envLabel("NEXT_PUBLIC_RENTGEN_PREMIUM_SLA_LABEL");
  const days = envInt("NEXT_PUBLIC_RENTGEN_PREMIUM_SLA_DAYS");

  if (labelOverride) {
    return {
      configured: true,
      label: labelOverride,
      note: active
        ? "Termín dodání dle aktuální produkční konfigurace — potvrzení e-mailem."
        : "Plánovaný SLA — produkt zatím není v prodeji.",
    };
  }

  if (days != null) {
    const label = `${days} kalendářních dnů od potvrzení rozsahu a podkladů`;
    return {
      configured: true,
      label,
      note: active
        ? "Konfigurovatelné SLA — finální termín potvrdíme při objednávce."
        : "Plánovaný SLA — zobrazuje se jen jako orientace před spuštěním.",
    };
  }

  return {
    configured: false,
    label: null,
    note: active
      ? "Termín dodání upřesníme individuálně při potvrzení objednávky — není hardcoded slib."
      : "Připravujeme — SLA zveřejníme před spuštěním prodeje.",
  };
}

export function getRentgenPremiumConfig(
  pricing: PropertyAnalysisPricing = PROPERTY_ANALYSIS_PRICING
): RentgenPremiumConfig {
  const commerciallyActive = isPaidAnalysisCommerciallyAvailable();
  const status: RentgenPremiumStatus = commerciallyActive ? "active" : "preparing";

  return {
    status,
    statusLabel: commerciallyActive ? "Aktivní produkt" : "Připravujeme",
    commerciallyActive,
    checkoutMode: commerciallyActive ? "checkout" : "interest_only",
    productName: pricing.productName,
    priceCzk: pricing.amountCzk,
    deliverables: PREMIUM_DELIVERABLES,
    deliverySla: buildDeliverySla(commerciallyActive),
    isNot: [...pricing.isNot],
  };
}
