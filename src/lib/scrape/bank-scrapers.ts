/**
 * Konfigurace scraperů českých bank (klasická + americká hypotéka).
 * KB: insider sazby. Ostatní: chybějící „bez pojištění“ = orientačně +0.3 p.b.
 */

import {
  BANK_NAME_TO_SCRAPER_ID,
  type BankScraperId,
} from "@/lib/scrape/bank-ids";
import {
  buildExtractedRates,
  extractFirstPercent,
  extractMesecFixationRate,
  extractMortgageRates,
  extractPenizeAmericanRate,
  extractUnicreditInterestFromPce,
  htmlToPlainText,
  isBotChallengePage,
  isValidMortgagePair,
  isValidMortgageRate,
  roundRate,
  RPSN_TEXT_PATTERNS,
  type ExtractedMortgageRates,
} from "@/lib/scrape/parse-rate";
import {
  KB_INSIDER_RATES,
  ORIENTATIONAL_WITHOUT_SURCHARGE,
} from "@/lib/scrape/rate-policy";

export type { BankScraperId };
export { BANK_NAME_TO_SCRAPER_ID };
export { KB_INSIDER_RATES, ORIENTATIONAL_WITHOUT_SURCHARGE };

export type BankScraperConfig = {
  id: BankScraperId;
  bankName: string;
  url: string;
  alternateUrls?: string[];
  /** Oficiální stránky americké / neúčelové hypotéky. */
  americanUrls?: string[];
  /** Měšec produktová stránka (záložní zdroj sazby s pojištěním). */
  mesecUrl?: string;
};

export type ScrapedBankRate = {
  id: BankScraperId;
  bankName: string;
  /** Zrcadlí sazbu s pojištěním (hlavní inzerovaná sazba). */
  rate: number;
  /** null pokud banka neuvedla ověřené RPSN u sazby s pojištěním */
  rpsn: number | null;
  rateWithInsurance: number;
  rpsnWithInsurance: number | null;
  rateWithoutInsurance: number | null;
  rpsnWithoutInsurance: number | null;
  /** true = bez pojištění doplněno orientačně (+0.3 p.b.) */
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
    mesecUrl:
      "https://www.mesec.cz/produkty/hypoteky/hypoteka-ceske-sporitelny-ceska-sporitelna/",
  },
  {
    id: "komercni-banka",
    bankName: "Komerční banka",
    url: "https://www.kb.cz/cs/obcane/pujcky/hypoteky/hypoteka",
    alternateUrls: ["https://www.kb.cz/cs/obcane/hypoteky"],
    americanUrls: [
      "https://www.kb.cz/cs/obcane/pujcky/hypoteky/americka-hypoteka",
    ],
    mesecUrl: "https://www.mesec.cz/produkty/hypoteky/hypoteka-komercni-banka/",
  },
  {
    id: "csob-hypotecni-banka",
    bankName: "ČSOB Hypoteční banka",
    url: "https://www.mesec.cz/produkty/hypoteky/hypoteka-csob/",
    mesecUrl: "https://www.mesec.cz/produkty/hypoteky/hypoteka-csob/",
  },
  {
    id: "raiffeisen-bank",
    bankName: "Raiffeisen Bank",
    url: "https://www.rb.cz/osobni/hypoteky/nabidka-hypotek/hypoteka-s-nizsi-splatkou",
    alternateUrls: ["https://www.rb.cz/osobni/hypoteky"],
    americanUrls: [
      "https://www.banky.cz/banky/raiffeisen-bank/americka-hypoteka-rb/",
    ],
    mesecUrl:
      "https://www.mesec.cz/produkty/hypoteky/hypoteka-raiffeisenbank/",
  },
  {
    id: "mbank",
    bankName: "mBank",
    url: "https://www.mbank.cz/osobni/hypoteky/hypoteka-na-bydleni/",
    alternateUrls: ["https://www.mbank.cz/osobni/hypoteky/"],
    americanUrls: ["https://www.mbank.cz/osobni/hypoteky/americka-hypoteka/"],
    mesecUrl: "https://www.mesec.cz/produkty/hypoteky/mhypoteka-mbank/",
  },
  {
    id: "unicredit-bank",
    bankName: "UniCredit Bank",
    url: "https://www.unicreditbank.cz/cs/obcane/hypoteky/hypoteka-nove-penize.html",
    alternateUrls: [
      "https://www.unicreditbank.cz/cs/obcane/hypoteky/refinancovani-hypoteky.html",
    ],
    mesecUrl: "https://www.mesec.cz/produkty/hypoteky/hypoteka-unicredit-bank/",
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

const UNICREDIT_PAGE =
  "https://www.unicreditbank.cz/cs/obcane/hypoteky/hypoteka-nove-penize.html";
const UNICREDIT_PCE_URL =
  "https://www.unicreditbank.cz/show.pws.pceCalculate.html";
const UNICREDIT_FAMILY_ID = "912";

const emptyAmerican = {
  americanRateWithInsurance: null as number | null,
  americanRpsnWithInsurance: null as number | null,
  americanRateWithoutInsurance: null as number | null,
  americanRpsnWithoutInsurance: null as number | null,
  americanWithoutInsuranceEstimated: false,
  americanSourceUrl: null as string | null,
};

function getUrlsToTry(config: BankScraperConfig): string[] {
  return [config.url, ...(config.alternateUrls ?? [])];
}

/** Doplní chybějící sazbu bez pojištění orientačně (+0.3 p.b.). */
function fillOrientationalWithout(
  rateWith: number | null,
  rpsnWith: number | null,
  rateWithout: number | null,
  rpsnWithout: number | null
): {
  rateWithout: number | null;
  rpsnWithout: number | null;
  estimated: boolean;
} {
  if (rateWithout != null || rateWith == null) {
    return {
      rateWithout,
      rpsnWithout,
      estimated: false,
    };
  }

  const filledRate = roundRate(rateWith + ORIENTATIONAL_WITHOUT_SURCHARGE);
  const filledRpsn =
    rpsnWithout != null
      ? rpsnWithout
      : rpsnWith != null
        ? roundRate(rpsnWith + ORIENTATIONAL_WITHOUT_SURCHARGE)
        : null;

  return {
    rateWithout: filledRate,
    rpsnWithout: filledRpsn,
    estimated: true,
  };
}

/** Insider přepis KB klasické hypotéky. */
function applyKbInsiderRates(
  scraped: ExtractedMortgageRates
): ExtractedMortgageRates {
  const rateWith = KB_INSIDER_RATES.rateWithInsurance;
  const rateWithout = KB_INSIDER_RATES.rateWithoutInsurance;

  const spread =
    scraped.rateWithInsurance != null && scraped.rpsnWithInsurance != null
      ? roundRate(scraped.rpsnWithInsurance - scraped.rateWithInsurance)
      : null;
  const safeSpread =
    spread != null && spread >= 0 && spread <= 1.5 ? spread : null;

  return buildExtractedRates({
    rateWithInsurance: rateWith,
    rpsnWithInsurance:
      safeSpread != null ? roundRate(rateWith + safeSpread) : scraped.rpsnWithInsurance,
    rateWithoutInsurance: rateWithout,
    rpsnWithoutInsurance:
      safeSpread != null
        ? roundRate(rateWithout + safeSpread)
        : scraped.rpsnWithoutInsurance,
  });
}

function toScrapedBankRate(
  config: Pick<BankScraperConfig, "id" | "bankName">,
  extracted: ExtractedMortgageRates,
  sourceUrl: string,
  american: typeof emptyAmerican = emptyAmerican,
  flags: {
    withoutInsuranceEstimated: boolean;
    americanWithoutInsuranceEstimated: boolean;
  } = {
    withoutInsuranceEstimated: false,
    americanWithoutInsuranceEstimated: false,
  }
): ScrapedBankRate {
  const {
    rateWithInsurance,
    rpsnWithInsurance,
    rateWithoutInsurance,
    rpsnWithoutInsurance,
  } = extracted;

  if (rateWithInsurance == null) {
    throw new Error(
      `${config.bankName}: chybí ověřená sazba s pojištěním (with=${String(rateWithInsurance)})`
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
    withoutInsuranceEstimated: flags.withoutInsuranceEstimated,
    sourceUrl,
    ...american,
    americanWithoutInsuranceEstimated:
      flags.americanWithoutInsuranceEstimated ||
      american.americanWithoutInsuranceEstimated,
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

function americanFromPartial(
  rateWith: number | null,
  rpsnWith: number | null,
  rateWithout: number | null,
  rpsnWithout: number | null,
  sourceUrl: string
): typeof emptyAmerican {
  if (rateWith == null || !isValidMortgageRate(rateWith)) {
    return emptyAmerican;
  }

  // RPSN je volitelné — jen pokud tvoří platný pár se sazbou
  const safeRpsnWith =
    rpsnWith != null && isValidMortgagePair(rateWith, rpsnWith)
      ? rpsnWith
      : null;

  let safeRateWithout =
    rateWithout != null && isValidMortgageRate(rateWithout)
      ? rateWithout
      : null;
  if (safeRateWithout != null && safeRateWithout < rateWith - 0.001) {
    safeRateWithout = null;
  }

  const safeRpsnWithout =
    safeRateWithout != null &&
    rpsnWithout != null &&
    isValidMortgagePair(safeRateWithout, rpsnWithout)
      ? rpsnWithout
      : null;

  return {
    americanRateWithInsurance: rateWith,
    americanRpsnWithInsurance: safeRpsnWith,
    americanRateWithoutInsurance: safeRateWithout,
    americanRpsnWithoutInsurance: safeRpsnWithout,
    americanWithoutInsuranceEstimated: false,
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
      const extracted = extractMortgageRates(html);
      const text = htmlToPlainText(html);

      const hypoRate =
        extractFirstPercent(
          text,
          [
            /úrokové\s+sazbě\s+(\d{1,2}[,.]\d{1,2})\s*%/i,
            /americk[áa]\s+hypot[ée]ka[^\d%]{0,40}od\s+(\d{1,2}[,.]\d{1,2})\s*%/i,
            /neúčelov[áa][^\d%]{0,40}(\d{1,2}[,.]\d{1,2})\s*%/i,
          ],
          { mortgageOnly: true }
        ) ?? extracted.rateWithInsurance;

      const hypoRpsn =
        extractFirstPercent(text, RPSN_TEXT_PATTERNS, { mortgageOnly: true }) ??
        extracted.rpsnWithInsurance;

      if (hypoRate != null) {
        return americanFromPartial(
          hypoRate,
          hypoRpsn,
          extracted.rateWithoutInsurance,
          extracted.rpsnWithoutInsurance,
          url
        );
      }
    } catch {
      // zkus další URL / agregátor
    }
  }

  try {
    if (!penizeHtmlCache.html) {
      penizeHtmlCache.html = await fetchHtml(PENIZE_AMERICAN_URL);
    }
    const rate = extractPenizeAmericanRate(penizeHtmlCache.html, config.id);
    if (rate != null) {
      // Peníze.cz uvádí sazbu, RPSN a bez pojištění typicky ne — null
      return americanFromPartial(rate, null, null, null, PENIZE_AMERICAN_URL);
    }
  } catch {
    // american remains empty
  }

  return emptyAmerican;
}

/**
 * UniCredit: oficiální PCE kalkulačka s přepínačem CPI (A/B/C vs No).
 * Vrací reálné sazby s/bez pojištění z bankovního API.
 */
async function scrapeUnicreditClassic(): Promise<{
  extracted: ExtractedMortgageRates;
  sourceUrl: string;
}> {
  const pageHtml = await fetchHtml(UNICREDIT_PAGE);
  const pageRates = extractMortgageRates(pageHtml);
  const pageText = htmlToPlainText(pageHtml);

  const exampleMatch = pageText.match(
    /úrokov[áa]\s+sazba\s+(\d{1,2}[,.]\d{1,2})\s*%[\s\S]{0,220}?RPSN\)?\s*(\d{1,2}[,.]\d{1,2})\s*%/i
  );
  let exampleRate: number | null = null;
  let exampleRpsn: number | null = null;
  if (exampleMatch?.[1] && exampleMatch[2]) {
    exampleRate = Number(exampleMatch[1].replace(",", "."));
    exampleRpsn = Number(exampleMatch[2].replace(",", "."));
    if (
      !Number.isFinite(exampleRate) ||
      !Number.isFinite(exampleRpsn) ||
      !isValidMortgagePair(exampleRate, exampleRpsn)
    ) {
      exampleRate = null;
      exampleRpsn = null;
    } else {
      exampleRate = +exampleRate.toFixed(2);
      exampleRpsn = +exampleRpsn.toFixed(2);
    }
  }

  async function pceInterest(cpi: "B" | "No"): Promise<number | null> {
    const serializedFields = [
      "propertyValueNew=4000000",
      "propertyValueNew_input=4000000",
      "Amount=3000000",
      "Amount_input=3000000",
      "Tenor=25",
      "Tenor_input=25",
      "FixPeriod=3",
      `CPI=${cpi}`,
    ].join("&");

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(UNICREDIT_PCE_URL, {
          method: "POST",
          headers: {
            ...FETCH_HEADERS,
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Accept: "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With": "XMLHttpRequest",
            SourceSystem: "PWS",
            EntityCode: "CZ",
            Language: "CS",
            Referer: UNICREDIT_PAGE,
            Origin: "https://www.unicreditbank.cz",
          },
          body: new URLSearchParams({
            familyId: UNICREDIT_FAMILY_ID,
            serializedFields,
          }).toString(),
          cache: "no-store",
          signal: AbortSignal.timeout(25_000),
        });

        if (!response.ok) {
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 800));
            continue;
          }
          return null;
        }

        const text = await response.text();
        let payload: unknown;
        try {
          payload = JSON.parse(text);
        } catch {
          return null;
        }
        return extractUnicreditInterestFromPce(payload);
      } catch {
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }
        return null;
      }
    }
    return null;
  }

  const rateWithInsurance = await pceInterest("B");
  await new Promise((r) => setTimeout(r, 400));
  const rateWithoutInsurance = await pceInterest("No");

  if (rateWithInsurance != null) {
    let rpsnWith: number | null = null;
    let rpsnWithout: number | null = null;

    if (exampleRate != null && exampleRpsn != null) {
      if (
        rateWithoutInsurance != null &&
        Math.abs(exampleRate - rateWithoutInsurance) < 0.021
      ) {
        rpsnWithout = exampleRpsn;
      } else if (Math.abs(exampleRate - rateWithInsurance) < 0.021) {
        rpsnWith = exampleRpsn;
      }
    }

    return {
      extracted: buildExtractedRates({
        rateWithInsurance,
        rpsnWithInsurance: rpsnWith,
        rateWithoutInsurance,
        rpsnWithoutInsurance: rpsnWithout,
      }),
      sourceUrl: UNICREDIT_PCE_URL,
    };
  }

  // PCE nedostupné — jen to, co stránka explicitně dá (bez přiřazování příkladu k „bez pojištění“)
  if (pageRates.rateWithInsurance == null) {
    throw new Error("UniCredit Bank: PCE ani stránka nevrátili sazbu");
  }

  return {
    extracted: buildExtractedRates({
      rateWithInsurance: pageRates.rateWithInsurance,
      rpsnWithInsurance: pageRates.rpsnWithInsurance,
      rateWithoutInsurance: pageRates.rateWithoutInsurance,
      rpsnWithoutInsurance: pageRates.rpsnWithoutInsurance,
    }),
    sourceUrl: UNICREDIT_PAGE,
  };
}

/**
 * ČSOB: oficiální web blokuje boty → sazba z Měšec.cz, RPSN z Fingo.
 * Bez pojištění jen pokud agregátor uvádí absolutní číslo (jinak null).
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
    rateWithInsurance = extractMesecFixationRate(mesecHtml);
    const mesecParsed = extractMortgageRates(mesecHtml);
    rateWithoutInsurance = mesecParsed.rateWithoutInsurance;
    rpsnWithoutInsurance = mesecParsed.rpsnWithoutInsurance;
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
    const fingoParsed = extractMortgageRates(fingoHtml);
    if (rateWithoutInsurance == null) {
      rateWithoutInsurance = fingoParsed.rateWithoutInsurance;
      rpsnWithoutInsurance = fingoParsed.rpsnWithoutInsurance;
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
      const penizeParsed = extractMortgageRates(penizeHtml);
      if (rateWithoutInsurance == null) {
        rateWithoutInsurance = penizeParsed.rateWithoutInsurance;
        rpsnWithoutInsurance = penizeParsed.rpsnWithoutInsurance;
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
    extracted: buildExtractedRates({
      rateWithInsurance,
      rpsnWithInsurance,
      rateWithoutInsurance,
      rpsnWithoutInsurance,
    }),
    sourceUrl,
  };
}

/** Záložní Měšec sazba (s pojištěním / základní) + RPSN ze stránky banky pokud je. */
async function scrapeMesecFallback(
  config: BankScraperConfig,
  existing: ExtractedMortgageRates | null
): Promise<{ extracted: ExtractedMortgageRates; sourceUrl: string } | null> {
  if (!config.mesecUrl) return null;
  try {
    const html = await fetchHtml(config.mesecUrl);
    const mesecRate = extractMesecFixationRate(html);
    const parsed = extractMortgageRates(html);
    const rateWith =
      existing?.rateWithInsurance ?? mesecRate ?? parsed.rateWithInsurance;
    if (rateWith == null) return null;

    return {
      extracted: buildExtractedRates({
        rateWithInsurance: rateWith,
        rpsnWithInsurance:
          existing?.rpsnWithInsurance ?? parsed.rpsnWithInsurance,
        rateWithoutInsurance:
          existing?.rateWithoutInsurance ?? parsed.rateWithoutInsurance,
        rpsnWithoutInsurance:
          existing?.rpsnWithoutInsurance ?? parsed.rpsnWithoutInsurance,
      }),
      sourceUrl: config.mesecUrl,
    };
  } catch {
    return null;
  }
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
  } else if (config.id === "unicredit-bank") {
    const classic = await scrapeUnicreditClassic();
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
      const mesec = await scrapeMesecFallback(config, null);
      if (mesec) {
        found = mesec;
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

  // 1) KB insider přepis klasické hypotéky
  if (config.id === "komercni-banka") {
    extracted = applyKbInsiderRates(extracted);
  }

  // 2) Orientační +0.3 % tam, kde chybí sazba bez pojištění
  //    (ne u KB — už má insider data; UniCredit má reálné PCE, pokud přišlo)
  let withoutEstimated = false;
  if (config.id !== "komercni-banka") {
    const filled = fillOrientationalWithout(
      extracted.rateWithInsurance,
      extracted.rpsnWithInsurance,
      extracted.rateWithoutInsurance,
      extracted.rpsnWithoutInsurance
    );
    // UniCredit: doplň jen pokud scraper opravdu vrátil null
    if (filled.estimated) {
      extracted = buildExtractedRates({
        ...extracted,
        rateWithoutInsurance: filled.rateWithout,
        rpsnWithoutInsurance: filled.rpsnWithout,
      });
      withoutEstimated = true;
    }
  }

  let americanResult = { ...american };
  let americanWithoutEstimated = false;
  const amFilled = fillOrientationalWithout(
    american.americanRateWithInsurance,
    american.americanRpsnWithInsurance,
    american.americanRateWithoutInsurance,
    american.americanRpsnWithoutInsurance
  );
  if (amFilled.estimated) {
    americanResult = {
      ...american,
      americanRateWithoutInsurance: amFilled.rateWithout,
      americanRpsnWithoutInsurance: amFilled.rpsnWithout,
      americanWithoutInsuranceEstimated: true,
    };
    americanWithoutEstimated = true;
  }

  return toScrapedBankRate(config, extracted, sourceUrl, americanResult, {
    withoutInsuranceEstimated: withoutEstimated,
    americanWithoutInsuranceEstimated: americanWithoutEstimated,
  });
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
