import { RATES_DISCLAIMER, rt } from "@/lib/legal/regulatory-texts";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function RatesDisclaimer({
  locale = "cs",
  className,
}: {
  locale?: Locale;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs leading-relaxed text-muted-foreground",
        className
      )}
    >
      {rt(locale, RATES_DISCLAIMER)}
    </p>
  );
}
