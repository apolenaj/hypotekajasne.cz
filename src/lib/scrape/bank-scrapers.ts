/**
 * Konfigurace scraperů českých bank (klasická + americká hypotéka).
 */

import {
  BANK_NAME_TO_SCRAPER_ID,
  type BankScraperId,
} from "@/lib/scrape/bank-ids";
import {
  applyInsuranceVariants,
  applyKbMarketCorrection,
  ensureRpsn,
  extractMesecCsobRate,
  extractMortgageRates,
  extractFirstPercent,
  extractPenizeAmericanRate,
  htmlToPlainText,
  isBotChallengePage,
  isValidMortgagePair,
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
  /** Zrcadlí sazbu s pojištěním (hlavní inzerovaná sazba). */
  rate: number;
  rpsn: number;
  rateWithInsurance: number;
  rpsnWithInsurance: number;
  rateWithoutInsurance: number;
  rpsnWithoutInsurance: number;
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

  if (
    rateWithInsurance == null ||
    rpsnWithInsurance == null ||
    rateWithoutInsurance == null ||
    rpsnWithoutInsurance == null
  ) {
    throw new Error(
      `${config.bankName}: neúplné sazby (s pojištěním / bez pojištění)`
    );
  }

  if (!isValidMortgagePair(rateWithInsurance, rpsnWithInsurance)) {
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
    extracted.rpsnWithInsurance == null ||
    extracted.rateWithoutInsurance == null ||
    extracted.rpsnWithoutInsurance == null
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

/** Scrapuje americkou hypotéku — oficiální URL, jinak Peníze.cz. */
async function scrapeAmericanRates(
  config: BankScraperConfig,
  penizeHtmlCache: { html: string | null }
): Promise<typeof emptyAmerican> {
  for (const url of config.americanUrls ?? []) {
    try {
      const html = await fetchHtml(url);
      let extracted = extractMortgageRates(html);

      // Preferuj sazbu v kontextu „úrokové sazbě X %“ (mBank jinak chytí spoření 4,21 %)
      const text = htmlToPlainText(html);
      const hypoRate = extractFirstPercent(
        text,
        [
          /úrokové\s+sazbě\s+(\d{1,2}[,.]\d{1,2})\s*%/i,
          /americk[áa]\s+hypot[ée]ka[^\d%]{0,40}od\s+(\d{1,2}[,.]\d{1,2})\s*%/i,
          /neúčelov[áa][^\d%]{0,40}(\d{1,2}[,.]\d{1,2})\s*%/i,
        ],
        { mortgageOnly: true }
      );
      const hypoRpsn =
        extractFirstPercent(text, RPSN_TEXT_PATTERNS, { mortgageOnly: true }) ??
        extracted.rpsnWithInsurance;

      if (hypoRate != null && hypoRpsn != null && isValidMortgagePair(hypoRate, hypoRpsn)) {
        extracted = applyInsuranceVariants(hypoRate, hypoRpsn);
      } else if (
        extracted.rateWithInsurance != null &&
        extracted.rpsnWithInsurance != null &&
        extracted.rpsnWithInsurance - extracted.rateWithInsurance > 1.0 &&
        hypoRate != null
      ) {
        extracted = applyInsuranceVariants(
          hypoRate,
          ensureRpsn(hypoRate, extracted.rpsnWithInsurance)
        );
      }

      // ČS americká: často jen RPSN v textu „procentní sazba nákladů činí“
      if (extracted.rateWithInsurance == null) {
        const costRate = text.match(
          /procentn[íi]\s+sazba\s+n[áa]klad[uů][^\d]{0,20}[cč]in[íi]\s+(\d{1,2}[,.]\d{1,2})\s*%/i
        );
        if (costRate?.[1]) {
          const rpsn = Number(costRate[1].replace(",", "."));
          const rate = +(rpsn - 0.3).toFixed(2);
          if (isValidMortgagePair(rate, rpsn)) {
            extracted = applyInsuranceVariants(rate, rpsn);
          }
        }
      }

      if (
        extracted.rateWithInsurance != null &&
        extracted.rpsnWithInsurance != null
      ) {
        return americanFromExtracted(extracted, url);
      }

      // Jen sazba bez RPSN
      if (extracted.rateWithInsurance != null) {
        const rpsn = ensureRpsn(extracted.rateWithInsurance, null);
        return americanFromExtracted(
          applyInsuranceVariants(extracted.rateWithInsurance, rpsn),
          url
        );
      }
    } catch {
      // zkus další URL / agregátor
    }
  }

  // Agregátor Peníze.cz
  try {
    if (!penizeHtmlCache.html) {
      penizeHtmlCache.html = await fetchHtml(PENIZE_AMERICAN_URL);
    }
    const rate = extractPenizeAmericanRate(penizeHtmlCache.html, config.id);
    if (rate != null) {
      const rpsn = ensureRpsn(rate, null);
      return americanFromExtracted(
        applyInsuranceVariants(rate, rpsn),
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
 * RPSN z Fingo (reprezentativní příklad), fallback rate+0.2.
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
  let sourceUrl = CSOB_MESEC_URL;
  const errors: string[] = [];

  try {
    const mesecHtml = await fetchHtml(CSOB_MESEC_URL);
    rateWithInsurance = extractMesecCsobRate(mesecHtml);
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

  rpsnWithInsurance = ensureRpsn(rateWithInsurance, rpsnWithInsurance);
  return {
    extracted: applyInsuranceVariants(rateWithInsurance, rpsnWithInsurance),
    sourceUrl,
  };
}

export async function scrapeBank(
  config: BankScraperConfig,
  penizeHtmlCache: { html: string | null } = { html: null }
): Promise<ScrapedBankRate> {
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
        if (parsed.rpsnWithInsurance == null) {
          throw new Error(
            `${config.bankName}: nepodařilo se najít RPSN na ${url}`
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

  // Insider korekce KB — reálná tržní sazba bez pojištění 4,94 %
  if (config.id === "komercni-banka") {
    extracted = applyKbMarketCorrection(extracted);
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
