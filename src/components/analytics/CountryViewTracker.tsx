"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

/** Fires country_viewed once on mount — privacy-safe country_id only. */
export function CountryViewTracker({ countryId }: { countryId: string }) {
  useEffect(() => {
    track("country_viewed", {
      country_id: countryId,
      tool_id: "country_hub",
      path:
        typeof window !== "undefined" ? window.location.pathname : undefined,
    });
  }, [countryId]);
  return null;
}
