import { getStaticPageSeo } from "@/lib/seo/pages";
import { AboutUsView } from "@/components/sections/AboutUsView";
import { LeadGen } from "@/components/sections/LeadGen";

export const metadata = getStaticPageSeo("/o-nas");

export default function ONasPage() {
  return (
    <>
      <AboutUsView />
      <LeadGen />
    </>
  );
}
