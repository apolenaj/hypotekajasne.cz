/**
 * Záchranná síť: doplnění null sazeb z českých agregátorů.
 * Jen absolutní přečtená čísla — žádné +0.X % dopočty.
 */

import * as cheerio from "cheerio";
import type { BankScraperId } from "@/lib/scrape/bank-ids";
import {
  buildExtractedRates,
  extractFirstPercent,
  extractMesecFixationRate,
  extractMortgageRates,
  extractPenizeAmericanRate,
  htmlToPlainText,
  isValidMortgagePair,
  parseCzechPercent,
  RPSN_TEXT_PATTERNS,
  WITHOUT_INSURANCE_RATE_PATTERNS,
  WITHOUT_INSURANCE_RPSN_PATTERNS,
  type ExtractedMortgageRates,
} from "@/lib/scrape/parse-rate";

export type AggregatorCache = {
  bankyHtml: string | null;
  penizeAmericanHtml: string | null;
  penizeClassicHtml: string | null;
  kurzyHtml: string | null;
};

export function createAggregatorCache(): AggregatorCache {
  return {
    bankyHtml: null,
    penizeAmericanHtml: null,
    penizeClassicHtml: null,
    kurzyHtml: null,
  };
}

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "cs-CZ,cs;q=0.9,en;q=0.8",
};

const BANKY_COMPARE_URL = "https://www.banky.cz/prehled-a-porovnani/hypoteky/";
const PENIZE_AMERICAN_URL = "https://www.penize.cz/srovnani/americke-hypoteky";
const PENIZE_CLASSIC_URL = "https://www.penize.cz/srovnani/hypoteky";
const KURZY_URL = "https://www.kurzy.cz/hypoteky/";

const BANK_ALIASES: Record<BankScraperId, string[]> = {
  "ceska-sporitelna": [
    "Česká spořitelna",
    "Ceska sporitelna",
    "Online hypotéka",
    "spořitelna",
  ],
  "komercni-banka": ["Komerční banka", "Hypotéka s chytrou rezervou"],
  "csob-hypotecni-banka": ["ČSOB", "Hypoteční banka"],
  "raiffeisen-bank": ["Raiffeisen", "Hypotéka na bydlení"],
  mbank: ["mBank", "mHypotéka"],
  "unicredit-bank": ["UniCredit", "U hypotéka"],
};

const FINGO_URLS: Partial<Record<BankScraperId, string[]>> = {
  "ceska-sporitelna": [
    "https://www.fingo.cz/hypoteky/ceska-sporitelna/hypoteka",
    "https://www.fingo.cz/hypoteky/ceska-sporitelna/",
  ],
  "komercni-banka": [
    "https://www.fingo.cz/hypoteky/kb/hypoteka",
    "https://www.fingo.cz/hypoteky/komercni-banka/",
  ],
  "csob-hypotecni-banka": [
    "https://www.fingo.cz/hypoteky/csob/hypoteka-od-csob",
  ],
  "raiffeisen-bank": [
    "https://www.fingo.cz/hypoteky/raiffeisenbank/hypoteka",
    "https://www.fingo.cz/hypoteky/raiffeisenbank/",
  ],
  mbank: [
    "https://www.fingo.cz/hypoteky/mbank/mhypoteka",
    "https://www.fingo.cz/hypoteky/mbank/",
  ],
  "unicredit-bank": [
    "https://www.fingo.cz/hypoteky/unicredit/hypoteka",
    "https://www.fingo.cz/hypoteky/unicredit-bank/",
  ],
};

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: FETCH_HEADERS,
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

function mergeExtracted(
  base: ExtractedMortgageRates,
  patch: Partial<ExtractedMortgageRates>
): ExtractedMortgageRates {
  return buildExtractedRates({
    rateWithInsurance: base.rateWithInsurance ?? patch.rateWithInsurance ?? null,
    rpsnWithInsurance: base.rpsnWithInsurance ?? patch.rpsnWithInsurance ?? null,
    rateWithoutInsurance:
      base.rateWithoutInsurance ?? patch.rateWithoutInsurance ?? null,
    rpsnWithoutInsurance:
      base.rpsnWithoutInsurance ?? patch.rpsnWithoutInsurance ?? null,
  });
}

function extractExplicitWithout(html: string): {
  rate: number | null;
  rpsn: number | null;
} {
  const text = htmlToPlainText(html);
  return {
    rate: extractFirstPercent(text, WITHOUT_INSURANCE_RATE_PATTERNS, {
      mortgageOnly: true,
    }),
    rpsn: extractFirstPercent(text, WITHOUT_INSURANCE_RPSN_PATTERNS, {
      mortgageOnly: true,
    }),
  };
}

function fromMesec(html: string): Partial<ExtractedMortgageRates> {
  const mesecRate = extractMesecFixationRate(html);
  const parsed = extractMortgageRates(html);
  const without = extractExplicitWithout(html);
  return {
    rateWithInsurance: mesecRate ?? parsed.rateWithInsurance,
    rpsnWithInsurance: parsed.rpsnWithInsurance,
    rateWithoutInsurance: without.rate ?? parsed.rateWithoutInsurance,
    rpsnWithoutInsurance: without.rpsn ?? parsed.rpsnWithoutInsurance,
  };
}

function fromFingoOrGeneric(html: string): Partial<ExtractedMortgageRates> {
  const text = htmlToPlainText(html);
  const parsed = extractMortgageRates(html);
  const without = extractExplicitWithout(html);

  const example = text.match(
    /pevn[áa]\s+výpůjční\s+úrokov[áa]\s+sazba:\s*(\d{1,2}[,.]\d{1,2})\s*%[\s\S]{0,160}?RPSN\)?:\s*(\d{1,2}[,.]\d{1,2})\s*%/i
  );
  let rate: number | null = parsed.rateWithInsurance;
  let rpsn: number | null = parsed.rpsnWithInsurance;
  if (example?.[1] && example[2]) {
    const er = parseCzechPercent(example[1], { mortgageOnly: true });
    const ep = parseCzechPercent(example[2], { mortgageOnly: true });
    if (er != null && ep != null && isValidMortgagePair(er, ep)) {
      rate = er;
      rpsn = ep;
    }
  }
  if (rpsn == null) {
    rpsn = extractFirstPercent(text, RPSN_TEXT_PATTERNS, { mortgageOnly: true });
  }

  return {
    rateWithInsurance: rate,
    rpsnWithInsurance: rpsn,
    rateWithoutInsurance: without.rate ?? parsed.rateWithoutInsurance,
    rpsnWithoutInsurance: without.rpsn ?? parsed.rpsnWithoutInsurance,
  };
}

/** banky.cz: absolutní Úrok 70% LTV. Buňky „+ 0,20 %“ se ignorují. */
function fromBankyCompare(
  html: string,
  bankId: BankScraperId
): Partial<ExtractedMortgageRates> & { americanWith?: number | null } {
  const aliases = BANK_ALIASES[bankId];
  const $ = cheerio.load(html);
  let rateWith: number | null = null;
  let rateWithout: number | null = null;
  let americanWith: number | null = null;

  $("table").each((_, table) => {
    const headers = $(table)
      .find("tr")
      .first()
      .find("th,td")
      .map((__, el) => $(el).text().replace(/\s+/g, " ").trim())
      .get();
    if (headers.length < 3) return;

    const uroRow = $(table)
      .find("tr")
      .filter((__, tr) => /úrok\s*70%/i.test($(tr).text()))
      .first();
    const bezRow = $(table)
      .find("tr")
      .filter((__, tr) =>
        /^bez pojišt/i.test($(tr).find("td,th").first().text().trim())
      )
      .first();

    const uroCells = uroRow
      .find("td,th")
      .map((__, el) => $(el).text().replace(/\s+/g, " ").trim())
      .get();
    const bezCells = bezRow
      .find("td,th")
      .map((__, el) => $(el).text().replace(/\s+/g, " ").trim())
      .get();

    for (let i = 1; i < headers.length; i++) {
      const header = headers[i] ?? "";
      const matches = aliases.some((a) =>
        header.toLowerCase().includes(a.toLowerCase())
      );
      if (!matches) continue;

      const uro = parseCzechPercent(uroCells[i] ?? "", { mortgageOnly: true });
      if (uro != null) {
        if (/americk/i.test(header)) {
          americanWith =
            americanWith == null ? uro : Math.min(americanWith, uro);
        } else {
          rateWith = rateWith == null ? uro : Math.min(rateWith, uro);
        }
      }

      const bezRaw = (bezCells[i] ?? "").trim();
      if (bezRaw && !/^\+\s*/.test(bezRaw)) {
        const bez = parseCzechPercent(bezRaw, { mortgageOnly: true });
        if (bez != null) {
          rateWithout =
            rateWithout == null ? bez : Math.min(rateWithout, bez);
        }
      }
    }
  });

  const without = extractExplicitWithout(html);
  return {
    rateWithInsurance: rateWith,
    rateWithoutInsurance: rateWithout ?? without.rate,
    rpsnWithoutInsurance: without.rpsn,
    americanWith,
  };
}

function rateNearBankName(text: string, aliases: string[]): number | null {
  const candidates: number[] = [];
  for (const alias of aliases) {
    const re = new RegExp(
      `${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^\\d%]{0,80}?(\\d{1,2}[,.]\\d{1,2})\\s*%`,
      "i"
    );
    const m = text.match(re);
    if (m?.[1]) {
      const rate = parseCzechPercent(m[1], { mortgageOnly: true });
      if (rate != null) candidates.push(rate);
    }
  }
  if (!candidates.length) return null;
  return Math.min(...candidates);
}

export async function enrichClassicFromAggregators(
  bankId: BankScraperId,
  mesecUrl: string | undefined,
  current: ExtractedMortgageRates,
  cache: AggregatorCache
): Promise<ExtractedMortgageRates> {
  let result = current;

  const needs =
    result.rateWithInsurance == null ||
    result.rpsnWithInsurance == null ||
    result.rateWithoutInsurance == null ||
    result.rpsnWithoutInsurance == null;
  if (!needs) return result;

  if (mesecUrl) {
    const html = await fetchHtml(mesecUrl);
    if (html) result = mergeExtracted(result, fromMesec(html));
  }

  if (
    result.rateWithInsurance == null ||
    result.rpsnWithInsurance == null ||
    result.rateWithoutInsurance == null
  ) {
    for (const url of FINGO_URLS[bankId] ?? []) {
      const html = await fetchHtml(url);
      if (!html) continue;
      result = mergeExtracted(result, fromFingoOrGeneric(html));
      if (
        result.rateWithInsurance != null &&
        result.rpsnWithInsurance != null &&
        result.rateWithoutInsurance != null
      ) {
        break;
      }
    }
  }

  if (result.rateWithInsurance == null || result.rateWithoutInsurance == null) {
    if (!cache.bankyHtml) {
      cache.bankyHtml = await fetchHtml(BANKY_COMPARE_URL);
    }
    if (cache.bankyHtml) {
      result = mergeExtracted(result, fromBankyCompare(cache.bankyHtml, bankId));
    }
  }

  if (result.rateWithInsurance == null || result.rateWithoutInsurance == null) {
    if (!cache.penizeClassicHtml) {
      cache.penizeClassicHtml = await fetchHtml(PENIZE_CLASSIC_URL);
    }
    if (cache.penizeClassicHtml) {
      const text = htmlToPlainText(cache.penizeClassicHtml);
      const parsed = extractMortgageRates(cache.penizeClassicHtml);
      const without = extractExplicitWithout(cache.penizeClassicHtml);
      result = mergeExtracted(result, {
        rateWithInsurance:
          rateNearBankName(text, BANK_ALIASES[bankId]) ??
          parsed.rateWithInsurance,
        rpsnWithInsurance: parsed.rpsnWithInsurance,
        rateWithoutInsurance: without.rate,
        rpsnWithoutInsurance: without.rpsn,
      });
    }
  }

  if (result.rateWithInsurance == null || result.rateWithoutInsurance == null) {
    if (!cache.kurzyHtml) {
      cache.kurzyHtml = await fetchHtml(KURZY_URL);
    }
    if (cache.kurzyHtml) {
      const text = htmlToPlainText(cache.kurzyHtml);
      const without = extractExplicitWithout(cache.kurzyHtml);
      result = mergeExtracted(result, {
        rateWithInsurance: rateNearBankName(text, BANK_ALIASES[bankId]),
        rateWithoutInsurance: without.rate,
        rpsnWithoutInsurance: without.rpsn,
      });
    }
  }

  return result;
}

export type AmericanPartial = {
  rateWith: number | null;
  rpsnWith: number | null;
  rateWithout: number | null;
  rpsnWithout: number | null;
  sourceUrl: string | null;
};

export async function enrichAmericanFromAggregators(
  bankId: BankScraperId,
  current: AmericanPartial,
  cache: AggregatorCache
): Promise<AmericanPartial> {
  let result = { ...current };

  if (result.rateWith == null) {
    if (!cache.penizeAmericanHtml) {
      cache.penizeAmericanHtml = await fetchHtml(PENIZE_AMERICAN_URL);
    }
    if (cache.penizeAmericanHtml) {
      const rate = extractPenizeAmericanRate(cache.penizeAmericanHtml, bankId);
      if (rate != null) {
        result = {
          ...result,
          rateWith: rate,
          sourceUrl: result.sourceUrl ?? PENIZE_AMERICAN_URL,
        };
      }
      const without = extractExplicitWithout(cache.penizeAmericanHtml);
      if (result.rateWithout == null && without.rate != null) {
        result.rateWithout = without.rate;
        result.rpsnWithout = without.rpsn;
      }
    }
  }

  if (result.rateWith == null || result.rateWithout == null) {
    if (!cache.bankyHtml) {
      cache.bankyHtml = await fetchHtml(BANKY_COMPARE_URL);
    }
    if (cache.bankyHtml) {
      const patch = fromBankyCompare(cache.bankyHtml, bankId);
      if (result.rateWith == null && patch.americanWith != null) {
        result.rateWith = patch.americanWith;
        result.sourceUrl = result.sourceUrl ?? BANKY_COMPARE_URL;
      }
      if (result.rateWithout == null && patch.rateWithoutInsurance != null) {
        result.rateWithout = patch.rateWithoutInsurance;
      }
    }
  }

  if (result.rpsnWith == null && result.rateWith != null) {
    for (const url of FINGO_URLS[bankId] ?? []) {
      const html = await fetchHtml(url);
      if (!html) continue;
      const text = htmlToPlainText(html);
      if (!/americk|neúčel/i.test(text)) continue;
      const rpsn = extractFirstPercent(text, RPSN_TEXT_PATTERNS, {
        mortgageOnly: true,
      });
      if (rpsn != null && isValidMortgagePair(result.rateWith, rpsn)) {
        result.rpsnWith = rpsn;
        break;
      }
    }
  }

  return result;
}
