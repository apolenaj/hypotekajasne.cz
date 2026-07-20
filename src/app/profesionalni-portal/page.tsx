import type { Metadata } from "next";
import { B2bPortalView } from "@/components/b2b-portal/B2bPortalView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";
import { formatAnalysisPrice } from "@/lib/property-rentgen";

export const metadata: Metadata = buildPageMetadata({
  title: "Profesionální B2B portál — partner SaaS",
  description: `Portál pro makléře, kanceláře, developery a hypoteční partnery: objednávky analýz ${formatAnalysisPrice()}, reporty, sdílení, engagement, projekty, fakturace, audit.`,
  path: routes.b2bPortal,
});

export default function B2bPortalPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({ name: "Profesionální portál", path: routes.b2bPortal })}
          />
        </div>
      </div>
      <B2bPortalView />
    </>
  );
}
