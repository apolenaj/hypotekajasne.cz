import type { Metadata } from "next";
import { PortfolioOsView } from "@/components/portfolio-os/PortfolioOsView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Moje portfolio — správa více nemovitostí",
  description:
    "Souhrn portfolia, koncentrace rizik, stress testy a srozumitelné scénáře. Export pro účetního. Bez pokynů k prodeji.",
  path: routes.portfolio,
});

export default function PortfolioPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({ name: "Moje portfolio", path: routes.portfolio })}
          />
        </div>
      </div>
      <PortfolioOsView />
    </>
  );
}
