import type { Metadata } from "next";
import { OfferStrategyView } from "@/components/offer-strategy/OfferStrategyView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Offer Strategy Assistant — strategie nabídky na nemovitost",
  description:
    "MODEL opening, target a max cena, vyjednávací marže, scenario slider (yield, CF, IRR) a etický návrh textu nabídky.",
  path: routes.offerStrategy,
});

export default function OfferStrategyPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({
              name: "Offer Strategy",
              path: routes.offerStrategy,
            })}
          />
        </div>
      </div>
      <OfferStrategyView />
    </>
  );
}
