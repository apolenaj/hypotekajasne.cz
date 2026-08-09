"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics/track";
import { trackEventOnce } from "@/lib/analytics/track-event";

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
 * Homepage also fires homepage_view once per session (no duplicate page_view).
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
      funnel_id: "phase4_conversion",
    };

    track("page_view", base);

    if (isHomePath(pathname)) {
      trackEventOnce("homepage_view", `homepage_view:${pathname}`, {
        ...base,
        path: pathname,
      });
    }
  }, [pathname]);

  return null;
}
