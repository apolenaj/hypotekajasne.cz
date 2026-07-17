/**
 * Konfigurace scraperů českých bank (klasická + americká hypotéka).
 * Žádné umělé +0.2 % / RPSN dopočty — chybějící sazby = null.
 */

import {
  BANK_NAME_TO_SCRAPER_ID,
  type BankScraperId,
} from "@/lib/scrape/bank-ids";
import {
  applyInsuranceVariants,
  extractMesecCsobRate,
  extractMortgageRates,
  extractFirstPercent,
  extractInsuranceSurcharge,
  extractMbankRatesFromConfig,
  extractPenizeAmericanRate,
  htmlToPlainText,
  isBotChallengePage,
  isValidMortgagePair,
  isValidMortgageRate,
  RPSN_TEXT_PATTERNS,
  type ExtractedMortgageRates,
} from "@/lib/scrape/parse-rate";

export type { BankScraperId };
export { BANK_NAME_TO_SCRAPER_ID };

export type BankScraperConfig = {
  id: BankScraperId;
  bankName: string;
  url: string;
  alternateUrls?: string[];
  /** Oficiální stránky americké / neúčelové hypotéky. */
  americanUrls?: string[];
  customScrape?: () => Promise<ScrapedBankRate>;
};

export type ScrapedBankRate = {
  id: BankScraperId;
  bankName: string;
  /** Zrcadlí sazbu s pojištěním (hlavní inzerovaná sazba), pokud je známa. */
  rate: number | null;
  rpsn: number | null;
  rateWithInsurance: number | null;
  rpsnWithInsurance: number | null;
  rateWithoutInsurance: number | null;
  rpsnWithoutInsurance: number | null;
  withoutInsuranceEstimated: boolean;
  sourceUrl: string;
  /** Americká hypotéka — null pokud se nepodařilo scrapovat. */
  americanRateWithInsurance: number | null;
  americanRpsnWithInsurance: number | null;
  americanRateWithoutInsurance: number | null;
  americanRpsnWithoutInsurance: number | null;
  americanWithoutInsuranceEstimated: boolean;
  americanSourceUrl: string | null;
};

export const BANK_SCRAPERS: BankScraperConfig[] = [
  {
    id: "ceska-sporitelna",
    bankName: "Česká spořitelna",
    url: "https://www.csas.cz/cs/osobni-finance/hypoteky/hypoteka",
    americanUrls: [
      "https://www.csas.cz/cs/osobni-finance/hypoteky/americka-hypoteka",
    ],
  },
  {
    id: "komercni-banka",
    bankName: "Komerční banka",
    url: "https://www.kb.cz/cs/obcane/pujcky/hypoteky/hypoteka",
    alternateUrls: ["https://www.kb.cz/cs/obcane/hypoteky"],
    americanUrls: [
      "https://www.kb.cz/cs/obcane/pujcky/hypoteky/americka-hypoteka",
    ],
  },
  {
    id: "csob-hypotecni-banka",
    bankName: "ČSOB Hypoteční banka",
    url: "https://www.mesec.cz/produkty/hypoteky/hypoteka-csob/",
  },
  {
    id: "raiffeisen-bank",
    bankName: "Raiffeisen Bank",
    url: "https://www.rb.cz/osobni/hypoteky/nabidka-hypotek/hypoteka-s-nizsi-splatkou",
    alternateUrls: ["https://www.rb.cz/osobni/hypoteky"],
    americanUrls: [
      "https://www.banky.cz/banky/raiffeisen-bank/americka-hypoteka-rb/",
    ],
  },
  {
    id: "mbank",
    bankName: "mBank",
    url: "https://www.mbank.cz/osobni/hypoteky/hypoteka-na-bydleni/",
    alternateUrls: ["https://www.mbank.cz/osobni/hypoteky/"],
    americanUrls: ["https://www.mbank.cz/osobni/hypoteky/americka-hypoteka/"],
  },
  {
    id: "unicredit-bank",
    bankName: "UniCredit Bank",
    url: "https://www.unicreditbank.cz/cs/obcane/hypoteky/hypoteka-nove-penize.html",
    alternateUrls: [
      "https://www.unicreditbank.cz/cs/obcane/hypoteky/refinancovani-hypoteky.html",
    ],
  },
];

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "cs-CZ,cs;q=0.9,en;q=0.8",
};

const CSOB_MESEC_URL = "https://www.mesec.cz/produkty/hypoteky/hypoteka-csob/";
const CSOB_FINGO_URL = "https://www.fingo.cz/hypoteky/csob/hypoteka-od-csob";
const CSOB_PENIZE_URL =
  "https://www.penize.cz/hypoteky/402786-csob-hypotecni-banka-hypotecni-uver-do-80";
const PENIZE_AMERICAN_URL = "https://www.penize.cz/srovnani/americke-hypoteky";
const MBANK_CALC_CONFIG_URL =
  "https://www.mbank.cz/.config/calc/mortgage-config.txt";

const emptyAmerican = {
  americanRateWithInsurance: null as number | null,
  americanRpsnWithInsurance: null as number | null,
  americanRateWithoutInsurance: null as number | null,
  americanRpsnWithoutInsurance: null as number | null,
  americanWithoutInsuranceEstimated: true,
  americanSourceUrl: null as string | null,
};

function getUrlsToTry(config: BankScraperConfig): string[] {
  return [config.url, ...(config.alternateUrls ?? [])];
}

function toScrapedBankRate(
  config: Pick<BankScraperConfig, "id" | "bankName">,
  extracted: ExtractedMortgageRates,
  sourceUrl: string,
  american: typeof emptyAmerican = emptyAmerican
): ScrapedBankRate {
  const {
    rateWithInsurance,
    rpsnWithInsurance,
    rateWithoutInsurance,
    rpsnWithoutInsurance,
    withoutInsuranceEstimated,
  } = extracted;

  if (rateWithInsurance == null || !isValidMortgageRate(rateWithInsurance)) {
    throw new Error(
      `${config.bankName}: nepodařilo se zjistit sazbu s pojištěním`
    );
  }

  if (
    rpsnWithInsurance != null &&
    !isValidMortgagePair(rateWithInsurance, rpsnWithInsurance)
  ) {
    throw new Error(
      `${config.bankName}: neplatná kombinace sazby ${rateWithInsurance}% a RPSN ${rpsnWithInsurance}%`
    );
  }

  return {
    id: config.id,
    bankName: config.bankName,
    rate: rateWithInsurance,
    rpsn: rpsnWithInsurance,
    rateWithInsurance,
    rpsnWithInsurance,
    rateWithoutInsurance,
    rpsnWithoutInsurance,
    withoutInsuranceEstimated,
    sourceUrl,
    ...american,
  };
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: FETCH_HEADERS,
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} při stahování ${url}`);
  }

  const html = await response.text();
  if (isBotChallengePage(html)) {
    throw new Error(`anti-bot ochrana na ${url}`);
  }
  return html;
}

function americanFromExtracted(
  extracted: ExtractedMortgageRates,
  sourceUrl: string
): typeof emptyAmerican {
  if (
    extracted.rateWithInsurance == null ||
    !isValidMortgageRate(extracted.rateWithInsurance)
  ) {
    return emptyAmerican;
  }

  return {
    americanRateWithInsurance: extracted.rateWithInsurance,
    americanRpsnWithInsurance: extracted.rpsnWithInsurance,
    americanRateWithoutInsurance: extracted.rateWithoutInsurance,
    americanRpsnWithoutInsurance: extracted.rpsnWithoutInsurance,
    americanWithoutInsuranceEstimated: extracted.withoutInsuranceEstimated,
    americanSourceUrl: sourceUrl,
  };
}

/** Scrapuje americkou hypotéku — oficiální URL, jinak Peníze.cz (bez vymýšlení RPSN). */
async function scrapeAmericanRates(
  config: BankScraperConfig,
  penizeHtmlCache: { html: string | null }
): Promise<typeof emptyAmerican> {
  for (const url of config.americanUrls ?? []) {
    try {
      const html = await fetchHtml(url);
      const text = htmlToPlainText(html);
      const fromPage = extractMortgageRates(html);

      const hypoRate = extractFirstPercent(
        text,
        [
          /úrokové\s+sazbě\s+(\d{1,2}[,.]\d{1,2})\s*%/i,
          /americk[áa]\s+hypot[ée]ka[^\d%]{0,40}od\s+(\d{1,2}[,.]\d{1,2})\s*%/i,
          /neúčelov[áa][^\d%]{0,40}(\d{1,2}[,.]\d{1,2})\s*%/i,
          /úrokov[áa]\s+sazba\s+od\s+(\d{1,2}[,.]\d{1,2})\s*%/i,
        ],
        { mortgageOnly: true }
      );

      const rateWith = hypoRate ?? fromPage.rateWithInsurance;
      if (rateWith == null || !isValidMortgageRate(rateWith)) continue;

      const hypoRpsn = extractFirstPercent(text, RPSN_TEXT_PATTERNS, {
        mortgageOnly: true,
      });
      const rpsnCandidate = hypoRpsn ?? fromPage.rpsnWithInsurance;
      const rpsnWith =
        rpsnCandidate != null && isValidMortgagePair(rateWith, rpsnCandidate)
          ? rpsnCandidate
          : null;

      const extracted = applyInsuranceVariants(rateWith, rpsnWith, {
        rateWithoutInsurance: fromPage.rateWithoutInsurance,
        rpsnWithoutInsurance: fromPage.rpsnWithoutInsurance,
        surcharge:
          fromPage.rateWithoutInsurance == null
            ? extractInsuranceSurcharge(text)
            : null,
      });

      return americanFromExtracted(extracted, url);
    } catch {
      // zkus další URL / agregátor
    }
  }

  // Agregátor Peníze.cz — jen sazba; RPSN / bez pojištění = null
  try {
    if (!penizeHtmlCache.html) {
      penizeHtmlCache.html = await fetchHtml(PENIZE_AMERICAN_URL);
    }
    const rate = extractPenizeAmericanRate(penizeHtmlCache.html, config.id);
    if (rate != null) {
      return americanFromExtracted(
        applyInsuranceVariants(rate, null),
        PENIZE_AMERICAN_URL
      );
    }
  } catch {
    // american remains empty
  }

  return emptyAmerican;
}

/**
 * ČSOB: oficiální web blokuje boty → sazba z Měšec.cz,
 * RPSN z Fingo (reprezentativní příklad) — bez umělého RPSN.
 */
async function scrapeCsobClassic(): Promise<{
  extracted: ExtractedMortgageRates;
  sourceUrl: string;
}> {
  const config = {
    id: "csob-hypotecni-banka" as const,
    bankName: "ČSOB Hypoteční banka",
  };

  let rateWithInsurance: number | null = null;
  let rpsnWithInsurance: number | null = null;
  let rateWithoutInsurance: number | null = null;
  let rpsnWithoutInsurance: number | null = null;
  let sourceUrl = CSOB_MESEC_URL;
  const errors: string[] = [];

  try {
    const mesecHtml = await fetchHtml(CSOB_MESEC_URL);
    rateWithInsurance = extractMesecCsobRate(mesecHtml);
    const fromPage = extractMortgageRates(mesecHtml);
    if (fromPage.rateWithoutInsurance != null) {
      rateWithoutInsurance = fromPage.rateWithoutInsurance;
      rpsnWithoutInsurance = fromPage.rpsnWithoutInsurance;
    }
    if (rateWithInsurance == null) {
      errors.push("Měšec: nenalezena základní sazba v tabulce");
    }
  } catch (err) {
    errors.push(
      `Měšec: ${err instanceof Error ? err.message : "neznámá chyba"}`
    );
  }

  try {
    const fingoHtml = await fetchHtml(CSOB_FINGO_URL);
    const text = htmlToPlainText(fingoHtml);
    const example = text.match(
      /pevn[áa]\s+výpůjční\s+úrokov[áa]\s+sazba:\s*(\d{1,2}[,.]\d{1,2})\s*%[^.]{0,120}RPSN\)?:\s*(\d{1,2}[,.]\d{1,2})\s*%/i
    );
    if (example?.[2]) {
      const rpsn = Number(example[2].replace(",", "."));
      if (Number.isFinite(rpsn)) rpsnWithInsurance = +rpsn.toFixed(2);
    }
    if (rpsnWithInsurance == null) {
      rpsnWithInsurance = extractFirstPercent(text, RPSN_TEXT_PATTERNS, {
        mortgageOnly: true,
      });
    }
    const fromFingo = extractMortgageRates(fingoHtml);
    if (rateWithoutInsurance == null && fromFingo.rateWithoutInsurance != null) {
      rateWithoutInsurance = fromFingo.rateWithoutInsurance;
      rpsnWithoutInsurance = fromFingo.rpsnWithoutInsurance;
    }
    if (rateWithInsurance == null) {
      const fromRates = [...text.matchAll(/od\s+(\d{1,2}[,.]\d{1,2})\s*%/gi)]
        .map((m) => Number(String(m[1]).replace(",", ".")))
        .filter((n) => Number.isFinite(n) && n >= 3 && n <= 15);
      if (fromRates.length) {
        rateWithInsurance = Math.min(...fromRates);
        sourceUrl = CSOB_FINGO_URL;
      }
    }
  } catch (err) {
    errors.push(
      `Fingo: ${err instanceof Error ? err.message : "neznámá chyba"}`
    );
  }

  if (rateWithInsurance == null) {
    try {
      const penizeHtml = await fetchHtml(CSOB_PENIZE_URL);
      const text = htmlToPlainText(penizeHtml);
      const threeYear = text.match(
        /3\s*rok[yí]?[^\d]{0,40}(\d{1,2}[,.]\d{1,2})/i
      );
      if (threeYear?.[1]) {
        rateWithInsurance = Number(threeYear[1].replace(",", "."));
        sourceUrl = CSOB_PENIZE_URL;
      }
      const fromPenize = extractMortgageRates(penizeHtml);
      if (
        rateWithoutInsurance == null &&
        fromPenize.rateWithoutInsurance != null
      ) {
        rateWithoutInsurance = fromPenize.rateWithoutInsurance;
        rpsnWithoutInsurance = fromPenize.rpsnWithoutInsurance;
      }
    } catch (err) {
      errors.push(
        `Peníze.cz: ${err instanceof Error ? err.message : "neznámá chyba"}`
      );
    }
  }

  if (rateWithInsurance == null) {
    throw new Error(
      `${config.bankName}: nepodařilo se získat sazbu z agregátorů (${errors.join("; ")})`
    );
  }

  return {
    extracted: applyInsuranceVariants(rateWithInsurance, rpsnWithInsurance, {
      rateWithoutInsurance,
      rpsnWithoutInsurance,
    }),
    sourceUrl,
  };
}

/** mBank: oficiální kalkulační config (reálné sazby + sleva za pojištění). */
async function scrapeMbank(): Promise<ScrapedBankRate> {
  const config = {
    id: "mbank" as const,
    bankName: "mBank",
  };
  const raw = await fetchHtml(MBANK_CALC_CONFIG_URL);
  const parsed = extractMbankRatesFromConfig(raw);
  if (!parsed?.classic.rateWithInsurance) {
    throw new Error("mBank: nepodařilo se načíst sazby z mortgage-config.txt");
  }

  return toScrapedBankRate(
    config,
    parsed.classic,
    MBANK_CALC_CONFIG_URL,
    americanFromExtracted(parsed.american, MBANK_CALC_CONFIG_URL)
  );
}

export async function scrapeBank(
  config: BankScraperConfig,
  penizeHtmlCache: { html: string | null } = { html: null }
): Promise<ScrapedBankRate> {
  if (config.id === "mbank") {
    return scrapeMbank();
  }

  let extracted: ExtractedMortgageRates;
  let sourceUrl: string;

  if (config.id === "csob-hypotecni-banka") {
    const classic = await scrapeCsobClassic();
    extracted = classic.extracted;
    sourceUrl = classic.sourceUrl;
  } else {
    let lastError: Error | null = null;
    let found: { extracted: ExtractedMortgageRates; sourceUrl: string } | null =
      null;

    for (const url of getUrlsToTry(config)) {
      try {
        const html = await fetchHtml(url);
        const parsed = extractMortgageRates(html);

        if (parsed.rateWithInsurance == null) {
          throw new Error(
            `${config.bankName}: nepodařilo se najít úrokovou sazbu na ${url}`
          );
        }

        found = { extracted: parsed, sourceUrl: url };
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error("Neznámá chyba");
      }
    }

    if (!found) {
      throw (
        lastError ??
        new Error(`${config.bankName}: scraping selhal bez detailní chyby`)
      );
    }

    extracted = found.extracted;
    sourceUrl = found.sourceUrl;
  }

  const american = await scrapeAmericanRates(config, penizeHtmlCache);
  return toScrapedBankRate(config, extracted, sourceUrl, american);
}

export async function scrapeAllBanks(): Promise<{
  success: ScrapedBankRate[];
  failures: { id: string; bankName: string; error: string }[];
}> {
  const success: ScrapedBankRate[] = [];
  const failures: { id: string; bankName: string; error: string }[] = [];
  const penizeHtmlCache = { html: null as string | null };

  for (const config of BANK_SCRAPERS) {
    try {
      const scraped = await scrapeBank(config, penizeHtmlCache);
      success.push(scraped);
    } catch (err) {
      failures.push({
        id: config.id,
        bankName: config.bankName,
        error: err instanceof Error ? err.message : "Neznámá chyba",
      });
    }
  }

  return { success, failures };
}
