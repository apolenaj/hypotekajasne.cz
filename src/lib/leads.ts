/**
 * Sjednocený sběr leadů do Supabase tabulky `leads`.
 * Consent record je povinný — odeslání ≠ marketingový souhlas.
 */

import type { FormConsentRecord } from "@/lib/consent/records";
import {
  clearLeadIdempotencyKey,
  getOrCreateLeadIdempotencyKey,
  markLeadThankYou,
  normalizeLeadIdempotencyKey,
} from "@/lib/leads-idempotency";

export const LEAD_SOURCES = [
  "investment_passport",
  "navrh_na_miru",
  "mortgage_calculator",
  "property_analysis",
  "lead_gen",
  "expert_request",
  "contact",
  "country_hub",
  "newsletter",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  investment_passport: "Osobní investiční průvodce",
  navrh_na_miru: "Hypoteční připravenost",
  mortgage_calculator: "Hypoteční kalkulačka",
  property_analysis: "Detailní analýza nemovitosti",
  lead_gen: "Konzultace s expertem",
  expert_request: "Přesný výpočet od experta",
  contact: "Kontaktní formulář",
  country_hub: "Zájem o zemi (hub)",
  newsletter: "Newsletter (články)",
};

/** Zdroje, kde stačí telefon a e-mail je volitelný. */
export function isPhonePrimaryLeadSource(source: LeadSource): boolean {
  return source === "expert_request";
}

export type LeadPayload = {
  name: string;
  /** Povinné u většiny zdrojů; u expert_request volitelné. */
  email?: string;
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
  /**
   * Client-generated UUID for duplicate/retry protection.
   * Never derived from PII. Optional — submitLead fills it.
   */
  idempotencyKey?: string;
};

export type LeadSubmitResult =
  | { ok: true; leadId?: string | null; replayed?: boolean }
  | { ok: false; error: string; status?: number };

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
  const idempotencyKey =
    normalizeLeadIdempotencyKey(payload.idempotencyKey) ??
    getOrCreateLeadIdempotencyKey(payload.source);

  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        idempotencyKey,
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      return {
        ok: false,
        status: res.status,
        error:
          data?.error ||
          (res.status === 429
            ? "Příliš mnoho pokusů. Zkuste to prosím za chvíli."
            : "Odeslání se nezdařilo. Zkuste to prosím znovu."),
      };
    }

    const data = (await res.json().catch(() => null)) as {
      leadId?: string | null;
      replayed?: boolean;
    } | null;

    clearLeadIdempotencyKey(payload.source);
    markLeadThankYou(payload.source);

    return {
      ok: true,
      leadId: data?.leadId ?? null,
      replayed: data?.replayed === true,
    };
  } catch {
    return {
      ok: false,
      error: "Nepodařilo se spojit se serverem. Zkontrolujte připojení.",
    };
  }
}
