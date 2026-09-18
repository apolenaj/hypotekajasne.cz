import { FutureProjectionsView } from "@/components/sections/FutureProjectionsView";
import { LeadGen } from "@/components/sections/LeadGen";
import { getStaticPageSeo } from "@/lib/seo/pages";

export const metadata = getStaticPageSeo("/kalkulacky/potencialni-vyvoj");

export default function PotencialniVyvojPage() {
  return (
    <>
      <FutureProjectionsView />
      <LeadGen />
    </>
  );
}
