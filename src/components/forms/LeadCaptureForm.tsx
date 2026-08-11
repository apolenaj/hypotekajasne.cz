"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import {
  FormConsentFields,
  emptyFormConsentState,
  toConsentRecord,
} from "@/components/consent/FormConsentFields";
import {
  buildThankYouPath,
  submitLead,
  type LeadPayload,
  type LeadSource,
} from "@/lib/leads";
import {
  defaultPartnerScope,
  isPartnerHandoffLeadSource,
  requiresPartnerTransfer,
} from "@/lib/consent/records";
import { ltvBand, pricingScenarioCategory } from "@/lib/analytics/bands";
import { trackCanonical } from "@/lib/analytics/track";
import { trackEvent, trackEventOnce } from "@/lib/analytics/track-event";
import {
  isLegalIdentityComplete,
  mustEnforceLegalIdentityForLeadCollection,
  LEGAL_LEAD_BLOCKED_PUBLIC_MESSAGE,
} from "@/config/legal";
import { cn } from "@/lib/utils";

type LeadCaptureFormProps = {
  source: LeadSource;
  country?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  title?: string;
  subtitle?: string;
  redirectOnSuccess?: boolean;
  onSuccess?: () => void;
  className?: string;
  compact?: boolean;
};

const fieldClass =
  "h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-deep-teal focus:ring-2 focus:ring-deep-teal/20 aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-200";

function readString(meta: Record<string, unknown> | undefined, key: string) {
  const v = meta?.[key];
  return typeof v === "string" && v.trim() ? v : undefined;
}

function readNumber(meta: Record<string, unknown> | undefined, key: string) {
  const v = meta?.[key];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function leadFunnelPayload(
  source: LeadSource,
  metadata: Record<string, unknown> | undefined
) {
  const path =
    typeof window !== "undefined" ? window.location.pathname : undefined;
  const scenarioKey =
    readString(metadata, "selectedPricingScenario") ??
    readString(metadata, "pricingScenarioKey");
  const scenarioCategory =
    readString(metadata, "selectedRateScenarioCategory") ??
    (scenarioKey ? pricingScenarioCategory(scenarioKey) : undefined);
  const ltv = readNumber(metadata, "ltv") ?? readNumber(metadata, "ltvPct");

  return {
    lead_source: source,
    source_page: readString(metadata, "sourcePage") ?? path,
    page_intent: readString(metadata, "page_intent"),
    purpose: readString(metadata, "purpose"),
    fixation_months: readNumber(metadata, "fixationMonths"),
    ltv_band: ltv != null ? ltvBand(ltv) : undefined,
    selected_lender:
      readString(metadata, "selectedLender") ??
      readString(metadata, "lenderSlug"),
    selected_rate_scenario_category: scenarioCategory,
    calculator_type: readString(metadata, "calculatorType") ?? "mortgage",
    funnel_id: "phase4_conversion",
    path,
  };
}

export function LeadCaptureForm({
  source,
  country,
  notes,
  metadata,
  title = "Chci nezávaznou konzultaci",
  subtitle = "Zanechte kontakt — ozveme se k nezávazné konzultaci.",
  redirectOnSuccess = true,
  onSuccess,
  className,
  compact = false,
}: LeadCaptureFormProps) {
  const router = useRouter();
  const errorId = useId();
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const metadataRef = useRef(metadata);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(() =>
    emptyFormConsentState(defaultPartnerScope(source))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<
    Partial<Record<"name" | "email" | "phone", boolean>>
  >({});
  const successOnceRef = useRef(false);

  const leadsBlocked =
    mustEnforceLegalIdentityForLeadCollection() && !isLegalIdentityComplete();

  useEffect(() => {
    metadataRef.current = metadata;
  }, [metadata]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        trackEventOnce(
          "lead_form_view",
          `lead_form_view:${source}:${typeof window !== "undefined" ? window.location.pathname : ""}`,
          leadFunnelPayload(source, metadataRef.current)
        );
        observer.disconnect();
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [source]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const funnel = leadFunnelPayload(source, metadata);

    if (leadsBlocked) {
      setError(LEGAL_LEAD_BLOCKED_PUBLIC_MESSAGE);
      trackEvent("lead_error", {
        ...funnel,
        error_code: "legal_identity_incomplete",
      });
      return;
    }

    const nextInvalid: typeof invalidFields = {};
    if (!name.trim()) nextInvalid.name = true;
    if (!email.trim() || !email.includes("@")) nextInvalid.email = true;
    if (phone.trim().length < 6) nextInvalid.phone = true;
    setInvalidFields(nextInvalid);

    if (Object.keys(nextInvalid).length > 0) {
      const parts: string[] = [];
      if (nextInvalid.name) {
        parts.push("Jméno je prázdné — vyplňte jméno a příjmení.");
      }
      if (nextInvalid.email) {
        parts.push(
          "E-mail chybí nebo není platný — zadejte adresu ve tvaru jmeno@domena.cz."
        );
      }
      if (nextInvalid.phone) {
        parts.push(
          "Telefon je příliš krátký — zadejte číslo včetně předvolby (min. 6 znaků)."
        );
      }
      setError(parts.join(" "));
      trackEvent("lead_error", {
        ...funnel,
        error_code: Object.keys(nextInvalid).sort().join("+"),
      });
      return;
    }

    trackEvent("lead_submit", funnel);
    setLoading(true);

    const payload: LeadPayload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      source,
      country,
      notes,
      metadata,
      consent: toConsentRecord(consent),
    };

    const result = await submitLead(payload);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      trackEvent("lead_error", {
        ...funnel,
        error_code: "api_or_network",
      });
      return;
    }

    if (!successOnceRef.current) {
      successOnceRef.current = true;
      trackEvent("lead_success", {
        ...funnel,
        partner_scope: requiresPartnerTransfer(source)
          ? consent.partnerTransferScope
          : "none",
        lead_qualified: Boolean(metadata?.qualified ?? metadata?.lead_qualified),
      });
      trackEventOnce(
        "decision_funnel_complete",
        `decision_funnel_complete:${source}`,
        funnel
      );
    }

    if (requiresPartnerTransfer(source) && consent.partnerTransferAccepted) {
      trackCanonical("partner_handoff_requested", "partner_handoff", {
        lead_source: source,
        partner_scope: consent.partnerTransferScope,
      });
    }

    if (redirectOnSuccess) {
      router.push(buildThankYouPath(source));
      return;
    }

    onSuccess?.();
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "rounded-2xl border border-deep-teal/15 bg-white/90 p-5 shadow-sm ring-1 ring-gray-900/5",
        compact ? "p-4" : "p-6 lg:p-8",
        className
      )}
    >
      <h3 className="font-heading text-lg font-bold text-text-dark">{title}</h3>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
      {leadsBlocked ? (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
        >
          {LEGAL_LEAD_BLOCKED_PUBLIC_MESSAGE}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3" noValidate>
        <div>
          <label
            htmlFor={nameId}
            className="mb-1 block text-xs font-semibold text-text-dark"
          >
            Jméno a příjmení
          </label>
          <input
            id={nameId}
            required
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setInvalidFields((f) => ({ ...f, name: false }));
            }}
            placeholder="Jan Novák"
            aria-invalid={invalidFields.name || undefined}
            aria-describedby={error ? errorId : undefined}
            className={fieldClass}
          />
        </div>
        <div
          className={cn(
            "grid gap-3",
            compact ? "grid-cols-1" : "sm:grid-cols-2"
          )}
        >
          <div>
            <label
              htmlFor={emailId}
              className="mb-1 block text-xs font-semibold text-text-dark"
            >
              E-mail
            </label>
            <input
              id={emailId}
              required
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setInvalidFields((f) => ({ ...f, email: false }));
              }}
              placeholder="jan@email.cz"
              aria-invalid={invalidFields.email || undefined}
              aria-describedby={error ? errorId : undefined}
              className={fieldClass}
            />
          </div>
          <div>
            <label
              htmlFor={phoneId}
              className="mb-1 block text-xs font-semibold text-text-dark"
            >
              Telefon
            </label>
            <input
              id={phoneId}
              required
              type="tel"
              name="phone"
              autoComplete="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setInvalidFields((f) => ({ ...f, phone: false }));
              }}
              placeholder="+420 …"
              aria-invalid={invalidFields.phone || undefined}
              aria-describedby={error ? errorId : undefined}
              className={fieldClass}
            />
          </div>
        </div>

        <FormConsentFields
          state={consent}
          onChange={setConsent}
          showPartnerTransfer={isPartnerHandoffLeadSource(source)}
        />

        {error && (
          <p
            id={errorId}
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || leadsBlocked}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-800 text-sm font-bold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
          ) : (
            <Send className="h-4 w-4" aria-hidden />
          )}
          {loading ? "Odesílám…" : "Odeslat poptávku"}
        </button>
      </form>
    </div>
  );
}
