export function formatNumber(value: number): string {
  if (value === 0) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
}

export function parseFormattedNumber(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits === "" ? 0 : parseInt(digits, 10);
}

export function parseRate(value: string): number {
  const cleaned = value.replace(",", ".").replace(/[^\d.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function formatRate(value: number): string {
  if (value === 0) return "";
  return String(value);
}
