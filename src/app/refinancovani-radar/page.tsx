import type { Metadata } from "next";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { RefinanceRadarView } from "@/components/refinance-radar/RefinanceRadarView";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Refinance Radar — sledujte fixaci a porovnejte refinancování",
  description:
    "Personalizované alerty k fixaci, scénáře splátky (MODEL), Stay vs Refinance porovnání s poplatky, pojištěním a dobou splácení. CTA na specialistu.",
  path: routes.refinanceRadar,
});

export default function RefinanceRadarPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({ name: "Refinance Radar", path: routes.refinanceRadar })}
          />
        </div>
      </div>
      <RefinanceRadarView />
    </>
  );
}
