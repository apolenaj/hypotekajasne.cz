"use client";

import { useEffect } from "react";
import { trackPair } from "@/lib/analytics/track";

/** Fires market_viewed (+ legacy country_viewed) once on mount. */
export function CountryViewTracker({ countryId }: { countryId: string }) {
  useEffect(() => {
    trackPair("country_viewed", "market_viewed", {
      country_id: countryId,
      tool_id: "country_hub",
      path:
        typeof window !== "undefined" ? window.location.pathname : undefined,
    });
  }, [countryId]);
  return null;
}
