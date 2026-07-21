import { getStaticPageSeo } from "@/lib/seo/pages";
import { LegalView } from "@/components/sections/LegalView";

export const metadata = getStaticPageSeo("/pravni/placena-analyza");


export default function PlacenaAnalyzaPage() {
  return <LegalView type="placena-analyza" />;
}
