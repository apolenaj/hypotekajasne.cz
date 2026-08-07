import { KalkulackyView } from "@/components/pages/KalkulackyView";
import { getStaticPageSeo } from "@/lib/seo/pages";

export const metadata = getStaticPageSeo("/kalkulacky/historicky-vyvoj");

export default function HistorickyVyvojPage() {
  return <KalkulackyView initialTab="historical" />;
}
