/**
 * Centrální Partner / Legal SoT pro hypoteční handoff.
 *
 * NEVYMÝŠLET: jméno partnera, IČO, licenci, JERRS URL.
 * Doplňte ověřené hodnoty přes env (nebo ověřený zápis níže).
 * Bez ověření: veřejný web nesmí tvrdit, že identita je zveřejněna / ověřena.
 */

export type MortgagePartnerJerrsStatus =
  | "LIVE"
  | "UNPUBLISHED"
  | "COMING_SOON";

export type MortgagePartner = {
  id: string;
  /** null = identita nezveřejněna (žádný fiktivní název) */
  legalName: string | null;
  ico: string | null;
  role: string;
  licenceSummary: string;
  jerrsVerificationUrl: string | null;
  jerrsStatus: MortgagePartnerJerrsStatus;
  scope: string;
  compensationDisclosure: string;
};

function envOrNull(...keys: string[]): string | null {
  for (const key of keys) {
    const v = process.env[key]?.trim();
    if (v && v.length > 0) return v;
  }
  return null;
}

/** Fraze, které nesmí být v „LIVE“ partner polích (staging / TODO). */
export const PARTNER_PLACEHOLDER_PATTERNS: RegExp[] = [
  /doplníme/i,
  /doplnění po ověření/i,
  /čeká na ověření/i,
  /odkaz doplníme/i,
  /zatím neuvedeno/i,
  /TODO/i,
  /TBD/i,
  /PLACEHOLDER/i,
  /pending.?verif/i,
];

export const COMPENSATION_DISCLOSURE =
  "Můžeme získat odměnu od partnera, pokud přes nás dojde k realizaci.";

/**
 * REQUIRED CONFIG před produkčním partner handoff:
 * - LEGAL_PARTNER_LEGAL_NAME (nebo NEXT_PUBLIC_… — veřejná data, musí být i na klientu)
 * - LEGAL_PARTNER_ICO (nebo NEXT_PUBLIC_…)
 * - LEGAL_PARTNER_JERRS_URL (nebo NEXT_PUBLIC_…)
 * Volitelně: LEGAL_PARTNER_LICENCE_SUMMARY, LEGAL_PARTNER_ROLE, LEGAL_PARTNER_SCOPE
 */
export function getMortgagePartners(): MortgagePartner[] {
  const legalName = envOrNull(
    "LEGAL_PARTNER_LEGAL_NAME",
    "NEXT_PUBLIC_LEGAL_PARTNER_LEGAL_NAME"
  );
  const ico = envOrNull("LEGAL_PARTNER_ICO", "NEXT_PUBLIC_LEGAL_PARTNER_ICO");
  const jerrsVerificationUrl = envOrNull(
    "LEGAL_PARTNER_JERRS_URL",
    "NEXT_PUBLIC_LEGAL_PARTNER_JERRS_URL"
  );
  const verified = Boolean(legalName && ico && jerrsVerificationUrl);
  const statusOverride = envOrNull(
    "LEGAL_PARTNER_JERRS_STATUS",
    "NEXT_PUBLIC_LEGAL_PARTNER_JERRS_STATUS"
  )?.toUpperCase();

  let jerrsStatus: MortgagePartnerJerrsStatus = "UNPUBLISHED";
  if (verified) {
    jerrsStatus = "LIVE";
  } else if (statusOverride === "COMING_SOON") {
    jerrsStatus = "COMING_SOON";
  } else if (statusOverride === "UNPUBLISHED" || statusOverride === "LIVE") {
    // LIVE without full identity is ignored — never invent verification
    jerrsStatus = "UNPUBLISHED";
  }

  const licenceSummary = verified
    ? (envOrNull(
        "LEGAL_PARTNER_LICENCE_SUMMARY",
        "NEXT_PUBLIC_LEGAL_PARTNER_LICENCE_SUMMARY"
      ) ??
      "Poskytuje službu v rozsahu své registrace u dohledového orgánu. Hypotéka Jasně není touto osobou.")
    : "Registrační údaje a rozsah licence zveřejníme až po ověření. Hypotéka Jasně není touto osobou.";
  const role = verified
    ? (envOrNull("LEGAL_PARTNER_ROLE", "NEXT_PUBLIC_LEGAL_PARTNER_ROLE") ??
      "Zprostředkování spotřebitelských úvěrů / hypoték dle registrace")
    : jerrsStatus === "COMING_SOON"
      ? "Hypoteční partner — ověření probíhá"
      : "Hypoteční partner — identifikace zatím nezveřejněna";
  const scope =
    envOrNull("LEGAL_PARTNER_SCOPE", "NEXT_PUBLIC_LEGAL_PARTNER_SCOPE") ??
    "Individuální konzultace, příprava podkladů, komunikace s bankami. Nezahrnuje závazné schválení úvěru.";

  return [
    {
      id: "primary-mortgage-partner",
      legalName: verified ? legalName : null,
      ico: verified ? ico : null,
      role,
      licenceSummary,
      jerrsVerificationUrl: verified ? jerrsVerificationUrl : null,
      jerrsStatus,
      scope,
      compensationDisclosure: COMPENSATION_DISCLOSURE,
    },
  ];
}

export function getPrimaryMortgagePartner(): MortgagePartner {
  return getMortgagePartners()[0]!;
}

/** Veřejný zobrazovaný název — nikdy falešná firma ani silnější claim. */
export function partnerPublicDisplayName(p: MortgagePartner): string {
  if (p.legalName && p.jerrsStatus === "LIVE") return p.legalName;
  if (p.jerrsStatus === "COMING_SOON") {
    return "Partner — ověření probíhá";
  }
  return "Partner — identifikace zatím nezveřejněna";
}

export function isMortgagePartnerIdentityVerified(
  p: MortgagePartner = getPrimaryMortgagePartner()
): boolean {
  if (p.jerrsStatus !== "LIVE") return false;
  if (!p.legalName || !p.ico || !p.jerrsVerificationUrl) return false;
  const blob = [p.legalName, p.ico, p.jerrsVerificationUrl, p.licenceSummary]
    .filter(Boolean)
    .join(" ");
  return !PARTNER_PLACEHOLDER_PATTERNS.some((re) => re.test(blob));
}

/**
 * Kritický lead handoff na partnera — jen s ověřenou identitou.
 * Jinak formuláře berou údaje pouze pro provozovatele (nezávazná konzultace).
 */
export function isMortgagePartnerHandoffReady(): boolean {
  return isMortgagePartnerIdentityVerified();
}

export function partnerJerrsPublicLabel(
  status: MortgagePartnerJerrsStatus
): string {
  if (status === "LIVE") return "Ověřeno ve veřejném registru";
  if (status === "COMING_SOON") return "Připravujeme zveřejnění";
  return "Identita nezveřejněna";
}

export type PartnerConfigAudit = {
  handoffReady: boolean;
  missingEnv: string[];
  placeholderHits: string[];
  partners: MortgagePartner[];
};

export function auditPartnerConfig(): PartnerConfigAudit {
  const partners = getMortgagePartners();
  const missingEnv: string[] = [];
  if (!envOrNull("LEGAL_PARTNER_LEGAL_NAME", "NEXT_PUBLIC_LEGAL_PARTNER_LEGAL_NAME")) {
    missingEnv.push("LEGAL_PARTNER_LEGAL_NAME (or NEXT_PUBLIC_…)");
  }
  if (!envOrNull("LEGAL_PARTNER_ICO", "NEXT_PUBLIC_LEGAL_PARTNER_ICO")) {
    missingEnv.push("LEGAL_PARTNER_ICO (or NEXT_PUBLIC_…)");
  }
  if (
    !envOrNull("LEGAL_PARTNER_JERRS_URL", "NEXT_PUBLIC_LEGAL_PARTNER_JERRS_URL")
  ) {
    missingEnv.push("LEGAL_PARTNER_JERRS_URL (or NEXT_PUBLIC_…)");
  }

  const placeholderHits: string[] = [];
  for (const p of partners) {
    const fields = [
      p.legalName,
      p.ico,
      p.jerrsVerificationUrl,
      p.licenceSummary,
      p.role,
      p.scope,
    ];
    for (const f of fields) {
      if (!f) continue;
      for (const re of PARTNER_PLACEHOLDER_PATTERNS) {
        if (re.test(f)) placeholderHits.push(`${p.id}: ${f.slice(0, 80)}`);
      }
    }
  }

  return {
    handoffReady: isMortgagePartnerHandoffReady(),
    missingEnv,
    placeholderHits,
    partners,
  };
}
