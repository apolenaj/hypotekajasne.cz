import { LOCALE_TAG, type Locale } from "@/lib/i18n/config";

export function formatCurrency(
  amount: number,
  locale: Locale = "cs",
  currency: "CZK" | "EUR" | "USD" = "CZK"
): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(
  value: number,
  locale: Locale = "cs",
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], options).format(value);
}

export function formatPercent(
  value: number,
  locale: Locale = "cs",
  fractionDigits = 2
): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value / 100);
}

export function formatDate(
  isoOrDate: string | Date,
  locale: Locale = "cs",
  style: "short" | "long" = "long"
): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return String(isoOrDate);
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    year: "numeric",
    month: style === "long" ? "long" : "numeric",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(
  isoOrDate: string | Date,
  locale: Locale = "cs"
): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return String(isoOrDate);
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}
