import type { Metadata } from "next";
import { HomeDashboard } from "@/components/dashboard/HomeDashboard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Můj přehled — finančně-realitní situace",
  description:
    "Personalizovaný přehled: připravenost, bezpečná kupní síla, relevantní sazby, sledované nemovitosti a jeden další krok.",
  path: routes.dashboard,
  noIndex: true,
});

export default function DashboardPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({ name: "Můj přehled", path: routes.dashboard })}
          />
        </div>
      </div>
      <HomeDashboard />
    </>
  );
}
