"use client";

import Link from "next/link";
import {
  CONSENT_POLICY_VERSION,
  CONSENT_PURPOSES,
  PARTNER_TRANSFER_SCOPE_LABELS,
  type PartnerTransferScope,
} from "@/lib/legal/consent-versions";
import {
  buildFormConsentRecord,
  type FormConsentRecord,
} from "@/lib/consent/records";
import { routes } from "@/lib/routes";

export type FormConsentState = {
  privacyAccepted: boolean;
  partnerTransferAccepted: boolean;
  partnerTransferScope: PartnerTransferScope;
  marketingAccepted: boolean;
};

export const emptyFormConsentState = (
  scope: PartnerTransferScope = "mortgage_specialist"
): FormConsentState => ({
  privacyAccepted: false,
  partnerTransferAccepted: false,
  partnerTransferScope: scope,
  marketingAccepted: false,
});

export function toConsentRecord(
  state: FormConsentState,
  sourcePath?: string
): FormConsentRecord {
  return buildFormConsentRecord({ ...state, sourcePath });
}

type FormConsentFieldsProps = {
  state: FormConsentState;
  onChange: (next: FormConsentState) => void;
  /** Zobrazit partner transfer checkbox */
  showPartnerTransfer: boolean;
  /** Marketing povinný (newsletter) */
  marketingRequired?: boolean;
  className?: string;
};

export function FormConsentFields({
  state,
  onChange,
  showPartnerTransfer,
  marketingRequired = false,
  className,
}: FormConsentFieldsProps) {
  const set = (patch: Partial<FormConsentState>) =>
    onChange({ ...state, ...patch });

  return (
    <fieldset className={className ?? "space-y-3 rounded-xl border border-border bg-slate-50 px-3 py-3 text-left text-xs leading-relaxed text-muted-foreground sm:text-sm"}>
      <legend className="sr-only">Souhlasy se zpracováním údajů</legend>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-deep-teal">
        Verze zásad: {CONSENT_POLICY_VERSION}
      </p>

      <label className="flex items-start gap-2.5">
        <input
          type="checkbox"
          required
          className="mt-1"
          checked={state.privacyAccepted}
          onChange={(e) => set({ privacyAccepted: e.target.checked })}
        />
        <span>
          {CONSENT_PURPOSES.privacy_processing.checkboxLabel}{" "}
          <Link href={routes.legal.gdpr} className="text-deep-teal underline">
            GDPR
          </Link>
          .
        </span>
      </label>

      {showPartnerTransfer ? (
        <label className="flex items-start gap-2.5">
          <input
            type="checkbox"
            required
            className="mt-1"
            checked={state.partnerTransferAccepted}
            onChange={(e) =>
              set({ partnerTransferAccepted: e.target.checked })
            }
          />
          <span>
            {CONSENT_PURPOSES.partner_transfer.checkboxLabel} Rozsah:{" "}
            <strong className="text-text-dark">
              {PARTNER_TRANSFER_SCOPE_LABELS[state.partnerTransferScope]}
            </strong>
            .{" "}
            <Link
              href={routes.partneri}
              className="text-deep-teal underline"
            >
              Partneři
            </Link>
            .
          </span>
        </label>
      ) : null}

      <label className="flex items-start gap-2.5">
        <input
          type="checkbox"
          required={marketingRequired}
          className="mt-1"
          checked={state.marketingAccepted}
          onChange={(e) => set({ marketingAccepted: e.target.checked })}
        />
        <span>
          {CONSENT_PURPOSES.marketing.checkboxLabel}
          {!marketingRequired
            ? " Odesláním formuláře tento souhlas nevzniká automaticky."
            : null}
        </span>
      </label>
    </fieldset>
  );
}
