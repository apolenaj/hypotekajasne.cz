/**
 * Explicitní jurisdikční pravidla — prevence cross-country kontaminace.
 * Neobsahuje vymyšlené sazby; jen očekávané měny, povolené/zakázané termíny
 * a povinná přítomnost klíčových claimů v dossieru.
 */
import { countryConfigs, type CountryId, type CurrencyCode } from "@/lib/calculators";
import { COUNTRY_DOSSIERS } from "@/lib/country-dossier";

/** Termíny, které smí být jen v konkrétních jurisdikcích (case-insensitive match). */
export const JURISDICTION_EXCLUSIVE_TERMS: Record<
  string,
  { allowedCountries: CountryId[]; label: string }
> = {
  IBI: {
    allowedCountries: ["spain"],
    label: "Španělská municipální daň z nemovitosti (IBI)",
  },
  IMU: {
    allowedCountries: ["italy"],
    label: "Italská daň z nemovitosti (IMU)",
  },
  "Cedolare secca": {
    allowedCountries: ["italy"],
    label: "Italský daňový režim nájmu",
  },
  ITP: {
    allowedCountries: ["spain"],
    label: "Španělská převodní daň (ITP)",
  },
  DLD: {
    allowedCountries: ["dubai"],
    label: "Dubai Land Department",
  },
  RERA: {
    allowedCountries: ["dubai"],
    label: "RERA (Dubaj)",
  },
  Oqood: {
    allowedCountries: ["dubai"],
    label: "Oqood (Dubaj)",
  },
  "Hak Milik": {
    allowedCountries: ["bali"],
    label: "Indonéské plné vlastnictví",
  },
  "daň z nehnuteľností": {
    allowedCountries: ["slovakia"],
    label: "Slovenská daň z nemovitostí",
  },
  ČNB: {
    allowedCountries: ["cz"],
    label: "Česká národní banka",
  },
  "Česká národní banka": {
    allowedCountries: ["cz"],
    label: "Česká národní banka",
  },
};

export const EXPECTED_CURRENCY: Record<CountryId, CurrencyCode> = {
  cz: "CZK",
  dubai: "AED",
  spain: "EUR",
  italy: "EUR",
  croatia: "EUR",
  bali: "USD",
  saudi: "SAR",
  slovakia: "EUR",
};

export type JurisdictionMatrixRow = {
  countryId: CountryId;
  currency: CurrencyCode;
  annualPropertyTaxTerm: string;
  ownershipModelHint: string;
  registrationAuthorityHint: string;
  historyIsCzProxy: boolean;
  lastLegalReviewNote: string;
};

/**
 * Interní validační matice — transparentní, bez falešné přesnosti sazeb.
 * Podrobné claimy žijí v COUNTRY_DOSSIERS.
 */
export const JURISDICTION_MATRIX: Record<CountryId, JurisdictionMatrixRow> = {
  cz: {
    countryId: "cz",
    currency: "CZK",
    annualPropertyTaxTerm: "daň z nemovitých věcí",
    ownershipModelHint: "katastr nemovitostí ČR",
    registrationAuthorityHint: "ČÚZK / katastr",
    historyIsCzProxy: false,
    lastLegalReviewNote: "viz dossier sources",
  },
  spain: {
    countryId: "spain",
    currency: "EUR",
    annualPropertyTaxTerm: "IBI",
    ownershipModelHint: "Registro de la Propiedad / freehold",
    registrationAuthorityHint: "notář + registro",
    historyIsCzProxy: true,
    lastLegalReviewNote: "viz dossier sources",
  },
  italy: {
    countryId: "italy",
    currency: "EUR",
    annualPropertyTaxTerm: "IMU",
    ownershipModelHint: "notaio / Conservatoria",
    registrationAuthorityHint: "notaio + Conservatoria",
    historyIsCzProxy: true,
    lastLegalReviewNote: "viz dossier sources",
  },
  croatia: {
    countryId: "croatia",
    currency: "EUR",
    annualPropertyTaxTerm: "místní / komunální poplatky (ověřujeme)",
    ownershipModelHint: "zemljišne knjige / katastr",
    registrationAuthorityHint: "katastr / ZK",
    historyIsCzProxy: true,
    lastLegalReviewNote: "viz dossier sources",
  },
  slovakia: {
    countryId: "slovakia",
    currency: "EUR",
    annualPropertyTaxTerm: "daň z nehnuteľností",
    ownershipModelHint: "slovenský kataster",
    registrationAuthorityHint: "Okresný úrad, katastrálny odbor",
    historyIsCzProxy: true,
    lastLegalReviewNote: "viz dossier sources",
  },
  dubai: {
    countryId: "dubai",
    currency: "AED",
    annualPropertyTaxTerm: "service charges / community (ověřujeme)",
    ownershipModelHint: "freehold zóny / DLD",
    registrationAuthorityHint: "Dubai Land Department (DLD)",
    historyIsCzProxy: true,
    lastLegalReviewNote: "viz dossier sources",
  },
  saudi: {
    countryId: "saudi",
    currency: "SAR",
    annualPropertyTaxTerm: "lokální režim (ověřujeme)",
    ownershipModelHint: "regulované zóny / Vision 2030",
    registrationAuthorityHint: "lokální registr (ověřujeme)",
    historyIsCzProxy: true,
    lastLegalReviewNote: "viz dossier sources",
  },
  bali: {
    countryId: "bali",
    currency: "USD",
    annualPropertyTaxTerm: "lokální poplatky / PBB (ověřujeme)",
    ownershipModelHint: "leasehold / PT PMA — ne EU freehold",
    registrationAuthorityHint: "indonéský katastr / notář",
    historyIsCzProxy: true,
    lastLegalReviewNote: "viz dossier sources",
  },
};

function dossierPlainText(countryId: CountryId): string {
  const d = COUNTRY_DOSSIERS[countryId];
  return JSON.stringify(d);
}

export type ContaminationHit = {
  countryId: CountryId;
  term: string;
  label: string;
};

/** Najde exclusive termíny mimo povolené země (v dossier JSON). */
export function findExclusiveTermContamination(): ContaminationHit[] {
  const hits: ContaminationHit[] = [];
  for (const countryId of Object.keys(COUNTRY_DOSSIERS) as CountryId[]) {
    const text = dossierPlainText(countryId);
    for (const [term, rule] of Object.entries(JURISDICTION_EXCLUSIVE_TERMS)) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(?:^|[^\\p{L}\\p{N}_])${escaped}(?=[^\\p{L}\\p{N}_]|$)`, "iu");
      if (!re.test(text)) continue;
      if (!rule.allowedCountries.includes(countryId)) {
        hits.push({ countryId, term, label: rule.label });
      }
    }
  }
  return hits;
}

export function assertCurrencyMatrixAligned(): string[] {
  const errors: string[] = [];
  for (const id of Object.keys(countryConfigs) as CountryId[]) {
    const expected = EXPECTED_CURRENCY[id];
    const actual = countryConfigs[id].currency;
    if (expected !== actual) {
      errors.push(`${id}: expected currency ${expected}, got ${actual}`);
    }
    if (JURISDICTION_MATRIX[id].currency !== actual) {
      errors.push(
        `${id}: matrix currency ${JURISDICTION_MATRIX[id].currency} ≠ config ${actual}`
      );
    }
  }
  return errors;
}

export function assertRequiredTaxTermPresent(): string[] {
  const errors: string[] = [];
  const required: Partial<Record<CountryId, string>> = {
    spain: "IBI",
    italy: "IMU",
    slovakia: "nehnuteľností",
    cz: "nemovitých věcí",
  };
  for (const [id, needle] of Object.entries(required) as [CountryId, string][]) {
    const text = dossierPlainText(id);
    if (!text.toLowerCase().includes(needle.toLowerCase())) {
      errors.push(`${id}: expected holding/tax term containing "${needle}"`);
    }
  }
  return errors;
}
