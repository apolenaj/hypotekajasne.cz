import type { Metadata } from "next";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { RefinanceRadarView } from "@/components/refinance-radar/RefinanceRadarView";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Hlídač refinancování — sledujte fixaci a porovnejte nabídky",
  description:
    "Spočítejte čas do konce fixace, modelové scénáře splátek a uložte si in-app hlídání. Orientační model — ne individuální nabídka banky.",
  path: routes.refinanceRadar,
});

export default function RefinanceRadarPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({ name: "Hlídač refinancování", path: routes.refinanceRadar })}
          />
        </div>
      </div>
      <RefinanceRadarView />
    </>
  );
}
