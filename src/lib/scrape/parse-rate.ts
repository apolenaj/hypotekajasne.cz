/**
 * Parsování sazeb a RPSN z HTML (cheerio + textové vzory).
 */

import * as cheerio from "cheerio";

const MORTGAGE_RATE_MIN = 3;
const MORTGAGE_RATE_MAX = 15;

/** Typická bankovní přirážka za absenci pojištění / nesplnění podmínek. */
export const INSURANCE_SURCHARGE_FALLBACK = 0.2;

/** Orientační RPSN, pokud stránka uvádí jen sazbu (agregátory). */
export const RPSN_FALLBACK_OFFSET = 0.2;

export function decodeHtmlEntities(html: string): string {
  return html
    .replace(/\\u0026nbsp;/gi, " ")
    .replace(/\\u00a0/gi, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&nbsp;/gi, " ");
}

export function isBotChallengePage(html: string): boolean {
  const sample = html.slice(0, 4000).toLowerCase();
  return (
    sample.includes("please enable javascript") ||
    sample.includes("/tspd/") ||
    sample.includes("bobcmn") ||
    sample.includes("your support id is")
  );
}

export function isValidMortgageRate(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= MORTGAGE_RATE_MIN &&
    value <= MORTGAGE_RATE_MAX
  );
}

export function isValidMortgagePair(rate: number, rpsn: number): boolean {
  return (
    isValidMortgageRate(rate) &&
    isValidMortgageRate(rpsn) &&
    rpsn >= rate - 0.05 &&
    rpsn <= rate + 3
  );
}

export function roundRate(value: number): number {
  return +value.toFixed(2);
}

export function parseCzechPercent(
  raw: string,
  { mortgageOnly = false }: { mortgageOnly?: boolean } = {}
): number | null {
  const normalized = raw
    .replace(/\s/g, " ")
    .replace(/(\d)\s+(\d)/g, "$1$2")
    .replace(",", ".");
  const match = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  if (mortgageOnly) {
    return isValidMortgageRate(value) ? roundRate(value) : null;
  }
  if (value < 0.5 || value > 25) return null;
  return roundRate(value);
}

export function extractFirstPercent(
  text: string,
  patterns: RegExp[],
  options: { mortgageOnly?: boolean } = {}
): number | null {
  for (const pattern of patterns) {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
    const globalPattern = new RegExp(pattern.source, flags);
    for (const match of text.matchAll(globalPattern)) {
      if (!match[1]) continue;
      const value = parseCzechPercent(match[1], options);
      if (value != null) return value;
    }
  }
  return null;
}

export function extractFromSelectors(
  html: string,
  selectors: string[]
): number | null {
  const $ = cheerio.load(html);
  for (const selector of selectors) {
    const nodes = $(selector);
    for (let i = 0; i < nodes.length; i++) {
      const text = $(nodes[i]).text();
      const value = parseCzechPercent(text);
      if (value != null) return value;
    }
  }
  return null;
}

export const RATE_TEXT_PATTERNS = [
  /hypot[ée]ka\s+s\s+úrokem\s+od\s+(\d{1,2}[,.]\d{1,2})\s*%/i,
  /u\s+hypot[ée]k[^\d%]{0,120}?od\s+(\d{1,2}[,.]\d{1,2})\s*%/i,
  /(?:nov[áa]\s+)?hypot[ée]ka[^\d%]{0,40}od\s+(\d{1,2}[,.]\d{1,2})\s*%/i,
  /(?:již\s+)?od\s+(\d{1,2}[,.]\d{1,2})\s*%\s*(?:ro[cč]n[ěe]|p\.?\s*a\.?)/i,
  /úrokov[áa]\s+sazba\s+už\s+od\s+(\d{1,2}[,.]\d{1,2})\s*%/i,
  /úrokov[áou][^\d%]{0,30}sazb[au][^\d%]{0,30}(?:od\s+|už\s+)?(\d{1,2}[,.]\d{1,2})\s*%/i,
  /pevn[áa]\s+(?:výpůjční\s+)?úrokov[áa]\s+sazba[^\d%]{0,30}(\d{1,2}[,.]\d{1,2})\s*%/i,
  /úrokov[áa]\s+sazba\s+s\s+fixac[íi][^\d%]{0,40}(\d{1,2}[,.]\d{1,2})/i,
  /(\d{1,2}[,.]\d{1,2})\s*%\s*p\.?\s*a\.?/i,
];

export const RPSN_TEXT_PATTERNS = [
  /procentn[íi]\s+sazba\s+n[áa]klad[uů][^\d%]{0,30}[cč]in[íi][^\d%]{0,15}(\d{1,2}[,.]\d{1,2})\s*%/i,
  /ro[cč]n[íi]\s+procentn[íi]\s+sazba\s+n[áa]klad[uů][^\d%]{0,40}(?:\(RPSN\)[^\d%]{0,10})?(\d{1,2}[,.]\d{1,2})\s*%/i,
  /RPSN\)?[^\d%]{0,30}(\d{1,2}[,.]\d{1,2})\s*%/i,
  /RPSN\s*[=:]\s*(\d{1,2}[,.]\d{1,2})/i,
];

/** Sazba / RPSN výslovně bez pojištění. */
export const WITHOUT_INSURANCE_RATE_PATTERNS = [
  /bez\s+pojišt[^\d%]{0,60}(?:úrokov[áou]\s+sazb[au][^\d%]{0,20})?(\d{1,2}[,.]\d{1,2})\s*%/i,
  /úrokov[áa]\s+sazba\s+bez\s+pojišt[^\d%]{0,30}(\d{1,2}[,.]\d{1,2})\s*%/i,
  /sazba\s+bez\s+pojišt[^\d%]{0,30}(\d{1,2}[,.]\d{1,2})\s*%/i,
];

export const WITHOUT_INSURANCE_RPSN_PATTERNS = [
  /RPSN\s+bez\s+pojišt[^\d%]{0,30}(\d{1,2}[,.]\d{1,2})\s*%/i,
  /bez\s+pojišt[^\d%]{0,40}RPSN[^\d%]{0,20}(\d{1,2}[,.]\d{1,2})\s*%/i,
];

/** Přirážka při nesplnění pojištění / podmínek (procentní body). */
export const INSURANCE_SURCHARGE_PATTERNS = [
  /(?:nesplnění|bez)\s+pojišt[^\d%]{0,80}(?:zvyšuje[^\d%]{0,30})?o\s+(\d[,.]\d)\s*(?:procentního\s+bodu|p\.?\s*b\.?|%)/i,
  /pojišt[^\d%]{0,60}zvyšuje[^\d%]{0,40}o\s+(\d[,.]\d)\s*(?:procentního\s+bodu|p\.?\s*b\.?)/i,
  /bez\s+(?:životního\s+)?pojišt[^\d%]{0,50}\+(\s*)?(\d[,.]\d)\s*(?:%|p\.?\s*b)/i,
  /sleva[^\d%]{0,40}pojišt[^\d%]{0,40}(\d[,.]\d)\s*(?:%|procent)/i,
];

export function htmlToPlainText(html: string): string {
  const decoded = decodeHtmlEntities(html);
  return decoded
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

export function extractMetaText(html: string): string {
  const parts: string[] = [];
  const metaPatterns = [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/gi,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/gi,
    /<title[^>]*>([^<]+)<\/title>/gi,
  ];

  for (const pattern of metaPatterns) {
    for (const match of html.matchAll(pattern)) {
      if (match[1]) parts.push(decodeHtmlEntities(match[1]));
    }
  }

  return parts.join(" ");
}

export function extractInsuranceSurcharge(text: string): number | null {
  for (const pattern of INSURANCE_SURCHARGE_PATTERNS) {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
    const globalPattern = new RegExp(pattern.source, flags);
    for (const match of text.matchAll(globalPattern)) {
      const raw = match[2] ?? match[1];
      if (!raw) continue;
      const value = Number(String(raw).replace(",", "."));
      if (Number.isFinite(value) && value >= 0.05 && value <= 1.5) {
        return roundRate(value);
      }
    }
  }
  return null;
}

export type ExtractedMortgageRates = {
  /** Inzerovaná (nejnižší) sazba = typicky s pojištěním. */
  rateWithInsurance: number | null;
  rpsnWithInsurance: number | null;
  rateWithoutInsurance: number | null;
  rpsnWithoutInsurance: number | null;
  /** Zda bez pojištění pochází z fallbacku +0.2 / přirážky. */
  withoutInsuranceEstimated: boolean;
};

export function applyInsuranceVariants(
  rateWithInsurance: number,
  rpsnWithInsurance: number,
  options: {
    rateWithoutInsurance?: number | null;
    rpsnWithoutInsurance?: number | null;
    surcharge?: number | null;
  } = {}
): ExtractedMortgageRates {
  const surcharge =
    options.surcharge ??
    (options.rateWithoutInsurance != null
      ? null
      : INSURANCE_SURCHARGE_FALLBACK);

  let rateWithout =
    options.rateWithoutInsurance ??
    roundRate(rateWithInsurance + (surcharge ?? INSURANCE_SURCHARGE_FALLBACK));

  let rpsnWithout =
    options.rpsnWithoutInsurance ??
    roundRate(rpsnWithInsurance + (surcharge ?? INSURANCE_SURCHARGE_FALLBACK));

  // Bez pojištění nesmí být výhodnější než s pojištěním
  if (rateWithout < rateWithInsurance) {
    rateWithout = roundRate(rateWithInsurance + INSURANCE_SURCHARGE_FALLBACK);
  }
  if (rpsnWithout < rpsnWithInsurance) {
    rpsnWithout = roundRate(rpsnWithInsurance + INSURANCE_SURCHARGE_FALLBACK);
  }

  const estimated =
    options.rateWithoutInsurance == null ||
    options.rpsnWithoutInsurance == null;

  return {
    rateWithInsurance,
    rpsnWithInsurance,
    rateWithoutInsurance: rateWithout,
    rpsnWithoutInsurance: rpsnWithout,
    withoutInsuranceEstimated: estimated,
  };
}

export function extractMortgageRates(html: string): ExtractedMortgageRates {
  const decoded = decodeHtmlEntities(html);
  const plainText = `${extractMetaText(decoded)} ${htmlToPlainText(decoded)}`;

  const rateWithInsurance =
    extractFirstPercent(plainText, RATE_TEXT_PATTERNS, { mortgageOnly: true }) ??
    extractFirstPercent(decoded, RATE_TEXT_PATTERNS, { mortgageOnly: true });

  let rpsnWithInsurance =
    extractFirstPercent(plainText, RPSN_TEXT_PATTERNS, { mortgageOnly: true }) ??
    extractFirstPercent(decoded, RPSN_TEXT_PATTERNS, { mortgageOnly: true });

  if (
    rateWithInsurance != null &&
    rpsnWithInsurance != null &&
    !isValidMortgagePair(rateWithInsurance, rpsnWithInsurance)
  ) {
    rpsnWithInsurance = null;
  }

  if (rateWithInsurance == null || rpsnWithInsurance == null) {
    return {
      rateWithInsurance,
      rpsnWithInsurance,
      rateWithoutInsurance: null,
      rpsnWithoutInsurance: null,
      withoutInsuranceEstimated: true,
    };
  }

  const explicitRateWithout = extractFirstPercent(
    plainText,
    WITHOUT_INSURANCE_RATE_PATTERNS,
    { mortgageOnly: true }
  );
  const explicitRpsnWithout = extractFirstPercent(
    plainText,
    WITHOUT_INSURANCE_RPSN_PATTERNS,
    { mortgageOnly: true }
  );
  const surcharge = extractInsuranceSurcharge(plainText);

  return applyInsuranceVariants(rateWithInsurance, rpsnWithInsurance, {
    rateWithoutInsurance: explicitRateWithout,
    rpsnWithoutInsurance: explicitRpsnWithout,
    surcharge:
      explicitRateWithout == null && explicitRpsnWithout == null
        ? surcharge
        : null,
  });
}

/** Měšec.cz: tabulka „Základní úroková sazba - fixace …“. */
export function extractMesecCsobRate(html: string): number | null {
  const $ = cheerio.load(html);
  const rates: { years: number; rate: number }[] = [];

  $("table tr").each((_, el) => {
    const rowText = $(el).text().replace(/\s+/g, " ").trim();
    const match = rowText.match(
      /Základní úroková sazba\s*[-–]\s*fixace\s*(\d+)\s*(?:rok|roky|let)[^\d]*(\d{1,2}(?:[.,]\d{1,2})?)\s*%/i
    );
    if (!match) return;
    const years = Number(match[1]);
    const rate = parseCzechPercent(match[2], { mortgageOnly: true });
    if (rate != null && years >= 1 && years <= 15) {
      rates.push({ years, rate });
    }
  });

  if (!rates.length) return null;

  const preferred = rates.find((r) => r.years === 3);
  if (preferred) return preferred.rate;

  return rates.reduce((best, cur) => (cur.rate < best.rate ? cur : best)).rate;
}

export function ensureRpsn(
  rate: number,
  rpsn: number | null
): number {
  if (rpsn != null && isValidMortgagePair(rate, rpsn)) return rpsn;
  return roundRate(rate + RPSN_FALLBACK_OFFSET);
}
