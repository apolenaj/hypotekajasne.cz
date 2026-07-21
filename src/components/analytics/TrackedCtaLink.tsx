"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track } from "@/lib/analytics/track";
import type { AnalyticsPayload } from "@/lib/analytics/events";

type Props = ComponentProps<typeof Link> & {
  ctaId: string;
  toolId?: string;
  event?: "primary_cta_clicked" | "specialist_cta_clicked";
  extra?: AnalyticsPayload;
};

/**
 * Link that emits a consent-gated CTA event on click.
 */
export function TrackedCtaLink({
  ctaId,
  toolId,
  event = "primary_cta_clicked",
  extra,
  onClick,
  ...rest
}: Props) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        track(event, {
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
