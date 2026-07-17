/**
 * Konfigurace scraperů českých bank.
 * Selektor / vzory ladí se podle aktuálního HTML banky.
 */

import {
  BANK_NAME_TO_SCRAPER_ID,
  type BankScraperId,
} from "@/lib/scrape/bank-ids";
import {
  applyInsuranceVariants,
  ensureRpsn,
  extractMesecCsobRate,
  extractMortgageRates,
  extractFirstPercent,
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
  /** Vlastní parser (např. ČSOB přes agregátor). */
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
};

export const BANK_SCRAPERS: BankScraperConfig[] = [
  {
    id: "ceska-sporitelna",
    bankName: "Česká spořitelna",
    url: "https://www.csas.cz/cs/osobni-finance/hypoteky/hypoteka",
  },
  {
    id: "komercni-banka",
    bankName: "Komerční banka",
    url: "https://www.kb.cz/cs/obcane/pujcky/hypoteky/hypoteka",
    alternateUrls: ["https://www.kb.cz/cs/obcane/hypoteky"],
  },
  {
    id: "csob-hypotecni-banka",
    bankName: "ČSOB Hypoteční banka",
    // Oficiální csob.cz blokuje server-side fetch (TSPD).
    // Primární zdroj: Měšec.cz produktová karta + RPSN z Fingo (reprezentativní příklad).
    url: "https://www.mesec.cz/produkty/hypoteky/hypoteka-csob/",
    customScrape: scrapeCsobViaAggregators,
  },
  {
    id: "raiffeisen-bank",
    bankName: "Raiffeisen Bank",
    url: "https://www.rb.cz/osobni/hypoteky/nabidka-hypotek/hypoteka-s-nizsi-splatkou",
    alternateUrls: ["https://www.rb.cz/osobni/hypoteky"],
  },
  {
    id: "mbank",
    bankName: "mBank",
    url: "https://www.mbank.cz/osobni/hypoteky/hypoteka-na-bydleni/",
    alternateUrls: ["https://www.mbank.cz/osobni/hypoteky/"],
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

function getUrlsToTry(config: BankScraperConfig): string[] {
  return [config.url, ...(config.alternateUrls ?? [])];
}

function toScrapedBankRate(
  config: Pick<BankScraperConfig, "id" | "bankName">,
  extracted: ExtractedMortgageRates,
  sourceUrl: string
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
  };
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: FETCH_HEADERS,
    next: { revalidate: 0 },
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

/**
 * ČSOB: oficiální web blokuje boty → sazba z Měšec.cz,
 * RPSN z Fingo (reprezentativní příklad), fallback rate+0.2.
 */
async function scrapeCsobViaAggregators(): Promise<ScrapedBankRate> {
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
    // Pokud Měšec selhal, zkus nejnižší „od X %“ z Fingo
    if (rateWithInsurance == null) {
      const fromRates = [
        ...text.matchAll(/od\s+(\d{1,2}[,.]\d{1,2})\s*%/gi),
      ]
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

  const extracted = applyInsuranceVariants(
    rateWithInsurance,
    rpsnWithInsurance
  );

  return toScrapedBankRate(config, extracted, sourceUrl);
}

export async function scrapeBank(
  config: BankScraperConfig
): Promise<ScrapedBankRate> {
  if (config.customScrape) {
    return config.customScrape();
  }

  let lastError: Error | null = null;

  for (const url of getUrlsToTry(config)) {
    try {
      const html = await fetchHtml(url);
      const extracted = extractMortgageRates(html);

      if (extracted.rateWithInsurance == null) {
        throw new Error(
          `${config.bankName}: nepodařilo se najít úrokovou sazbu na ${url}`
        );
      }

      if (extracted.rpsnWithInsurance == null) {
        throw new Error(
          `${config.bankName}: nepodařilo se najít RPSN na ${url}`
        );
      }

      return toScrapedBankRate(config, extracted, url);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Neznámá chyba");
    }
  }

  throw (
    lastError ??
    new Error(`${config.bankName}: scraping selhal bez detailní chyby`)
  );
}

export async function scrapeAllBanks(): Promise<{
  success: ScrapedBankRate[];
  failures: { id: string; bankName: string; error: string }[];
}> {
  const success: ScrapedBankRate[] = [];
  const failures: { id: string; bankName: string; error: string }[] = [];

  for (const config of BANK_SCRAPERS) {
    try {
      const scraped = await scrapeBank(config);
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
