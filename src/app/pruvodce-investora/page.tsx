import { getStaticPageSeo } from "@/lib/seo/pages";
import { InvestorGuideHub } from "@/components/pages/InvestorGuideHub";

export const metadata = getStaticPageSeo("/pruvodce-investora");

export default function PruvodceInvestoraPage() {
  return <InvestorGuideHub />;
}
