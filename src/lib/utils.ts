import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  formatNumber as formatGroupedCs,
  parseFormattedNumber,
  THOUSANDS_SEP,
} from "@/lib/format";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Display helper: thousand separators as NBSP (cs-CZ). */
export function formatNumber(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const n =
    typeof value === "number" ? value : parseFormattedNumber(String(value));
  if (!Number.isFinite(n)) return "";
  if (n === 0) return "0";
  return formatGroupedCs(n, { emptyZero: false });
}

/** Storage helper: strips all non-digits for clean numeric state. */
export function parseNumber(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  return value.toString().replace(/\D/g, "");
}

export { THOUSANDS_SEP };
