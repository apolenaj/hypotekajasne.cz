/**
 * Timezone-stable Czech calendar dates for audit / checkedAt values.
 * Prefer Europe/Prague so UTC midnight audit stamps do not shift a day west of CZ.
 */

const PRAGUE = "Europe/Prague";

function toDate(isoOrDate: string | Date): Date | null {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * Formats an ISO timestamp or Date as a Czech calendar date in Europe/Prague.
 * Independent of the visitor's local timezone when formatters honor timeZone.
 */
export function formatAuditDateCs(
  isoOrDate: string | Date | null | undefined,
  style: "numeric" | "long" = "numeric"
): string {
  if (!isoOrDate) return "";
  const d = toDate(isoOrDate);
  if (!d) return "";
  return new Intl.DateTimeFormat("cs-CZ", {
    timeZone: PRAGUE,
    year: "numeric",
    month: style === "long" ? "long" : "numeric",
    day: "numeric",
  }).format(d);
}

/** YYYY-MM-DD calendar day in Europe/Prague (stable key for tests). */
export function auditCalendarDayPrague(
  isoOrDate: string | Date
): string | null {
  const d = toDate(isoOrDate);
  if (!d) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PRAGUE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
