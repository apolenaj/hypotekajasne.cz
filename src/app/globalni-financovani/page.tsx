import type { Metadata } from "next";
import { GlobalFinancingRouterView } from "@/components/global-financing/GlobalFinancingRouterView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Global Financing Router — mapa cest financování",
  description:
    "Porovnejte lokální hypotéku, české zajištěné financování, developer plán, hotovost a kombinace. Bez jediného doporučení — s riziky, dokumenty a partnery.",
  path: routes.globalFinancing,
});

export default function GlobalFinancingPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({
              name: "Global Financing Router",
              path: routes.globalFinancing,
            })}
          />
        </div>
      </div>
      <GlobalFinancingRouterView />
    </>
  );
}
