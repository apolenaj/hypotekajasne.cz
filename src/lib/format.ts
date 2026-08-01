/**
 * Formátování čísel pro UI (cs-CZ) — oddělovač tisíců = nezlomitelná mezera (U+00A0).
 * Pro odeslání / výpočty vždy používej parseFormattedNumber → čisté číslo.
 */

/** Nezlomitelná mezera — shodná s HTML &nbsp; */
export const THOUSANDS_SEP = "\u00a0";

const GROUP_SEP_RE = /[\u00a0\u202f\u2009\u2007\s]/g;

/** Normalizuje jakýkoli whitespace / thin space na NBSP. */
export function normalizeThousandsSeparators(formatted: string): string {
  return formatted.replace(GROUP_SEP_RE, THOUSANDS_SEP);
}

/**
 * Celé číslo s oddělovači tisíců (60 000, 1 000 000).
 * `emptyZero`: true → 0 zobrazí jako prázdný string (vhodné pro prázdné inputy).
 */
export function formatNumber(
  value: number,
  options: { emptyZero?: boolean } = {}
): string {
  const emptyZero = options.emptyZero ?? true;
  if (!Number.isFinite(value)) return "";
  if (value === 0 && emptyZero) return "";
  const rounded = Math.round(value);
  return normalizeThousandsSeparators(
    new Intl.NumberFormat("cs-CZ", {
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(rounded)
  );
}

/** Alias — vždy zobrazí 0 jako „0“. */
export function formatGroupedInteger(value: number): string {
  if (!Number.isFinite(value)) return "";
  return formatNumber(value, { emptyZero: false });
}

/**
 * Parsuje uživatelský vstup (s mezerami / NBSP) na čisté číslo.
 * „60 000“ → 60000. Pro backend / state vždy toto.
 */
export function parseFormattedNumber(value: string): number {
  const digits = value.replace(/\D/g, "");
  if (digits === "") return 0;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}

/** Formátuje draft při psaní: nechá jen číslice a okamžitě seskupí. */
export function formatMoneyTyping(raw: string): string {
  const n = parseFormattedNumber(raw);
  if (raw.replace(/\D/g, "") === "") return "";
  return formatNumber(n, { emptyZero: false });
}

export function parseRate(value: string): number {
  const cleaned = value.replace(",", ".").replace(/[^\d.]/g, "");
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : num;
}

export function formatRate(value: number): string {
  if (value === 0) return "";
  return String(value);
}
