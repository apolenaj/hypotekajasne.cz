import { CALCULATOR_DISCLAIMER, rt } from "@/lib/legal/regulatory-texts";
import type { Locale } from "@/lib/i18n/config";

/** @deprecated Prefer CALCULATOR_DISCLAIMER from @/lib/legal/regulatory-texts */
export const CALCULATOR_DISCLAIMER_CS = CALCULATOR_DISCLAIMER.cs;

export function getCalculatorDisclaimer(locale: Locale = "cs"): string {
  return rt(locale, CALCULATOR_DISCLAIMER);
}

export function CalculatorDisclaimer({
  className = "",
  locale = "cs",
}: {
  className?: string;
  locale?: Locale;
}) {
  return (
    <p
      className={`text-xs leading-relaxed text-gray-500 ${className}`.trim()}
    >
      {getCalculatorDisclaimer(locale)}
    </p>
  );
}
