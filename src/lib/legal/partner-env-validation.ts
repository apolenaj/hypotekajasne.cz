/**
 * Atomická validace LEGAL_PARTNER_* — jméno, IČO a JERRS URL jako jeden celek.
 * Chybí-li jedna hodnota nebo je URL neplatná, žádná se nepoužije ve veřejném UI.
 */

export type PartnerEnvInput = {
  legalName: string | null;
  ico: string | null;
  jerrsVerificationUrl: string | null;
};

export type ValidatedPartnerEnv =
  | {
      valid: true;
      legalName: string;
      ico: string;
      jerrsVerificationUrl: string;
    }
  | {
      valid: false;
      reason:
        | "missing_name"
        | "missing_ico"
        | "missing_url"
        | "invalid_url"
        | "placeholder";
    };

const PLACEHOLDER_RE =
  /doplníme|doplnění po ověření|čeká na ověření|TODO|TBD|PLACEHOLDER|pending.?verif|k právnímu schválení|ověřený právní subjekt/i;

/** Veřejně přípustné JERRS / ČNB registry URL. */
export function isValidJerrsRegistryUrl(raw: string | null | undefined): boolean {
  if (!raw?.trim()) return false;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return host === "jerrs.cnb.cz" || host.endsWith(".cnb.cz");
  } catch {
    return false;
  }
}

function hasPlaceholder(...values: (string | null | undefined)[]): boolean {
  return values.some((v) => v && PLACEHOLDER_RE.test(v));
}

export function validatePartnerEnv(input: PartnerEnvInput): ValidatedPartnerEnv {
  const legalName = input.legalName?.trim() ?? "";
  const ico = input.ico?.trim() ?? "";
  const jerrsVerificationUrl = input.jerrsVerificationUrl?.trim() ?? "";

  if (!legalName) return { valid: false, reason: "missing_name" };
  if (!ico) return { valid: false, reason: "missing_ico" };
  if (!jerrsVerificationUrl) return { valid: false, reason: "missing_url" };
  if (!isValidJerrsRegistryUrl(jerrsVerificationUrl)) {
    return { valid: false, reason: "invalid_url" };
  }
  if (hasPlaceholder(legalName, ico, jerrsVerificationUrl)) {
    return { valid: false, reason: "placeholder" };
  }

  return {
    valid: true,
    legalName,
    ico,
    jerrsVerificationUrl,
  };
}

export function readPartnerEnvFromProcess(): PartnerEnvInput {
  function envOrNull(...keys: string[]): string | null {
    for (const key of keys) {
      const v = process.env[key]?.trim();
      if (v && v.length > 0) return v;
    }
    return null;
  }

  return {
    legalName: envOrNull(
      "LEGAL_PARTNER_LEGAL_NAME",
      "NEXT_PUBLIC_LEGAL_PARTNER_LEGAL_NAME"
    ),
    ico: envOrNull("LEGAL_PARTNER_ICO", "NEXT_PUBLIC_LEGAL_PARTNER_ICO"),
    jerrsVerificationUrl: envOrNull(
      "LEGAL_PARTNER_JERRS_URL",
      "NEXT_PUBLIC_LEGAL_PARTNER_JERRS_URL"
    ),
  };
}

export function getValidatedPartnerEnv(): ValidatedPartnerEnv {
  return validatePartnerEnv(readPartnerEnvFromProcess());
}
