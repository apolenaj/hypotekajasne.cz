import { getStaticPageSeo } from "@/lib/seo/pages";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { faqPageJsonLd } from "@/lib/seo/json-ld";
import { crumbs } from "@/lib/seo/breadcrumbs";
import {
  RentgenBottomCta,
  RentgenDataTrustNote,
  RentgenFaq,
  RentgenHero,
  RentgenHowItWorks,
  RentgenPillars,
  RentgenPricing,
} from "@/components/property-rentgen/RentgenLandingSections";
import { InvestmentXrayDashboard } from "@/components/property-rentgen/InvestmentXrayDashboard";
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
    <div className="overflow-x-hidden bg-white">
      <JsonLdScript data={faqSchema} />
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={crumbs({
            name: "Investiční rentgen",
            path: routes.investicniRentgen,
          })}
        />
      </div>

      {/* Hero → formulář co nejdříve → ukázka → ceny → jak to funguje → důvěra → FAQ → CTA */}
      <RentgenHero />
      <RentgenToolIsland />
      <div id="ukazka" className="scroll-mt-24 border-b border-border bg-[#f4f6f5]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="mb-6 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Ukázka výsledku
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-text-dark sm:text-3xl">
              Modelový dashboard — data, ne verdikt
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ukázka KPI a cash-flow scénářů. Bez investičního skóre a bez
              doporučení „kupte / nekupte“.
            </p>
          </div>
          <InvestmentXrayDashboard />
        </div>
      </div>
      <RentgenPillars />
      <RentgenPricing />
      <RentgenHowItWorks />
      <RentgenDataTrustNote />
      <RentgenFaq />
      <RentgenBottomCta />
      <p className="sr-only">{formatAnalysisPriceLabel()}</p>
    </div>
  );
}
