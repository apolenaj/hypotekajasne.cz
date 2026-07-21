import { getStaticPageSeo } from "@/lib/seo/pages";
import { HistoricalTrendsView } from "@/components/sections/HistoricalTrendsView";

export const metadata = getStaticPageSeo("/kalkulacky/historicky-vyvoj");

export default function HistorickyVyvojPage() {
  return <HistoricalTrendsView />;
}
