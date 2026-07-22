/**
 * MortgageRegulationEngine — PROMPT 4.
 * Česká logika v cz-rules.ts; UI jen zobrazuje výstup.
 */

import { resolveCzPeriod } from "@/lib/mortgage-regulation/cz-rules";
import {
  AGE_PURPOSE_DEPENDENCY_NOTICE,
  REGULATION_FRAMEWORK_DISCLAIMER,
  type MortgageRegulationInput,
  type MortgageRegulationResult,
} from "@/lib/mortgage-regulation/types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Klasifikace: investiční bucket při účelu investment / additional,
 * explicitním investmentPurpose, nebo 3.+ obytné (již ≥2 vlastněné).
 */
export function resolveAppliedBucket(
  input: Pick<
    MortgageRegulationInput,
    | "purpose"
    | "investmentPurpose"
    | "numberOfOwnedResidentialProperties"
  >
): "owner_occupied" | "investment" {
  if (input.purpose === "investment") return "investment";
  if (input.purpose === "additional_residential") return "investment";
  if (input.investmentPurpose === true) return "investment";
  const owned = input.numberOfOwnedResidentialProperties;
  if (owned != null && owned >= 2) return "investment";
  return "owner_occupied";
}

function isAgeKnown(age: number | null | undefined): age is number {
  return typeof age === "number" && Number.isFinite(age) && age > 0;
}

export function evaluateMortgageRegulation(
  raw: MortgageRegulationInput
): MortgageRegulationResult {
  const effectiveDate = (raw.effectiveDate || todayIso()).slice(0, 10);
  const assumptions: string[] = [
    AGE_PURPOSE_DEPENDENCY_NOTICE,
    REGULATION_FRAMEWORK_DISCLAIMER,
  ];

  if (raw.country !== "cz") {
    assumptions.push("unsupported_jurisdiction_fallback_cz_not_applied");
    return {
      maxLtv: 0,
      dtiStatus: "unknown",
      dstiStatus: "unknown",
      dtiLimit: null,
      ruleType: "UNSUPPORTED_JURISDICTION",
      source: "MortgageRegulationEngine — jurisdikce mimo SoT",
      sourceUrl: null,
      verifiedAt: todayIso(),
      explanation:
        "Pro tuto zemi nemáme v engine ověřená makroobezřetnostní pravidla. LTV strop se neaplikuje jako univerzální číslo.",
      assumptions,
      appliedBucket: "owner_occupied",
      youngLtvApplied: false,
      frameworkDisclaimer: REGULATION_FRAMEWORK_DISCLAIMER,
    };
  }

  const period = resolveCzPeriod(effectiveDate);
  const bucket = resolveAppliedBucket(raw);
  assumptions.push(`regulation_period:${period.id}`);
  assumptions.push(`applied_bucket:${bucket}`);
  assumptions.push(`effective_date:${effectiveDate}`);

  if (bucket === "investment") {
    if (raw.purpose === "additional_residential") {
      assumptions.push("bucket_from_additional_residential_purpose");
    }
    if (raw.investmentPurpose === true) {
      assumptions.push("bucket_from_investment_purpose_flag");
    }
    if (
      raw.numberOfOwnedResidentialProperties != null &&
      raw.numberOfOwnedResidentialProperties >= 2
    ) {
      assumptions.push("bucket_from_third_plus_residential");
    }

    const inv = period.investment;
    return {
      maxLtv: inv.ltvMax,
      dtiStatus: inv.dtiStatus,
      dstiStatus: inv.dstiStatus,
      dtiLimit: inv.dtiMax,
      ruleType: "CNB_RECOMMENDATION",
      source: period.source,
      sourceUrl: period.sourceUrl,
      verifiedAt: period.verifiedAt,
      explanation: [
        `Investiční / další obytné nemovitosti: orientační max. LTV ${inv.ltvMax} %.`,
        inv.dtiStatus === "recommended_limit" && inv.dtiMax != null
          ? `Doporučený limit DTI ${inv.dtiMax}.`
          : "DTI není v tomto období modelován jako plošný doporučený strop.",
        "DSTI není plošně povinný limit ČNB.",
        AGE_PURPOSE_DEPENDENCY_NOTICE,
      ].join(" "),
      assumptions,
      appliedBucket: "investment",
      youngLtvApplied: false,
      frameworkDisclaimer: REGULATION_FRAMEWORK_DISCLAIMER,
    };
  }

  // —— vlastní bydlení ——
  const oo = period.ownerOccupied;
  const ageKnown = isAgeKnown(raw.age);
  const ageValue = ageKnown ? raw.age : null;

  if (!ageKnown || ageValue == null) {
    assumptions.push("age_unknown_no_young_ltv_boost");
    assumptions.push(`default_owner_ltv:${oo.ltvStandard}`);
    return {
      maxLtv: oo.ltvStandard,
      dtiStatus: oo.dtiStatus,
      dstiStatus: oo.dstiStatus,
      dtiLimit: null,
      ruleType: "CNB_RECOMMENDATION",
      source: period.source,
      sourceUrl: period.sourceUrl,
      verifiedAt: period.verifiedAt,
      explanation: [
        `Vlastní bydlení: bez známého věku se použije standardní orientační LTV ${oo.ltvStandard} % — nikoli zvýhodnění až ${oo.ltvYoungUnder36} % pro mladší žadatele.`,
        "DTI a DSTI u vlastního bydlení zůstávají deaktivované (banky mohou používat interně).",
        AGE_PURPOSE_DEPENDENCY_NOTICE,
      ].join(" "),
      assumptions,
      appliedBucket: "owner_occupied",
      youngLtvApplied: false,
      frameworkDisclaimer: REGULATION_FRAMEWORK_DISCLAIMER,
    };
  }

  const youngEligible = ageValue < oo.youngAgeExclusiveMax;
  if (youngEligible) {
    assumptions.push(
      `age_known:${ageValue}_young_ltv_${oo.ltvYoungUnder36}`
    );
    return {
      maxLtv: oo.ltvYoungUnder36,
      dtiStatus: oo.dtiStatus,
      dstiStatus: oo.dstiStatus,
      dtiLimit: null,
      ruleType: "CNB_RECOMMENDATION",
      source: period.source,
      sourceUrl: period.sourceUrl,
      verifiedAt: period.verifiedAt,
      explanation: [
        `Vlastní bydlení, věk ${ageValue} (< ${oo.youngAgeExclusiveMax}): orientační LTV až ${oo.ltvYoungUnder36} %.`,
        "DTI a DSTI deaktivované u vlastního bydlení.",
        AGE_PURPOSE_DEPENDENCY_NOTICE,
      ].join(" "),
      assumptions,
      appliedBucket: "owner_occupied",
      youngLtvApplied: true,
      frameworkDisclaimer: REGULATION_FRAMEWORK_DISCLAIMER,
    };
  }

  assumptions.push(`age_known:${ageValue}_standard_ltv_${oo.ltvStandard}`);
  return {
    maxLtv: oo.ltvStandard,
    dtiStatus: oo.dtiStatus,
    dstiStatus: oo.dstiStatus,
    dtiLimit: null,
    ruleType: "CNB_RECOMMENDATION",
    source: period.source,
    sourceUrl: period.sourceUrl,
    verifiedAt: period.verifiedAt,
    explanation: [
      `Vlastní bydlení, věk ${ageValue} (≥ ${oo.youngAgeExclusiveMax}): orientační LTV ${oo.ltvStandard} %.`,
      "DTI a DSTI deaktivované u vlastního bydlení.",
      AGE_PURPOSE_DEPENDENCY_NOTICE,
    ].join(" "),
    assumptions,
    appliedBucket: "owner_occupied",
    youngLtvApplied: false,
    frameworkDisclaimer: REGULATION_FRAMEWORK_DISCLAIMER,
  };
}

/** Zkratka pro běžné CZ volání s dnešním datem. */
export function evaluateCzMortgageRegulation(
  partial: Omit<MortgageRegulationInput, "country" | "effectiveDate"> & {
    effectiveDate?: string;
  }
): MortgageRegulationResult {
  return evaluateMortgageRegulation({
    country: "cz",
    effectiveDate: partial.effectiveDate ?? todayIso(),
    purpose: partial.purpose,
    age: partial.age,
    numberOfOwnedResidentialProperties:
      partial.numberOfOwnedResidentialProperties,
    investmentPurpose: partial.investmentPurpose,
    applicantType: partial.applicantType,
  });
}
