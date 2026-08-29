import Link from "next/link";
import {
  buildRegulatoryPlatformBlock,
  getJerrsRegistryUrl,
  getLastLegalReviewLine,
} from "@/lib/legal/regulatory-texts";
import { getPrimaryMortgagePartner } from "@/lib/legal/partner-config";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type RegulatoryBlockProps = {
  locale?: Locale;
  className?: string;
  heading?: string;
};

export function RegulatoryBlock({
  locale = "cs",
  className,
  heading,
}: RegulatoryBlockProps) {
  const block = buildRegulatoryPlatformBlock(locale);
  const reviewLine = getLastLegalReviewLine(locale);
  const partner = getPrimaryMortgagePartner();
  const jerrsUrl =
    block.usesVerifiedIntermediary && partner.jerrsVerificationUrl
      ? partner.jerrsVerificationUrl
      : getJerrsRegistryUrl(locale);
  const title =
    heading ??
    (locale === "en" ? "Regulatory information" : "Regulatorní informace");

  return (
    <aside
      className={cn(
        "rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950",
        className
      )}
      aria-labelledby="regulatory-block-heading"
    >
      <h2
        id="regulatory-block-heading"
        className="font-heading text-base font-bold text-amber-950"
      >
        {title}
      </h2>
      <p className="mt-2">{block.platformLine}</p>
      {block.intermediaryLine ? (
        <p className="mt-2">{block.intermediaryLine}</p>
      ) : null}
      {block.showJerrsLink && block.jerrsLeadIn ? (
        <p className="mt-2">
          {block.jerrsLeadIn}{" "}
          <Link
            href={jerrsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-deep-teal underline underline-offset-2 hover:text-deep-teal/90"
          >
            {locale === "en" ? "CNB JERRS register" : "Registr JERRS ČNB"}
            <span className="sr-only">
              {locale === "en"
                ? " (opens in a new window)"
                : " (otevře se v novém okně)"}
            </span>
          </Link>
          .
        </p>
      ) : null}
      {reviewLine ? (
        <p className="mt-3 text-xs text-amber-900/80">{reviewLine}</p>
      ) : null}
    </aside>
  );
}
