"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics/track-event";

export type LandingCtaLink = { label: string; href: string };

function destinationKind(href: string): string {
  if (href.startsWith("#poptavka")) return "lead";
  if (href.includes("/moje-moznosti")) return "diagnostic";
  if (href.includes("/sazby")) return "rates";
  if (href.includes("/investicni-rentgen")) return "rentgen";
  if (href.includes("/kalkulacky")) return "calculator";
  if (href.startsWith("#")) return "page_section";
  return "other";
}

function CtaLink({
  cta,
  pageIntent,
  placement,
  variant,
}: {
  cta: LandingCtaLink;
  pageIntent?: string;
  placement: string;
  variant: "primary" | "secondary";
}) {
  const className =
    variant === "primary"
      ? "inline-flex h-11 min-h-11 items-center justify-center rounded-xl bg-deep-teal px-5 text-sm font-bold text-white transition hover:bg-deep-teal/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
      : "inline-flex h-11 min-h-11 items-center justify-center rounded-xl border border-deep-teal/40 bg-white px-5 text-sm font-semibold text-deep-teal transition hover:bg-deep-teal/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2";

  return (
    <Link
      href={cta.href}
      className={className}
      onClick={() => {
        trackEvent("cta_click", {
          page_intent: pageIntent,
          cta_destination: destinationKind(cta.href),
          cta_placement: placement,
          placement,
          path:
            typeof window !== "undefined" ? window.location.pathname : undefined,
          funnel_id: "phase6_conversion",
        });
      }}
    >
      {cta.label}
    </Link>
  );
}

export function LandingCtaRow({
  primary,
  secondary,
  pageIntent,
  placement = "hero",
  supportCopy,
}: {
  primary?: LandingCtaLink;
  secondary?: LandingCtaLink;
  pageIntent?: string;
  placement?: string;
  supportCopy?: string;
}) {
  if (!primary && !secondary) return null;
  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {primary ? (
          <CtaLink
            cta={primary}
            pageIntent={pageIntent}
            placement={placement}
            variant="primary"
          />
        ) : null}
        {secondary ? (
          <CtaLink
            cta={secondary}
            pageIntent={pageIntent}
            placement={placement}
            variant="secondary"
          />
        ) : null}
      </div>
      {supportCopy ? (
        <p className="mt-2 text-xs text-muted-foreground">{supportCopy}</p>
      ) : null}
    </div>
  );
}
