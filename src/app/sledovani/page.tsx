import type { Metadata } from "next";
import { SmartWatchlistView } from "@/components/watchlist/SmartWatchlistView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Sledované nemovitosti",
  description:
    "Sledujte nemovitosti, města a filtry. Inteligentní upozornění jen z dostupných dat.",
  path: routes.sledovani,
});

export default function SledovaniPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({ name: "Sledované nemovitosti", path: routes.sledovani })}
          />
        </div>
      </div>
      <SmartWatchlistView />
    </>
  );
}
