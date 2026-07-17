/**
 * Parsování sazeb a RPSN z HTML (cheerio + textové vzory).
 */

import * as cheerio from "cheerio";

export function parseCzechPercent(raw: string): number | null {
  const normalized = raw
    .replace(/\s/g, " ")
    .replace(/(\d)\s+(\d)/g, "$1$2")
    .replace(",", ".");
  const match = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value < 0.5 || value > 25) return null;
  return +value.toFixed(2);
}

export function extractFirstPercent(
  text: string,
  patterns: RegExp[]
): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;
    const value = parseCzechPercent(match[1]);
    if (value != null) return value;
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
  /úrokov[áa]\s+sazba[^\d%]{0,40}(?:od\s+)?(\d{1,2}[,.]\d{1,2})\s*%/i,
  /(?:nov[áa]\s+)?hypot[ée]ka[^\d%]{0,30}od\s+(\d{1,2}[,.]\d{1,2})\s*%/i,
  /od\s+(\d{1,2}[,.]\d{1,2})\s*%\s*(?:ro[cč]n[ěe]|p\.?\s*a\.?)/i,
  /sazba\s+od\s+(\d{1,2}[,.]\d{1,2})\s*%/i,
  /minim[áa]ln[íi]\s+úrokov[áa]\s+sazba[^\d%]{0,20}(\d{1,2}[,.]\d{1,2})\s*%/i,
];

export const RPSN_TEXT_PATTERNS = [
  /ro[cč]n[íi]\s+procentn[íi]\s+sazba\s+n[áa]klad[uů]\s+(?:[cč]in[íi]\s+)?(\d{1,2}[,.]\d{1,2})\s*%/i,
  /RPSN[^\d%]{0,40}(\d{1,2}[,.]\d{1,2})\s*%/i,
  /RPSN\s*[=:]\s*(\d{1,2}[,.]\d{1,2})/i,
];
