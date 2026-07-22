/**
 * Mortgage regulation engine — types (PROMPT 4).
 * Orientační regulační/modelový rámec — NENÍ bankovní approval.
 */

export type RegulationCountry = "cz";

export type RegulationPurpose =
  | "owner_occupied"
  | "investment"
  | "additional_residential";

export type ApplicantType = "individual" | "joint" | "unknown";

export type IndicatorStatus =
  | "deactivated"
  | "recommended_limit"
  | "not_applicable"
  | "unknown";

export type RegulationRuleType =
  | "CNB_RECOMMENDATION"
  | "MODEL_FALLBACK"
  | "UNSUPPORTED_JURISDICTION";

export type MortgageRegulationInput = {
  country: RegulationCountry | string;
  purpose: RegulationPurpose;
  /** null / undefined = věk neznámý — NIKDY neaplikovat young LTV boost */
  age: number | null | undefined;
  /** Počet již vlastněných obytných nemovitostí (bez kupované). null = neznámé */
  numberOfOwnedResidentialProperties: number | null | undefined;
  /** Explicitní investiční účel (pronájem / spekulace) */
  investmentPurpose: boolean | null | undefined;
  applicantType: ApplicantType;
  /** ISO date YYYY-MM-DD — rozhodné datum pravidel */
  effectiveDate: string;
};

export type MortgageRegulationResult = {
  maxLtv: number;
  dtiStatus: IndicatorStatus;
  dstiStatus: IndicatorStatus;
  /** Doporučený strop DTI, pokud status = recommended_limit */
  dtiLimit: number | null;
  ruleType: RegulationRuleType;
  source: string;
  sourceUrl: string | null;
  verifiedAt: string;
  explanation: string;
  assumptions: string[];
  /** Klasifikace bucketu po vyhodnocení vstupů */
  appliedBucket: "owner_occupied" | "investment";
  /** Young LTV boost byl skutečně použit */
  youngLtvApplied: boolean;
  /** Veřejný disclaimer */
  frameworkDisclaimer: string;
};

export const REGULATION_FRAMEWORK_DISCLAIMER =
  "Orientační regulační / modelový rámec podle doporučení ČNB — nejde o schválení úvěru bankou ani o závazný limit pro konkrétní žádost.";

export const AGE_PURPOSE_DEPENDENCY_NOTICE =
  "Výsledek závisí na věku a účelu financování.";
