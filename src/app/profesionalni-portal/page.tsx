import type { Metadata } from "next";
import { B2bPortalView } from "@/components/b2b-portal/B2bPortalView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "B2B Professional Portal — partner SaaS",
  description:
    "Portál pro makléře, kanceláře, developery a hypoteční partnery: objednávky analýz 5 000 Kč, reporty, share linky, engagement, projekty, billing-ready fakturace, audit log.",
  path: routes.b2bPortal,
});

export default function B2bPortalPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({ name: "B2B Portal", path: routes.b2bPortal })}
          />
        </div>
      </div>
      <B2bPortalView />
    </>
  );
}
