import { HistoricalTrendsView } from "@/components/sections/HistoricalTrendsView";
import { LeadGen } from "@/components/sections/LeadGen";
import { getStaticPageSeo } from "@/lib/seo/pages";

export const metadata = getStaticPageSeo("/kalkulacky/historicky-vyvoj");

export default function HistorickyVyvojPage() {
  return (
    <>
      <HistoricalTrendsView />
      <LeadGen />
    </>
  );
}
