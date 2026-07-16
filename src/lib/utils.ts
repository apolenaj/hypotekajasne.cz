import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Display helper: adds thousand separators (spaces). */
export function formatNumber(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const rawValue = value.toString().replace(/\D/g, "");
  if (!rawValue) return "";
  return rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** Storage helper: strips all non-digits for clean numeric state. */
export function parseNumber(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  return value.toString().replace(/\D/g, "");
}
