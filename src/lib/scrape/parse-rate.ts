/**
 * Parsování sazeb a RPSN z HTML (cheerio + textové vzory).
 * Žádné umělé dopočítávání (+0.2 %, RPSN offset, KB korekce).
 * Chybějící sazba = null.
 */

import * as cheerio from "cheerio";

const MORTGAGE_RATE_MIN = 3;
const MORTGAGE_RATE_MAX = 15;

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

/** Sazba / RPSN výslovně bez pojištění (absolutní číslo, ne přirážka). */
export const WITHOUT_INSURANCE_RATE_PATTERNS = [
  /bez\s+pojišt[^\d%]{0,60}(?:úrokov[áou]\s+sazb[au][^\d%]{0,20})?(\d{1,2}[,.]\d{1,2})\s*%/i,
  /úrokov[áa]\s+sazba\s+bez\s+pojišt[^\d%]{0,30}(\d{1,2}[,.]\d{1,2})\s*%/i,
  /sazba\s+bez\s+pojišt[^\d%]{0,30}(\d{1,2}[,.]\d{1,2})\s*%/i,
  /bez\s+pojišt[^\d%]{0,40}od\s+(\d{1,2}[,.]\d{1,2})\s*%/i,
];

export const WITHOUT_INSURANCE_RPSN_PATTERNS = [
  /RPSN\s+bez\s+pojišt[^\d%]{0,30}(\d{1,2}[,.]\d{1,2})\s*%/i,
  /bez\s+pojišt[^\d%]{0,40}RPSN[^\d%]{0,20}(\d{1,2}[,.]\d{1,2})\s*%/i,
];

/** Sazba výslovně s pojištěním. */
export const WITH_INSURANCE_RATE_PATTERNS = [
  /s\s+pojišt[^\d%]{0,60}(?:úrokov[áou]\s+sazb[au][^\d%]{0,20})?(\d{1,2}[,.]\d{1,2})\s*%/i,
  /úrokov[áa]\s+sazba\s+s\s+pojišt[^\d%]{0,30}(\d{1,2}[,.]\d{1,2})\s*%/i,
  /sazba\s+s\s+pojišt[^\d%]{0,30}(\d{1,2}[,.]\d{1,2})\s*%/i,
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

export type ExtractedMortgageRates = {
  /** Inzerovaná (nejnižší) sazba = typicky s pojištěním / podmínkami. */
  rateWithInsurance: number | null;
  rpsnWithInsurance: number | null;
  /** Jen pokud je na stránce výslovně uvedena absolutní sazba bez pojištění. */
  rateWithoutInsurance: number | null;
  rpsnWithoutInsurance: number | null;
};

/**
 * Složí výsledek jen z reálně nalezených hodnot — nikdy nedopočítává.
 */
export function buildExtractedRates(input: {
  rateWithInsurance?: number | null;
  rpsnWithInsurance?: number | null;
  rateWithoutInsurance?: number | null;
  rpsnWithoutInsurance?: number | null;
}): ExtractedMortgageRates {
  let rateWith = input.rateWithInsurance ?? null;
  let rpsnWith = input.rpsnWithInsurance ?? null;
  let rateWithout = input.rateWithoutInsurance ?? null;
  let rpsnWithout = input.rpsnWithoutInsurance ?? null;

  if (
    rateWith != null &&
    rpsnWith != null &&
    !isValidMortgagePair(rateWith, rpsnWith)
  ) {
    rpsnWith = null;
  }

  if (
    rateWithout != null &&
    rpsnWithout != null &&
    !isValidMortgagePair(rateWithout, rpsnWithout)
  ) {
    rpsnWithout = null;
  }

  // Bez pojištění nesmí být výhodnější než s pojištěním — spíš chybný parse
  if (
    rateWith != null &&
    rateWithout != null &&
    rateWithout < rateWith - 0.001
  ) {
    rateWithout = null;
    rpsnWithout = null;
  }

  return {
    rateWithInsurance: rateWith,
    rpsnWithInsurance: rpsnWith,
    rateWithoutInsurance: rateWithout,
    rpsnWithoutInsurance: rpsnWithout,
  };
}

export function extractMortgageRates(html: string): ExtractedMortgageRates {
  const decoded = decodeHtmlEntities(html);
  const plainText = `${extractMetaText(decoded)} ${htmlToPlainText(decoded)}`;

  // Preferuj reprezentativní příklad jako svázaný pár sazba+RPSN
  const exampleMatch = plainText.match(
    /úrokov[áa]\s+sazba\s+(\d{1,2}[,.]\d{1,2})\s*%[\s\S]{0,220}?RPSN\)?\s*(\d{1,2}[,.]\d{1,2})\s*%/i
  );
  let exampleRate: number | null = null;
  let exampleRpsn: number | null = null;
  if (exampleMatch?.[1] && exampleMatch[2]) {
    const rate = parseCzechPercent(exampleMatch[1], { mortgageOnly: true });
    const rpsn = parseCzechPercent(exampleMatch[2], { mortgageOnly: true });
    if (rate != null && rpsn != null && isValidMortgagePair(rate, rpsn)) {
      exampleRate = rate;
      exampleRpsn = rpsn;
    }
  }

  const explicitWith = extractFirstPercent(
    plainText,
    WITH_INSURANCE_RATE_PATTERNS,
    { mortgageOnly: true }
  );

  const advertisedRate =
    explicitWith ??
    extractFirstPercent(plainText, RATE_TEXT_PATTERNS, { mortgageOnly: true }) ??
    extractFirstPercent(decoded, RATE_TEXT_PATTERNS, { mortgageOnly: true });

  let rpsnWithInsurance =
    extractFirstPercent(plainText, RPSN_TEXT_PATTERNS, { mortgageOnly: true }) ??
    extractFirstPercent(decoded, RPSN_TEXT_PATTERNS, { mortgageOnly: true });

  const rateWithoutInsurance = extractFirstPercent(
    plainText,
    WITHOUT_INSURANCE_RATE_PATTERNS,
    { mortgageOnly: true }
  );
  const rpsnWithoutInsurance = extractFirstPercent(
    plainText,
    WITHOUT_INSURANCE_RPSN_PATTERNS,
    { mortgageOnly: true }
  );

  // Pokud inzerovaná sazba ≠ příklad, nepřiděluj RPSN z příkladu k inzerátu
  let rateWithInsurance = advertisedRate;
  if (
    advertisedRate != null &&
    exampleRate != null &&
    exampleRpsn != null &&
    Math.abs(advertisedRate - exampleRate) > 0.021
  ) {
    // RPSN z příkladu nepatří k marketingové „od X %“
    if (rpsnWithInsurance === exampleRpsn) {
      rpsnWithInsurance = null;
    }
  } else if (
    rateWithInsurance == null &&
    exampleRate != null &&
    exampleRpsn != null
  ) {
    rateWithInsurance = exampleRate;
    rpsnWithInsurance = exampleRpsn;
  } else if (
    rateWithInsurance != null &&
    exampleRate != null &&
    exampleRpsn != null &&
    Math.abs(rateWithInsurance - exampleRate) < 0.021
  ) {
    rpsnWithInsurance = exampleRpsn;
  }

  return buildExtractedRates({
    rateWithInsurance,
    rpsnWithInsurance,
    rateWithoutInsurance,
    rpsnWithoutInsurance,
  });
}

/** Měšec.cz: tabulka „Základní úroková sazba - fixace …“ (preferuj 3 roky). */
export function extractMesecFixationRate(
  html: string,
  preferredYears = 3
): number | null {
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

  const preferred = rates.find((r) => r.years === preferredYears);
  if (preferred) return preferred.rate;

  return rates.reduce((best, cur) => (cur.rate < best.rate ? cur : best)).rate;
}

/** @deprecated alias — stejné jako extractMesecFixationRate */
export function extractMesecCsobRate(html: string): number | null {
  return extractMesecFixationRate(html);
}

const PENIZE_AMERICAN_BANK_ALIASES: Record<string, string[]> = {
  "ceska-sporitelna": ["ČS -", "Česká spořitelna", "spořitelna"],
  "komercni-banka": ["Komerční banka"],
  "csob-hypotecni-banka": ["ČSOB -", "ČSOB Americká", "Hypoteční banka - Americká"],
  "raiffeisen-bank": ["Raiffeisenbank", "UNIVERZÁL"],
  "mbank": ["mBank", "mHypotéka Light"],
  "unicredit-bank": ["UniCredit"],
};

/**
 * Peníze.cz srovnání amerických hypoték — řádek „Banka - produkt … X,XX %“.
 * Vrací jen sazbu (RPSN na stránce typicky chybí → null).
 */
export function extractPenizeAmericanRate(
  html: string,
  bankId: string
): number | null {
  const aliases = PENIZE_AMERICAN_BANK_ALIASES[bankId];
  if (!aliases?.length) return null;

  const $ = cheerio.load(html);
  const candidates: number[] = [];

  $("tr, li, div, td").each((_, el) => {
    const rowText = $(el).text().replace(/\s+/g, " ").trim();
    if (rowText.length > 280 || rowText.length < 10) return;
    if (!/americk|neúčel|UNIVERZÁL|mHypotéka Light/i.test(rowText)) return;

    const matchesAlias = aliases.some((alias) =>
      rowText.toLowerCase().includes(alias.toLowerCase())
    );
    if (!matchesAlias) return;

    const rateMatch = rowText.match(/(\d{1,2}[,.]\d{1,2})\s*%/);
    if (!rateMatch) return;
    const rate = parseCzechPercent(rateMatch[1], { mortgageOnly: true });
    if (rate != null) candidates.push(rate);
  });

  if (!candidates.length) {
    const text = htmlToPlainText(html);
    for (const alias of aliases) {
      const re = new RegExp(
        `${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^\\d]{0,80}?(\\d{1,2}[,.]\\d{1,2})\\s*%`,
        "i"
      );
      const m = text.match(re);
      if (m?.[1]) {
        const rate = parseCzechPercent(m[1], { mortgageOnly: true });
        if (rate != null) candidates.push(rate);
      }
    }
  }

  if (!candidates.length) return null;
  return Math.min(...candidates);
}

/** Extrahuje InterestOut z UniCredit PCE JSON odpovědi. */
export function extractUnicreditInterestFromPce(
  payload: unknown
): number | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as {
    SUCCESS?: {
      OutputByResultNumber?: {
        PCE_OutputResultContainerInfo?: Array<{
          Key?: string;
          Value?: {
            PCE_OutputValueInfo?:
              | { Value?: string | number | null }
              | Array<{ Value?: string | number | null }>;
          };
        }>;
      };
    };
  };

  const infos =
    root.SUCCESS?.OutputByResultNumber?.PCE_OutputResultContainerInfo;
  if (!infos?.length) return null;

  const interest = infos.find((x) => x.Key === "InterestOut");
  const rawInfo = interest?.Value?.PCE_OutputValueInfo;
  const raw = Array.isArray(rawInfo) ? rawInfo[0]?.Value : rawInfo?.Value;
  if (raw == null) return null;

  const value =
    typeof raw === "number"
      ? raw
      : parseCzechPercent(String(raw), { mortgageOnly: true });

  return value != null && isValidMortgageRate(value) ? roundRate(value) : null;
}
