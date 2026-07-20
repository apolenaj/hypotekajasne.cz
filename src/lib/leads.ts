/**
 * Sjednocený sběr leadů do Supabase tabulky `leads`.
 * Consent record je povinný — odeslání ≠ marketingový souhlas.
 */

import type { FormConsentRecord } from "@/lib/consent/records";

export const LEAD_SOURCES = [
  "investment_passport",
  "navrh_na_miru",
  "mortgage_calculator",
  "property_analysis",
  "lead_gen",
  "contact",
  "country_hub",
  "newsletter",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  investment_passport: "Osobní investiční průvodce",
  navrh_na_miru: "Hypoteční připravenost",
  mortgage_calculator: "Hypoteční kalkulačka",
  property_analysis: "Kompletní analýza nemovitosti",
  lead_gen: "Konzultace s expertem",
  contact: "Kontaktní formulář",
  country_hub: "Zájem o zemi (hub)",
  newsletter: "Newsletter (články)",
};

export type LeadPayload = {
  name: string;
  email: string;
  phone?: string;
  source: LeadSource;
  /** Země / trh zájmu (volitelné) */
  country?: string;
  /** Lidsky čitelný kontext pro analytiky */
  notes?: string;
  /** Strukturovaný kontext (cena, LTV, pojištění, …) */
  metadata?: Record<string, unknown>;
  /**
   * Timestamped consent record (verze + účely).
   * marketingAccepted se nikdy neodvozuje z pouhého odeslání.
   */
  consent: FormConsentRecord;
};

export type LeadSubmitResult =
  | { ok: true }
  | { ok: false; error: string };

export function isLeadSource(value: string): value is LeadSource {
  return (LEAD_SOURCES as readonly string[]).includes(value);
}

export function buildThankYouPath(source: LeadSource): string {
  return `/dekujeme?source=${encodeURIComponent(source)}`;
}

/** Klientské odeslání přes API (bez přímého přístupu ke service role). */
export async function submitLead(
  payload: LeadPayload
): Promise<LeadSubmitResult> {
  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      return {
        ok: false,
        error: data?.error || "Odeslání se nezdařilo. Zkuste to prosím znovu.",
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Nepodařilo se spojit se serverem. Zkontrolujte připojení.",
    };
  }
}
