/**
 * Identita provozovatele — NEVYMÝŠLET.
 * Doplňte env / hodnoty níže před produkcí. Null = nezveřejňovat falešný údaj.
 */

export type OperatorIdentity = {
  /** Obchodní / právní jméno (např. „XY s.r.o.“) */
  legalName: string | null;
  /** IČO — pouze ověřené */
  ico: string | null;
  /** DIČ — pouze pokud je plátce DPH a ověřeno */
  dic: string | null;
  /** Ulice a číslo */
  street: string | null;
  city: string | null;
  zip: string | null;
  country: string;
  email: string;
  phone: string;
  /** URL veřejného výpisu (ARES / justice.cz) — po ověření */
  publicRegisterUrl: string | null;
  /**
   * true = provozovatel je vyplněn dostatečně pro produkční zveřejnění IČO.
   * false = IČO a registr ve veřejném UI neuvádíme (žádné TODO texty).
   */
  isProductionReady: boolean;
  /** Interní — názvy chybějících env (ne renderovat klientovi) */
  missingFields: string[];
};

function envOrNull(key: string): string | null {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : null;
}

/**
 * Kontaktní údaje z veřejného webu (nejsou náhradou za právní identifikaci).
 * Adresa/telefon mohou sloužit ke komunikaci i když IČO ještě není v configu.
 */
const CONTACT_FALLBACK = {
  email: "info@hypotekajasne.cz",
  phone: "+420 727 814 810",
  street: "Soukenická 6",
  city: "Krnov",
  zip: "79401",
  country: "Česká republika",
} as const;

/**
 * REQUIRED CONFIG — doplňte před produkčním spuštěním:
 * - LEGAL_OPERATOR_LEGAL_NAME
 * - LEGAL_OPERATOR_ICO
 * - LEGAL_OPERATOR_DIC (volitelné)
 * - LEGAL_OPERATOR_STREET / CITY / ZIP (nebo potvrďte CONTACT_FALLBACK)
 * - LEGAL_OPERATOR_REGISTER_URL (ARES odkaz)
 */
export function getOperatorIdentity(): OperatorIdentity {
  const legalName = envOrNull("LEGAL_OPERATOR_LEGAL_NAME");
  const ico = envOrNull("LEGAL_OPERATOR_ICO");
  const dic = envOrNull("LEGAL_OPERATOR_DIC");
  const street =
    envOrNull("LEGAL_OPERATOR_STREET") ?? CONTACT_FALLBACK.street;
  const city = envOrNull("LEGAL_OPERATOR_CITY") ?? CONTACT_FALLBACK.city;
  const zip = envOrNull("LEGAL_OPERATOR_ZIP") ?? CONTACT_FALLBACK.zip;
  const publicRegisterUrl = envOrNull("LEGAL_OPERATOR_REGISTER_URL");
  const email =
    envOrNull("LEGAL_OPERATOR_EMAIL") ?? CONTACT_FALLBACK.email;
  const phone =
    envOrNull("LEGAL_OPERATOR_PHONE") ?? CONTACT_FALLBACK.phone;

  const missingFields: string[] = [];
  if (!legalName) missingFields.push("LEGAL_OPERATOR_LEGAL_NAME");
  if (!ico) missingFields.push("LEGAL_OPERATOR_ICO");
  if (!publicRegisterUrl) missingFields.push("LEGAL_OPERATOR_REGISTER_URL");
  if (!envOrNull("LEGAL_OPERATOR_STREET")) {
    missingFields.push(
      "LEGAL_OPERATOR_STREET (používá se kontaktní fallback — potvrďte)"
    );
  }

  return {
    legalName,
    ico,
    dic,
    street,
    city,
    zip,
    country: CONTACT_FALLBACK.country,
    email,
    phone,
    publicRegisterUrl,
    isProductionReady: missingFields.length === 0 && Boolean(legalName && ico),
    missingFields,
  };
}

export function formatOperatorAddress(op: OperatorIdentity): string {
  const parts = [op.street, op.zip, op.city, op.country].filter(Boolean);
  return parts.join(", ");
}

export function operatorDisplayName(op: OperatorIdentity): string {
  return op.legalName ?? "Provozovatel platformy Hypotéka Jasně";
}

/** Placená analýza ke koupi — jen když je provozovatel i checkout připraven. */
export function isPaidAnalysisCommerciallyAvailable(): boolean {
  const op = getOperatorIdentity();
  const checkoutLive =
    process.env.PAID_ANALYSIS_CHECKOUT_LIVE === "true" ||
    process.env.NEXT_PUBLIC_PAID_ANALYSIS_CHECKOUT_LIVE === "true";
  return op.isProductionReady && checkoutLive;
}
