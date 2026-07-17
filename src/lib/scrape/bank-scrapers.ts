/**
 * Konfigurace scraperů českých bank.
 * Selektor / vzory ladí se podle aktuálního HTML banky.
 */

import {
  BANK_NAME_TO_SCRAPER_ID,
  type BankScraperId,
} from "@/lib/scrape/bank-ids";
import {
  extractFirstPercent,
  extractFromSelectors,
  RATE_TEXT_PATTERNS,
  RPSN_TEXT_PATTERNS,
} from "@/lib/scrape/parse-rate";

export type { BankScraperId };
export { BANK_NAME_TO_SCRAPER_ID };

export type BankScraperConfig = {
  id: BankScraperId;
  bankName: string;
  url: string;
  rateSelectors: string[];
  rpsnSelectors: string[];
};

export type ScrapedBankRate = {
  id: BankScraperId;
  bankName: string;
  rate: number;
  rpsn: number;
  sourceUrl: string;
};

export const BANK_SCRAPERS: BankScraperConfig[] = [
  {
    id: "ceska-sporitelna",
    bankName: "Česká spořitelna",
    url: "https://www.csas.cz/cs/osobni-finance/hypoteky/hypoteka",
    rateSelectors: [
      "[data-testid*='rate']",
      ".interest-rate",
      ".hypo-rate",
      "h1",
      "h2",
    ],
    rpsnSelectors: [".rpsn", "[data-testid*='rpsn']", "p", "li"],
  },
  {
    id: "komercni-banka",
    bankName: "Komerční banka",
    url: "https://www.kb.cz/cs/obcane/uvery/hypoteky",
    rateSelectors: [
      ".product-rate",
      ".interest-rate",
      "[class*='rate']",
      "h1",
      "h2",
      "strong",
    ],
    rpsnSelectors: [".rpsn", "[class*='rpsn']", "p", "li"],
  },
  {
    id: "csob-hypotecni-banka",
    bankName: "ČSOB Hypoteční banka",
    url: "https://www.csob.cz/lide/bydleni/hypoteka",
    rateSelectors: ["[class*='rate']", "h1", "h2", "strong"],
    rpsnSelectors: ["[class*='rpsn']", "p", "li"],
  },
  {
    id: "raiffeisen-bank",
    bankName: "Raiffeisen Bank",
    url: "https://www.rb.cz/osobni/hypoteky",
    rateSelectors: ["[class*='rate']", "h1", "h2", "strong"],
    rpsnSelectors: ["[class*='rpsn']", "p", "li"],
  },
  {
    id: "mbank",
    bankName: "mBank",
    url: "https://www.mbank.cz/osobni/hypoteky/",
    rateSelectors: ["[class*='rate']", "h1", "h2", "strong"],
    rpsnSelectors: ["[class*='rpsn']", "p", "li"],
  },
  {
    id: "unicredit-bank",
    bankName: "UniCredit Bank",
    url: "https://www.unicreditbank.cz/cs/obcane/hypoteky.html",
    rateSelectors: ["[class*='rate']", "h1", "h2", "strong"],
    rpsnSelectors: ["[class*='rpsn']", "p", "li"],
  },
];

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "cs-CZ,cs;q=0.9,en;q=0.8",
};

export async function scrapeBank(
  config: BankScraperConfig
): Promise<ScrapedBankRate> {
  const response = await fetch(config.url, {
    headers: FETCH_HEADERS,
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(25_000),
  });

  if (!response.ok) {
    throw new Error(
      `${config.bankName}: HTTP ${response.status} při stahování ${config.url}`
    );
  }

  const html = await response.text();
  const plainText = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

  const rate =
    extractFromSelectors(html, config.rateSelectors) ??
    extractFirstPercent(plainText, RATE_TEXT_PATTERNS);

  const rpsn =
    extractFromSelectors(html, config.rpsnSelectors) ??
    extractFirstPercent(plainText, RPSN_TEXT_PATTERNS);

  if (rate == null) {
    throw new Error(
      `${config.bankName}: nepodařilo se najít úrokovou sazbu na ${config.url}`
    );
  }

  if (rpsn == null) {
    throw new Error(
      `${config.bankName}: nepodařilo se najít RPSN na ${config.url}`
    );
  }

  return {
    id: config.id,
    bankName: config.bankName,
    rate,
    rpsn,
    sourceUrl: config.url,
  };
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
