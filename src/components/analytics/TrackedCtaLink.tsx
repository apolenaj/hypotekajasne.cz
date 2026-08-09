"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import type { AnalyticsEventName, AnalyticsPayload } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/track-event";

type Props = ComponentProps<typeof Link> & {
  ctaId: string;
  toolId?: string;
  event?: "cta_click" | "primary_cta_clicked" | "specialist_cta_clicked";
  extra?: AnalyticsPayload;
};

/**
 * Link that emits a consent-gated CTA event on click.
 */
export function TrackedCtaLink({
  ctaId,
  toolId,
  event = "cta_click",
  extra,
  onClick,
  ...rest
}: Props) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        trackEvent(event as AnalyticsEventName, {
          cta_id: ctaId,
          tool_id: toolId,
          path:
            typeof window !== "undefined" ? window.location.pathname : undefined,
          ...extra,
        });
        onClick?.(e);
      }}
    />
  );
}
