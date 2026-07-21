import { getStaticPageSeo } from "@/lib/seo/pages";
import { MortgageReadinessWizard } from "@/components/mortgage-readiness/MortgageReadinessWizard";

export const metadata = getStaticPageSeo("/navrh-na-miru");

export default function NavrhNaMiruPage() {
  return <MortgageReadinessWizard />;
}
