import { getStaticPageSeo } from "@/lib/seo/pages";
import { InvestmentModelerView } from "@/components/sections/InvestmentModelerView";

export const metadata = getStaticPageSeo("/investicni-rentgen/modelar");


export default function InvesticniRentgenModelarPage() {
  return <InvestmentModelerView />;
}
