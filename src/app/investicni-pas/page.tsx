import { getStaticPageSeo } from "@/lib/seo/pages";
import { InvestmentPassportView } from "@/components/sections/InvestmentPassportView";

export const metadata = getStaticPageSeo("/investicni-pas");

export default function InvesticniPasPage() {
  return <InvestmentPassportView />;
}
