import type { ComparePropertyInput } from "@/lib/property-compare/types";

type CompactProperty = {
  i: string;
  l: string;
  c: string;
  y: string;
  t: string;
  a: number;
  p: number;
  r?: number;
  e?: number;
  rt?: number;
  u?: number;
  n?: string;
};

function compact(p: ComparePropertyInput): CompactProperty {
  const out: CompactProperty = {
    i: p.id,
    l: p.label,
    c: p.country,
    y: p.city,
    t: p.propertyType || "Byt",
    a: p.areaM2,
    p: p.priceCzk,
  };
  if (p.rentMonthlyCzk != null) out.r = p.rentMonthlyCzk;
  if (p.equityCzk != null) out.e = p.equityCzk;
  if (p.ratePercent != null) out.rt = p.ratePercent;
  if (p.termYears !== 30) out.u = p.termYears;
  if (p.listingUrl) out.n = p.listingUrl;
  return out;
}

function expand(c: CompactProperty): ComparePropertyInput {
  return {
    id: c.i,
    label: c.l,
    country: c.c,
    city: c.y,
    propertyType: (c.t as ComparePropertyInput["propertyType"]) || "Byt",
    areaM2: c.a,
    priceCzk: c.p,
    rentMonthlyCzk: c.r ?? null,
    equityCzk: c.e ?? null,
    ratePercent: c.rt ?? null,
    termYears: c.u ?? 30,
    purpose: "investment",
    renovationNeed: "unknown",
    listingUrl: c.n,
  };
}

function toBase64Url(json: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(json, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(encoded: string): string {
  const pad = encoded.length % 4 === 0 ? "" : "=".repeat(4 - (encoded.length % 4));
  const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/") + pad;
  if (typeof Buffer !== "undefined") {
    return Buffer.from(b64, "base64").toString("utf8");
  }
  return decodeURIComponent(escape(atob(b64)));
}

export function encodeComparisonLink(properties: ComparePropertyInput[]): string {
  const payload = JSON.stringify(properties.map(compact));
  return toBase64Url(payload);
}

export function decodeComparisonLink(encoded: string): ComparePropertyInput[] | null {
  try {
    const raw = fromBase64Url(encoded.trim());
    const parsed = JSON.parse(raw) as CompactProperty[];
    if (!Array.isArray(parsed) || parsed.length < 2 || parsed.length > 5) {
      return null;
    }
    return parsed.map(expand);
  } catch {
    return null;
  }
}

export function buildShareableComparisonUrl(
  properties: ComparePropertyInput[],
  origin = "https://hypotekajasne.cz"
): string {
  const code = encodeComparisonLink(properties);
  return `${origin}/investicni-rentgen/porovnani?c=${code}`;
}
