"use client";

import { useEffect, useState } from "react";
import { AnalyticsAttributionBootstrap } from "@/components/analytics/AnalyticsAttributionBootstrap";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { trackEvent } from "@/lib/analytics/track-event";

/** Analytics bootstrap až po idle — neblokuje hlavní vlákno při LCP. */
export function DeferredAnalyticsMount() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const run = () => setActive(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(run, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!active) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLElement>("[data-cta-id]");
      if (!link) return;
      trackEvent("cta_click", {
        cta_id: link.dataset.ctaId,
        path: window.location.pathname,
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [active]);

  if (!active) return null;

  return (
    <>
      <AnalyticsAttributionBootstrap />
      <PageViewTracker />
    </>
  );
}
