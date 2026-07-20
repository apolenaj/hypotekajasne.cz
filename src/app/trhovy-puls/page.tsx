import type { Metadata } from "next";
import { MarketPulseView } from "@/components/market-pulse/MarketPulseView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Tržní puls — vývoj trhů bez clickbaitu",
  description:
    "Trendy sazeb, cen, nájmů a yieldu pro podporované trhy. Opportunity Radar upozorňuje na shodu s kritérii — ne garantuje investici. Regulační changelog.",
  path: routes.marketPulse,
});

export default function MarketPulsePage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({ name: "Tržní puls", path: routes.marketPulse })}
          />
        </div>
      </div>
      <MarketPulseView />
    </>
  );
}
