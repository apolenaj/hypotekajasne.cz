import { KalkulackyView } from "@/components/pages/KalkulackyView";
import { getStaticPageSeo } from "@/lib/seo/pages";

export const metadata = getStaticPageSeo("/kalkulacky/potencialni-vyvoj");

export default function PotencialniVyvojPage() {
  return <KalkulackyView initialTab="future" />;
}
