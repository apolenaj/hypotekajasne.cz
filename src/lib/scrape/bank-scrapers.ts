/**
 * Konfigurace scraperů českých bank.
 * Selektor / vzory ladí se podle aktuálního HTML banky.
 */

import {
  BANK_NAME_TO_SCRAPER_ID,
  type BankScraperId,
} from "@/lib/scrape/bank-ids";
import {
  extractMortgageRates,
  isBotChallengePage,
  isValidMortgagePair,
} from "@/lib/scrape/parse-rate";

export type { BankScraperId };
export { BANK_NAME_TO_SCRAPER_ID };

export type BankScraperConfig = {
  id: BankScraperId;
  bankName: string;
  url: string;
  alternateUrls?: string[];
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
    url: "https://www.csob.cz/lide/bydleni/hypoteka",
    alternateUrls: ["https://www.csob.cz/lide/bydleni/hypoteka-na-usporne-bydleni"],
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

function getUrlsToTry(config: BankScraperConfig): string[] {
  return [config.url, ...(config.alternateUrls ?? [])];
}

export async function scrapeBank(
  config: BankScraperConfig
): Promise<ScrapedBankRate> {
  let lastError: Error | null = null;

  for (const url of getUrlsToTry(config)) {
    try {
      const response = await fetch(url, {
        headers: FETCH_HEADERS,
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(25_000),
      });

      if (!response.ok) {
        throw new Error(
          `${config.bankName}: HTTP ${response.status} při stahování ${url}`
        );
      }

      const html = await response.text();

      if (isBotChallengePage(html)) {
        throw new Error(
          `${config.bankName}: stránka vyžaduje JavaScript / anti-bot ochranu (${url})`
        );
      }

      const { rate, rpsn } = extractMortgageRates(html);

      if (rate == null) {
        throw new Error(
          `${config.bankName}: nepodařilo se najít úrokovou sazbu na ${url}`
        );
      }

      if (rpsn == null) {
        throw new Error(
          `${config.bankName}: nepodařilo se najít RPSN na ${url}`
        );
      }

      if (!isValidMortgagePair(rate, rpsn)) {
        throw new Error(
          `${config.bankName}: neplatná kombinace sazby ${rate}% a RPSN ${rpsn}%`
        );
      }

      return {
        id: config.id,
        bankName: config.bankName,
        rate,
        rpsn,
        sourceUrl: url,
      };
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
