"use client";

import Link from "next/link";
import {
  CONSENT_POLICY_VERSION,
  CONSENT_PURPOSES,
  buildConsentContextSummary,
  buildPartnerTransferCheckboxLabel,
  buildPrivacyProcessingCheckboxLabel,
  type PartnerTransferScope,
} from "@/lib/legal/consent-versions";
import { isMortgagePartnerHandoffReady } from "@/lib/legal/partner-config";
import { getPartnerClaimLabels } from "@/lib/partners/verification";
import {
  isLegalIdentityComplete,
  LEGAL_IDENTITY_INCOMPLETE_PUBLIC_MESSAGE,
} from "@/config/legal";
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

  const handoffReady = isMortgagePartnerHandoffReady();
  const identityComplete = isLegalIdentityComplete();
  const isMortgageScope = state.partnerTransferScope === "mortgage_specialist";

  /** Bez ověřené identity partnera nepožadujeme falešný partner-transfer souhlas. */
  const effectiveShowPartnerTransfer =
    showPartnerTransfer && (!isMortgageScope || handoffReady);

  return (
    <fieldset
      className={
        className ??
        "space-y-3 rounded-xl border border-border bg-slate-50 px-3 py-3 text-left text-xs leading-relaxed text-muted-foreground sm:text-sm"
      }
    >
      <legend className="sr-only">Souhlasy se zpracováním údajů</legend>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-deep-teal">
        Verze zásad: {CONSENT_POLICY_VERSION}
      </p>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {buildConsentContextSummary()}
      </p>

      {!identityComplete ? (
        <p
          role="status"
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] leading-relaxed text-slate-700"
        >
          {LEGAL_IDENTITY_INCOMPLETE_PUBLIC_MESSAGE}
        </p>
      ) : null}

      <label className="flex items-start gap-2.5">
        <input
          type="checkbox"
          required
          className="mt-1"
          checked={state.privacyAccepted}
          onChange={(e) => set({ privacyAccepted: e.target.checked })}
        />
        <span>
          {buildPrivacyProcessingCheckboxLabel()}{" "}
          <Link href={routes.legal.gdpr} className="text-deep-teal underline">
            GDPR
          </Link>
          .
        </span>
      </label>

      {showPartnerTransfer && isMortgageScope && !handoffReady ? (
        <p
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] leading-relaxed text-amber-950"
        >
          {getPartnerClaimLabels().leadIntakeDisclosure}
        </p>
      ) : null}

      {effectiveShowPartnerTransfer ? (
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
            {buildPartnerTransferCheckboxLabel(state.partnerTransferScope)}
            {isMortgageScope && handoffReady ? (
              <>
                {" "}
                <Link
                  href={routes.partneri}
                  className="text-deep-teal underline"
                >
                  Partneři
                </Link>
                .
              </>
            ) : null}
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
