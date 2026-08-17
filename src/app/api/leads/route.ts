import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateFormConsent } from "@/lib/consent/records";
import {
  isLeadSource,
  isPhonePrimaryLeadSource,
  LEAD_SOURCE_LABELS,
  type LeadPayload,
} from "@/lib/leads";
import { sanitizeLeadAttribution } from "@/lib/leads-attribution";
import {
  logLeadOps,
  notifyLeadOperatorsBestEffort,
} from "@/lib/leads-ops";
import type { FormConsentRecord } from "@/lib/consent/records";
import type { PartnerTransferScope } from "@/lib/legal/consent-versions";
import { isMortgagePartnerHandoffReady } from "@/lib/legal/partner-config";
import {
  canAcceptPersonalLeads,
  LEGAL_LEAD_BLOCKED_PUBLIC_MESSAGE,
} from "@/lib/legal";
import { computeEnquiryRetentionUntil } from "@/lib/legal/privacy-retention";

function getSupabaseAdmin() {
  // Project root only — /rest/v1 doubles the path and yields PGRST125 "Invalid path".
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  url = url.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");

  if (!url || !key) {
    throw new Error(
      "Chybí Supabase credentials (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
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

  if (!isLeadSource(source)) {
    return {
      error:
        "Neplatný zdroj formuláře. Obnovte stránku a odešlete formulář znovu.",
    };
  }

  if (!name) {
    return { error: "Chybí jméno. Vyplňte jméno a příjmení." };
  }

  const phonePrimary = isPhonePrimaryLeadSource(source);

  if (phonePrimary) {
    if (phone.length < 6) {
      return {
        error:
          "Telefon je povinný. Zadejte číslo včetně předvolby (min. 6 znaků).",
      };
    }
    if (email && !email.includes("@")) {
      return {
        error:
          "E-mail není platný. Použijte tvar jmeno@domena.cz, nebo pole nechte prázdné.",
      };
    }
  } else {
    if (!email || !email.includes("@")) {
      return {
        error:
          "Chybí platný e-mail. Vyplňte adresu ve tvaru jmeno@domena.cz.",
      };
    }
    if (source !== "newsletter" && phone.length < 6) {
      return {
        error:
          "Telefon chybí nebo je příliš krátký. Zadejte číslo včetně předvolby (min. 6 znaků).",
      };
    }
  }

  const consentCheck = validateFormConsent(source, parseConsent(data.consent));
  if (!consentCheck.ok) {
    return { error: consentCheck.error };
  }

  return {
    payload: {
      name: source === "newsletter" && name === "—" ? "Newsletter" : name,
      // DB sloupec email je NOT NULL — bez e-mailu uložíme značku
      email: email || (phonePrimary ? "—" : email),
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
    if (!canAcceptPersonalLeads()) {
      return NextResponse.json(
        { error: LEGAL_LEAD_BLOCKED_PUBLIC_MESSAGE },
        { status: 503 }
      );
    }

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

    const nowIso = new Date().toISOString();
    const marketingConsent = payload.consent.marketingAccepted === true;
    const retentionUntil = computeEnquiryRetentionUntil({
      lastInteractionAt: nowIso,
      source: payload.source,
      activeCase: false,
      marketingConsent,
    });

    const attribution = sanitizeLeadAttribution(
      payload.metadata as Record<string, unknown> | undefined
    );
    const pageIntent = attribution.page_intent;

    const consentMeta = {
      consent: payload.consent,
      privacy_notice_version: payload.consent.policyVersion,
      privacy_notice_acknowledged: payload.consent.privacyAccepted === true,
      privacy_notice_acknowledged_at: payload.consent.consentedAt,
      marketing_consent: marketingConsent,
      marketing_consent_at: marketingConsent
        ? payload.consent.consentedAt
        : null,
      marketing_consent_withdrawn_at: null,
      marketing_consent_version: marketingConsent
        ? payload.consent.policyVersion
        : null,
      marketing_opt_in: marketingConsent,
      transfer_consent: payload.consent.partnerTransferAccepted === true,
      transfer_consent_at:
        payload.consent.partnerTransferAccepted === true
          ? payload.consent.consentedAt
          : null,
      transfer_consent_version:
        payload.consent.partnerTransferAccepted === true
          ? payload.consent.policyVersion
          : null,
      transfer_recipient:
        payload.consent.partnerTransferAccepted === true &&
        payload.consent.partnerTransferScope !== "none"
          ? payload.consent.partnerTransferScope
          : null,
      partner_transfer: payload.consent.partnerTransferAccepted === true,
      partner_scope: payload.consent.partnerTransferScope,
      consent_policy_version: payload.consent.policyVersion,
      partner_handoff_ready: isMortgagePartnerHandoffReady(),
      intake_mode: isMortgagePartnerHandoffReady()
        ? "partner_handoff"
        : "operator_only",
    };

    const baseRow = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? null,
      source: payload.source,
      country: payload.country ?? null,
      notes: composedNotes,
      metadata: {
        ...attribution.metadata,
        source_label: sourceLabel,
        submitted_at: nowIso,
        user_agent:
          request.headers.get("user-agent")?.slice(0, 200) ?? undefined,
        ...consentMeta,
      },
    };

    // First-class retention / consent / lifecycle columns (additive migrations).
    const rowWithRetention = {
      ...baseRow,
      updated_at: nowIso,
      last_interaction_at: nowIso,
      retention_until: retentionUntil?.toISOString() ?? null,
      privacy_notice_version: payload.consent.policyVersion,
      deleted_at: null,
      legal_hold: false,
      active_case: false,
      marketing_consent: marketingConsent,
      marketing_consent_at: marketingConsent
        ? payload.consent.consentedAt
        : null,
      marketing_consent_withdrawn_at: null,
      marketing_consent_version: marketingConsent
        ? payload.consent.policyVersion
        : null,
      lifecycle_status: "new",
      page_intent: pageIntent,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      utm_content: attribution.utm_content,
      utm_term: attribution.utm_term,
      landing_path: attribution.landing_path,
      revenue_status: "unknown",
      revenue_currency: "CZK",
      expected_revenue_amount: null,
      realized_revenue_amount: null,
      realized_at: null,
    };

    const rowWithRetentionOnly = {
      ...baseRow,
      updated_at: nowIso,
      last_interaction_at: nowIso,
      retention_until: retentionUntil?.toISOString() ?? null,
      privacy_notice_version: payload.consent.policyVersion,
      deleted_at: null,
      legal_hold: false,
      active_case: false,
      marketing_consent: marketingConsent,
      marketing_consent_at: marketingConsent
        ? payload.consent.consentedAt
        : null,
      marketing_consent_withdrawn_at: null,
      marketing_consent_version: marketingConsent
        ? payload.consent.policyVersion
        : null,
    };

    const supabase = getSupabaseAdmin();

    let insertedId: string | null = null;
    let { data, error } = await supabase
      .from("leads")
      .insert(rowWithRetention)
      .select("id")
      .single();

    // Fallback chain: lifecycle columns may be missing before Phase 6.2 SQL.
    if (
      error &&
      /column|schema cache|does not exist/i.test(error.message)
    ) {
      console.warn(
        "Supabase leads lifecycle/revenue columns missing — retrying retention row. Apply supabase/leads_lifecycle_revenue.sql."
      );
      ({ data, error } = await supabase
        .from("leads")
        .insert(rowWithRetentionOnly)
        .select("id")
        .single());
    }

    if (
      error &&
      /column|schema cache|does not exist/i.test(error.message)
    ) {
      console.warn(
        "Supabase leads retention columns missing — inserting base row. Apply supabase/leads_retention.sql."
      );
      ({ data, error } = await supabase
        .from("leads")
        .insert(baseRow)
        .select("id")
        .single());
    }

    if (error) {
      logLeadOps({
        event: "lead_insert_error",
        source: payload.source,
        pageIntent,
        errorCode: error.code ?? "insert_failed",
      });
      console.error("Supabase leads insert error:", error.message);
      return NextResponse.json(
        {
          error:
            "Lead se nepodařilo uložit. Zkontrolujte tabulku `leads` a RLS policy.",
        },
        { status: 502 }
      );
    }

    insertedId = typeof data?.id === "string" ? data.id : null;
    if (insertedId) {
      logLeadOps({
        event: "lead_insert_ok",
        leadId: insertedId,
        source: payload.source,
        pageIntent,
      });
      const testMarkerRaw = attribution.metadata?.test_marker;
      const testMarker =
        typeof testMarkerRaw === "string" ? testMarkerRaw : null;
      const landingPage =
        attribution.landing_path ||
        payload.consent.sourcePath ||
        (typeof attribution.metadata?.source_path === "string"
          ? attribution.metadata.source_path
          : "") ||
        "";
      // Notification must not block or undo DB success.
      void notifyLeadOperatorsBestEffort({
        leadId: insertedId,
        source: payload.source,
        pageIntent,
        createdAt: nowIso,
        name: payload.name,
        email: payload.email || "—",
        phone: payload.phone,
        landingPage,
        message: payload.notes,
        testMarker,
      });
    }

    return NextResponse.json({
      ok: true,
      leadId: insertedId,
      // Public-neutral SLA — no invented response-time promise.
      nextStep: "Ozveme se co nejdříve.",
    });
  } catch (err) {
    logLeadOps({
      event: "lead_insert_error",
      errorCode: "unhandled",
    });
    console.error("API /api/leads:", err);
    return NextResponse.json(
      { error: "Interní chyba při ukládání leadu." },
      { status: 500 }
    );
  }
}
