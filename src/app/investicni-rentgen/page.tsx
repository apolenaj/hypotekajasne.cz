import { Suspense } from "react";
import { getStaticPageSeo } from "@/lib/seo/pages";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { faqPageJsonLd } from "@/lib/seo/json-ld";
import { crumbs } from "@/lib/seo/breadcrumbs";
import {
  RentgenBottomCta,
  RentgenFaq,
  RentgenHero,
  RentgenHowItWorks,
  RentgenPricing,
  RentgenProofQuestions,
  RentgenRevealCards,
  RentgenSamplePreviewCards,
} from "@/components/property-rentgen/RentgenLandingSections";
import { RentgenMiniProof } from "@/components/property-rentgen/RentgenMiniProof";
import { RentgenControlPreview } from "@/components/property-rentgen/RentgenControlPreview";
import { RentgenToolIsland } from "@/components/property-rentgen/RentgenToolIsland";
import { RentgenStickyMobileCta } from "@/components/property-rentgen/RentgenStickyMobileCta";
import {
  formatAnalysisPriceLabel,
  getRentgenPremiumConfig,
  RENTGEN_FAQ,
  withAnalysisPrice,
} from "@/lib/property-rentgen";
import { routes } from "@/lib/routes";

export const metadata = getStaticPageSeo("/investicni-rentgen");

export default function InvesticniRentgenPage() {
  const faqSchema = faqPageJsonLd(
    RENTGEN_FAQ.map((item) => ({
      question: withAnalysisPrice(item.q),
      answer: withAnalysisPrice(item.a),
    }))
  );
  const checkoutLive = getRentgenPremiumConfig().commerciallyActive;

  return (
    <div className="overflow-x-hidden bg-white pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <JsonLdScript data={faqSchema} />
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={crumbs({
            name: "Investiční rentgen",
            path: routes.investicniRentgen,
          })}
        />
      </div>

      {/* 1. Hero */}
      <RentgenHero />
      {/* 2. Short proof questions + mini model KPIs */}
      <RentgenProofQuestions />
      <RentgenMiniProof />
      {/* 3–4. Pricing + 999 vs 4990 decision */}
      <RentgenPricing />
      {/* 5. Visual sample previews */}
      <RentgenSamplePreviewCards />
      {/* 6. What analysis can reveal */}
      <RentgenRevealCards />
      {/* 7. Full model example (moved below pricing) */}
      <RentgenControlPreview />
      {/* 8. Free preview + order funnel */}
      <Suspense
        fallback={
          <div className="border-b border-border bg-white py-12 text-center text-sm text-muted-foreground">
            Načítám nástroj…
          </div>
        }
      >
        <RentgenToolIsland checkoutLive={checkoutLive} />
      </Suspense>
      {/* 9–12. Process, FAQ/methodology, final CTA */}
      <RentgenHowItWorks />
      <RentgenFaq />
      <RentgenBottomCta />
      <RentgenStickyMobileCta live={checkoutLive} />
      <p className="sr-only">{formatAnalysisPriceLabel()}</p>
    </div>
  );
}
