import { getStaticPageSeo } from "@/lib/seo/pages";
import { AboutMajetioView } from "@/components/sections/AboutMajetioView";

export const metadata = getStaticPageSeo("/o-majetio");

export default function OMajetioPage() {
  return <AboutMajetioView />;
}
