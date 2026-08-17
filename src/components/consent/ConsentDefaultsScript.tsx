import Script from "next/script";
import { CONSENT_DEFAULTS_INLINE_SCRIPT } from "@/lib/consent/consent-mode";

/**
 * Google Consent Mode v2 defaults — always denied until user choice.
 * Must live in the root layout so strategy="beforeInteractive" is honored.
 */
export function ConsentDefaultsScript() {
  return (
    <Script
      id="hj-consent-defaults"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULTS_INLINE_SCRIPT }}
    />
  );
}
