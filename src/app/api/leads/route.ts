import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateFormConsent } from "@/lib/consent/records";
import {
  isLeadSource,
  LEAD_SOURCE_LABELS,
  type LeadPayload,
} from "@/lib/leads";
import type { FormConsentRecord } from "@/lib/consent/records";
import type { PartnerTransferScope } from "@/lib/legal/consent-versions";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Chybí Supabase credentials (URL / klíč).");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function parseConsent(raw: unknown): FormConsentRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  const scope = String(c.partnerTransferScope ?? "none") as PartnerTransferScope;
  return {
    policyVersion: String(c.policyVersion ?? ""),
    privacyAccepted: Boolean(c.privacyAccepted),
    partnerTransferAccepted: Boolean(c.partnerTransferAccepted),
    partnerTransferScope: scope,
    marketingAccepted: Boolean(c.marketingAccepted),
    consentedAt: String(c.consentedAt ?? new Date().toISOString()),
    sourcePath:
      typeof c.sourcePath === "string" ? c.sourcePath : undefined,
  };
}

function normalizePayload(
  body: unknown
): { payload: LeadPayload } | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Neplatné tělo požadavku." };
  }
  const data = body as Record<string, unknown>;

  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const phone = String(data.phone ?? "").trim();
  const source = String(data.source ?? "").trim();
  const country = String(data.country ?? "").trim() || undefined;
  const notes = String(data.notes ?? "").trim() || undefined;
  const metadata =
    data.metadata && typeof data.metadata === "object"
      ? (data.metadata as Record<string, unknown>)
      : undefined;

  if (!name || !email || !email.includes("@")) {
    return { error: "Vyplňte jméno a platný e-mail." };
  }
  if (!isLeadSource(source)) {
    return { error: "Neplatný zdroj formuláře." };
  }
  if (source !== "newsletter" && phone.length < 6) {
    return { error: "Vyplňte telefon." };
  }

  const consentCheck = validateFormConsent(source, parseConsent(data.consent));
  if (!consentCheck.ok) {
    return { error: consentCheck.error };
  }

  return {
    payload: {
      name: source === "newsletter" && name === "—" ? "Newsletter" : name,
      email,
      phone: phone || undefined,
      source,
      country,
      notes,
      metadata,
      consent: consentCheck.consent,
    },
  };
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const normalized = normalizePayload(raw);

    if ("error" in normalized) {
      return NextResponse.json({ error: normalized.error }, { status: 400 });
    }

    const { payload } = normalized;
    const sourceLabel = LEAD_SOURCE_LABELS[payload.source];
    const composedNotes = [
      `Zdroj: ${sourceLabel}`,
      payload.country ? `Zájem o: ${payload.country}` : null,
      payload.notes || null,
    ]
      .filter(Boolean)
      .join("\n");

    const row = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? null,
      source: payload.source,
      country: payload.country ?? null,
      notes: composedNotes,
      metadata: {
        ...(payload.metadata ?? {}),
        source_label: sourceLabel,
        submitted_at: new Date().toISOString(),
        user_agent:
          request.headers.get("user-agent")?.slice(0, 200) ?? undefined,
        consent: payload.consent,
        // Explicitně: marketing jen pokud checkbox
        marketing_opt_in: payload.consent.marketingAccepted === true,
        partner_transfer: payload.consent.partnerTransferAccepted === true,
        partner_scope: payload.consent.partnerTransferScope,
        consent_policy_version: payload.consent.policyVersion,
      },
    };

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("leads").insert(row);

    if (error) {
      console.error("Supabase leads insert error:", error.message);
      return NextResponse.json(
        {
          error:
            "Lead se nepodařilo uložit. Zkontrolujte tabulku `leads` a RLS policy.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("API /api/leads:", err);
    return NextResponse.json(
      { error: "Interní chyba při ukládání leadu." },
      { status: 500 }
    );
  }
}
