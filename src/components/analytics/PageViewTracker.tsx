"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics/track";

function referrerHost(): string | undefined {
  try {
    if (!document.referrer) return undefined;
    return new URL(document.referrer).hostname || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Fires page_view on client navigations (App Router).
 * Consent-gated inside track() — no vendor calls here.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (last.current === pathname) return;
    last.current = pathname;
    track("page_view", {
      path: pathname,
      referrer_host: referrerHost(),
      funnel_id: "moje_moznosti_north_star",
    });
  }, [pathname]);

  return null;
}
