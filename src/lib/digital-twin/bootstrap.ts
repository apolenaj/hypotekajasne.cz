/**
 * Property Digital Twin — bootstrap from Watchlist (COMING_SOON wiring).
 * Does not auto-add market value — only purchase price if user provided.
 */

import { emptyTwin, type PropertyDigitalTwin } from "@/lib/digital-twin/types";
import type { WatchTarget } from "@/lib/watchlist/types";

export function bootstrapTwinFromWatchTarget(
  target: WatchTarget,
  relationship: "watched" | "owned" = "watched"
): PropertyDigitalTwin {
  const twin = emptyTwin({
    id: `twin_${target.id}`,
    label: target.label,
    relationship,
    watchTargetId: target.id,
    majetioListingId: target.majetioListingId,
    location: {
      country: target.city ? "Česká republika" : null,
      city: target.city,
      areaM2: null,
      propertyType: target.propertyType,
      currencyCode: "CZK",
    },
    purchase: {
      purchasePriceCzk: target.priceCzk,
      purchaseDate: null,
      acquisitionCostsCzk: null,
      currency: "CZK",
      claimKind: target.priceCzk != null ? "DATA" : "NEOVERENO",
    },
  });

  if (target.priceCzk != null) {
    twin.valueHistory = [];
  }

  return twin;
}
