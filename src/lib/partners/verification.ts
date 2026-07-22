/**
 * Partner verification claims — PROMPT 2.
 * NEVYMÝŠLET licenci, IČO ani registraci.
 * Veřejné copy nesmí být silnější než verificationStatus.
 */

import {
  getPrimaryMortgagePartner,
  isMortgagePartnerIdentityVerified,
  type MortgagePartner,
} from "@/lib/legal/partner-config";

export type PartnerVerificationStatus =
  | "VERIFIED"
  | "PENDING"
  | "UNVERIFIED";

export type PartnerVerification = {
  /** Veřejné jméno — null pokud nezveřejněno */
  name: string | null;
  /** Právnická osoba / obchodní jméno */
  legalEntity: string | null;
  /** Registrační / IČO */
  registrationNumber: string | null;
  /** Dohledový orgán (např. ČNB) — jen pokud je doložen */
  regulator: string | null;
  registryUrl: string | null;
  verifiedAt: string | null;
  verificationStatus: PartnerVerificationStatus;
};

function envOrNull(...keys: string[]): string | null {
  for (const key of keys) {
    const v = process.env[key]?.trim();
    if (v && v.length > 0) return v;
  }
  return null;
}

/**
 * Mapuje MortgagePartner + env na PartnerVerification.
 * PENDING: explicitní env LEGAL_PARTNER_VERIFICATION_STATUS=PENDING,
 * nebo částečná data bez plného registru.
 */
export function toPartnerVerification(
  partner: MortgagePartner = getPrimaryMortgagePartner()
): PartnerVerification {
  const override = envOrNull(
    "LEGAL_PARTNER_VERIFICATION_STATUS",
    "NEXT_PUBLIC_LEGAL_PARTNER_VERIFICATION_STATUS"
  )?.toUpperCase();

  const verifiedAt = envOrNull(
    "LEGAL_PARTNER_VERIFIED_AT",
    "NEXT_PUBLIC_LEGAL_PARTNER_VERIFIED_AT"
  );
  const regulator = envOrNull(
    "LEGAL_PARTNER_REGULATOR",
    "NEXT_PUBLIC_LEGAL_PARTNER_REGULATOR"
  );

  const identityOk = isMortgagePartnerIdentityVerified(partner);

  let verificationStatus: PartnerVerificationStatus = "UNVERIFIED";
  if (override === "VERIFIED" || override === "PENDING" || override === "UNVERIFIED") {
    verificationStatus = override;
    // Never claim VERIFIED without identity — ignore unsafe override
    if (verificationStatus === "VERIFIED" && !identityOk) {
      verificationStatus = partner.jerrsStatus === "COMING_SOON" ? "PENDING" : "UNVERIFIED";
    }
  } else if (identityOk && partner.jerrsStatus === "LIVE") {
    verificationStatus = "VERIFIED";
  } else if (partner.jerrsStatus === "COMING_SOON") {
    verificationStatus = "PENDING";
  } else if (partner.legalName || partner.ico || partner.jerrsVerificationUrl) {
    // Partial data without full verification
    verificationStatus = "PENDING";
  }

  const legalEntity =
    verificationStatus === "UNVERIFIED" ? null : partner.legalName;

  return {
    name:
      verificationStatus === "VERIFIED" && partner.legalName
        ? partner.legalName
        : null,
    legalEntity,
    registrationNumber:
      verificationStatus === "VERIFIED" ? partner.ico : null,
    regulator:
      verificationStatus === "VERIFIED" ? regulator : null,
    registryUrl:
      verificationStatus === "VERIFIED" ? partner.jerrsVerificationUrl : null,
    verifiedAt: verificationStatus === "VERIFIED" ? verifiedAt : null,
    verificationStatus,
  };
}

export function getPrimaryPartnerVerification(): PartnerVerification {
  return toPartnerVerification(getPrimaryMortgagePartner());
}

/** Smí UI použít slova typu licencovaný / prověřený / ověřený partner? */
export function canUseStrongPartnerTrustClaims(
  v: PartnerVerification = getPrimaryPartnerVerification()
): boolean {
  return v.verificationStatus === "VERIFIED";
}

export type PartnerClaimLabels = {
  /** Krátký badge text */
  badgeLabel: string;
  /** Veřejný popis role bez silnějšího claimu, než dovoluje status */
  roleLabel: string;
  /** CTA / odkaz na konzultaci */
  consultCta: string;
  /** Footer / contact blurb o propojení */
  connectBlurb: string;
  /** Co se stane s kontaktem z lead formuláře */
  leadIntakeDisclosure: string;
  /** Dekujeme / handoff copy */
  thankYouHandoff: string;
};

export function getPartnerClaimLabels(
  v: PartnerVerification = getPrimaryPartnerVerification()
): PartnerClaimLabels {
  switch (v.verificationStatus) {
    case "VERIFIED": {
      const who = v.name ?? "ověřený partner";
      return {
        badgeLabel: "Ověřený partner",
        roleLabel: "Ověřený hypoteční partner",
        consultCta: `Konzultace s ověřeným partnerem`,
        connectBlurb:
          "Nejsme banka ani licencovaný zprostředkovatel. Individuální konzultaci zajišťuje ověřený partner — s odkazem na veřejný registr.",
        leadIntakeDisclosure: `Při souhlasu s předáním předáme kontakt ověřenému partnerovi (${who}). Hypotéka Jasně není banka; konzultace je nezávazná.`,
        thankYouHandoff: `${who} se vám ozve ohledně nezávazné konzultace — obvykle do 24 hodin. Hypotéka Jasně není banka.`,
      };
    }
    case "PENDING":
      return {
        badgeLabel: "Ověření partnera probíhá",
        roleLabel: "Partner (ověření probíhá)",
        consultCta: "Nezávazná konzultace",
        connectBlurb:
          "Nejsme banka ani licencovaný zprostředkovatel. Ověření partnera probíhá — do zveřejnění identity přijímá poptávky provozovatel webu.",
        leadIntakeDisclosure:
          "Vaše údaje přijme provozovatel webu Hypotéka Jasně pro nezávaznou konzultaci. Předání konkrétnímu partnerovi zatím není aktivní — ověření partnera probíhá. Hypotéka Jasně není banka.",
        thankYouHandoff:
          "Ozveme se vám ohledně nezávazné konzultace — obvykle do 24 hodin. Předání konkrétnímu partnerovi zatím není aktivní. Hypotéka Jasně není banka.",
      };
    default:
      return {
        badgeLabel: "Identita partnera nezveřejněna",
        roleLabel: "Partner (identita nezveřejněna)",
        consultCta: "Nezávazná konzultace",
        connectBlurb:
          "Nejsme banka ani licencovaný zprostředkovatel. Poptávky přijímá provozovatel webu; předání partnerovi až po zveřejnění ověřené identity (viz Partneři).",
        leadIntakeDisclosure:
          "Vaše údaje přijme provozovatel webu Hypotéka Jasně pro nezávaznou konzultaci. Předání třetímu partnerovi není produkčně aktivní, dokud není zveřejněna ověřená identifikace. Hypotéka Jasně není banka.",
        thankYouHandoff:
          "Ozveme se vám ohledně nezávazné konzultace — obvykle do 24 hodin. Hypotéka Jasně není banka a nepředává kontakt neověřenému partnerovi.",
      };
  }
}

/** Fraze zakázané ve veřejném UI, pokud partner není VERIFIED. */
export const STRONG_PARTNER_CLAIM_PATTERNS: RegExp[] = [
  /prověřenými experty/i,
  /prověření experti/i,
  /ověřenými experty/i,
  /ověřený poradce/i,
  /náš specialista/i,
  /ověřeno ČNB/i,
];

/**
 * Pro audit: silné claimy o licenci partnera jsou OK jen ve VERIFIED větvích
 * nebo v negativních větách („nejsme licencovaný…“).
 */
export function assertNoUnauthorizedStrongClaims(
  text: string,
  status: PartnerVerificationStatus
): void {
  if (status === "VERIFIED") return;
  for (const re of STRONG_PARTNER_CLAIM_PATTERNS) {
    if (re.test(text)) {
      throw new Error(
        `Unauthorized partner trust claim for status=${status}: matched ${re}`
      );
    }
  }
}
