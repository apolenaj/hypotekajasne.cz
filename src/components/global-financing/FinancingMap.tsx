"use client";

import { ArrowRight, MapPin, User } from "lucide-react";
import { ClaimBadge } from "@/components/property-rentgen/ClaimBadge";
import type {
  FinancingMapEdge,
  FinancingMapNode,
  FinancingRouteCard,
  RouteAvailabilityStatus,
} from "@/lib/global-financing/types";

const STATUS_COLORS: Record<RouteAvailabilityStatus, string> = {
  AVAILABLE: "border-emerald-400 bg-emerald-50",
  AVAILABLE_INDIVIDUALLY: "border-amber-400 bg-amber-50",
  CONDITIONALLY_AVAILABLE: "border-sky-400 bg-sky-50",
  INSUFFICIENT_EQUITY: "border-stone-300 bg-stone-50 opacity-75",
  NOT_SUPPORTED: "border-stone-200 bg-stone-100 opacity-60",
};

type Props = {
  originLabel: string;
  destinationLabel: string;
  nodes: FinancingMapNode[];
  edges: FinancingMapEdge[];
  routes: FinancingRouteCard[];
  onRouteSelect?: (route: FinancingRouteCard) => void;
  selectedRouteId?: string | null;
};

export function FinancingMap({
  originLabel,
  destinationLabel,
  routes,
  onRouteSelect,
  selectedRouteId,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Flow header */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2 rounded-full border border-deep-teal/30 bg-deep-teal/5 px-4 py-2 font-semibold text-deep-teal">
          <User className="h-4 w-4" />
          {originLabel}
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className="flex flex-wrap gap-2">
          {routes.map((route) => (
            <button
              key={route.routeId}
              type="button"
              onClick={() => onRouteSelect?.(route)}
              className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                selectedRouteId === route.routeId
                  ? "border-muted-gold bg-muted-gold text-deep-teal"
                  : "border-border bg-white hover:border-deep-teal/40"
              }`}
            >
              Route {route.routeLetter}
            </button>
          ))}
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 font-semibold">
          <MapPin className="h-4 w-4 text-deep-teal" />
          {destinationLabel}
        </div>
      </div>

      {/* Route cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <button
            key={route.routeId}
            type="button"
            onClick={() => onRouteSelect?.(route)}
            className={`rounded-2xl border-2 p-4 text-left transition hover:shadow-md ${
              STATUS_COLORS[route.availabilityStatus]
            } ${selectedRouteId === route.routeId ? "ring-2 ring-muted-gold" : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Route {route.routeLetter}
                </p>
                <p className="mt-1 font-heading text-base font-bold text-foreground">
                  {route.label}
                </p>
              </div>
              <ClaimBadge kind={route.claimKind} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {route.typicalStructure}
            </p>
            <p className="mt-3 text-xs font-medium text-foreground/80">
              {route.availabilityLabel}
            </p>
            {route.requiredEquityPercent != null && (
              <p className="mt-1 text-xs text-muted-foreground">
                Vlastní kapitál: min. {route.requiredEquityPercent} %
              </p>
            )}
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Router nevybírá jednu „nejlepší“ cestu — porovnejte možnosti a ověřte u specialisty.
      </p>
    </div>
  );
}
