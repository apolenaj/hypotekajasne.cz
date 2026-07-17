/**
 * ID a mapování bank (bez cheerio — bezpečné pro klienta).
 */

export type BankScraperId =
  | "ceska-sporitelna"
  | "komercni-banka"
  | "csob-hypotecni-banka"
  | "raiffeisen-bank"
  | "mbank"
  | "unicredit-bank";

export const BANK_NAME_TO_SCRAPER_ID: Record<string, BankScraperId> = {
  "Česká spořitelna": "ceska-sporitelna",
  "Komerční banka": "komercni-banka",
  "ČSOB Hypoteční banka": "csob-hypotecni-banka",
  "Raiffeisen Bank": "raiffeisen-bank",
  mBank: "mbank",
  "UniCredit Bank": "unicredit-bank",
};
