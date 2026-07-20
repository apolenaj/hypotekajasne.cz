"use client";

import { useState } from "react";
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(() =>
    emptyFormConsentState(defaultPartnerScope(source))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
      return;
    }

    track("lead_submitted", {
      lead_source: source,
      partner_scope: requiresPartnerTransfer(source)
        ? consent.partnerTransferScope
        : "none",
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
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

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input
          required
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jméno a příjmení"
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-deep-teal focus:ring-2 focus:ring-deep-teal/20"
        />
        <div
          className={cn(
            "grid gap-3",
            compact ? "grid-cols-1" : "sm:grid-cols-2"
          )}
        >
          <input
            required
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-deep-teal focus:ring-2 focus:ring-deep-teal/20"
          />
          <input
            required
            type="tel"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefon"
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-deep-teal focus:ring-2 focus:ring-deep-teal/20"
          />
        </div>

        <FormConsentFields
          state={consent}
          onChange={setConsent}
          showPartnerTransfer={requiresPartnerTransfer(source)}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-800 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {loading ? "Odesílám…" : "Odeslat poptávku"}
        </button>
      </form>
    </div>
  );
}
