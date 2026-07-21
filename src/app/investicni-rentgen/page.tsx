import { getStaticPageSeo } from "@/lib/seo/pages";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { faqPageJsonLd } from "@/lib/seo/json-ld";
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
