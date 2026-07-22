import { getStaticPageSeo } from "@/lib/seo/pages";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { faqPageJsonLd } from "@/lib/seo/json-ld";
import { crumbs } from "@/lib/seo/breadcrumbs";
import {
  RentgenBottomCta,
  RentgenDemoReport,
  RentgenFaq,
  RentgenHero,
  RentgenMetricsGrid,
  RentgenPricing,
  RentgenValueProp,
  RentgenWhatWeAnalyze,
} from "@/components/property-rentgen/RentgenLandingSections";
import { RentgenToolIsland } from "@/components/property-rentgen/RentgenToolIsland";
import {
  formatAnalysisPriceLabel,
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

  return (
    <div className="bg-white">
      <JsonLdScript data={faqSchema} />
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={crumbs({
            name: "Investiční rentgen",
            path: routes.investicniRentgen,
          })}
        />
      </div>
      <RentgenHero />
      <RentgenValueProp />
      <RentgenWhatWeAnalyze />
      <RentgenMetricsGrid />
      <RentgenDemoReport />
      <RentgenToolIsland />
      <RentgenPricing />
      <RentgenFaq />
      <RentgenBottomCta />
      <p className="sr-only">{formatAnalysisPriceLabel()}</p>
    </div>
  );
}
