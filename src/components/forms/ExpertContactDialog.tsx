"use client";

import { useCallback, useId, useState } from "react";
import { Loader2, Send } from "lucide-react";
import {
  FormConsentFields,
  emptyFormConsentState,
  toConsentRecord,
} from "@/components/consent/FormConsentFields";
import { Dialog } from "@/components/ui/dialog";
import { Toast } from "@/components/ui/Toast";
import {
  defaultPartnerScope,
  isPartnerHandoffLeadSource,
  requiresPartnerTransfer,
} from "@/lib/consent/records";
import { submitLead, type LeadPayload } from "@/lib/leads";
import { track, trackCanonical } from "@/lib/analytics/track";
import {
  isLegalIdentityComplete,
  mustEnforceLegalIdentityForLeadCollection,
  LEGAL_LEAD_BLOCKED_PUBLIC_MESSAGE,
} from "@/config/legal";
import { cn } from "@/lib/utils";

const EXPERT_LEAD_SOURCE = "expert_request" as const;

const fieldClass =
  "h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-deep-teal focus:ring-2 focus:ring-deep-teal/20 aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-200";

type ExpertContactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Kontext pro notes / metadata (např. stránka) */
  contextNote?: string;
  metadata?: Record<string, unknown>;
};

export function ExpertContactDialog({
  open,
  onOpenChange,
  contextNote,
  metadata,
}: ExpertContactDialogProps) {
  const errorId = useId();
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(() =>
    emptyFormConsentState(defaultPartnerScope(EXPERT_LEAD_SOURCE))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<
    Partial<Record<"name" | "phone" | "email", boolean>>
  >({});
  const [toastOpen, setToastOpen] = useState(false);
  const closeToast = useCallback(() => setToastOpen(false), []);
  const [formStarted, setFormStarted] = useState(false);

  const leadsBlocked =
    mustEnforceLegalIdentityForLeadCollection() && !isLegalIdentityComplete();

  const resetForm = useCallback(() => {
    setName("");
    setPhone("");
    setEmail("");
    setConsent(emptyFormConsentState(defaultPartnerScope(EXPERT_LEAD_SOURCE)));
    setError(null);
    setInvalidFields({});
    setLoading(false);
    setFormStarted(false);
  }, []);

  const markFormStarted = () => {
    if (formStarted) return;
    setFormStarted(true);
    track("lead_form_started", {
      lead_source: EXPERT_LEAD_SOURCE,
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && !loading) {
      resetForm();
    }
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (leadsBlocked) {
      setError(LEGAL_LEAD_BLOCKED_PUBLIC_MESSAGE);
      track("lead_form_error", {
        lead_source: EXPERT_LEAD_SOURCE,
        error_code: "legal_identity_incomplete",
      });
      return;
    }

    const nextInvalid: typeof invalidFields = {};
    if (!name.trim()) nextInvalid.name = true;
    if (phone.trim().length < 6) nextInvalid.phone = true;
    if (email.trim() && !email.includes("@")) nextInvalid.email = true;
    setInvalidFields(nextInvalid);

    if (Object.keys(nextInvalid).length > 0) {
      const parts: string[] = [];
      if (nextInvalid.name) parts.push("Vyplňte jméno a příjmení.");
      if (nextInvalid.phone) {
        parts.push(
          "Telefon je povinný — zadejte číslo včetně předvolby (min. 6 znaků)."
        );
      }
      if (nextInvalid.email) {
        parts.push("E-mail není platný — použijte tvar jmeno@domena.cz, nebo pole nechte prázdné.");
      }
      setError(parts.join(" "));
      track("lead_form_error", {
        lead_source: EXPERT_LEAD_SOURCE,
        error_code: Object.keys(nextInvalid).sort().join("+"),
      });
      return;
    }

    setLoading(true);

    const payload: LeadPayload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      source: EXPERT_LEAD_SOURCE,
      notes:
        contextNote ??
        "Poptávka přesného výpočtu od experta (WhatNext / Finanční pas).",
      metadata: {
        ...metadata,
        email_optional: !email.trim(),
        entry: "expert_contact_dialog",
      },
      consent: toConsentRecord(
        consent,
        typeof window !== "undefined" ? window.location.pathname : undefined
      ),
    };

    const result = await submitLead(payload);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      track("lead_form_error", {
        lead_source: EXPERT_LEAD_SOURCE,
        error_code: "api_or_network",
      });
      return;
    }

    track("lead_form_submitted_success", {
      lead_source: EXPERT_LEAD_SOURCE,
      partner_scope: requiresPartnerTransfer(EXPERT_LEAD_SOURCE)
        ? consent.partnerTransferScope
        : "none",
    });
    trackCanonical("lead_form_submitted", "lead_submitted", {
      lead_source: EXPERT_LEAD_SOURCE,
      partner_scope: requiresPartnerTransfer(EXPERT_LEAD_SOURCE)
        ? consent.partnerTransferScope
        : "none",
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
    });
    if (
      requiresPartnerTransfer(EXPERT_LEAD_SOURCE) &&
      consent.partnerTransferAccepted
    ) {
      trackCanonical("partner_handoff_requested", "partner_handoff", {
        lead_source: EXPERT_LEAD_SOURCE,
        partner_scope: consent.partnerTransferScope,
      });
    }

    resetForm();
    onOpenChange(false);
    setToastOpen(true);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Chci nabídku na míru"
        subtitle="Orientační čísla už znáte. Spojte se s expertem pro přesnou kalkulaci a neveřejné slevy z bank."
      >
        {leadsBlocked ? (
          <p
            role="alert"
            className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
          >
            {LEGAL_LEAD_BLOCKED_PUBLIC_MESSAGE}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <div>
            <label
              htmlFor={nameId}
              className="mb-1 block text-xs font-semibold text-text-dark"
            >
              Jméno a příjmení
            </label>
            <input
              id={nameId}
              name="name"
              autoComplete="name"
              required
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

          <div>
            <label
              htmlFor={phoneId}
              className="mb-1 block text-xs font-semibold text-text-dark"
            >
              Telefon
            </label>
            <input
              id={phoneId}
              name="phone"
              type="tel"
              autoComplete="tel"
              required
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

          <div>
            <label
              htmlFor={emailId}
              className="mb-1 block text-xs font-semibold text-text-dark"
            >
              E-mail{" "}
              <span className="font-normal text-muted-foreground">
                (volitelné)
              </span>
            </label>
            <input
              id={emailId}
              name="email"
              type="email"
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

          <FormConsentFields
            state={consent}
            onChange={setConsent}
            showPartnerTransfer={isPartnerHandoffLeadSource(EXPERT_LEAD_SOURCE)}
          />

          {error ? (
            <p
              id={errorId}
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading || leadsBlocked}
            className={cn(
              "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 text-sm font-bold text-white transition hover:bg-emerald-700",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:opacity-60"
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
            {loading ? "Odesílám…" : "Odeslat poptávku"}
          </button>
        </form>
      </Dialog>

      <Toast
        open={toastOpen}
        onClose={closeToast}
        message="Děkujeme — ozveme se vám s přesnější kalkulací. Nejde o závaznou nabídku banky."
      />
    </>
  );
}
