/**
 * Centrální regulatorní a informační texty (CS / EN).
 * Jediný zdroj pravdy — UI nesmí parafrázovat licence ani oprávnění jinak.
 *
 * INTERMEDIARY_PENDING_MARKER je pouze pro testy / interní audit — nikdy ve veřejném HTML.
 */

import { getLegalIdentityConfig, legalOperator } from "@/config/legal";
import type { Locale } from "@/lib/i18n/config";
import {
  getPrimaryMortgagePartner,
  isMortgagePartnerIdentityVerified,
} from "@/lib/legal/partner-config";
import { getValidatedPartnerEnv } from "@/lib/legal/partner-env-validation";

export const JERRS_REGISTRY_INTRO_URL = {
  cs: "https://jerrs.cnb.cz/apljerrsdad/JERRS.WEB07.INTRO_PAGE?p_lang=cz",
  en: "https://jerrs.cnb.cz/apljerrsdad/JERRS.WEB07.INTRO_PAGE?p_lang=en",
} as const;

/** Interní marker — nesmí se renderovat ve veřejném UI. */
export const INTERMEDIARY_PENDING_MARKER = {
  cs: "[ověřený právní subjekt — k právnímu schválení]",
  en: "[verified legal entity — pending legal approval]",
} as const;

/** Bezpečný veřejný fallback bez neověřeného zprostředkovatele. */
export const PLATFORM_NEUTRAL_FALLBACK = {
  cs: "Hypotéka Jasně je informační a kontaktní platforma. Konečné podmínky úvěru stanoví banka po individuálním posouzení.",
  en: "Hypotéka Jasně is an information and contact platform. Final loan terms are determined by the bank following an individual assessment.",
} as const;

export const CALCULATOR_DISCLAIMER = {
  cs: "Výpočet je orientační a nepředstavuje nabídku úvěru ani úvěrové doporučení. Konečné podmínky stanoví banka po individuálním posouzení.",
  en: "The calculation is indicative and does not constitute a loan offer or credit recommendation. Final terms are set by the bank after individual assessment.",
} as const;

export const RATES_DISCLAIMER = {
  cs: "Uvedené sazby jsou orientační, vycházejí z veřejně dostupných informací bank a mohou být podmíněny dalšími službami nebo individuálním posouzením.",
  en: "The rates shown are indicative, based on publicly available bank information, and may be subject to additional services or individual assessment.",
} as const;

export const BANK_RATE_PAYMENT_NOTE = {
  cs: "Nezahrnuje individuální posouzení banky, poplatky ani pojištění, pokud nejsou součástí uvedené sazby.",
  en: "Excludes the bank's individual assessment, fees and insurance unless included in the quoted rate.",
} as const;

export const CNB_INVESTMENT_RECOMMENDATION_TITLE = {
  cs: "Doporučení ČNB pro investiční hypotéky",
  en: "CNB recommendations for investment mortgages",
} as const;

export const CNB_OWNER_OCCUPIED_TITLE = {
  cs: "Rámec pro vlastní bydlení",
  en: "Owner-occupied housing framework",
} as const;

export const CNB_INVESTMENT_RECOMMENDATION_BODY = {
  cs: "ČNB doporučuje poskytovatelům u definovaných investičních hypoték obezřetnější horní hranici LTV 70 % a DTI 7, s účinností doporučení od 1. dubna 2026.",
  en: "The CNB recommends that providers apply a more prudent upper limit of LTV 70% and DTI 7 for defined investment mortgages, effective from 1 April 2026.",
} as const;

export const CNB_OWNER_OCCUPIED_BODY = {
  cs: "U vlastního bydlení ČNB ponechává horní hranici LTV 80 % (u žadatelů mladších 36 let až 90 % při splnění příslušných podmínek). Ukazatele DTI a DSTI u standardního vlastního bydlení zůstávají deaktivované — banky je mohou používat interně, nejde o plošně povinné limity.",
  en: "For owner-occupied housing the CNB maintains an upper LTV limit of 80% (up to 90% for applicants under 36 when applicable conditions are met). DTI and DSTI indicators for standard owner-occupied loans remain deactivated — banks may use them internally; they are not blanket mandatory limits.",
} as const;

export const CNB_PURPOSE_DISTINCTION = {
  cs: "Doporučení pro investiční hypotéky se liší od rámce pro vlastní bydlení — stejné hodnoty neplatí pro všechny žadatele.",
  en: "Recommendations for investment mortgages differ from the owner-occupied framework — the same values do not apply to every applicant.",
} as const;

export const CNB_INVESTMENT_SOURCE_URL =
  "https://www.cnb.cz/cs/cnb-news/tiskove-zpravy/CNB-doporucuje-prisnejsi-limity-pro-investicni-hypoteky.-Kapitalove-rezervy-se-nemeni/" as const;

/** Neutrální spolupráce — bez jména třetí strany a bez tvrzení o licenci. */
export const COOPERATION_NEUTRAL = {
  cs: `${legalOperator.companyName.replace(/[.!?…]+$/, "")} provozuje platformu ${legalOperator.brand}. V oblasti hypoteček může spolupracovat s dalšími subjekty — podrobnosti uvádíme po ověření.`,
  en: `${legalOperator.companyName.replace(/[.!?…]+$/, "")} operates the ${legalOperator.brand} platform. In mortgage-related matters it may cooperate with other entities — we publish details only after verification.`,
} as const;

export const PLATFORM_OPERATOR_LINE = {
  cs: `${legalOperator.brand} je informační a kontaktní platforma provozovaná společností ${legalOperator.companyName.replace(/[.!?…]+$/, "")}.`,
  en: `${legalOperator.brand} is an information and contact platform operated by ${legalOperator.companyName.replace(/[.!?…]+$/, "")}.`,
} as const;

export const FORM_DATA_RECIPIENT_NOTE = {
  cs: "Údaje z úvodního formuláře nepředáváme třetím stranám, pokud k tomu nedáte samostatný souhlas s konkrétním příjemcem.",
  en: "We do not pass initial form data to third parties unless you separately consent to a named recipient.",
} as const;

export const NO_REGULATED_ADVICE = {
  cs: "Neposkytujeme regulované investiční poradenství, daňové poradenství ani nezávislé finanční poradenství.",
  en: "We do not provide regulated investment advice, tax advice, or independent financial advice.",
} as const;

export type IntermediarySubject = {
  label: string;
  legalApprovalStatus: "verified" | "neutral_fallback";
};

export type RegulatoryPlatformBlock = {
  platformLine: string;
  intermediaryLine: string | null;
  jerrsLeadIn: string | null;
  showJerrsLink: boolean;
  intermediary: IntermediarySubject;
  usesVerifiedIntermediary: boolean;
};

function legalNameInline(name: string): string {
  return name.trim().replace(/[.!?…]+$/, "");
}

export function rt(locale: Locale, block: Record<Locale, string>): string {
  return block[locale];
}

export function getCalculatorDisclaimer(locale: Locale = "cs"): string {
  return rt(locale, CALCULATOR_DISCLAIMER);
}

export function getRatesDisclaimer(locale: Locale = "cs"): string {
  return rt(locale, RATES_DISCLAIMER);
}

export function getJerrsRegistryUrl(locale: Locale = "cs"): string {
  return JERRS_REGISTRY_INTRO_URL[locale];
}

export function isPartnerConfigPubliclyVerified(): boolean {
  const envValid = getValidatedPartnerEnv().valid;
  if (!envValid) return false;
  return isMortgagePartnerIdentityVerified(getPrimaryMortgagePartner());
}

export function resolveIntermediarySubject(
  locale: Locale = "cs"
): IntermediarySubject {
  const partner = getPrimaryMortgagePartner();
  if (isPartnerConfigPubliclyVerified() && partner.legalName) {
    return {
      label: partner.legalName,
      legalApprovalStatus: "verified",
    };
  }
  return {
    label: rt(locale, PLATFORM_NEUTRAL_FALLBACK),
    legalApprovalStatus: "neutral_fallback",
  };
}

export function buildRegulatoryPlatformBlock(
  locale: Locale = "cs"
): RegulatoryPlatformBlock {
  const verified = isPartnerConfigPubliclyVerified();
  const partner = getPrimaryMortgagePartner();

  if (verified && partner.legalName) {
    const name = legalNameInline(partner.legalName);
    if (locale === "en") {
      return {
        platformLine: rt(locale, PLATFORM_NEUTRAL_FALLBACK),
        intermediaryLine: `Consumer credit intermediation is provided by ${name} within the scope of the relevant authorisation.`,
        jerrsLeadIn:
          "Authorisation can be verified in the Czech National Bank register:",
        showJerrsLink: true,
        intermediary: { label: name, legalApprovalStatus: "verified" },
        usesVerifiedIntermediary: true,
      };
    }
    return {
      platformLine: rt(locale, PLATFORM_NEUTRAL_FALLBACK),
      intermediaryLine: `Zprostředkování spotřebitelského úvěru zajišťuje ${name} v rozsahu příslušného oprávnění.`,
      jerrsLeadIn: "Oprávnění lze ověřit v registru České národní banky:",
      showJerrsLink: true,
      intermediary: { label: name, legalApprovalStatus: "verified" },
      usesVerifiedIntermediary: true,
    };
  }

  return {
    platformLine: rt(locale, PLATFORM_NEUTRAL_FALLBACK),
    intermediaryLine: null,
    jerrsLeadIn: locale === "en"
      ? "Information about the public register of intermediaries:"
      : "Informace o veřejném registru zprostředovatelů:",
    showJerrsLink: true,
    intermediary: {
      label: rt(locale, PLATFORM_NEUTRAL_FALLBACK),
      legalApprovalStatus: "neutral_fallback",
    },
    usesVerifiedIntermediary: false,
  };
}

export function getCooperationWordingNeutral(locale: Locale = "cs"): string {
  return rt(locale, COOPERATION_NEUTRAL);
}

export function getPlatformWordingNeutral(locale: Locale = "cs"): string {
  return `${rt(locale, PLATFORM_OPERATOR_LINE)} ${rt(locale, COOPERATION_NEUTRAL)}`;
}

export function getRegulatoryFooterLine(locale: Locale = "cs"): string {
  if (locale === "en") {
    return "Information platform — we are not a bank. Loan approval is always decided by the bank after its own assessment.";
  }
  return "Informační platforma — nejsme banka. Schválení úvěru vždy provádí banka po vlastním posouzení.";
}

export function buildLeadFormIntakeDisclosure(locale: Locale = "cs"): string {
  const op = legalOperator;
  const partner = getPrimaryMortgagePartner();
  const verified = isPartnerConfigPubliclyVerified();

  if (locale === "en") {
    if (verified && partner.legalName) {
      return `Your details are received by ${legalNameInline(op.companyName)}, the operator of ${op.brand}. With your consent to transfer, we may pass them to ${legalNameInline(partner.legalName)}, who will contact you about a non-binding consultation. ${op.brand} is not a bank and does not approve loans.`;
    }
    return `Your details are received by ${legalNameInline(op.companyName)}, the operator of ${op.brand}. ${op.representative} or a colleague from the operator team will contact you about your enquiry — usually within 24 hours. ${op.brand} is not a bank and does not approve loans.`;
  }

  if (verified && partner.legalName) {
    return `Údaje z formuláře přijímá provozovatel platformy ${legalNameInline(op.companyName)}. Po souhlasu s předáním je můžeme předat společnosti ${legalNameInline(partner.legalName)}, která vás kontaktuje ohledně nezávazné konzultace. ${op.brand} není banka a neschvaluje úvěry.`;
  }

  return `Údaje z formuláře přijímá provozovatel platformy ${legalNameInline(op.companyName)}. Ohledně poptávky vás kontaktuje ${op.representative} nebo kolega z týmu provozovatele — obvykle do 24 hodin. ${op.brand} není banka a neschvaluje úvěry.`;
}

export function getLastLegalReviewLine(locale: Locale = "cs"): string | null {
  const cfg = getLegalIdentityConfig();
  if (!cfg.lastLegalReviewDate || !cfg.legalReviewedBy) return null;
  if (locale === "en") {
    return `Last legal review of texts: ${cfg.lastLegalReviewDate} (${cfg.legalReviewedBy}).`;
  }
  return `Poslední právní kontrola textů: ${cfg.lastLegalReviewDate} (${cfg.legalReviewedBy}).`;
}

export function getRegulatedBoundaryStatements(locale: Locale = "cs"): string[] {
  const distinction = rt(locale, CNB_PURPOSE_DISTINCTION);
  const block = buildRegulatoryPlatformBlock(locale);

  const base =
    locale === "en"
      ? [
          block.platformLine,
          "Digital tools and model outputs are not binding bank offers or investment advice.",
          rt(locale, FORM_DATA_RECIPIENT_NOTE),
          rt(locale, NO_REGULATED_ADVICE),
          "Loan approval is always decided by the bank after its own assessment.",
          distinction,
        ]
      : [
          block.platformLine,
          "Digitální nástroje a modelové výpočty nejsou závaznou nabídkou banky ani investičním doporučením.",
          rt(locale, FORM_DATA_RECIPIENT_NOTE),
          rt(locale, NO_REGULATED_ADVICE),
          "Schválení úvěru vždy provádí banka po vlastním posouzení.",
          distinction,
        ];

  if (block.intermediaryLine) {
    base.splice(2, 0, block.intermediaryLine);
  }

  return base;
}

/** Kontrola, že text neobsahuje interní placeholdery určené k publikaci. */
export function containsPublicForbiddenPlaceholder(text: string): boolean {
  return (
    /k právnímu schválení/i.test(text) ||
    /ověřený právní subjekt/i.test(text) ||
    /verified legal entity — pending legal approval/i.test(text) ||
    text.includes(INTERMEDIARY_PENDING_MARKER.cs) ||
    text.includes(INTERMEDIARY_PENDING_MARKER.en)
  );
}

/** Veřejné texty z tohoto modulu — pro audit testů. */
export function collectPublicRegulatoryStrings(locale: Locale): string[] {
  const block = buildRegulatoryPlatformBlock(locale);
  return [
    block.platformLine,
    block.intermediaryLine ?? "",
    block.jerrsLeadIn ?? "",
    getCooperationWordingNeutral(locale),
    getPlatformWordingNeutral(locale),
    buildLeadFormIntakeDisclosure(locale),
    getCalculatorDisclaimer(locale),
    getRatesDisclaimer(locale),
    ...getRegulatedBoundaryStatements(locale),
  ].filter(Boolean);
}
