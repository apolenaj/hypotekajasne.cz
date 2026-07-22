"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track, trackCanonical } from "@/lib/analytics/track";

function referrerHost(): string | undefined {
  try {
    if (!document.referrer) return undefined;
    return new URL(document.referrer).hostname || undefined;
  } catch {
    return undefined;
  }
}

function isHomePath(path: string): boolean {
  return path === "/" || path === "/en";
}

/**
 * Fires page_view on client navigations (App Router).
 * Homepage also fires homepage_view for dashboard KPIs.
 * Consent-gated inside track() — no vendor calls here.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (last.current === pathname) return;
    last.current = pathname;

    const base = {
      path: pathname,
      referrer_host: referrerHost(),
      funnel_id: "moje_moznosti_north_star",
    };

    track("page_view", base);

    if (isHomePath(pathname)) {
      trackCanonical("homepage_view", "page_view", {
        ...base,
        path: pathname,
      });
    }
  }, [pathname]);

  return null;
}
