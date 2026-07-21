"use client";

import { useId, useState } from "react";
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
import { track } from "@/lib/analytics/track";
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

export function LeadCaptureForm({
  source,
  country,
  notes,
  metadata,
  title = "Chci nezávaznou konzultaci",
  subtitle = "Zanechte kontakt — ozveme se do 24 hodin.",
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

  const [formStarted, setFormStarted] = useState(false);

  const markFormStarted = () => {
    if (formStarted) return;
    setFormStarted(true);
    track("lead_form_started", {
      lead_source: source,
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      track("lead_form_error", {
        lead_source: source,
        error_code: Object.keys(nextInvalid).sort().join("+"),
      });
      return;
    }

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
      track("lead_form_error", {
        lead_source: source,
        error_code: "api_or_network",
      });
      return;
    }

    track("lead_submitted", {
      lead_source: source,
      partner_scope: requiresPartnerTransfer(source)
        ? consent.partnerTransferScope
        : "none",
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
    });
    track("lead_form_submitted_success", {
      lead_source: source,
      partner_scope: requiresPartnerTransfer(source)
        ? consent.partnerTransferScope
        : "none",
      funnel_id: "moje_moznosti_north_star",
    });
    if (requiresPartnerTransfer(source) && consent.partnerTransferAccepted) {
      track("partner_handoff", {
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
              markFormStarted();
              setName(e.target.value);
              setInvalidFields((f) => ({ ...f, name: false }));
            }}
            onFocus={markFormStarted}
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
          disabled={loading}
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
