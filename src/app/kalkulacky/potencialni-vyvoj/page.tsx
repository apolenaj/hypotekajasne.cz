import { getStaticPageSeo } from "@/lib/seo/pages";
import { FutureProjectionsView } from "@/components/sections/FutureProjectionsView";

export const metadata = getStaticPageSeo("/kalkulacky/potencialni-vyvoj");

export default function PotencialniVyvojPage() {
  return <FutureProjectionsView />;
}
