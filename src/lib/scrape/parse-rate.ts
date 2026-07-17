/**
 * Parsování sazeb a RPSN z HTML (cheerio + textové vzory).
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
    return isValidMortgageRate(value) ? +value.toFixed(2) : null;
  }
  if (value < 0.5 || value > 25) return null;
  return +value.toFixed(2);
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

export function extractMortgageRates(html: string): {
  rate: number | null;
  rpsn: number | null;
} {
  const decoded = decodeHtmlEntities(html);
  const plainText = `${extractMetaText(decoded)} ${htmlToPlainText(decoded)}`;

  const rate =
    extractFirstPercent(plainText, RATE_TEXT_PATTERNS, { mortgageOnly: true }) ??
    extractFirstPercent(decoded, RATE_TEXT_PATTERNS, { mortgageOnly: true });

  const rpsn =
    extractFirstPercent(plainText, RPSN_TEXT_PATTERNS, { mortgageOnly: true }) ??
    extractFirstPercent(decoded, RPSN_TEXT_PATTERNS, { mortgageOnly: true });

  if (rate != null && rpsn != null && !isValidMortgagePair(rate, rpsn)) {
    return { rate, rpsn: null };
  }

  return { rate, rpsn };
}
