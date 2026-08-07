import { KalkulackyView } from "@/components/pages/KalkulackyView";
import { getStaticPageSeo } from "@/lib/seo/pages";

export const metadata = getStaticPageSeo("/kalkulacky/koupe-vs-najem");

export default function KoupeVsNajemPage() {
  return <KalkulackyView initialTab="buy_vs_rent" />;
}
